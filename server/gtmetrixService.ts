const GTMETRIX_API_BASE = 'https://gtmetrix.com/api/2.0';
const GTMETRIX_API_KEY = process.env.GTMETRIX_API_KEY || '';

interface GtmetrixStatus {
  api_credits: number;
  api_refill: number;
  api_refill_amount?: number;
}

interface GtmetrixTestResponse {
  data: {
    id: string;
    type: string;
    attributes: {
      state: string;
      report?: string;
    };
    links?: {
      report?: string;
    };
  };
}

interface GtmetrixReportResponse {
  data: {
    id: string;
    type: string;
    attributes: {
      browser?: { name: string };
      location?: { name: string };
      lighthouse_grade?: string;
      performance_score?: number;
      structure_score?: number;
      largest_contentful_paint?: number;
      total_blocking_time?: number;
      cumulative_layout_shift?: number;
      first_contentful_paint?: number;
      speed_index?: number;
      time_to_interactive?: number;
      fully_loaded_time?: number;
      onload_time?: number;
      page_bytes?: number;
      page_requests?: number;
      html_bytes?: number;
      html_load_time?: number;
      redirect_duration?: number;
      connect_duration?: number;
      backend_duration?: number;
    };
    links?: {
      report_pdf?: string;
      report_pdf_full?: string;
      lighthouse?: string;
      har?: string;
      screenshot?: string;
      video?: string;
    };
  };
}

class GtmetrixService {
  private getAuthHeader(): string {
    return 'Basic ' + Buffer.from(`${GTMETRIX_API_KEY}:`).toString('base64');
  }

  async checkBalance(): Promise<GtmetrixStatus | null> {
    if (!GTMETRIX_API_KEY) {
      console.warn('GTmetrix API key not configured');
      return null;
    }

    try {
      const response = await fetch(`${GTMETRIX_API_BASE}/status`, {
        headers: {
          'Authorization': this.getAuthHeader(),
        },
      });

      if (!response.ok) {
        console.error('GTmetrix status check failed:', response.status);
        return null;
      }

      const data = await response.json() as { data: { attributes: GtmetrixStatus } };
      return data.data.attributes;
    } catch (error) {
      console.error('GTmetrix status check error:', error);
      return null;
    }
  }

