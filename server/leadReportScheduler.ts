import { storage } from './storage';
import { sendAndLogEmail } from './emailService';
import { format, subMinutes } from 'date-fns';

const REPORT_RECIPIENTS = ['trifused@gmail.com'];
const REPORT_INTERVAL_MS = 1 * 60 * 1000; // 1 minute (for testing)
const INITIAL_LOOKBACK_MINUTES = 1; // Only look back 1 min on first run

let lastReportSentAt: Date | null = null;

interface LeadReportData {
  contactSubmissions: Awaited<ReturnType<typeof storage.getAllContactSubmissions>>;
  chatLeads: Awaited<ReturnType<typeof storage.getChatLeads>>;
  serviceLeads: Awaited<ReturnType<typeof storage.getAllServiceLeads>>;
  emailSubscribers: Awaited<ReturnType<typeof storage.getAllEmailSubscribers>>;
}

async function getLeadsSince(since: Date): Promise<LeadReportData> {
  const allContacts = await storage.getAllContactSubmissions();
  const allChatLeads = await storage.getChatLeads();
  const allServiceLeads = await storage.getAllServiceLeads();
  const allSubscribers = await storage.getAllEmailSubscribers();

  return {
    contactSubmissions: allContacts.filter(c => new Date(c.createdAt) > since),
    chatLeads: allChatLeads.filter(c => new Date(c.createdAt) > since),
    serviceLeads: allServiceLeads.filter(s => new Date(s.createdAt) > since),
    emailSubscribers: allSubscribers.filter(e => new Date(e.subscribedAt) > since),
  };
}

