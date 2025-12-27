import { db } from '../db';
import { scheduledReports } from '@shared/schema';
import { eq, and, lte, sql } from 'drizzle-orm';
import { Resend } from 'resend';

async function getResendClient() {
  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME;
  const xReplitToken = process.env.REPL_IDENTITY 
    ? 'repl ' + process.env.REPL_IDENTITY 
    : process.env.WEB_REPL_RENEWAL 
    ? 'depl ' + process.env.WEB_REPL_RENEWAL 
    : null;

  if (!xReplitToken) {
    throw new Error('Resend token not available');
  }

  const connectionSettings = await fetch(
    'https://' + hostname + '/api/v2/connection?include_secrets=true&connector_names=resend',
    {
      headers: {
        'Accept': 'application/json',
        'X_REPLIT_TOKEN': xReplitToken
      }
    }
  ).then(res => res.json()).then(data => data.items?.[0]);

  if (!connectionSettings?.settings?.api_key) {
    throw new Error('Resend not connected');
  }

  return new Resend(connectionSettings.settings.api_key);
}

async function getStatusReportData() {
  const leadStats = await db.execute(sql`
    SELECT 
      (SELECT COUNT(*) FROM contact_submissions) as contact_leads,
      (SELECT COUNT(*) FROM chat_leads) as chat_leads,
      (SELECT COUNT(*) FROM service_leads) as service_leads,
      (SELECT COUNT(*) FROM email_subscribers) as email_subscribers
  `);

  const userStats = await db.execute(sql`
    SELECT 
      COUNT(*) as total_users,
      COUNT(*) FILTER (WHERE status = 'active') as active_users,
      COUNT(*) FILTER (WHERE stripe_customer_id IS NOT NULL) as paying_customers
    FROM users
  `);

  const graderStats = await db.execute(sql`
    SELECT 
      COUNT(*) as total_scans,
      COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '24 hours') as scans_today,
      ROUND(AVG(overall_score)::numeric, 1) as avg_score
    FROM website_grades
  `);

  const visitStats = await db.execute(sql`
    SELECT 
      COUNT(*) as total_visits,
      COUNT(*) FILTER (WHERE scanned_at > NOW() - INTERVAL '24 hours') as visits_today
    FROM diagnostic_scans
  `);

  const recentScans = await db.execute(sql`
    SELECT url, overall_score, performance_score, seo_score, security_score
    FROM website_grades 
    ORDER BY created_at DESC 
    LIMIT 3
  `);

  return {
    leads: leadStats.rows[0] as any,
    users: userStats.rows[0] as any,
    grader: graderStats.rows[0] as any,
    visits: visitStats.rows[0] as any,
    recentScans: recentScans.rows as any[]
  };
}

function generateStatusReportHtml(data: any, reportName: string) {
  const now = new Date().toLocaleString();
  
  return `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0a0a0f; color: #fff; padding: 40px 20px; }
    .container { max-width: 700px; margin: 0 auto; background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); border-radius: 16px; border: 1px solid rgba(34, 211, 238, 0.2); padding: 40px; }
    h1 { color: #22d3ee; margin: 0 0 8px; }
    h2 { color: #22d3ee; font-size: 18px; margin-top: 32px; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 8px; }
    .stat-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; margin: 16px 0; }
    .stat-box { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; padding: 16px; }
    .stat-value { font-size: 32px; font-weight: bold; color: #22d3ee; }
    .stat-label { font-size: 14px; color: #94a3b8; margin-top: 4px; }
    table { width: 100%; border-collapse: collapse; margin: 16px 0; }
    th, td { padding: 12px; text-align: left; border-bottom: 1px solid rgba(255,255,255,0.1); }
    th { color: #94a3b8; font-weight: 500; font-size: 12px; text-transform: uppercase; }
    td { color: #e2e8f0; }
    .badge { display: inline-block; padding: 4px 12px; border-radius: 9999px; font-size: 12px; font-weight: 500; background: rgba(34, 197, 94, 0.2); color: #22c55e; }
  </style>
</head>
<body>
  <div class="container">
    <h1>📊 ${reportName}</h1>
    <p style="color: #94a3b8; margin: 0;">Generated: ${now}</p>
    
    <h2>Overview</h2>
    <div class="stat-grid">
      <div class="stat-box">
        <div class="stat-value">${data.users?.total_users || 0}</div>
        <div class="stat-label">Total Users</div>
      </div>
      <div class="stat-box">
        <div class="stat-value">${data.grader?.total_scans || 0}</div>
        <div class="stat-label">Website Scans</div>
      </div>
      <div class="stat-box">
        <div class="stat-value">${data.visits?.total_visits || 0}</div>
        <div class="stat-label">Site Visits</div>
      </div>
      <div class="stat-box">
        <div class="stat-value">${data.grader?.scans_today || 0}</div>
        <div class="stat-label">Scans Today</div>
      </div>
    </div>

    <h2>Leads & Contacts</h2>
    <table>
      <tr><th>Source</th><th>Count</th></tr>
      <tr><td>Contact Submissions</td><td>${data.leads?.contact_leads || 0}</td></tr>
      <tr><td>Chat Leads</td><td>${data.leads?.chat_leads || 0}</td></tr>
      <tr><td>Service Leads</td><td>${data.leads?.service_leads || 0}</td></tr>
      <tr><td>Email Subscribers</td><td>${data.leads?.email_subscribers || 0}</td></tr>
    </table>

    <h2>Website Grader</h2>
    <table>
      <tr><th>Metric</th><th>Value</th></tr>
      <tr><td>Total Scans</td><td>${data.grader?.total_scans || 0}</td></tr>
      <tr><td>Scans Today</td><td>${data.grader?.scans_today || 0}</td></tr>
      <tr><td>Average Score</td><td>${data.grader?.avg_score || 'N/A'}</td></tr>
    </table>

    ${data.recentScans?.length ? `
    <h3 style="color: #e2e8f0;">Recent Scans</h3>
    <table>
      <tr><th>URL</th><th>Score</th><th>Perf</th><th>SEO</th><th>Security</th></tr>
      ${data.recentScans.map((s: any) => `
        <tr>
          <td>${s.url}</td>
          <td><span class="badge">${s.overall_score}</span></td>
          <td>${s.performance_score}</td>
          <td>${s.seo_score}</td>
          <td>${s.security_score}</td>
        </tr>
      `).join('')}
    </table>
    ` : ''}

    <hr style="border: none; border-top: 1px solid rgba(255,255,255,0.1); margin: 32px 0;">
    <p style="color: #64748b; font-size: 12px; text-align: center;">
      Automated Status Report from TriFused<br>
      © ${new Date().getFullYear()} TriFused
    </p>
  </div>
</body>
</html>
  `;
}

