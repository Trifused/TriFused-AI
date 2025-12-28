import { storage } from './storage';
import { sendWebsiteReportEmail, WebsiteReportEmailData } from './emailService';

let schedulerInterval: NodeJS.Timeout | null = null;
const SCHEDULER_CHECK_INTERVAL = 5 * 60 * 1000; // Check every 5 minutes

export async function processScheduledReports(): Promise<void> {
  try {
    const dueSchedules = await storage.getDueWebsiteReportSchedules();
    
    if (dueSchedules.length === 0) {
      return;
    }
    
    console.log(`[WebsiteReportScheduler] Processing ${dueSchedules.length} due report(s)`);
    
    for (const schedule of dueSchedules) {
      try {
        await sendScheduledReport(schedule.id);
      } catch (error) {
        console.error(`[WebsiteReportScheduler] Failed to process schedule ${schedule.id}:`, error);
      }
    }
  } catch (error) {
    console.error('[WebsiteReportScheduler] Error checking for due reports:', error);
  }
}

export async function sendScheduledReport(scheduleId: string): Promise<{ success: boolean; error?: string }> {
  const schedule = await storage.getWebsiteReportSchedule(scheduleId);
  if (!schedule) {
    return { success: false, error: 'Schedule not found' };
  }
  
  if (schedule.frequency === 'disabled' || !schedule.isActive) {
    return { success: false, error: 'Schedule is disabled' };
  }
  
  const userWebsite = await storage.getUserWebsite(schedule.userWebsiteId);
  if (!userWebsite) {
    return { success: false, error: 'Website not found' };
  }
  
  const user = await storage.getUser(schedule.userId);
  if (!user) {
    return { success: false, error: 'User not found' };
  }
  
  const recipientEmail = schedule.recipientEmail || user.email;
  if (!recipientEmail) {
    return { success: false, error: 'No recipient email' };
  }
  
  let gradeData = null;
  if (userWebsite.lastGradeId) {
    gradeData = await storage.getWebsiteGrade(userWebsite.lastGradeId);
  }
  
  if (!gradeData) {
    return { success: false, error: 'No grade data available for this website' };
  }
  
  const baseUrl = process.env.BASE_URL || 'https://trifused.com';
  const viewReportLink = userWebsite.lastShareToken 
    ? `${baseUrl}/website-report/${userWebsite.lastShareToken}`
    : `${baseUrl}/portal`;
  
  const reportData: WebsiteReportEmailData = {
    websiteUrl: userWebsite.url,
    overallScore: gradeData.overallScore || 0,
    performanceScore: gradeData.performanceScore || 0,
    seoScore: gradeData.seoScore || 0,
    securityScore: gradeData.securityScore || 0,
    mobileScore: gradeData.mobileScore || 0,
    accessibilityScore: gradeData.accessibilityScore || 0,
    reportDate: new Date(),
    viewReportLink,
  };
  
  const result = await sendWebsiteReportEmail(recipientEmail, reportData);
  
  if (result.success) {
    const nextScheduledAt = calculateNextScheduledDate(schedule.frequency);
    await storage.updateWebsiteReportSchedule(schedule.id, {
      lastSentAt: new Date(),
      nextScheduledAt,
    });
    console.log(`[WebsiteReportScheduler] Sent report for ${userWebsite.url} to ${recipientEmail}`);
  }
  
  return result;
}

export async function sendInstantReport(
  userWebsiteId: string,
  userId: string,
  recipientEmail?: string
): Promise<{ success: boolean; error?: string }> {
  const userWebsite = await storage.getUserWebsite(userWebsiteId);
  if (!userWebsite) {
    return { success: false, error: 'Website not found' };
  }
  
  if (userWebsite.userId !== userId) {
    return { success: false, error: 'Unauthorized' };
  }
  
  const user = await storage.getUser(userId);
  if (!user) {
    return { success: false, error: 'User not found' };
  }
  
  const toEmail = recipientEmail || user.email;
  if (!toEmail) {
    return { success: false, error: 'No recipient email' };
  }
  
  let gradeData = null;
  if (userWebsite.lastGradeId) {
    gradeData = await storage.getWebsiteGrade(userWebsite.lastGradeId);
  }
  
  if (!gradeData) {
    return { success: false, error: 'No grade data available. Please run a scan first.' };
  }
  
  const baseUrl = process.env.BASE_URL || 'https://trifused.com';
  const viewReportLink = userWebsite.lastShareToken 
    ? `${baseUrl}/website-report/${userWebsite.lastShareToken}`
    : `${baseUrl}/portal`;
  
  const reportData: WebsiteReportEmailData = {
    websiteUrl: userWebsite.url,
    overallScore: gradeData.overallScore || 0,
    performanceScore: gradeData.performanceScore || 0,
    seoScore: gradeData.seoScore || 0,
    securityScore: gradeData.securityScore || 0,
    mobileScore: gradeData.mobileScore || 0,
    accessibilityScore: gradeData.accessibilityScore || 0,
    reportDate: new Date(),
    viewReportLink,
  };
  
  return sendWebsiteReportEmail(toEmail, reportData);
}

function calculateNextScheduledDate(frequency: string): Date {
  const now = new Date();
  switch (frequency) {
    case 'daily':
      return new Date(now.getTime() + 24 * 60 * 60 * 1000);
    case 'weekly':
      return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    case 'monthly':
      const next = new Date(now);
      next.setMonth(next.getMonth() + 1);
      return next;
    default:
      return new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  }
}

export function startWebsiteReportScheduler(): void {
  if (schedulerInterval) {
    console.log('[WebsiteReportScheduler] Already running');
    return;
  }
  
  console.log('[WebsiteReportScheduler] Starting scheduler (checks every 5 minutes)');
  
  processScheduledReports();
  
  schedulerInterval = setInterval(processScheduledReports, SCHEDULER_CHECK_INTERVAL);
}

export function stopWebsiteReportScheduler(): void {
  if (schedulerInterval) {
    clearInterval(schedulerInterval);
    schedulerInterval = null;
    console.log('[WebsiteReportScheduler] Stopped');
  }
}
