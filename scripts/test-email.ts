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
    throw new Error('X_REPLIT_TOKEN not found');
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

async function main() {
  const { apiKey, fromEmail } = await getCredentials();
  console.log('Using from email:', fromEmail);
  const client = new Resend(apiKey);
  
  const htmlContent = '<html><body style="font-family: -apple-system, sans-serif; background-color: #0a0a0f; color: #fff; padding: 40px 20px;"><div style="max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); border-radius: 16px; border: 1px solid rgba(34, 211, 238, 0.2); padding: 40px;"><h1 style="color: #22d3ee; text-align: center;">TriFused</h1><p style="color: #94a3b8; text-align: center;">AI-Native Technology Services</p><h2 style="color: #fff;">Welcome!</h2><p style="color: #cbd5e1;">This is a test email to verify the Resend integration is working correctly. Your TriFused Portal email system is ready!</p><div style="text-align: center; margin: 32px 0;"><a href="https://trifused.com/portal/login" style="display: inline-block; background: linear-gradient(135deg, #22d3ee 0%, #0891b2 100%); color: #0a0a0f; font-weight: 600; text-decoration: none; padding: 14px 32px; border-radius: 8px;">Visit Portal</a></div><p style="color: #64748b; font-size: 12px; text-align: center;">Test email from TriFused. 2025 TriFused.</p></div></body></html>';
  
  const result = await client.emails.send({
    from: 'TriFused <noreply@mailout1.trifused.com>',
    to: 'trifused@gmail.com',
    subject: 'Welcome to Your TriFused Portal Account - Test',
    html: htmlContent
  });
  
  console.log('Email sent:', result);
}

main().catch(console.error);
