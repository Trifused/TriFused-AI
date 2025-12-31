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
    
    const verifiedFrom = (fromEmail && fromEmail.includes('mailout1.trifused.com')) 
      ? fromEmail 
      : 'TriFused <noreply@mailout1.trifused.com>';
    
    const result = await client.emails.send({
      from: verifiedFrom,
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
    const { client, fromEmail } = await getResendClient();
    const verifiedFrom = (fromEmail && fromEmail.includes('mailout1.trifused.com')) 
      ? fromEmail 
      : 'TriFused <noreply@mailout1.trifused.com>';
    
    const result = await client.emails.send({
      from: verifiedFrom,
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

// Email logging wrapper - logs all sent emails to the database
import { storage } from './storage';
import type { InsertEmailLog } from '@shared/schema';
import { withCircuitBreaker } from './circuitBreaker';

const VERIFIED_FROM_EMAIL = 'TriFused <noreply@mailout1.trifused.com>';

export async function sendAndLogEmail(options: {
  to: string;
  subject: string;
  html: string;
  emailType: string;
  metadata?: Record<string, any>;
}): Promise<{ success: boolean; emailLogId?: string; resendId?: string; error?: string }> {
  const { to, subject, html, emailType, metadata } = options;
  
  try {
    const { client, fromEmail } = await getResendClient();
    // Always use the verified mailout1.trifused.com domain
    const from = (fromEmail && fromEmail.includes('mailout1.trifused.com')) 
      ? fromEmail 
      : VERIFIED_FROM_EMAIL;
    
    // Wrap email sending with circuit breaker
    const result = await withCircuitBreaker('email', async () => {
      return client.emails.send({
        from,
        to,
        subject,
        html,
      });
    });

    const resendId = result.data?.id || undefined;
    const status = result.error ? 'failed' : 'sent';
    const errorMessage = result.error?.message || undefined;

    // Log the email
    const emailLog = await storage.createEmailLog({
      to,
      from,
      subject,
      emailType,
      status,
      resendId,
      errorMessage,
      metadata: metadata || null,
    });

    if (result.error) {
      return { success: false, emailLogId: emailLog.id, error: result.error.message };
    }

    return { success: true, emailLogId: emailLog.id, resendId };
  } catch (error: any) {
    // Log the failed email attempt
    try {
      const { fromEmail } = await getCredentials().catch(() => ({ fromEmail: 'unknown' }));
      const from = fromEmail || 'TriFused <noreply@mailout1.trifused.com>';
      
      const emailLog = await storage.createEmailLog({
        to,
        from,
        subject,
        emailType,
        status: 'failed',
        errorMessage: error.message || 'Unknown error',
        metadata: metadata || null,
      });
      return { success: false, emailLogId: emailLog.id, error: error.message };
    } catch (logError) {
      console.error('Failed to log email error:', logError);
      return { success: false, error: error.message || 'Failed to send email' };
    }
  }
}

// Website report card email 
export interface WebsiteReportEmailData {
  websiteUrl: string;
  overallScore: number;
  performanceScore: number;
  seoScore: number;
  securityScore: number;
  mobileScore: number;
  accessibilityScore: number;
  reportDate: Date;
  viewReportLink: string;
}

function getScoreColor(score: number): string {
  if (score >= 80) return '#22c55e'; // green
  if (score >= 60) return '#eab308'; // yellow
  if (score >= 40) return '#f97316'; // orange
  return '#ef4444'; // red
}

function getGradeLetter(score: number): string {
  if (score >= 90) return 'A';
  if (score >= 80) return 'B';
  if (score >= 70) return 'C';
  if (score >= 60) return 'D';
  return 'F';
}

export function generateWebsiteReportEmailHtml(data: WebsiteReportEmailData): string {
  const scoreColor = getScoreColor(data.overallScore);
  const gradeLetter = getGradeLetter(data.overallScore);
  const formattedDate = data.reportDate.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  const categories = [
    { name: 'Performance', score: data.performanceScore },
    { name: 'SEO', score: data.seoScore },
    { name: 'Security', score: data.securityScore },
    { name: 'Mobile', score: data.mobileScore },
    { name: 'Accessibility', score: data.accessibilityScore },
  ];

  const categoryRows = categories.map(cat => `
    <tr>
      <td style="padding: 12px 16px; color: #ffffff; font-size: 14px;">${cat.name}</td>
      <td style="padding: 12px 16px; text-align: right;">
        <span style="color: ${getScoreColor(cat.score)}; font-weight: 600; font-size: 16px;">${cat.score}</span>
        <span style="color: #94a3b8; font-size: 12px;">/100</span>
      </td>
    </tr>
  `).join('');

  return `
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
          <p style="color: #94a3b8; margin: 0;">Website Report Card</p>
        </div>
        
        <h2 style="color: #ffffff; font-size: 20px; margin-bottom: 8px; text-align: center;">
          ${data.websiteUrl}
        </h2>
        <p style="color: #64748b; font-size: 14px; text-align: center; margin-bottom: 24px;">
          Report generated on ${formattedDate}
        </p>
        
        <!-- Overall Score -->
        <div style="text-align: center; padding: 32px; background: rgba(0,0,0,0.3); border-radius: 12px; margin-bottom: 24px;">
          <div style="display: inline-block; width: 120px; height: 120px; border-radius: 50%; border: 6px solid ${scoreColor}; line-height: 108px; text-align: center;">
            <span style="font-size: 48px; font-weight: 700; color: ${scoreColor};">${gradeLetter}</span>
          </div>
          <p style="color: #ffffff; font-size: 32px; font-weight: 700; margin: 16px 0 0 0;">
            <span style="color: ${scoreColor};">${data.overallScore}</span><span style="color: #64748b; font-size: 18px;">/100</span>
          </p>
          <p style="color: #94a3b8; font-size: 14px; margin: 4px 0 0 0;">Overall Score</p>
        </div>
        
        <!-- Category Scores -->
        <table style="width: 100%; border-collapse: collapse; background: rgba(0,0,0,0.2); border-radius: 8px; overflow: hidden;">
          <thead>
            <tr style="background: rgba(34, 211, 238, 0.1);">
              <th style="padding: 12px 16px; text-align: left; color: #22d3ee; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Category</th>
              <th style="padding: 12px 16px; text-align: right; color: #22d3ee; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Score</th>
            </tr>
          </thead>
          <tbody>
            ${categoryRows}
          </tbody>
        </table>
        
        <div style="text-align: center; margin: 32px 0;">
          <a href="${data.viewReportLink}" style="display: inline-block; background: linear-gradient(135deg, #22d3ee 0%, #0891b2 100%); color: #0a0a0f; font-weight: 600; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-size: 16px;">
            View Full Report
          </a>
        </div>
        
        <p style="color: #94a3b8; font-size: 14px; line-height: 1.6; text-align: center;">
          Want to improve your scores? Our team can help optimize your website for better performance, SEO, and security.
        </p>
        
        <hr style="border: none; border-top: 1px solid rgba(255,255,255,0.1); margin: 32px 0;">
        
        <p style="color: #64748b; font-size: 12px; text-align: center; margin: 0;">
          You received this email because you subscribed to website report updates.<br>
          <a href="#" style="color: #22d3ee;">Manage your preferences</a><br><br>
          &copy; ${new Date().getFullYear()} TriFused. All rights reserved.
        </p>
      </div>
    </body>
    </html>
  `;
}

export async function sendWebsiteReportEmail(
  toEmail: string,
  data: WebsiteReportEmailData
): Promise<{ success: boolean; emailLogId?: string; error?: string }> {
  const html = generateWebsiteReportEmailHtml(data);
  
  return sendAndLogEmail({
    to: toEmail,
    subject: `Website Report Card: ${data.websiteUrl} - Score ${data.overallScore}/100`,
    html,
    emailType: 'website_report',
    metadata: {
      websiteUrl: data.websiteUrl,
      overallScore: data.overallScore,
      reportDate: data.reportDate.toISOString(),
    },
  });
}

export interface ServiceLeadNotificationData {
  email: string;
  businessName?: string | null;
  phoneNumber?: string | null;
  message?: string | null;
  serviceInterests?: string[] | null;
  needHelpAsap?: boolean;
  geoCity?: string | null;
  geoRegion?: string | null;
  geoCountry?: string | null;
}

export async function sendServiceLeadNotificationEmail(
  data: ServiceLeadNotificationData
): Promise<{ success: boolean; error?: string }> {
  try {
    const { client, fromEmail } = await getResendClient();
    const verifiedFrom = (fromEmail && fromEmail.includes('mailout1.trifused.com')) 
      ? fromEmail 
      : 'TriFused <noreply@mailout1.trifused.com>';
    
    const services = data.serviceInterests?.join(', ') || 'Not specified';
    const location = [data.geoCity, data.geoRegion, data.geoCountry].filter(Boolean).join(', ') || 'Unknown';
    const urgentBadge = data.needHelpAsap 
      ? '<span style="background: #ef4444; color: white; padding: 4px 12px; border-radius: 4px; font-size: 12px; font-weight: bold;">🚨 URGENT - ASAP</span>' 
      : '';
    const isDev = process.env.NODE_ENV === 'development';
    const devBadge = isDev 
      ? '<div style="background: #f59e0b; color: #000; padding: 8px 16px; border-radius: 8px; text-align: center; margin-bottom: 16px; font-weight: bold;">⚠️ DEV ENVIRONMENT - Test Submission</div>' 
      : '';
    
    const result = await client.emails.send({
      from: verifiedFrom,
      to: 'trifused@gmail.com',
      subject: `${isDev ? '[DEV] ' : ''}${data.needHelpAsap ? '🚨 URGENT: ' : ''}New Service Inquiry from ${data.businessName || data.email}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #0a0a0f; color: #ffffff; margin: 0; padding: 40px 20px;">
          <div style="max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); border-radius: 16px; border: 1px solid rgba(34, 211, 238, 0.2); padding: 40px;">
            ${devBadge}
            <div style="text-align: center; margin-bottom: 24px;">
              <h1 style="color: #22d3ee; font-size: 24px; margin: 0 0 8px 0;">New Service Inquiry</h1>
              ${urgentBadge}
            </div>
            
            <div style="background: rgba(0,0,0,0.3); border-radius: 12px; padding: 24px; margin-bottom: 24px;">
              <h3 style="color: #22d3ee; margin: 0 0 16px 0; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">Contact Details</h3>
              
              <div style="margin-bottom: 12px;">
                <span style="color: #e2e8f0; font-size: 12px; font-weight: 600;">Email:</span><br>
                <a href="mailto:${data.email}" style="color: #22d3ee; font-size: 16px; text-decoration: none;">${data.email}</a>
              </div>
              
              ${data.businessName ? `
              <div style="margin-bottom: 12px;">
                <span style="color: #e2e8f0; font-size: 12px; font-weight: 600;">Business:</span><br>
                <span style="color: #ffffff; font-size: 16px;">${data.businessName}</span>
              </div>
              ` : ''}
              
              ${data.phoneNumber ? `
              <div style="margin-bottom: 12px;">
                <span style="color: #e2e8f0; font-size: 12px; font-weight: 600;">Phone:</span><br>
                <a href="tel:${data.phoneNumber}" style="color: #22d3ee; font-size: 16px; text-decoration: none;">${data.phoneNumber}</a>
              </div>
              ` : ''}
              
              <div style="margin-bottom: 12px;">
                <span style="color: #e2e8f0; font-size: 12px; font-weight: 600;">Location:</span><br>
                <span style="color: #ffffff; font-size: 16px;">${location}</span>
              </div>
            </div>
            
            <div style="background: rgba(0,0,0,0.3); border-radius: 12px; padding: 24px; margin-bottom: 24px;">
              <h3 style="color: #22d3ee; margin: 0 0 16px 0; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">Services Interested</h3>
              <span style="color: #ffffff; font-size: 16px;">${services}</span>
            </div>
            
            ${data.message ? `
            <div style="background: rgba(0,0,0,0.3); border-radius: 12px; padding: 24px; margin-bottom: 24px;">
              <h3 style="color: #22d3ee; margin: 0 0 16px 0; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">Message</h3>
              <p style="color: #ffffff; font-size: 16px; margin: 0; white-space: pre-wrap;">${data.message}</p>
            </div>
            ` : ''}
            
            <div style="text-align: center;">
              <a href="https://trifused.com/portal/admin" style="display: inline-block; background: linear-gradient(135deg, #22d3ee 0%, #0891b2 100%); color: #0a0a0f; font-weight: 600; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-size: 16px;">
                View in Admin Portal
              </a>
            </div>
            
            <hr style="border: none; border-top: 1px solid rgba(255,255,255,0.1); margin: 32px 0;">
            
            <p style="color: #64748b; font-size: 12px; text-align: center; margin: 0;">
              This is an automated notification from TriFused.<br>
              &copy; ${new Date().getFullYear()} TriFused. All rights reserved.
            </p>
          </div>
        </body>
        </html>
      `
    });
    
    console.log('Service lead notification email sent:', result);
    return { success: true };
  } catch (error: any) {
    console.error('Failed to send service lead notification email:', error);
    return { success: false, error: error.message };
  }
}

export async function sendChatLeadNotification(data: {
  name: string;
  contactMethod: string;
  contactValue: string;
  inquiry: string;
  sessionId: string;
}) {
  try {
    const { client, fromEmail } = await getResendClient();
    
    const verifiedFrom = (fromEmail && fromEmail.includes('mailout1.trifused.com')) 
      ? fromEmail 
      : 'TriFused <noreply@mailout1.trifused.com>';
    
    const result = await client.emails.send({
      from: verifiedFrom,
      to: 'larry@trifused.com',
      subject: `New Chat Lead: ${data.name}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #0a0a0f; color: #ffffff; margin: 0; padding: 40px 20px;">
          <div style="max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); border-radius: 16px; border: 1px solid rgba(16, 185, 129, 0.3); padding: 40px;">
            <div style="text-align: center; margin-bottom: 32px;">
              <div style="display: inline-block; background: rgba(16, 185, 129, 0.2); padding: 12px; border-radius: 12px; margin-bottom: 16px;">
                <span style="font-size: 32px;">💬</span>
              </div>
              <h1 style="color: #10b981; font-size: 24px; margin: 0;">New Chat Lead Captured</h1>
            </div>
            
            <div style="display: grid; gap: 16px; margin-bottom: 24px;">
              <div style="background: rgba(0,0,0,0.3); border-radius: 12px; padding: 16px;">
                <span style="color: #94a3b8; font-size: 12px; text-transform: uppercase;">Name</span><br>
                <span style="color: #ffffff; font-size: 18px; font-weight: 600;">${data.name}</span>
              </div>
              
              <div style="background: rgba(0,0,0,0.3); border-radius: 12px; padding: 16px;">
                <span style="color: #94a3b8; font-size: 12px; text-transform: uppercase;">${data.contactMethod}</span><br>
                <a href="${data.contactMethod === 'email' ? 'mailto:' + data.contactValue : ''}" style="color: #10b981; font-size: 18px; font-weight: 600; text-decoration: none;">${data.contactValue}</a>
              </div>
              
              <div style="background: rgba(0,0,0,0.3); border-radius: 12px; padding: 16px;">
                <span style="color: #94a3b8; font-size: 12px; text-transform: uppercase;">Inquiry</span><br>
                <span style="color: #ffffff; font-size: 16px;">${data.inquiry}</span>
              </div>
            </div>
            
            <div style="text-align: center;">
              <a href="https://trifused.com/portal/admin" style="display: inline-block; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: #ffffff; font-weight: 600; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-size: 16px;">
                View in Admin Portal
              </a>
            </div>
            
            <hr style="border: none; border-top: 1px solid rgba(255,255,255,0.1); margin: 32px 0;">
            
            <p style="color: #64748b; font-size: 12px; text-align: center; margin: 0;">
              Session ID: ${data.sessionId}<br>
              &copy; ${new Date().getFullYear()} TriFused. All rights reserved.
            </p>
          </div>
        </body>
        </html>
      `
    });
    
    console.log('Chat lead notification email sent:', result);
    return { success: true };
  } catch (error: any) {
    console.error('Failed to send chat lead notification email:', error);
    return { success: false, error: error.message };
  }
}

export async function sendEmailSignupNotification(email: string) {
  try {
    const { client, fromEmail } = await getResendClient();
    
    const verifiedFrom = (fromEmail && fromEmail.includes('mailout1.trifused.com')) 
      ? fromEmail 
      : 'TriFused <noreply@mailout1.trifused.com>';
    
    const result = await client.emails.send({
      from: verifiedFrom,
      to: 'larry@trifused.com',
      subject: `New Email Signup: ${email}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #0a0a0f; color: #ffffff; margin: 0; padding: 40px 20px;">
          <div style="max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); border-radius: 16px; border: 1px solid rgba(59, 130, 246, 0.3); padding: 40px;">
            <div style="text-align: center; margin-bottom: 32px;">
              <div style="display: inline-block; background: rgba(59, 130, 246, 0.2); padding: 12px; border-radius: 12px; margin-bottom: 16px;">
                <span style="font-size: 32px;">📧</span>
              </div>
              <h1 style="color: #3b82f6; font-size: 24px; margin: 0;">New Email Signup</h1>
            </div>
            
            <div style="background: rgba(0,0,0,0.3); border-radius: 12px; padding: 24px; text-align: center; margin-bottom: 24px;">
              <span style="color: #94a3b8; font-size: 12px; text-transform: uppercase;">Email Address</span><br>
              <a href="mailto:${email}" style="color: #3b82f6; font-size: 20px; font-weight: 600; text-decoration: none;">${email}</a>
            </div>
            
            <div style="text-align: center;">
              <a href="https://trifused.com/portal/admin" style="display: inline-block; background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); color: #ffffff; font-weight: 600; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-size: 16px;">
                View in Admin Portal
              </a>
            </div>
            
            <hr style="border: none; border-top: 1px solid rgba(255,255,255,0.1); margin: 32px 0;">
            
            <p style="color: #64748b; font-size: 12px; text-align: center; margin: 0;">
              Subscribed at: ${new Date().toLocaleString()}<br>
              &copy; ${new Date().getFullYear()} TriFused. All rights reserved.
            </p>
          </div>
        </body>
        </html>
      `
    });
    
    console.log('Email signup notification sent:', result);
    return { success: true };
  } catch (error: any) {
    console.error('Failed to send email signup notification:', error);
    return { success: false, error: error.message };
  }
}

export interface Vibe2ASignupNotificationData {
  email: string;
  source: 'vibe2a' | 'portal' | 'grader' | 'vibe2a_cta' | 'vibe2a_offer_card';
  attemptType: 'signup_attempt' | 'signup_complete' | 'offer_click' | 'signup_click';
  selectedOffer?: string | null;
  offerId?: string | null;
  websiteUrl?: string | null;
  niche?: string | null;
  userAgent?: string | null;
  ipAddress?: string | null;
}

export async function sendVibe2ASignupNotification(
  data: Vibe2ASignupNotificationData
): Promise<{ success: boolean; error?: string }> {
  try {
    const { client, fromEmail } = await getResendClient();
    const verifiedFrom = (fromEmail && fromEmail.includes('mailout1.trifused.com')) 
      ? fromEmail 
      : 'TriFused <noreply@mailout1.trifused.com>';
    
    const isDev = process.env.NODE_ENV === 'development';
    const devBadge = isDev 
      ? '<div style="background: #f59e0b; color: #000; padding: 8px 16px; border-radius: 8px; text-align: center; margin-bottom: 16px; font-weight: bold;">⚠️ DEV ENVIRONMENT</div>' 
      : '';
    
    const typeColors: Record<string, { bg: string; text: string; label: string }> = {
      'signup_attempt': { bg: '#3b82f6', text: 'white', label: '🔵 Signup Attempt' },
      'signup_complete': { bg: '#22c55e', text: 'white', label: '✅ Signup Complete' },
      'offer_click': { bg: '#f59e0b', text: 'black', label: '💰 Offer Clicked' },
      'signup_click': { bg: '#8b5cf6', text: 'white', label: '👆 CTA Click (Anonymous)' },
    };
    
    const typeInfo = typeColors[data.attemptType] || typeColors['signup_attempt'];
    
    const isAnonymous = data.email.includes('@visitor.vibe2a.com');
    const anonymousBadge = isAnonymous 
      ? '<div style="background: #6366f1; color: white; padding: 6px 12px; border-radius: 6px; text-align: center; margin-bottom: 12px; font-size: 12px;">📊 Anonymous Click Tracking - Real email will be collected on signup form</div>' 
      : '';
    
    const result = await client.emails.send({
      from: verifiedFrom,
      to: 'trifused@gmail.com',
      subject: `${isDev ? '[DEV] ' : ''}[Vibe2A] ${typeInfo.label}${isAnonymous ? ' (Tracking)' : ''} - ${isAnonymous ? 'Anonymous Visitor' : data.email}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #0a0a0f; color: #ffffff; margin: 0; padding: 40px 20px;">
          <div style="max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); border-radius: 16px; border: 1px solid rgba(34, 211, 238, 0.2); padding: 40px;">
            ${devBadge}
            ${anonymousBadge}
            <div style="text-align: center; margin-bottom: 24px;">
              <span style="background: ${typeInfo.bg}; color: ${typeInfo.text}; padding: 8px 16px; border-radius: 8px; font-size: 14px; font-weight: bold;">${typeInfo.label}</span>
            </div>
            
            <div style="background: rgba(0,0,0,0.3); border-radius: 12px; padding: 24px; margin-bottom: 24px;">
              <h3 style="color: #22d3ee; margin: 0 0 16px 0; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">User Details</h3>
              
              <div style="margin-bottom: 12px;">
                <span style="color: #94a3b8; font-size: 12px;">${isAnonymous ? 'Tracking ID:' : 'Email:'}</span><br>
                ${isAnonymous 
                  ? `<span style="color: #8b5cf6; font-size: 14px; font-family: monospace;">${data.email.split('@')[0]}</span>`
                  : `<a href="mailto:${data.email}" style="color: #22d3ee; font-size: 16px; text-decoration: none;">${data.email}</a>`
                }
              </div>
              
              <div style="margin-bottom: 12px;">
                <span style="color: #94a3b8; font-size: 12px;">Source:</span><br>
                <span style="color: #ffffff; font-size: 16px;">${data.source}</span>
              </div>
              
              ${data.selectedOffer ? `
              <div style="margin-bottom: 12px;">
                <span style="color: #94a3b8; font-size: 12px;">Selected Offer:</span><br>
                <span style="color: #22c55e; font-size: 16px; font-weight: 600;">${data.selectedOffer}</span>
              </div>
              ` : ''}
              
              ${data.websiteUrl ? `
              <div style="margin-bottom: 12px;">
                <span style="color: #94a3b8; font-size: 12px;">Website:</span><br>
                <a href="${data.websiteUrl}" style="color: #22d3ee; font-size: 16px; text-decoration: none;">${data.websiteUrl}</a>
              </div>
              ` : ''}
              
              ${data.niche ? `
              <div style="margin-bottom: 12px;">
                <span style="color: #94a3b8; font-size: 12px;">Industry/Niche:</span><br>
                <span style="color: #ffffff; font-size: 16px;">${data.niche}</span>
              </div>
              ` : ''}
            </div>
            
            <div style="text-align: center;">
              <a href="https://trifused.com/portal/admin" style="display: inline-block; background: linear-gradient(135deg, #22d3ee 0%, #0891b2 100%); color: #0a0a0f; font-weight: 600; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-size: 16px;">
                View in Admin Portal
              </a>
            </div>
            
            <hr style="border: none; border-top: 1px solid rgba(255,255,255,0.1); margin: 32px 0;">
            
            <p style="color: #64748b; font-size: 12px; text-align: center; margin: 0;">
              Timestamp: ${new Date().toLocaleString()}<br>
              &copy; ${new Date().getFullYear()} TriFused / Vibe2A. All rights reserved.
            </p>
          </div>
        </body>
        </html>
      `
    });
    
    console.log('[Vibe2A] Admin notification sent:', data.attemptType, data.email);
    return { success: true };
  } catch (error: any) {
    console.error('[Vibe2A] Failed to send admin notification:', error);
    return { success: false, error: error.message };
  }
}
