import { db } from '../db';
import { rateLimitEvents, rateLimitOverrides, users, apiKeys } from '@shared/schema';
import { eq, and, gte, lte, desc, sql, count } from 'drizzle-orm';
import { format, subHours, startOfHour, endOfHour } from 'date-fns';
import { sendAndLogEmail } from './emailService';
import { getTierLimits } from './rateLimitMiddleware';

interface RateLimitStats {
  totalRequests: number;
  blockedRequests: number;
  uniqueIdentifiers: number;
  requestsByTier: Record<string, number>;
  blockedByTier: Record<string, number>;
  topIdentifiers: Array<{
    identifier: string;
    identifierType: string;
    userId: string | null;
    requestCount: number;
    blockedCount: number;
    tier: string;
  }>;
  topEndpoints: Array<{
    endpoint: string;
    requestCount: number;
    blockedCount: number;
  }>;
  hourlyBreakdown: Array<{
    hour: string;
    requests: number;
    blocked: number;
  }>;
}

export async function getRateLimitStats(startDate: Date, endDate: Date): Promise<RateLimitStats> {
  const events = await db
    .select()
    .from(rateLimitEvents)
    .where(and(
      gte(rateLimitEvents.createdAt, startDate),
      lte(rateLimitEvents.createdAt, endDate)
    ))
    .orderBy(desc(rateLimitEvents.createdAt));

  const totalRequests = events.length;
  const blockedRequests = events.filter(e => e.wasBlocked === 1).length;
  const uniqueIdentifiers = new Set(events.map(e => e.identifier)).size;

  const requestsByTier: Record<string, number> = {};
  const blockedByTier: Record<string, number> = {};
  const identifierStats: Record<string, { requestCount: number; blockedCount: number; identifierType: string; userId: string | null; tier: string }> = {};
  const endpointStats: Record<string, { requestCount: number; blockedCount: number }> = {};

  for (const event of events) {
    requestsByTier[event.tier] = (requestsByTier[event.tier] || 0) + 1;
    if (event.wasBlocked === 1) {
      blockedByTier[event.tier] = (blockedByTier[event.tier] || 0) + 1;
    }

    if (!identifierStats[event.identifier]) {
      identifierStats[event.identifier] = {
        requestCount: 0,
        blockedCount: 0,
        identifierType: event.identifierType,
        userId: event.userId,
        tier: event.tier,
      };
    }
    identifierStats[event.identifier].requestCount++;
    if (event.wasBlocked === 1) {
      identifierStats[event.identifier].blockedCount++;
    }

    if (!endpointStats[event.endpoint]) {
      endpointStats[event.endpoint] = { requestCount: 0, blockedCount: 0 };
    }
    endpointStats[event.endpoint].requestCount++;
    if (event.wasBlocked === 1) {
      endpointStats[event.endpoint].blockedCount++;
    }
  }

  const topIdentifiers = Object.entries(identifierStats)
    .map(([identifier, stats]) => ({ identifier, ...stats }))
    .sort((a, b) => b.requestCount - a.requestCount)
    .slice(0, 10);

  const topEndpoints = Object.entries(endpointStats)
    .map(([endpoint, stats]) => ({ endpoint, ...stats }))
    .sort((a, b) => b.requestCount - a.requestCount)
    .slice(0, 10);

  return {
    totalRequests,
    blockedRequests,
    uniqueIdentifiers,
    requestsByTier,
    blockedByTier,
    topIdentifiers,
    topEndpoints,
    hourlyBreakdown: [],
  };
}

export async function getActiveOverrides() {
  return db
    .select()
    .from(rateLimitOverrides)
    .where(eq(rateLimitOverrides.isActive, 1))
    .orderBy(desc(rateLimitOverrides.createdAt));
}

export async function createOverride(params: {
  targetType: string;
  targetId: string;
  maxPerMinute: number;
  maxPerDay: number;
  reason?: string;
  createdBy: string;
  expiresAt?: Date;
}) {
  const [override] = await db
    .insert(rateLimitOverrides)
    .values({
      targetType: params.targetType,
      targetId: params.targetId,
      maxPerMinute: params.maxPerMinute,
      maxPerDay: params.maxPerDay,
      reason: params.reason || null,
      createdBy: params.createdBy,
      expiresAt: params.expiresAt || null,
      isActive: 1,
    })
    .returning();
  return override;
}

export async function deactivateOverride(id: string) {
  await db
    .update(rateLimitOverrides)
    .set({ isActive: 0, updatedAt: new Date() })
    .where(eq(rateLimitOverrides.id, id));
}

