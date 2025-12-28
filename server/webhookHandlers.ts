import { getStripeSync, getUncachableStripeClient } from './stripeClient';
import { storage } from './storage';
import { apiService } from './apiService';
import { tokenService } from './tokenService';
import Stripe from 'stripe';

export class WebhookHandlers {
  static async processWebhook(payload: Buffer, signature: string): Promise<void> {
    if (!Buffer.isBuffer(payload)) {
      throw new Error(
        'STRIPE WEBHOOK ERROR: Payload must be a Buffer. ' +
        'Received type: ' + typeof payload + '. ' +
        'This usually means express.json() parsed the body before reaching this handler. ' +
        'FIX: Ensure webhook route is registered BEFORE app.use(express.json()).'
      );
    }

    const sync = await getStripeSync();
    await sync.processWebhook(payload, signature);

    // Also handle custom logic for report subscriptions
    await WebhookHandlers.processCustomLogic(payload, signature);
  }

  static async processCustomLogic(payload: Buffer, signature: string): Promise<void> {
    try {
      const stripe = await getUncachableStripeClient();
      const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
      
      if (!webhookSecret) return;

      const event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);

      if (event.type === 'customer.subscription.created' || event.type === 'customer.subscription.updated') {
        await WebhookHandlers.handleSubscriptionEvent(event.data.object as Stripe.Subscription);
      }
      
      if (event.type === 'customer.subscription.deleted') {
        await WebhookHandlers.handleSubscriptionCancelled(event.data.object as Stripe.Subscription);
      }
      
      if (event.type === 'checkout.session.completed') {
        await WebhookHandlers.handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
      }
    } catch (error) {
      console.error('Custom webhook logic error:', error);
    }
  }

  static async handleSubscriptionCancelled(subscription: Stripe.Subscription): Promise<void> {
    const stripe = await getUncachableStripeClient();
    const customerId = subscription.customer as string;
    
    const user = await storage.getUserByStripeCustomerId(customerId);
    if (!user) return;

    // Check if this was an API tier subscription
    for (const item of subscription.items.data) {
      const product = await stripe.products.retrieve(item.price.product as string);
      if (product.metadata?.product_type === 'api_tier') {
        // Downgrade to free tier
        await apiService.setUserTier(user.id, 'free');
        console.log(`Downgraded user ${user.id} to free tier after subscription cancellation`);
      }
    }
  }

  static async handleCheckoutCompleted(session: Stripe.Checkout.Session): Promise<void> {
    if (session.payment_status !== 'paid') return;

    const stripe = await getUncachableStripeClient();
    const customerId = session.customer as string;

    // Find user by stripeCustomerId first
    let user = await storage.getUserByStripeCustomerId(customerId);
    
    // If not found by stripeCustomerId, try to find by email and link the account
    if (!user && customerId) {
      try {
        const stripeCustomer = await stripe.customers.retrieve(customerId);
        if (stripeCustomer && !stripeCustomer.deleted && stripeCustomer.email) {
          user = await storage.getUserByEmail(stripeCustomer.email);
          if (user) {
            // Link the Stripe customer to this portal account
            await storage.updateUser(user.id, { stripeCustomerId: customerId });
            console.log(`Linked Stripe customer ${customerId} to existing user ${user.id} (${stripeCustomer.email})`);
          }
        }
      } catch (err) {
        console.error('Error looking up Stripe customer for linking:', err);
      }
    }
    
    if (!user) {
      console.log('No user found for customer:', customerId);
      return;
    }

    // Get line items to check for call packs
    const lineItems = await stripe.checkout.sessions.listLineItems(session.id, { expand: ['data.price.product'] });
    
    let totalAmount = 0;
    const productNames: string[] = [];
    
    for (const item of lineItems.data) {
      const product = item.price?.product as Stripe.Product;
      if (!product || typeof product === 'string') continue;

      productNames.push(product.name);
      totalAmount += item.amount_total || 0;

      if (product.metadata?.product_type === 'call_pack') {
        const calls = parseInt(product.metadata?.calls || '0');
        if (calls > 0) {
          // Create call pack record
          await apiService.addCallPack(user.id, calls, session.id);
          console.log(`Added ${calls} API calls to user ${user.id} from call pack purchase`);
        }
      }

      // Handle token pack purchases
      if (product.metadata?.product_type === 'token_pack') {
        const tokens = parseInt(product.metadata?.tokens || '0');
        const bonusTokens = parseInt(product.metadata?.bonus_tokens || '0');
        const totalTokens = tokens + bonusTokens;
        
        if (totalTokens > 0) {
          const idempotencyKey = `stripe_checkout_${session.id}_${product.id}`;
          
          await tokenService.creditTokens({
            userId: user.id,
            amount: totalTokens,
            source: 'purchase',
            description: `Purchased ${product.name}${bonusTokens > 0 ? ` (+${bonusTokens} bonus)` : ''}`,
            referenceId: session.id,
            referenceType: 'stripe_checkout',
            idempotencyKey,
            metadata: {
              productId: product.id,
              productName: product.name,
              baseTokens: tokens,
              bonusTokens,
              priceId: item.price?.id,
            },
          });
          
          console.log(`Credited ${totalTokens} tokens to user ${user.id} from token pack purchase (${tokens} base + ${bonusTokens} bonus)`);
        }
      }
    }

    // Sync to QuickBooks if connected
    try {
      const { syncStripePaymentToQuickBooks, getActiveConnection } = await import('./quickbooksService');
      const qbConnection = await getActiveConnection();
      if (qbConnection) {
        const result = await syncStripePaymentToQuickBooks(
          user.email || '',
          `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email || 'Customer',
          productNames.join(', ') || 'TriFused Purchase',
          totalAmount,
          session.id
        );
        if (result.success) {
          console.log(`QuickBooks invoice created: ${result.invoiceId} for session ${session.id}`);
        } else {
          console.error(`QuickBooks sync failed for session ${session.id}: ${result.error}`);
        }
      }
    } catch (qbError) {
      console.error('QuickBooks sync error:', qbError);
    }
  }

  static async handleSubscriptionEvent(subscription: Stripe.Subscription): Promise<void> {
    if (subscription.status !== 'active') return;

    const stripe = await getUncachableStripeClient();
    
    for (const item of subscription.items.data) {
      const product = await stripe.products.retrieve(item.price.product as string);
      
      // Handle API tier subscriptions
      if (product.metadata?.product_type === 'api_tier') {
        const tierName = product.metadata?.tier_name;
        if (tierName) {
          const customerId = subscription.customer as string;
          let user = await storage.getUserByStripeCustomerId(customerId);
          
          // Fallback: try to find by email and link account
          if (!user && customerId) {
            try {
              const stripeCustomer = await stripe.customers.retrieve(customerId);
              if (stripeCustomer && !stripeCustomer.deleted && stripeCustomer.email) {
                user = await storage.getUserByEmail(stripeCustomer.email);
                if (user) {
                  await storage.updateUser(user.id, { stripeCustomerId: customerId });
                  console.log(`Linked Stripe customer ${customerId} to user ${user.id} for API tier`);
                }
              }
            } catch (err) {
              console.error('Error linking Stripe customer for API tier:', err);
            }
          }
          
          if (user) {
            await apiService.setUserTier(user.id, tierName);
            console.log(`Assigned API tier '${tierName}' to user ${user.id}`);
          }
        }
      }
      
      if (product.metadata?.product_type === 'report_subscription') {
        const customerId = subscription.customer as string;
        
        // Find user by stripeCustomerId first
        let user = await storage.getUserByStripeCustomerId(customerId);
        
        // Fallback: try to find by email and link account
        if (!user && customerId) {
          try {
            const stripeCustomer = await stripe.customers.retrieve(customerId);
            if (stripeCustomer && !stripeCustomer.deleted && stripeCustomer.email) {
              user = await storage.getUserByEmail(stripeCustomer.email);
              if (user) {
                await storage.updateUser(user.id, { stripeCustomerId: customerId });
                console.log(`Linked Stripe customer ${customerId} to user ${user.id} for report subscription`);
              }
            }
          } catch (err) {
            console.error('Error linking Stripe customer for report subscription:', err);
          }
        }
        
        if (!user) {
          console.log('No user found for customer:', customerId);
          continue;
        }

        // Check if report subscription already exists for this subscription
        const existing = await storage.getReportSubscriptionByStripeSubscriptionId(subscription.id);
        if (existing) {
          // Update status if needed
          if (existing.status !== 'active') {
            await storage.updateReportSubscription(existing.id, { status: 'active' });
          }
          continue;
        }

        // Generate unique slug from company name or email
        const baseSlug = (user.email?.split('@')[0] || user.id).toLowerCase().replace(/[^a-z0-9]/g, '-');
        const slug = `${baseSlug}-${Date.now().toString(36)}`;

        // Create new report subscription record
        await storage.createReportSubscription({
          userId: user.id,
          stripeSubscriptionId: subscription.id,
          targetUrl: '',
          slug,
          companyName: null,
          brandColor: '#00ffff',
          logoUrl: null,
          visibility: 'private',
          status: 'active',
          embedEnabled: 1,
          apiEnabled: 1,
        });

        console.log(`Created report subscription for user ${user.id} with slug: ${slug}`);
      }
    }
  }
}
