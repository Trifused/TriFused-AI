import { getStripeSync, getUncachableStripeClient } from './stripeClient';
import { storage } from './storage';
import { apiService } from './apiService';
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
      
      if (event.type === 'checkout.session.completed') {
        await WebhookHandlers.handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
      }
    } catch (error) {
      console.error('Custom webhook logic error:', error);
    }
  }

  static async handleCheckoutCompleted(session: Stripe.Checkout.Session): Promise<void> {
    if (session.payment_status !== 'paid') return;

    const stripe = await getUncachableStripeClient();
    const customerId = session.customer as string;

    // Find user by stripeCustomerId
    const user = await storage.getUserByStripeCustomerId(customerId);
    if (!user) {
      console.log('No user found for customer:', customerId);
      return;
    }

    // Get line items to check for call packs
    const lineItems = await stripe.checkout.sessions.listLineItems(session.id, { expand: ['data.price.product'] });
    
    for (const item of lineItems.data) {
      const product = item.price?.product as Stripe.Product;
      if (!product || typeof product === 'string') continue;

      if (product.metadata?.product_type === 'call_pack') {
        const calls = parseInt(product.metadata?.calls || '0');
        if (calls > 0) {
          // Create call pack record
          await apiService.addCallPack(user.id, calls, session.id);
          console.log(`Added ${calls} API calls to user ${user.id} from call pack purchase`);
        }
      }
    }
  }

  static async handleSubscriptionEvent(subscription: Stripe.Subscription): Promise<void> {
    if (subscription.status !== 'active') return;

    const stripe = await getUncachableStripeClient();
    
    for (const item of subscription.items.data) {
      const product = await stripe.products.retrieve(item.price.product as string);
      
      if (product.metadata?.product_type === 'report_subscription') {
        const customerId = subscription.customer as string;
        
        // Find user by stripeCustomerId
        const user = await storage.getUserByStripeCustomerId(customerId);
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
