import { getUncachableStripeClient } from '../stripeClient';

async function createReportProduct() {
  const stripe = await getUncachableStripeClient();
  
  const productName = 'Website Grade Report - White Label';
  
  const existingProducts = await stripe.products.list({ limit: 100 });
  const existing = existingProducts.data.find(p => p.name === productName);
  
  if (existing) {
    console.log('Product already exists:', existing.id);
    console.log('Metadata:', existing.metadata);
    return;
  }

  console.log('Creating Website Grade Report product...');
  
  const product = await stripe.products.create({
    name: productName,
    description: 'Annual subscription for white-label website grader. Embed on your subdomain or use via API. Includes 500 monthly API calls and custom branding.',
    metadata: {
      product_type: 'report_subscription',
      tier: 'pro',
      calls_included: '500',
      features: 'white-label,custom-branding,subdomain-embed,api-access,500-monthly-calls'
    }
  });

  console.log('Created product:', product.id);

  const price = await stripe.prices.create({
    product: product.id,
    unit_amount: 49567,
    currency: 'usd',
    recurring: {
      interval: 'year'
    }
  });

  console.log('Created price:', price.id, '- $495.67/year');
  console.log('Done! Product is ready in Stripe.');
}

createReportProduct().catch(console.error);
