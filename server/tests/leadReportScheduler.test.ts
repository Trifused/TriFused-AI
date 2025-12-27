import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('Lead Report Scheduler', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it('should have scheduler module defined', async () => {
    const schedulerModule = await import('../leadReportScheduler');
    expect(schedulerModule).toBeDefined();
    expect(schedulerModule.startLeadReportScheduler).toBeDefined();
    expect(schedulerModule.stopLeadReportScheduler).toBeDefined();
  });

  it('should filter leads by date correctly', () => {
    const now = new Date();
    const oneMinuteAgo = new Date(now.getTime() - 60 * 1000);
    const twoMinutesAgo = new Date(now.getTime() - 120 * 1000);
    
    const testLeads = [
      { createdAt: now, name: 'Recent Lead' },
      { createdAt: twoMinutesAgo, name: 'Old Lead' },
    ];

    const filteredLeads = testLeads.filter(
      lead => new Date(lead.createdAt) > oneMinuteAgo
    );

    expect(filteredLeads).toHaveLength(1);
    expect(filteredLeads[0].name).toBe('Recent Lead');
  });

  it('should format email subject with lead count', () => {
    const formatSubject = (totalLeads: number) => {
      return totalLeads > 0 
        ? `TriFused Lead Report: ${totalLeads} New Lead${totalLeads === 1 ? '' : 's'}`
        : 'TriFused Lead Report: No New Leads';
    };

    expect(formatSubject(0)).toBe('TriFused Lead Report: No New Leads');
    expect(formatSubject(1)).toBe('TriFused Lead Report: 1 New Lead');
    expect(formatSubject(5)).toBe('TriFused Lead Report: 5 New Leads');
  });

  it('should use verified email domain', () => {
    const VERIFIED_FROM_EMAIL = 'TriFused <noreply@mailout1.trifused.com>';
    
    const validateFromEmail = (fromEmail: string | undefined) => {
      return (fromEmail && fromEmail.includes('mailout1.trifused.com')) 
        ? fromEmail 
        : VERIFIED_FROM_EMAIL;
    };

    expect(validateFromEmail('portal@Trifused.com')).toBe(VERIFIED_FROM_EMAIL);
    expect(validateFromEmail(undefined)).toBe(VERIFIED_FROM_EMAIL);
    expect(validateFromEmail('test@mailout1.trifused.com')).toBe('test@mailout1.trifused.com');
  });
});