function generateRateLimitReportHtml(stats: RateLimitStats, periodStart: string, periodEnd: string): string {
  const tierLimits = getTierLimits();
  const envPrefix = process.env.NODE_ENV === 'production' ? 'PROD' : 'DEV';
  const envColor = process.env.NODE_ENV === 'production' ? '#10b981' : '#f59e0b';

  const tierRows = Object.entries(tierLimits)
    .map(([tier, limits]) => `
      <tr style="border-bottom: 1px solid rgba(255,255,255,0.1);">
        <td style="padding: 12px; color: #22d3ee; text-transform: capitalize;">${tier}</td>
        <td style="padding: 12px; color: #cbd5e1; text-align: center;">${limits.max}/min</td>
        <td style="padding: 12px; color: #cbd5e1; text-align: center;">${limits.dailyMax}/day</td>
        <td style="padding: 12px; color: #10b981; text-align: center;">${stats.requestsByTier[tier] || 0}</td>
        <td style="padding: 12px; color: ${(stats.blockedByTier[tier] || 0) > 0 ? '#ef4444' : '#64748b'}; text-align: center;">${stats.blockedByTier[tier] || 0}</td>
      </tr>
    `).join('');

  const topIdentifierRows = stats.topIdentifiers.slice(0, 5).map(id => `
    <tr style="border-bottom: 1px solid rgba(255,255,255,0.1);">
      <td style="padding: 12px; color: #22d3ee; font-family: monospace; font-size: 12px;">${id.identifier.substring(0, 20)}...</td>
      <td style="padding: 12px; color: #64748b; text-transform: capitalize;">${id.identifierType}</td>
      <td style="padding: 12px; color: #cbd5e1; text-transform: capitalize;">${id.tier}</td>
      <td style="padding: 12px; color: #10b981; text-align: center;">${id.requestCount}</td>
      <td style="padding: 12px; color: ${id.blockedCount > 0 ? '#ef4444' : '#64748b'}; text-align: center;">${id.blockedCount}</td>
    </tr>
  `).join('');

  const topEndpointRows = stats.topEndpoints.slice(0, 5).map(ep => `
    <tr style="border-bottom: 1px solid rgba(255,255,255,0.1);">
      <td style="padding: 12px; color: #22d3ee; font-family: monospace;">${ep.endpoint}</td>
      <td style="padding: 12px; color: #10b981; text-align: center;">${ep.requestCount}</td>
      <td style="padding: 12px; color: ${ep.blockedCount > 0 ? '#ef4444' : '#64748b'}; text-align: center;">${ep.blockedCount}</td>
    </tr>
  `).join('');

  const blockRate = stats.totalRequests > 0 
    ? ((stats.blockedRequests / stats.totalRequests) * 100).toFixed(1) 
    : '0';

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
          <span style="display: inline-block; background: ${envColor}; color: #000; font-size: 11px; font-weight: bold; padding: 4px 10px; border-radius: 4px; margin-bottom: 12px; text-transform: uppercase;">${envPrefix}</span>
          <h1 style="color: #22d3ee; font-size: 28px; margin: 0 0 8px 0;">Rate Limit Report</h1>
          <p style="color: #94a3b8; margin: 0;">${periodStart} → ${periodEnd}</p>
        </div>

        <!-- Summary Stats -->
        <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 32px;">
          <div style="background: rgba(34, 211, 238, 0.1); border: 1px solid rgba(34, 211, 238, 0.3); border-radius: 8px; padding: 16px; text-align: center;">
            <p style="color: #64748b; font-size: 12px; margin: 0 0 4px 0;">Total Requests</p>
            <p style="color: #22d3ee; font-size: 32px; font-weight: bold; margin: 0;">${stats.totalRequests}</p>
          </div>
          <div style="background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.3); border-radius: 8px; padding: 16px; text-align: center;">
            <p style="color: #64748b; font-size: 12px; margin: 0 0 4px 0;">Blocked</p>
            <p style="color: #ef4444; font-size: 32px; font-weight: bold; margin: 0;">${stats.blockedRequests}</p>
          </div>
          <div style="background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.3); border-radius: 8px; padding: 16px; text-align: center;">
            <p style="color: #64748b; font-size: 12px; margin: 0 0 4px 0;">Block Rate</p>
            <p style="color: #10b981; font-size: 32px; font-weight: bold; margin: 0;">${blockRate}%</p>
          </div>
          <div style="background: rgba(139, 92, 246, 0.1); border: 1px solid rgba(139, 92, 246, 0.3); border-radius: 8px; padding: 16px; text-align: center;">
            <p style="color: #64748b; font-size: 12px; margin: 0 0 4px 0;">Unique Clients</p>
            <p style="color: #8b5cf6; font-size: 32px; font-weight: bold; margin: 0;">${stats.uniqueIdentifiers}</p>
          </div>
        </div>

        <!-- Tier Breakdown -->
        <h2 style="color: #ffffff; font-size: 18px; margin-bottom: 16px; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 8px;">
          📊 Tier Breakdown
        </h2>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 32px;">
          <thead>
            <tr style="border-bottom: 2px solid rgba(255,255,255,0.2);">
              <th style="padding: 12px; text-align: left; color: #94a3b8;">Tier</th>
              <th style="padding: 12px; text-align: center; color: #94a3b8;">Limit/Min</th>
              <th style="padding: 12px; text-align: center; color: #94a3b8;">Limit/Day</th>
              <th style="padding: 12px; text-align: center; color: #94a3b8;">Requests</th>
              <th style="padding: 12px; text-align: center; color: #94a3b8;">Blocked</th>
            </tr>
          </thead>
          <tbody>
            ${tierRows}
          </tbody>
        </table>

        ${stats.topIdentifiers.length > 0 ? `
        <!-- Top Clients -->
        <h2 style="color: #ffffff; font-size: 18px; margin-bottom: 16px; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 8px;">
          🔝 Top Clients
        </h2>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 32px;">
          <thead>
            <tr style="border-bottom: 2px solid rgba(255,255,255,0.2);">
              <th style="padding: 12px; text-align: left; color: #94a3b8;">Identifier</th>
              <th style="padding: 12px; text-align: left; color: #94a3b8;">Type</th>
              <th style="padding: 12px; text-align: left; color: #94a3b8;">Tier</th>
              <th style="padding: 12px; text-align: center; color: #94a3b8;">Requests</th>
              <th style="padding: 12px; text-align: center; color: #94a3b8;">Blocked</th>
            </tr>
          </thead>
          <tbody>
            ${topIdentifierRows}
          </tbody>
        </table>
        ` : ''}

        ${stats.topEndpoints.length > 0 ? `
        <!-- Top Endpoints -->
        <h2 style="color: #ffffff; font-size: 18px; margin-bottom: 16px; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 8px;">
          🔗 Top Endpoints
        </h2>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 32px;">
          <thead>
            <tr style="border-bottom: 2px solid rgba(255,255,255,0.2);">
              <th style="padding: 12px; text-align: left; color: #94a3b8;">Endpoint</th>
              <th style="padding: 12px; text-align: center; color: #94a3b8;">Requests</th>
              <th style="padding: 12px; text-align: center; color: #94a3b8;">Blocked</th>
            </tr>
          </thead>
          <tbody>
            ${topEndpointRows}
          </tbody>
        </table>
        ` : ''}

        <div style="text-align: center; margin-top: 32px; padding-top: 24px; border-top: 1px solid rgba(255,255,255,0.1);">
          <p style="color: #64748b; font-size: 12px; margin: 0;">TriFused Rate Limit Monitoring</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

export async function sendHourlyRateLimitReport(recipients: string[]): Promise<void> {
  const now = new Date();
  const periodEnd = startOfHour(now);
  const periodStart = subHours(periodEnd, 1);

  const periodStartStr = format(periodStart, 'MMM d, h:mm a');
  const periodEndStr = format(periodEnd, 'h:mm a');

  const stats = await getRateLimitStats(periodStart, periodEnd);

  if (stats.totalRequests === 0) {
    console.log('[RateLimitReport] No API activity in the last hour, skipping report');
    return;
  }

  const html = generateRateLimitReportHtml(stats, periodStartStr, periodEndStr);
  const envPrefix = process.env.NODE_ENV === 'production' ? '[PROD]' : '[DEV]';
  const subject = stats.blockedRequests > 0
    ? `${envPrefix} Rate Limit Report: ${stats.blockedRequests} blocked of ${stats.totalRequests} requests`
    : `${envPrefix} Rate Limit Report: ${stats.totalRequests} requests (no blocks)`;

  for (const recipient of recipients) {
    await sendAndLogEmail({
      to: recipient,
      subject,
      html,
      emailType: 'rate_limit_report',
    });
  }

  console.log(`[RateLimitReport] Sent hourly report to ${recipients.length} recipients`);
}

let rateLimitReportInterval: NodeJS.Timeout | null = null;

export function startRateLimitReportScheduler(recipients: string[]): void {
  if (rateLimitReportInterval) {
    clearInterval(rateLimitReportInterval);
  }

  const msUntilNextHour = (60 - new Date().getMinutes()) * 60 * 1000;
  
  setTimeout(() => {
    sendHourlyRateLimitReport(recipients).catch(console.error);

    rateLimitReportInterval = setInterval(() => {
      sendHourlyRateLimitReport(recipients).catch(console.error);
    }, 60 * 60 * 1000);
  }, msUntilNextHour);

  console.log(`[RateLimitReport] Scheduler started - next report in ${Math.round(msUntilNextHour / 60000)} minutes`);
}

export function stopRateLimitReportScheduler(): void {
  if (rateLimitReportInterval) {
    clearInterval(rateLimitReportInterval);
    rateLimitReportInterval = null;
    console.log('[RateLimitReport] Scheduler stopped');
  }
}