export async function sendScheduledReport(reportId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const reports = await db.select().from(scheduledReports).where(eq(scheduledReports.id, reportId));
    if (reports.length === 0) {
      return { success: false, error: 'Report not found' };
    }

    const report = reports[0];
    const data = await getStatusReportData();
    const html = generateStatusReportHtml(data, report.name);
    
    const resend = await getResendClient();
    await resend.emails.send({
      from: 'TriFused Reports <reports@mailout1.trifused.com>',
      to: report.recipientEmail,
      subject: `📊 ${report.name} - ${new Date().toLocaleDateString()}`,
      html
    });

    const nextRun = calculateNextRun(report.schedule);
    await db.update(scheduledReports)
      .set({ 
        lastSentAt: new Date(), 
        nextRunAt: nextRun,
        updatedAt: new Date() 
      })
      .where(eq(scheduledReports.id, reportId));

    return { success: true };
  } catch (error: any) {
    console.error('Failed to send scheduled report:', error);
    return { success: false, error: error.message };
  }
}

function calculateNextRun(schedule: string): Date {
  const now = new Date();
  switch (schedule) {
    case 'daily':
      return new Date(now.getTime() + 24 * 60 * 60 * 1000);
    case 'weekly':
      return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    case 'monthly':
      const next = new Date(now);
      next.setMonth(next.getMonth() + 1);
      return next;
    default:
      return new Date(now.getTime() + 24 * 60 * 60 * 1000);
  }
}

export async function runDueReports(): Promise<{ sent: number; errors: number }> {
  const now = new Date();
  const dueReports = await db.select()
    .from(scheduledReports)
    .where(and(
      eq(scheduledReports.isActive, 1),
      lte(scheduledReports.nextRunAt, now)
    ));

  let sent = 0;
  let errors = 0;

  for (const report of dueReports) {
    const result = await sendScheduledReport(report.id);
    if (result.success) {
      sent++;
    } else {
      errors++;
    }
  }

  return { sent, errors };
}

export async function createScheduledReport(data: {
  name: string;
  reportType?: string;
  recipientEmail: string;
  schedule: string;
}): Promise<any> {
  const nextRun = calculateNextRun(data.schedule);
  
  const result = await db.insert(scheduledReports).values({
    name: data.name,
    reportType: data.reportType || 'status',
    recipientEmail: data.recipientEmail,
    schedule: data.schedule,
    isActive: 1,
    nextRunAt: nextRun,
  }).returning();

  return result[0];
}

export async function getScheduledReports(): Promise<any[]> {
  return db.select().from(scheduledReports).orderBy(scheduledReports.createdAt);
}

export async function deleteScheduledReport(id: string): Promise<void> {
  await db.delete(scheduledReports).where(eq(scheduledReports.id, id));
}

export async function toggleScheduledReport(id: string, isActive: boolean): Promise<void> {
  await db.update(scheduledReports)
    .set({ isActive: isActive ? 1 : 0, updatedAt: new Date() })
    .where(eq(scheduledReports.id, id));
}
