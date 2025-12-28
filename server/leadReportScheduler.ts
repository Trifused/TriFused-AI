import { storage } from './storage';
import { sendAndLogEmail } from './emailService';
import { format, subMinutes } from 'date-fns';

const SETTING_KEY = 'lead_report';

// Default settings (fallback if database has no record)
const DEFAULT_RECIPIENTS = (process.env.LEAD_REPORT_RECIPIENTS || 'trifused@gmail.com').split(',').map(e => e.trim());
const DEFAULT_INTERVAL_MINUTES = parseInt(process.env.LEAD_REPORT_INTERVAL_MINUTES || '1', 10);

// In-memory cache of settings (loaded from database)
let REPORT_RECIPIENTS = DEFAULT_RECIPIENTS;
let REPORT_INTERVAL_MINUTES = DEFAULT_INTERVAL_MINUTES;
let INITIAL_LOOKBACK_MINUTES = REPORT_INTERVAL_MINUTES;

let lastReportSentAt: Date | null = null;
let settingsLoaded = false;

// Load settings from database on startup
async function loadSettingsFromDatabase(): Promise<void> {
  try {
    const dbSettings = await storage.getReportSettings(SETTING_KEY);
    if (dbSettings) {
      REPORT_RECIPIENTS = dbSettings.recipients.split(',').map(e => e.trim()).filter(e => e);
      REPORT_INTERVAL_MINUTES = dbSettings.intervalMinutes;
      INITIAL_LOOKBACK_MINUTES = dbSettings.intervalMinutes;
      lastReportSentAt = dbSettings.lastSentAt || null;
      console.log(`[LeadReport] Loaded settings from database: interval=${REPORT_INTERVAL_MINUTES}min, recipients=${REPORT_RECIPIENTS.join(', ')}`);
    } else {
      // Create initial record in database with defaults
      await storage.upsertReportSettings(SETTING_KEY, {
        recipients: DEFAULT_RECIPIENTS.join(', '),
        intervalMinutes: DEFAULT_INTERVAL_MINUTES,
        isActive: 1,
      });
      console.log(`[LeadReport] Created default settings in database`);
    }
    settingsLoaded = true;
  } catch (error) {
    console.error('[LeadReport] Error loading settings from database:', error);
  }
}

interface LeadReportData {
  contactSubmissions: Awaited<ReturnType<typeof storage.getAllContactSubmissions>>;
  chatLeads: Awaited<ReturnType<typeof storage.getChatLeads>>;
  serviceLeads: Awaited<ReturnType<typeof storage.getAllServiceLeads>>;
  emailSubscribers: Awaited<ReturnType<typeof storage.getAllEmailSubscribers>>;
}

