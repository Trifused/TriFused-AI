import { Resend } from 'resend';

let connectionSettings: any;

async function getCredentials() {
  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME;
  const xReplitToken = process.env.REPL_IDENTITY 
    ? 'repl ' + process.env.REPL_IDENTITY 
    : process.env.WEB_REPL_RENEWAL 
    ? 'depl ' + process.env.WEB_REPL_RENEWAL 
    : null;

  if (!xReplitToken) {
    throw new Error('X_REPLIT_TOKEN not found for repl/depl');
  }

  connectionSettings = await fetch(
    'https://' + hostname + '/api/v2/connection?include_secrets=true&connector_names=resend',
    {
      headers: {
        'Accept': 'application/json',
        'X_REPLIT_TOKEN': xReplitToken
      }
    }
  ).then(res => res.json()).then(data => data.items?.[0]);

  if (!connectionSettings || (!connectionSettings.settings.api_key)) {
    throw new Error('Resend not connected');
  }
  return {
    apiKey: connectionSettings.settings.api_key, 
    fromEmail: connectionSettings.settings.from_email
  };
}

export async function getResendClient() {
  const { apiKey, fromEmail } = await getCredentials();
  return {
    client: new Resend(apiKey),
    fromEmail
  };
}

export async function sendPortalInviteEmail(
  toEmail: string, 
  customerName: string | null, 
  inviteLink: string
) {
  try {
    const { client, fromEmail } = await getResendClient();
    
    const name = customerName || 'Valued Customer';
    
    const result = await client.emails.send({
      from: fromEmail || 'TriFused <noreply@mailout1.trifused.com>',
      to: toEmail,
      subject: 'Welcome to Your TriFused Portal Account',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #0a0a0f; color: #ffffff; margin: 0; padding: 40px 20px;">
          <div style="max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); border-radius: 16px; border: 1px solid rgba(34, 211, 238, 0.2); padding: 40px;">
            <div style="text-align: center; margin-bottom: 32px;">
              <h1 style="color: #22d3ee; font-size: 28px; margin: 0 0 8px 0;">TriFused</h1>
              <p style="color: #94a3b8; margin: 0;">AI-Native Technology Services</p>
            </div>
            
            <h2 style="color: #ffffff; font-size: 24px; margin-bottom: 16px;">Welcome, ${name}!</h2>
            
            <p style="color: #cbd5e1; font-size: 16px; line-height: 1.6; margin-bottom: 24px;">
              Your TriFused Portal account has been created. You can now access your dashboard to manage your services, view reports, and collaborate with your team.
            </p>
            
            <div style="text-align: center; margin: 32px 0;">
              <a href="${inviteLink}" style="display: inline-block; background: linear-gradient(135deg, #22d3ee 0%, #0891b2 100%); color: #0a0a0f; font-weight: 600; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-size: 16px;">
                Access Your Portal
              </a>
            </div>
            
            <p style="color: #94a3b8; font-size: 14px; line-height: 1.6;">
              If the button doesn't work, copy and paste this link into your browser:<br>
              <a href="${inviteLink}" style="color: #22d3ee; word-break: break-all;">${inviteLink}</a>
            </p>
            
            <hr style="border: none; border-top: 1px solid rgba(255,255,255,0.1); margin: 32px 0;">
            
            <p style="color: #64748b; font-size: 12px; text-align: center; margin: 0;">
              This email was sent by TriFused. If you didn't expect this email, please ignore it.<br>
              &copy; ${new Date().getFullYear()} TriFused. All rights reserved.
            </p>
          </div>
        </body>
        </html>
      `
    });
    
    console.log('Portal invite email sent to:', toEmail, result);
    return { success: true, result };
  } catch (error) {
    console.error('Failed to send portal invite email:', error);
    return { success: false, error };
  }
}

export interface EmailDomain {
  id: string;
  name: string;
  status: string;
  region: string;
  created_at: string;
}

export interface EmailServiceStatus {
  connected: boolean;
  fromEmail: string | null;
  domains: EmailDomain[];
  error: string | null;
}

export async function getEmailServiceStatus(): Promise<EmailServiceStatus> {
  try {
    const { client, fromEmail } = await getResendClient();
    
    const domainsResponse = await client.domains.list();
    
    const domains: EmailDomain[] = [];
    if (domainsResponse.data?.data) {
      for (const domain of domainsResponse.data.data) {
        domains.push({
          id: domain.id,
          name: domain.name,
          status: domain.status,
          region: domain.region,
          created_at: domain.created_at
        });
      }
    }
    
    return {
      connected: true,
      fromEmail: fromEmail || null,
      domains,
      error: null
    };
  } catch (error: any) {
    console.error('Failed to get email service status:', error);
    return {
      connected: false,
      fromEmail: null,
      domains: [],
      error: error.message || 'Failed to connect to email service'
    };
  }
}

export async function sendTestEmail(toEmail: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { client } = await getResendClient();
    
    const result = await client.emails.send({
      from: 'TriFused <noreply@mailout1.trifused.com>',
      to: toEmail,
      subject: 'TriFused Email Test',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #0a0a0f; color: #ffffff; margin: 0; padding: 40px 20px;">
          <div style="max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); border-radius: 16px; border: 1px solid rgba(34, 211, 238, 0.2); padding: 40px;">
            <div style="text-align: center; margin-bottom: 32px;">
              <h1 style="color: #22d3ee; font-size: 28px; margin: 0 0 8px 0;">TriFused</h1>
              <p style="color: #94a3b8; margin: 0;">AI-Native Technology Services</p>
            </div>
            
            <h2 style="color: #ffffff; font-size: 24px; margin-bottom: 16px;">Email Test Successful!</h2>
            
            <p style="color: #cbd5e1; font-size: 16px; line-height: 1.6; margin-bottom: 24px;">
              This is a test email to verify that the TriFused email system is working correctly. If you received this email, the configuration is successful!
            </p>
            
            <div style="background: rgba(34, 211, 238, 0.1); border: 1px solid rgba(34, 211, 238, 0.3); border-radius: 8px; padding: 16px; margin: 24px 0;">
              <p style="color: #22d3ee; font-size: 14px; margin: 0;">
                <strong>Timestamp:</strong> ${new Date().toISOString()}
              </p>
            </div>
            
            <hr style="border: none; border-top: 1px solid rgba(255,255,255,0.1); margin: 32px 0;">
            
            <p style="color: #64748b; font-size: 12px; text-align: center; margin: 0;">
              &copy; ${new Date().getFullYear()} TriFused. All rights reserved.
            </p>
          </div>
        </body>
        </html>
      `
    });
    
    if (result.error) {
      return { success: false, error: result.error.message };
    }
    
    return { success: true };
  } catch (error: any) {
    console.error('Failed to send test email:', error);
    return { success: false, error: error.message || 'Failed to send test email' };
  }
}
