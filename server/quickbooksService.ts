import OAuthClient from 'intuit-oauth';
import { db } from '../db';
import { quickbooksTokens, quickbooksSyncLog } from '@shared/schema';
import { eq } from 'drizzle-orm';

const QUICKBOOKS_CLIENT_ID = process.env.QUICKBOOKS_CLIENT_ID;
const QUICKBOOKS_CLIENT_SECRET = process.env.QUICKBOOKS_CLIENT_SECRET;
const QUICKBOOKS_REDIRECT_URI = process.env.QUICKBOOKS_REDIRECT_URI || 'https://trifused.com/api/quickbooks/callback';
const QUICKBOOKS_ENVIRONMENT = process.env.QUICKBOOKS_ENVIRONMENT || 'sandbox';

let oauthClient: OAuthClient | null = null;

function getOAuthClient(): OAuthClient {
  if (!oauthClient) {
    if (!QUICKBOOKS_CLIENT_ID || !QUICKBOOKS_CLIENT_SECRET) {
      throw new Error('QuickBooks credentials not configured');
    }
    oauthClient = new OAuthClient({
      clientId: QUICKBOOKS_CLIENT_ID,
      clientSecret: QUICKBOOKS_CLIENT_SECRET,
      environment: QUICKBOOKS_ENVIRONMENT as 'sandbox' | 'production',
      redirectUri: QUICKBOOKS_REDIRECT_URI,
    });
  }
  return oauthClient;
}

export function isQuickBooksConfigured(): boolean {
  return !!(QUICKBOOKS_CLIENT_ID && QUICKBOOKS_CLIENT_SECRET);
}

export function getAuthorizationUrl(state?: string): string {
  const client = getOAuthClient();
  return client.authorizeUri({
    scope: [OAuthClient.scopes.Accounting, OAuthClient.scopes.OpenId],
    state: state || 'trifused-qb-auth',
  });
}

export async function handleCallback(url: string): Promise<{ realmId: string; companyName: string }> {
  const client = getOAuthClient();
  
  const authResponse = await client.createToken(url);
  const token = authResponse.getJson();
  
  const realmId = new URL(url, 'https://trifused.com').searchParams.get('realmId');
  if (!realmId) {
    throw new Error('Missing realmId in callback');
  }
  
  let companyName = 'Unknown Company';
  try {
    const companyInfo = await getCompanyInfo(realmId, token.access_token);
    companyName = companyInfo?.CompanyName || 'Unknown Company';
  } catch (e) {
    console.error('Failed to get company info:', e);
  }
  
  const accessTokenExpiresAt = new Date(Date.now() + (token.expires_in || 3600) * 1000);
  const refreshTokenExpiresAt = new Date(Date.now() + (token.x_refresh_token_expires_in || 100 * 24 * 60 * 60) * 1000);
  
  const existing = await db.select().from(quickbooksTokens).where(eq(quickbooksTokens.realmId, realmId)).limit(1);
  
  if (existing.length > 0) {
    await db.update(quickbooksTokens)
      .set({
        accessToken: token.access_token,
        refreshToken: token.refresh_token,
        accessTokenExpiresAt,
        refreshTokenExpiresAt,
        companyName,
        isActive: 1,
        updatedAt: new Date(),
      })
      .where(eq(quickbooksTokens.realmId, realmId));
  } else {
    await db.insert(quickbooksTokens).values({
      realmId,
      accessToken: token.access_token,
      refreshToken: token.refresh_token,
      accessTokenExpiresAt,
      refreshTokenExpiresAt,
      companyName,
      environment: QUICKBOOKS_ENVIRONMENT,
      isActive: 1,
    });
  }
  
  return { realmId, companyName };
}

export async function getActiveConnection(): Promise<{
  realmId: string;
  companyName: string | null;
  environment: string;
  isActive: boolean;
  expiresAt: Date;
} | null> {
  const tokens = await db.select()
    .from(quickbooksTokens)
    .where(eq(quickbooksTokens.isActive, 1))
    .limit(1);
  
  if (tokens.length === 0) return null;
  
  const token = tokens[0];
  return {
    realmId: token.realmId,
    companyName: token.companyName,
    environment: token.environment,
    isActive: token.isActive === 1,
    expiresAt: token.accessTokenExpiresAt,
  };
}

async function getValidAccessToken(realmId: string): Promise<string> {
  const tokens = await db.select()
    .from(quickbooksTokens)
    .where(eq(quickbooksTokens.realmId, realmId))
    .limit(1);
  
  if (tokens.length === 0) {
    throw new Error('QuickBooks not connected');
  }
  
  const token = tokens[0];
  
  if (new Date() >= token.accessTokenExpiresAt) {
    return await refreshAccessToken(realmId);
  }
  
  return token.accessToken;
}