interface UsageStats {
  websiteGrades: {
    total: number;
    recent: Awaited<ReturnType<typeof storage.getAllWebsiteGrades>>;
  };
  diagnosticScans: {
    total: number;
    recent: Awaited<ReturnType<typeof storage.getAllDiagnosticScans>>;
  };
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

async function getUsageStats(since: Date): Promise<UsageStats> {
  const allGrades = await storage.getAllWebsiteGrades();
  const allScans = await storage.getAllDiagnosticScans();
  const totalGrades = await storage.getWebsiteGradesCount();
  const totalScans = await storage.getDiagnosticScansCount();

  return {
    websiteGrades: {
      total: totalGrades,
      recent: allGrades.filter(g => new Date(g.createdAt) > since),
    },
    diagnosticScans: {
      total: totalScans,
      recent: allScans.filter(s => new Date(s.scannedAt) > since),
    },
  };
}

async function getTotalMetrics() {
  const [contacts, chatLeads, serviceLeads, subscribers, grades, diagnostics] = await Promise.all([
    storage.getContactSubmissionsCount(),
    storage.getChatLeadsCount(),
    storage.getServiceLeadsCount(),
    storage.getEmailSubscribersCount(),
    storage.getWebsiteGradesCount(),
    storage.getDiagnosticScansCount(),
  ]);

  return { contacts, chatLeads, serviceLeads, subscribers, grades, diagnostics };
}

function generateLeadReportHtml(
  data: LeadReportData, 
  usageStats: UsageStats,
  totalMetrics: Awaited<ReturnType<typeof getTotalMetrics>>,
  since: Date
): string {
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

  let graderRows = '';
  for (const grade of usageStats.websiteGrades.recent.slice(0, 10)) {
    graderRows += `
      <tr style="border-bottom: 1px solid rgba(255,255,255,0.1);">
        <td style="padding: 12px; color: #22d3ee;">${grade.url}</td>
        <td style="padding: 12px; color: #cbd5e1;">${grade.overallScore || '-'}</td>
        <td style="padding: 12px; color: #64748b; font-size: 12px;">${format(new Date(grade.createdAt), 'MMM d, h:mm a')}</td>
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
          <h1 style="color: #22d3ee; font-size: 28px; margin: 0 0 8px 0;">TriFused Analytics Report</h1>
          <p style="color: #94a3b8; margin: 0;">${periodStart} → ${periodEnd}</p>
        </div>

        <!-- New Leads Summary -->
        <div style="background: rgba(34, 211, 238, 0.1); border: 1px solid rgba(34, 211, 238, 0.3); border-radius: 12px; padding: 24px; margin-bottom: 32px; text-align: center;">
          <p style="color: #94a3b8; margin: 0 0 8px 0; font-size: 14px;">New Leads This Period</p>
          <p style="color: #22d3ee; font-size: 48px; font-weight: bold; margin: 0;">${totalNewLeads}</p>
        </div>

        <!-- Lead Metrics Grid -->
        <h2 style="color: #ffffff; font-size: 18px; margin-bottom: 16px; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 8px;">
          📊 Lead Metrics (New / Total)
        </h2>
        <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 32px;">
          <div style="background: rgba(255,255,255,0.05); border-radius: 8px; padding: 16px; text-align: center;">
            <p style="color: #64748b; font-size: 12px; margin: 0 0 4px 0;">Contact Forms</p>
            <p style="color: #ffffff; font-size: 24px; font-weight: bold; margin: 0;">${data.contactSubmissions.length} <span style="color: #64748b; font-size: 14px;">/ ${totalMetrics.contacts}</span></p>
          </div>
          <div style="background: rgba(255,255,255,0.05); border-radius: 8px; padding: 16px; text-align: center;">
            <p style="color: #64748b; font-size: 12px; margin: 0 0 4px 0;">Chat Leads</p>
            <p style="color: #ffffff; font-size: 24px; font-weight: bold; margin: 0;">${data.chatLeads.length} <span style="color: #64748b; font-size: 14px;">/ ${totalMetrics.chatLeads}</span></p>
          </div>
          <div style="background: rgba(255,255,255,0.05); border-radius: 8px; padding: 16px; text-align: center;">
            <p style="color: #64748b; font-size: 12px; margin: 0 0 4px 0;">Service Leads</p>
            <p style="color: #ffffff; font-size: 24px; font-weight: bold; margin: 0;">${data.serviceLeads.length} <span style="color: #64748b; font-size: 14px;">/ ${totalMetrics.serviceLeads}</span></p>
          </div>
          <div style="background: rgba(255,255,255,0.05); border-radius: 8px; padding: 16px; text-align: center;">
            <p style="color: #64748b; font-size: 12px; margin: 0 0 4px 0;">Subscribers</p>
            <p style="color: #ffffff; font-size: 24px; font-weight: bold; margin: 0;">${data.emailSubscribers.length} <span style="color: #64748b; font-size: 14px;">/ ${totalMetrics.subscribers}</span></p>
          </div>
        </div>

        <!-- Usage Stats Grid -->
        <h2 style="color: #ffffff; font-size: 18px; margin-bottom: 16px; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 8px;">
          📈 Platform Usage (New / Total)
        </h2>
        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; margin-bottom: 32px;">
          <div style="background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.3); border-radius: 8px; padding: 16px; text-align: center;">
            <p style="color: #64748b; font-size: 12px; margin: 0 0 4px 0;">🔍 Website Grades</p>
            <p style="color: #10b981; font-size: 32px; font-weight: bold; margin: 0;">${usageStats.websiteGrades.recent.length} <span style="color: #64748b; font-size: 14px;">/ ${totalMetrics.grades}</span></p>
          </div>
          <div style="background: rgba(139, 92, 246, 0.1); border: 1px solid rgba(139, 92, 246, 0.3); border-radius: 8px; padding: 16px; text-align: center;">
            <p style="color: #64748b; font-size: 12px; margin: 0 0 4px 0;">🖥️ Diagnostic Scans</p>
            <p style="color: #8b5cf6; font-size: 32px; font-weight: bold; margin: 0;">${usageStats.diagnosticScans.recent.length} <span style="color: #64748b; font-size: 14px;">/ ${totalMetrics.diagnostics}</span></p>
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

        ${usageStats.websiteGrades.recent.length > 0 ? `
        <div style="margin-bottom: 32px;">
          <h2 style="color: #ffffff; font-size: 18px; margin-bottom: 16px; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 8px;">
            🔍 Recent Website Grades (${usageStats.websiteGrades.recent.length})
          </h2>
          <table style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr style="border-bottom: 2px solid rgba(16, 185, 129, 0.3);">
                <th style="padding: 12px; text-align: left; color: #94a3b8; font-size: 12px;">URL</th>
                <th style="padding: 12px; text-align: left; color: #94a3b8; font-size: 12px;">Score</th>
                <th style="padding: 12px; text-align: left; color: #94a3b8; font-size: 12px;">Time</th>
              </tr>
            </thead>
            <tbody>
              ${graderRows}
            </tbody>
          </table>
        </div>
        ` : ''}

        ${totalNewLeads === 0 && usageStats.websiteGrades.recent.length === 0 && usageStats.diagnosticScans.recent.length === 0 ? `
        <div style="text-align: center; padding: 40px; color: #64748b;">
          <p style="font-size: 16px; margin: 0;">No new activity in this period.</p>
        </div>
        ` : ''}

        <hr style="border: none; border-top: 1px solid rgba(255,255,255,0.1); margin: 32px 0;">
        
        <p style="color: #64748b; font-size: 12px; text-align: center; margin: 0;">
          This is an automated report from TriFused. Reports are sent every ${REPORT_INTERVAL_MINUTES} minutes.<br>
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
    
    const [data, usageStats, totalMetrics] = await Promise.all([
      getLeadsSince(sinceCutoff),
      getUsageStats(sinceCutoff),
      getTotalMetrics(),
    ]);
    
    const html = generateLeadReportHtml(data, usageStats, totalMetrics, sinceCutoff);
    
    const totalNewLeads = 
      data.contactSubmissions.length + 
      data.chatLeads.length + 
      data.serviceLeads.length + 
      data.emailSubscribers.length;

    const totalActivity = totalNewLeads + usageStats.websiteGrades.recent.length + usageStats.diagnosticScans.recent.length;

    const subject = totalActivity > 0 
      ? `TriFused Analytics: ${totalNewLeads} Leads, ${usageStats.websiteGrades.recent.length} Grades, ${usageStats.diagnosticScans.recent.length} Scans`
      : 'TriFused Analytics: No New Activity';

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
          websiteGrades: usageStats.websiteGrades.recent.length,
          diagnosticScans: usageStats.diagnosticScans.recent.length,
          periodStart: sinceCutoff.toISOString(),
          periodEnd: new Date().toISOString(),
        },
      })
    );

    const results = await Promise.all(sendPromises);
    const allSuccessful = results.every(r => r.success);

    if (allSuccessful) {
      console.log(`[LeadReport] Report sent successfully to ${REPORT_RECIPIENTS.join(', ')} (${totalNewLeads} leads, ${usageStats.websiteGrades.recent.length} grades, ${usageStats.diagnosticScans.recent.length} scans)`);
      lastReportSentAt = new Date();
      // Update last sent timestamp in database
      await storage.updateReportSettingsLastSent(SETTING_KEY);
    } else {
      const failedRecipients = REPORT_RECIPIENTS.filter((_, i) => !results[i].success);
      console.error('[LeadReport] Failed to send report to:', failedRecipients.join(', '));
      // Still update timestamp if at least one succeeded to avoid duplicate sends
      if (results.some(r => r.success)) {
        lastReportSentAt = new Date();
        await storage.updateReportSettingsLastSent(SETTING_KEY);
      }
    }
  } catch (error) {
    console.error('[LeadReport] Error generating/sending report:', error);
  }
}

let schedulerInterval: NodeJS.Timeout | null = null;

export async function startLeadReportScheduler() {
  if (schedulerInterval) {
    console.log('[LeadReport] Scheduler already running');
    return;
  }

  // Load settings from database first
  await loadSettingsFromDatabase();

  console.log(`[LeadReport] Starting scheduler - reports will be sent every ${REPORT_INTERVAL_MINUTES} minutes to ${REPORT_RECIPIENTS.join(', ')}`);
  
  // Send first report after 1 minute to allow system to fully initialize
  setTimeout(() => {
    sendLeadReport();
  }, 60 * 1000);

  // Then send at configured interval
  schedulerInterval = setInterval(() => {
    sendLeadReport();
  }, REPORT_INTERVAL_MINUTES * 60 * 1000);
}

export function stopLeadReportScheduler() {
  if (schedulerInterval) {
    clearInterval(schedulerInterval);
    schedulerInterval = null;
    console.log('[LeadReport] Scheduler stopped');
  }
}

// Update settings dynamically (can be called from admin API) - persists to database
export async function updateReportSettings(options: {
  recipients?: string[];
  intervalMinutes?: number;
  updatedBy?: string;
}) {
  if (options.recipients) {
    REPORT_RECIPIENTS = options.recipients;
  }
  if (options.intervalMinutes && options.intervalMinutes >= 1) {
    REPORT_INTERVAL_MINUTES = options.intervalMinutes;
    INITIAL_LOOKBACK_MINUTES = options.intervalMinutes;
    
    // Restart the scheduler with new interval
    if (schedulerInterval) {
      stopLeadReportScheduler();
      await startLeadReportScheduler();
    }
  }
  
  // Persist to database
  await storage.upsertReportSettings(SETTING_KEY, {
    recipients: REPORT_RECIPIENTS.join(', '),
    intervalMinutes: REPORT_INTERVAL_MINUTES,
    isActive: 1,
    updatedBy: options.updatedBy,
  });
  
  console.log(`[LeadReport] Settings updated and persisted: interval=${REPORT_INTERVAL_MINUTES}min, recipients=${REPORT_RECIPIENTS.join(', ')}`);
}

export function getReportSettings() {
  return {
    recipients: REPORT_RECIPIENTS,
    intervalMinutes: REPORT_INTERVAL_MINUTES,
  };
}

// Export for manual trigger from admin
export { sendLeadReport };