  async startTest(url: string, options?: {
    location?: string;
    browser?: string;
    adblock?: boolean;
  }): Promise<{ testId: string } | { error: string }> {
    if (!GTMETRIX_API_KEY) {
      return { error: 'GTmetrix API key not configured' };
    }

    try {
      const response = await fetch(`${GTMETRIX_API_BASE}/tests`, {
        method: 'POST',
        headers: {
          'Authorization': this.getAuthHeader(),
          'Content-Type': 'application/vnd.api+json',
        },
        body: JSON.stringify({
          data: {
            type: 'test',
            attributes: {
              url,
              location: options?.location || '1',
              browser: options?.browser || '3',
              adblock: options?.adblock ? 1 : 0,
              report: 'lighthouse',
            },
          },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json() as { errors?: Array<{ title: string; detail?: string }> };
        const errorMsg = errorData.errors?.[0]?.detail || errorData.errors?.[0]?.title || 'Unknown error';
        return { error: `GTmetrix test failed: ${errorMsg}` };
      }

      const data = await response.json() as GtmetrixTestResponse;
      return { testId: data.data.id };
    } catch (error) {
      console.error('GTmetrix start test error:', error);
      return { error: 'Failed to start GTmetrix test' };
    }
  }

  async getTestStatus(testId: string): Promise<{
    state: 'queued' | 'started' | 'completed' | 'error';
    reportId?: string;
  } | { error: string }> {
    if (!GTMETRIX_API_KEY) {
      return { error: 'GTmetrix API key not configured' };
    }

    try {
      const response = await fetch(`${GTMETRIX_API_BASE}/tests/${testId}`, {
        headers: {
          'Authorization': this.getAuthHeader(),
        },
      });

      if (!response.ok) {
        return { error: `GTmetrix test status failed: ${response.status}` };
      }

      const data = await response.json() as GtmetrixTestResponse;
      const state = data.data.attributes.state as 'queued' | 'started' | 'completed' | 'error';
      const reportId = data.data.attributes.report || data.data.links?.report?.split('/').pop();

      return { state, reportId };
    } catch (error) {
      console.error('GTmetrix test status error:', error);
      return { error: 'Failed to get GTmetrix test status' };
    }
  }

  async getReport(reportId: string): Promise<{
    performanceScore: number;
    structureScore: number;
    lcp: number;
    tbt: number;
    cls: number;
    fcp: number;
    speedIndex: number;
    tti: number;
    fullyLoadedTime: number;
    pageBytes: number;
    pageRequests: number;
    lighthouseGrade: string;
    pdfUrl?: string;
    screenshotUrl?: string;
  } | { error: string }> {
    if (!GTMETRIX_API_KEY) {
      return { error: 'GTmetrix API key not configured' };
    }

    try {
      const response = await fetch(`${GTMETRIX_API_BASE}/reports/${reportId}`, {
        headers: {
          'Authorization': this.getAuthHeader(),
        },
      });

      if (!response.ok) {
        return { error: `GTmetrix report fetch failed: ${response.status}` };
      }

      const data = await response.json() as GtmetrixReportResponse;
      const attrs = data.data.attributes;
      const links = data.data.links;

      return {
        performanceScore: attrs.performance_score || 0,
        structureScore: attrs.structure_score || 0,
        lcp: attrs.largest_contentful_paint || 0,
        tbt: attrs.total_blocking_time || 0,
        cls: attrs.cumulative_layout_shift || 0,
        fcp: attrs.first_contentful_paint || 0,
        speedIndex: attrs.speed_index || 0,
        tti: attrs.time_to_interactive || 0,
        fullyLoadedTime: attrs.fully_loaded_time || 0,
        pageBytes: attrs.page_bytes || 0,
        pageRequests: attrs.page_requests || 0,
        lighthouseGrade: attrs.lighthouse_grade || 'N/A',
        pdfUrl: links?.report_pdf,
        screenshotUrl: links?.screenshot,
      };
    } catch (error) {
      console.error('GTmetrix report error:', error);
      return { error: 'Failed to get GTmetrix report' };
    }
  }

  async runFullTest(url: string, options?: {
    location?: string;
    browser?: string;
    adblock?: boolean;
    maxWaitMs?: number;
    pollIntervalMs?: number;
  }): Promise<{
    success: boolean;
    report?: {
      performanceScore: number;
      structureScore: number;
      lcp: number;
      tbt: number;
      cls: number;
      fcp: number;
      speedIndex: number;
      tti: number;
      fullyLoadedTime: number;
      pageBytes: number;
      pageRequests: number;
      lighthouseGrade: string;
      pdfUrl?: string;
      screenshotUrl?: string;
    };
    error?: string;
  }> {
    const maxWait = options?.maxWaitMs || 120000;
    const pollInterval = options?.pollIntervalMs || 5000;

    const startResult = await this.startTest(url, options);
    if ('error' in startResult) {
      return { success: false, error: startResult.error };
    }

    const { testId } = startResult;
    const startTime = Date.now();

    while (Date.now() - startTime < maxWait) {
      await new Promise(resolve => setTimeout(resolve, pollInterval));

      const statusResult = await this.getTestStatus(testId);
      if ('error' in statusResult) {
        return { success: false, error: statusResult.error };
      }

      if (statusResult.state === 'completed' && statusResult.reportId) {
        const reportResult = await this.getReport(statusResult.reportId);
        if ('error' in reportResult) {
          return { success: false, error: reportResult.error };
        }
        return { success: true, report: reportResult };
      }

      if (statusResult.state === 'error') {
        return { success: false, error: 'GTmetrix test failed' };
      }
    }

    return { success: false, error: 'GTmetrix test timed out' };
  }
}

export const gtmetrixService = new GtmetrixService();