async function refreshAccessToken(realmId: string): Promise<string> {
  const tokens = await db.select()
    .from(quickbooksTokens)
    .where(eq(quickbooksTokens.realmId, realmId))
    .limit(1);
  
  if (tokens.length === 0) {
    throw new Error('QuickBooks not connected');
  }
  
  const token = tokens[0];
  const client = getOAuthClient();
  
  client.setToken({
    access_token: token.accessToken,
    refresh_token: token.refreshToken,
    token_type: 'Bearer',
    expires_in: 3600,
    x_refresh_token_expires_in: 100 * 24 * 60 * 60,
  });
  
  const authResponse = await client.refresh();
  const newToken = authResponse.getJson();
  
  const accessTokenExpiresAt = new Date(Date.now() + (newToken.expires_in || 3600) * 1000);
  const refreshTokenExpiresAt = new Date(Date.now() + (newToken.x_refresh_token_expires_in || 100 * 24 * 60 * 60) * 1000);
  
  await db.update(quickbooksTokens)
    .set({
      accessToken: newToken.access_token,
      refreshToken: newToken.refresh_token,
      accessTokenExpiresAt,
      refreshTokenExpiresAt,
      updatedAt: new Date(),
    })
    .where(eq(quickbooksTokens.realmId, realmId));
  
  return newToken.access_token;
}

async function getCompanyInfo(realmId: string, accessToken: string): Promise<any> {
  const baseUrl = QUICKBOOKS_ENVIRONMENT === 'production'
    ? 'https://quickbooks.api.intuit.com'
    : 'https://sandbox-quickbooks.api.intuit.com';
  
  const response = await fetch(
    `${baseUrl}/v3/company/${realmId}/companyinfo/${realmId}?minorversion=65`,
    {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/json',
      },
    }
  );
  
  if (!response.ok) {
    throw new Error(`QuickBooks API error: ${response.status}`);
  }
  
  const data = await response.json();
  return data.CompanyInfo;
}

export async function createCustomer(realmId: string, customer: {
  email: string;
  displayName: string;
  givenName?: string;
  familyName?: string;
}): Promise<any> {
  const accessToken = await getValidAccessToken(realmId);
  const baseUrl = QUICKBOOKS_ENVIRONMENT === 'production'
    ? 'https://quickbooks.api.intuit.com'
    : 'https://sandbox-quickbooks.api.intuit.com';
  
  const response = await fetch(
    `${baseUrl}/v3/company/${realmId}/customer?minorversion=65`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        DisplayName: customer.displayName,
        GivenName: customer.givenName,
        FamilyName: customer.familyName,
        PrimaryEmailAddr: { Address: customer.email },
      }),
    }
  );
  
  if (!response.ok) {
    const error = await response.text();
    console.error('QuickBooks create customer error:', error);
    throw new Error(`Failed to create QuickBooks customer: ${response.status}`);
  }
  
  const data = await response.json();
  
  await db.insert(quickbooksSyncLog).values({
    realmId,
    syncType: 'customer_create',
    quickbooksId: data.Customer?.Id,
    status: 'success',
    metadata: { email: customer.email, displayName: customer.displayName },
  });
  
  return data.Customer;
}

export async function findCustomerByEmail(realmId: string, email: string): Promise<any | null> {
  const accessToken = await getValidAccessToken(realmId);
  const baseUrl = QUICKBOOKS_ENVIRONMENT === 'production'
    ? 'https://quickbooks.api.intuit.com'
    : 'https://sandbox-quickbooks.api.intuit.com';
  
  const query = `select * from Customer where PrimaryEmailAddr = '${email}'`;
  const response = await fetch(
    `${baseUrl}/v3/company/${realmId}/query?query=${encodeURIComponent(query)}&minorversion=65`,
    {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/json',
      },
    }
  );
  
  if (!response.ok) {
    throw new Error(`QuickBooks query error: ${response.status}`);
  }
  
  const data = await response.json();
  return data.QueryResponse?.Customer?.[0] || null;
}

