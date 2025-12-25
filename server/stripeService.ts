import { getUncachableStripeClient } from './stripeClient';
import { db } from '../db';
import { sql } from 'drizzle-orm';

export class StripeService {
  async createCustomer(email: string, userId: string) {
    const stripe = await getUncachableStripeClient();
    return await stripe.customers.create({
      email,
      metadata: { userId },
    });
  }

  async createCheckoutSession(
    customerId: string,
    priceId: string,
    mode: 'subscription' | 'payment',
    successUrl: string,
    cancelUrl: string,
    metadata?: Record<string, string>
  ) {
    const stripe = await getUncachableStripeClient();
    return await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      mode,
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata,
    });
  }

  async createCustomerPortalSession(customerId: string, returnUrl: string) {
    const stripe = await getUncachableStripeClient();
    return await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl,
    });
  }

  async getProduct(productId: string) {
    const result = await db.execute(
      sql`SELECT * FROM stripe.products WHERE id = ${productId}`
    );
    return result.rows[0] || null;
  }

  async listProducts(active = true, limit = 20, offset = 0) {
    const result = await db.execute(
      sql`SELECT * FROM stripe.products WHERE active = ${active} LIMIT ${limit} OFFSET ${offset}`
    );
    return result.rows;
  }

  async listProductsWithPrices(activeOnly = true, limit = 20, offset = 0) {
    if (activeOnly) {
      const result = await db.execute(
        sql`
          WITH paginated_products AS (
            SELECT id, name, description, metadata, active
            FROM stripe.products
            WHERE active = true
            ORDER BY id
            LIMIT ${limit} OFFSET ${offset}
          )
          SELECT 
            p.id as product_id,
            p.name as product_name,
            p.description as product_description,
            p.active as product_active,
            p.metadata as product_metadata,
            pr.id as price_id,
            pr.unit_amount,
            pr.currency,
            pr.recurring,
            pr.active as price_active,
            pr.metadata as price_metadata
          FROM paginated_products p
          LEFT JOIN stripe.prices pr ON pr.product = p.id AND pr.active = true
          ORDER BY p.id, pr.unit_amount
        `
      );
      return result.rows;
    } else {
      // Return ALL products (both active and inactive) for admin
      const result = await db.execute(
        sql`
          WITH paginated_products AS (
            SELECT id, name, description, metadata, active
            FROM stripe.products
            ORDER BY active DESC, id
            LIMIT ${limit} OFFSET ${offset}
          )
          SELECT 
            p.id as product_id,
            p.name as product_name,
            p.description as product_description,
            p.active as product_active,
            p.metadata as product_metadata,
            pr.id as price_id,
            pr.unit_amount,
            pr.currency,
            pr.recurring,
            pr.active as price_active,
            pr.metadata as price_metadata
          FROM paginated_products p
          LEFT JOIN stripe.prices pr ON pr.product = p.id
          ORDER BY p.active DESC, p.id, pr.unit_amount
        `
      );
      return result.rows;
    }
  }

  async getPrice(priceId: string) {
    const result = await db.execute(
      sql`SELECT * FROM stripe.prices WHERE id = ${priceId}`
    );
    return result.rows[0] || null;
  }

  async listPrices(active = true, limit = 20, offset = 0) {
    const result = await db.execute(
      sql`SELECT * FROM stripe.prices WHERE active = ${active} LIMIT ${limit} OFFSET ${offset}`
    );
    return result.rows;
  }

  async getPricesForProduct(productId: string) {
    const result = await db.execute(
      sql`SELECT * FROM stripe.prices WHERE product = ${productId} AND active = true`
    );
    return result.rows;
  }

  async getSubscription(subscriptionId: string) {
    const result = await db.execute(
      sql`SELECT * FROM stripe.subscriptions WHERE id = ${subscriptionId}`
    );
    return result.rows[0] || null;
  }

  async getCustomerSubscriptions(customerId: string) {
    const result = await db.execute(
      sql`SELECT * FROM stripe.subscriptions WHERE customer = ${customerId} ORDER BY created DESC`
    );
    return result.rows;
  }

  async createProduct(name: string, description: string, metadata?: Record<string, string>) {
    const stripe = await getUncachableStripeClient();
    return await stripe.products.create({
      name,
      description,
      metadata,
    });
  }

  async createPrice(
    productId: string,
    unitAmount: number,
    currency: string = 'usd',
    recurring?: { interval: 'month' | 'year' }
  ) {
    const stripe = await getUncachableStripeClient();
    return await stripe.prices.create({
      product: productId,
      unit_amount: unitAmount,
      currency,
      ...(recurring ? { recurring } : {}),
    });
  }

  async updateProduct(productId: string, updates: { name?: string; description?: string; active?: boolean; metadata?: Record<string, string> }) {
    const stripe = await getUncachableStripeClient();
    return await stripe.products.update(productId, updates);
  }

  async archiveProduct(productId: string) {
    const stripe = await getUncachableStripeClient();
    return await stripe.products.update(productId, { active: false });
  }

  // Customer Service Methods
  async listOrders(limit = 50, offset = 0) {
    const result = await db.execute(
      sql`
        SELECT 
          cs.id as session_id,
          cs.customer,
          cs.customer_email,
          cs.payment_status,
          cs.status as session_status,
          cs.amount_total,
          cs.currency,
          cs.mode,
          cs.metadata,
          cs.created,
          c.id as customer_id,
          c.email as customer_email_stripe,
          c.name as customer_name,
          pi.id as payment_intent_id,
          pi.status as payment_status_detail,
          ch.id as charge_id,
          ch.refunded
        FROM stripe.checkout_sessions cs
        LEFT JOIN stripe.customers c ON cs.customer = c.id
        LEFT JOIN stripe.payment_intents pi ON cs.payment_intent = pi.id
        LEFT JOIN stripe.charges ch ON ch.payment_intent = pi.id
        WHERE cs.payment_status IS NOT NULL
        ORDER BY cs.created DESC
        LIMIT ${limit} OFFSET ${offset}
      `
    );
    return result.rows;
  }

  async getOrderDetails(sessionId: string) {
    const result = await db.execute(
      sql`
        SELECT 
          cs.*,
          c.email as customer_email_stripe,
          c.name as customer_name,
          pi.id as payment_intent_id,
          pi.status as payment_status_detail,
          pi.amount as payment_amount,
          ch.id as charge_id,
          ch.refunded,
          ch.amount_refunded
        FROM stripe.checkout_sessions cs
        LEFT JOIN stripe.customers c ON cs.customer = c.id
        LEFT JOIN stripe.payment_intents pi ON cs.payment_intent = pi.id
        LEFT JOIN stripe.charges ch ON ch.payment_intent = pi.id
        WHERE cs.id = ${sessionId}
      `
    );
    return result.rows[0] || null;
  }

  async listAllSubscriptions(limit = 50, offset = 0) {
    const result = await db.execute(
      sql`
        SELECT 
          s.id as subscription_id,
          s.customer,
          s.status,
          s.current_period_start,
          s.current_period_end,
          s.cancel_at_period_end,
          s.canceled_at,
          s.created,
          s.metadata,
          c.email as customer_email,
          c.name as customer_name,
          p.name as product_name,
          pr.unit_amount,
          pr.currency,
          pr.recurring
        FROM stripe.subscriptions s
        LEFT JOIN stripe.customers c ON s.customer = c.id
        LEFT JOIN stripe.subscription_items si ON si.subscription = s.id
        LEFT JOIN stripe.prices pr ON si.price = pr.id
        LEFT JOIN stripe.products p ON pr.product = p.id
        ORDER BY s.created DESC
        LIMIT ${limit} OFFSET ${offset}
      `
    );
    return result.rows;
  }

  async getSubscriptionDetails(subscriptionId: string) {
    const result = await db.execute(
      sql`
        SELECT 
          s.*,
          c.email as customer_email,
          c.name as customer_name,
          c.phone as customer_phone,
          p.name as product_name,
          p.description as product_description,
          pr.unit_amount,
          pr.currency,
          pr.recurring
        FROM stripe.subscriptions s
        LEFT JOIN stripe.customers c ON s.customer = c.id
        LEFT JOIN stripe.subscription_items si ON si.subscription = s.id
        LEFT JOIN stripe.prices pr ON si.price = pr.id
        LEFT JOIN stripe.products p ON pr.product = p.id
        WHERE s.id = ${subscriptionId}
      `
    );
    return result.rows[0] || null;
  }

  async listAllCustomers(limit = 50, offset = 0) {
    const result = await db.execute(
      sql`
        SELECT 
          c.*,
          (SELECT COUNT(*) FROM stripe.subscriptions s WHERE s.customer = c.id AND s.status = 'active') as active_subscriptions,
          (SELECT COUNT(*) FROM stripe.checkout_sessions cs WHERE cs.customer = c.id AND cs.payment_status = 'paid') as total_orders
        FROM stripe.customers c
        ORDER BY c.created DESC
        LIMIT ${limit} OFFSET ${offset}
      `
    );
    return result.rows;
  }

  async getCustomerServiceStats() {
    const result = await db.execute(
      sql`
        SELECT 
          (SELECT COUNT(*) FROM stripe.subscriptions WHERE status = 'active') as active_subscriptions,
          (SELECT COUNT(*) FROM stripe.checkout_sessions WHERE payment_status = 'paid') as total_orders,
          (SELECT COUNT(*) FROM stripe.customers) as total_customers,
          (SELECT COALESCE(SUM(amount_total), 0) FROM stripe.checkout_sessions WHERE payment_status = 'paid') as total_revenue
      `
    );
    return result.rows[0] || { active_subscriptions: 0, total_orders: 0, total_customers: 0, total_revenue: 0 };
  }

  async cancelSubscription(subscriptionId: string, cancelAtPeriodEnd = true) {
    const stripe = await getUncachableStripeClient();
    if (cancelAtPeriodEnd) {
      return await stripe.subscriptions.update(subscriptionId, { cancel_at_period_end: true });
    } else {
      return await stripe.subscriptions.cancel(subscriptionId);
    }
  }

  async createRefund(chargeId: string, amount?: number, reason?: string) {
    const stripe = await getUncachableStripeClient();
    return await stripe.refunds.create({
      charge: chargeId,
      ...(amount ? { amount } : {}),
      ...(reason ? { reason: reason as any } : {}),
    });
  }
}

export const stripeService = new StripeService();