function generateLeadReportHtml(data: LeadReportData, since: Date): string {
  const now = new Date();
  const periodStart = format(since, 'MMM d, yyyy h:mm a');
  const periodEnd = format(now, 'MMM d, yyyy h:mm a');

  const totalNewLeads = 
    data.contactSubmissions.length + 
    data.chatLeads.length + 
    data.serviceLeads.length + 
    data.emailSubscribers.length;

  let contactRows = '';
  for (const contact of data.contactSubmissions.slice(0, 20)) {
    contactRows += `
      <tr style="border-bottom: 1px solid rgba(255,255,255,0.1);">
        <td style="padding: 12px; color: #cbd5e1;">${contact.name}</td>
        <td style="padding: 12px; color: #22d3ee;"><a href="mailto:${contact.email}" style="color: #22d3ee;">${contact.email}</a></td>
        <td style="padding: 12px; color: #94a3b8;">${contact.company || '-'}</td>
        <td style="padding: 12px; color: #64748b; font-size: 12px;">${format(new Date(contact.createdAt), 'MMM d, h:mm a')}</td>
      </tr>
    `;
  }

  let chatLeadRows = '';
  for (const lead of data.chatLeads.slice(0, 20)) {
    chatLeadRows += `
      <tr style="border-bottom: 1px solid rgba(255,255,255,0.1);">
        <td style="padding: 12px; color: #cbd5e1;">${lead.name || '-'}</td>
        <td style="padding: 12px; color: #22d3ee;">${lead.contactMethod}: ${lead.contactValue}</td>
        <td style="padding: 12px; color: #94a3b8;">${lead.inquiry.slice(0, 50)}${lead.inquiry.length > 50 ? '...' : ''}</td>
        <td style="padding: 12px; color: #64748b; font-size: 12px;">${format(new Date(lead.createdAt), 'MMM d, h:mm a')}</td>
      </tr>
    `;
  }

  let serviceLeadRows = '';
  for (const lead of data.serviceLeads.slice(0, 20)) {
    const services = lead.serviceInterests?.join(', ') || '-';
    serviceLeadRows += `
      <tr style="border-bottom: 1px solid rgba(255,255,255,0.1);">
        <td style="padding: 12px; color: #cbd5e1;">${lead.businessName || '-'}</td>
        <td style="padding: 12px; color: #22d3ee;"><a href="mailto:${lead.email}" style="color: #22d3ee;">${lead.email}</a></td>
        <td style="padding: 12px; color: #94a3b8;">${services}</td>
        <td style="padding: 12px; color: #64748b; font-size: 12px;">${format(new Date(lead.createdAt), 'MMM d, h:mm a')}</td>
      </tr>
    `;
  }

  let subscriberRows = '';
  for (const sub of data.emailSubscribers.slice(0, 20)) {
    subscriberRows += `
      <tr style="border-bottom: 1px solid rgba(255,255,255,0.1);">
        <td style="padding: 12px; color: #22d3ee;"><a href="mailto:${sub.email}" style="color: #22d3ee;">${sub.email}</a></td>
        <td style="padding: 12px; color: #64748b; font-size: 12px;">${format(new Date(sub.subscribedAt), 'MMM d, h:mm a')}</td>
      </tr>
    `;
  }

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #0a0a0f; color: #ffffff; margin: 0; padding: 40px 20px;">
      <div style="max-width: 800px; margin: 0 auto; background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); border-radius: 16px; border: 1px solid rgba(34, 211, 238, 0.2); padding: 40px;">
        
        <div style="text-align: center; margin-bottom: 32px;">
          <h1 style="color: #22d3ee; font-size: 28px; margin: 0 0 8px 0;">TriFused Lead Report</h1>
          <p style="color: #94a3b8; margin: 0;">${periodStart} → ${periodEnd}</p>
        </div>

        <div style="background: rgba(34, 211, 238, 0.1); border: 1px solid rgba(34, 211, 238, 0.3); border-radius: 12px; padding: 24px; margin-bottom: 32px; text-align: center;">
          <p style="color: #94a3b8; margin: 0 0 8px 0; font-size: 14px;">Total New Leads</p>
          <p style="color: #22d3ee; font-size: 48px; font-weight: bold; margin: 0;">${totalNewLeads}</p>
        </div>

        <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 32px;">
          <div style="background: rgba(255,255,255,0.05); border-radius: 8px; padding: 16px; text-align: center;">
            <p style="color: #64748b; font-size: 12px; margin: 0 0 4px 0;">Contact Forms</p>
            <p style="color: #ffffff; font-size: 24px; font-weight: bold; margin: 0;">${data.contactSubmissions.length}</p>
          </div>
          <div style="background: rgba(255,255,255,0.05); border-radius: 8px; padding: 16px; text-align: center;">
            <p style="color: #64748b; font-size: 12px; margin: 0 0 4px 0;">Chat Leads</p>
            <p style="color: #ffffff; font-size: 24px; font-weight: bold; margin: 0;">${data.chatLeads.length}</p>
          </div>
          <div style="background: rgba(255,255,255,0.05); border-radius: 8px; padding: 16px; text-align: center;">
            <p style="color: #64748b; font-size: 12px; margin: 0 0 4px 0;">Service Leads</p>
            <p style="color: #ffffff; font-size: 24px; font-weight: bold; margin: 0;">${data.serviceLeads.length}</p>
          </div>
          <div style="background: rgba(255,255,255,0.05); border-radius: 8px; padding: 16px; text-align: center;">
            <p style="color: #64748b; font-size: 12px; margin: 0 0 4px 0;">Subscribers</p>
            <p style="color: #ffffff; font-size: 24px; font-weight: bold; margin: 0;">${data.emailSubscribers.length}</p>
          </div>
        </div>

        ${data.contactSubmissions.length > 0 ? `
        <div style="margin-bottom: 32px;">
          <h2 style="color: #ffffff; font-size: 18px; margin-bottom: 16px; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 8px;">
            📧 Contact Form Submissions (${data.contactSubmissions.length})
          </h2>
          <table style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr style="border-bottom: 2px solid rgba(34, 211, 238, 0.3);">
                <th style="padding: 12px; text-align: left; color: #94a3b8; font-size: 12px;">Name</th>
                <th style="padding: 12px; text-align: left; color: #94a3b8; font-size: 12px;">Email</th>
                <th style="padding: 12px; text-align: left; color: #94a3b8; font-size: 12px;">Company</th>
                <th style="padding: 12px; text-align: left; color: #94a3b8; font-size: 12px;">Time</th>
              </tr>
            </thead>
            <tbody>
              ${contactRows}
            </tbody>
          </table>
        </div>
        ` : ''}

        ${data.chatLeads.length > 0 ? `
        <div style="margin-bottom: 32px;">
          <h2 style="color: #ffffff; font-size: 18px; margin-bottom: 16px; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 8px;">
            💬 Chat Leads (${data.chatLeads.length})
          </h2>
          <table style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr style="border-bottom: 2px solid rgba(34, 211, 238, 0.3);">
                <th style="padding: 12px; text-align: left; color: #94a3b8; font-size: 12px;">Name</th>
                <th style="padding: 12px; text-align: left; color: #94a3b8; font-size: 12px;">Contact</th>
                <th style="padding: 12px; text-align: left; color: #94a3b8; font-size: 12px;">Inquiry</th>
                <th style="padding: 12px; text-align: left; color: #94a3b8; font-size: 12px;">Time</th>
              </tr>
            </thead>
            <tbody>
              ${chatLeadRows}
            </tbody>
          </table>
        </div>
        ` : ''}

        ${data.serviceLeads.length > 0 ? `
        <div style="margin-bottom: 32px;">
          <h2 style="color: #ffffff; font-size: 18px; margin-bottom: 16px; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 8px;">
            🎯 Service Interest Leads (${data.serviceLeads.length})
          </h2>
          <table style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr style="border-bottom: 2px solid rgba(34, 211, 238, 0.3);">
                <th style="padding: 12px; text-align: left; color: #94a3b8; font-size: 12px;">Business</th>
                <th style="padding: 12px; text-align: left; color: #94a3b8; font-size: 12px;">Email</th>
                <th style="padding: 12px; text-align: left; color: #94a3b8; font-size: 12px;">Services</th>
                <th style="padding: 12px; text-align: left; color: #94a3b8; font-size: 12px;">Time</th>
              </tr>
            </thead>
            <tbody>
              ${serviceLeadRows}
            </tbody>
          </table>
        </div>
        ` : ''}

        ${data.emailSubscribers.length > 0 ? `
        <div style="margin-bottom: 32px;">
          <h2 style="color: #ffffff; font-size: 18px; margin-bottom: 16px; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 8px;">
            📬 New Email Subscribers (${data.emailSubscribers.length})
          </h2>
          <table style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr style="border-bottom: 2px solid rgba(34, 211, 238, 0.3);">
                <th style="padding: 12px; text-align: left; color: #94a3b8; font-size: 12px;">Email</th>
                <th style="padding: 12px; text-align: left; color: #94a3b8; font-size: 12px;">Subscribed</th>
              </tr>
            </thead>
            <tbody>
              ${subscriberRows}
            </tbody>
          </table>
        </div>
        ` : ''}

        ${totalNewLeads === 0 ? `
        <div style="text-align: center; padding: 40px; color: #64748b;">
          <p style="font-size: 16px; margin: 0;">No new leads in this period.</p>
        </div>
        ` : ''}

        <hr style="border: none; border-top: 1px solid rgba(255,255,255,0.1); margin: 32px 0;">
        
        <p style="color: #64748b; font-size: 12px; text-align: center; margin: 0;">
          This is an automated report from TriFused. Reports are sent every 15 minutes.<br>
          &copy; ${new Date().getFullYear()} TriFused. All rights reserved.
        </p>
      </div>
    </body>
    </html>
  `;
}

async function sendLeadReport() {
  try {
    // On first run, only look back INITIAL_LOOKBACK_MINUTES instead of all historical data
    const sinceCutoff = lastReportSentAt || subMinutes(new Date(), INITIAL_LOOKBACK_MINUTES);
    
    const data = await getLeadsSince(sinceCutoff);
    const html = generateLeadReportHtml(data, sinceCutoff);
    
    const totalLeads = 
      data.contactSubmissions.length + 
      data.chatLeads.length + 
      data.serviceLeads.length + 
      data.emailSubscribers.length;

    const subject = totalLeads > 0 
      ? `TriFused Lead Report: ${totalLeads} New Lead${totalLeads === 1 ? '' : 's'}`
      : 'TriFused Lead Report: No New Leads';

    // Send to all recipients
    const sendPromises = REPORT_RECIPIENTS.map(recipient => 
      sendAndLogEmail({
        to: recipient,
        subject,
        html,
        emailType: 'lead_report',
        metadata: {
          contactSubmissions: data.contactSubmissions.length,
          chatLeads: data.chatLeads.length,
          serviceLeads: data.serviceLeads.length,
          emailSubscribers: data.emailSubscribers.length,
          periodStart: sinceCutoff.toISOString(),
          periodEnd: new Date().toISOString(),
        },
      })
    );

    const results = await Promise.all(sendPromises);
    const allSuccessful = results.every(r => r.success);

    if (allSuccessful) {
      console.log(`[LeadReport] Report sent successfully to ${REPORT_RECIPIENTS.join(', ')} (${totalLeads} leads)`);
      lastReportSentAt = new Date();
    } else {
      const failedRecipients = REPORT_RECIPIENTS.filter((_, i) => !results[i].success);
      console.error('[LeadReport] Failed to send report to:', failedRecipients.join(', '));
      // Still update timestamp if at least one succeeded to avoid duplicate sends
      if (results.some(r => r.success)) {
        lastReportSentAt = new Date();
      }
    }
  } catch (error) {
    console.error('[LeadReport] Error generating/sending report:', error);
  }
}

let schedulerInterval: NodeJS.Timeout | null = null;

export function startLeadReportScheduler() {
  if (schedulerInterval) {
    console.log('[LeadReport] Scheduler already running');
    return;
  }

  console.log(`[LeadReport] Starting scheduler - reports will be sent every 1 minute to ${REPORT_RECIPIENTS.join(', ')}`);
  
  // Send first report after 10 seconds to test quickly
  setTimeout(() => {
    sendLeadReport();
  }, 10 * 1000);

  // Then send every 15 minutes
  schedulerInterval = setInterval(() => {
    sendLeadReport();
  }, REPORT_INTERVAL_MS);
}

export function stopLeadReportScheduler() {
  if (schedulerInterval) {
    clearInterval(schedulerInterval);
    schedulerInterval = null;
    console.log('[LeadReport] Scheduler stopped');
  }
}

// Export for manual trigger from admin
export { sendLeadReport };