export async function createInvoice(realmId: string, invoice: {
  customerId: string;
  lineItems: Array<{
    description: string;
    amount: number;
    quantity?: number;
  }>;
  dueDate?: Date;
  memo?: string;
}): Promise<any> {
  const accessToken = await getValidAccessToken(realmId);
  const baseUrl = QUICKBOOKS_ENVIRONMENT === 'production'
    ? 'https://quickbooks.api.intuit.com'
    : 'https://sandbox-quickbooks.api.intuit.com';
  
  const lines = invoice.lineItems.map(item => ({
    Amount: item.amount,
    Description: item.description,
    DetailType: 'SalesItemLineDetail',
    SalesItemLineDetail: {
      Qty: item.quantity || 1,
      UnitPrice: item.amount / (item.quantity || 1),
    },
  }));
  
  const invoiceData: any = {
    CustomerRef: { value: invoice.customerId },
    Line: lines,
  };
  
  if (invoice.dueDate) {
    invoiceData.DueDate = invoice.dueDate.toISOString().split('T')[0];
  }
  
  if (invoice.memo) {
    invoiceData.CustomerMemo = { value: invoice.memo };
  }
  
  const response = await fetch(
    `${baseUrl}/v3/company/${realmId}/invoice?minorversion=65`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(invoiceData),
    }
  );
  
  if (!response.ok) {
    const error = await response.text();
    console.error('QuickBooks create invoice error:', error);
    throw new Error(`Failed to create QuickBooks invoice: ${response.status}`);
  }
  
  const data = await response.json();
  
  await db.insert(quickbooksSyncLog).values({
    realmId,
    syncType: 'invoice_create',
    quickbooksId: data.Invoice?.Id,
    status: 'success',
    metadata: { customerId: invoice.customerId, amount: lines.reduce((sum, l) => sum + l.Amount, 0) },
  });
  
  return data.Invoice;
}

export async function syncStripePaymentToQuickBooks(
  stripeCustomerEmail: string,
  stripeCustomerName: string | null,
  productName: string,
  amount: number,
  stripePaymentId: string
): Promise<{ success: boolean; invoiceId?: string; error?: string }> {
  try {
    const connection = await getActiveConnection();
    if (!connection) {
      return { success: false, error: 'QuickBooks not connected' };
    }
    
    const realmId = connection.realmId;
    
    let qbCustomer = await findCustomerByEmail(realmId, stripeCustomerEmail);
    
    if (!qbCustomer) {
      qbCustomer = await createCustomer(realmId, {
        email: stripeCustomerEmail,
        displayName: stripeCustomerName || stripeCustomerEmail,
        givenName: stripeCustomerName?.split(' ')[0],
        familyName: stripeCustomerName?.split(' ').slice(1).join(' '),
      });
    }
    
    const invoice = await createInvoice(realmId, {
      customerId: qbCustomer.Id,
      lineItems: [{
        description: productName,
        amount: amount / 100,
        quantity: 1,
      }],
      memo: `Stripe Payment: ${stripePaymentId}`,
    });
    
    await db.insert(quickbooksSyncLog).values({
      realmId,
      syncType: 'stripe_sync',
      stripeId: stripePaymentId,
      quickbooksId: invoice.Id,
      status: 'success',
      metadata: { customerEmail: stripeCustomerEmail, productName, amount },
    });
    
    return { success: true, invoiceId: invoice.Id };
  } catch (error: any) {
    console.error('QuickBooks sync error:', error);
    
    const connection = await getActiveConnection();
    if (connection) {
      await db.insert(quickbooksSyncLog).values({
        realmId: connection.realmId,
        syncType: 'stripe_sync',
        stripeId: stripePaymentId,
        status: 'error',
        errorMessage: error.message,
        metadata: { customerEmail: stripeCustomerEmail, productName, amount },
      });
    }
    
    return { success: false, error: error.message };
  }
}

export async function getSyncLogs(limit: number = 50): Promise<any[]> {
  const logs = await db.select()
    .from(quickbooksSyncLog)
    .orderBy(quickbooksSyncLog.createdAt)
    .limit(limit);
  return logs;
}

export async function disconnect(realmId: string): Promise<void> {
  await db.update(quickbooksTokens)
    .set({ isActive: 0, updatedAt: new Date() })
    .where(eq(quickbooksTokens.realmId, realmId));
}

export async function getStatus(): Promise<{
  configured: boolean;
  connected: boolean;
  connection: {
    realmId: string;
    companyName: string | null;
    environment: string;
    expiresAt: Date;
  } | null;
  recentSyncs: number;
}> {
  const configured = isQuickBooksConfigured();
  const connection = await getActiveConnection();
  
  let recentSyncs = 0;
  if (connection) {
    const logs = await db.select()
      .from(quickbooksSyncLog)
      .where(eq(quickbooksSyncLog.realmId, connection.realmId))
      .limit(100);
    recentSyncs = logs.length;
  }
  
  return {
    configured,
    connected: !!connection,
    connection: connection ? {
      realmId: connection.realmId,
      companyName: connection.companyName,
      environment: connection.environment,
      expiresAt: connection.expiresAt,
    } : null,
    recentSyncs,
  };
}
