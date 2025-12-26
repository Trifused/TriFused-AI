import puppeteer, { Browser } from 'puppeteer';

interface LighthouseResult {
  performance: number;
  accessibility: number;
  bestPractices: number;
  seo: number;
  pwa: number;
  metrics: {
    firstContentfulPaint: number;
    largestContentfulPaint: number;
    totalBlockingTime: number;
    cumulativeLayoutShift: number;
    speedIndex: number;
    timeToInteractive: number;
  };
  audits: {
    id: string;
    title: string;
    score: number | null;
    displayValue?: string;
  }[];
}

class LighthouseService {
  private validateUrl(url: string): void {
    const parsedUrl = new URL(url);
    
    // Block internal/private network access (SSRF protection)
    const blockedHosts = ['localhost', '127.0.0.1', '0.0.0.0', '::1', 'internal'];
    const blockedPatterns = [/^10\./, /^172\.(1[6-9]|2[0-9]|3[01])\./, /^192\.168\./, /\.local$/, /\.internal$/];
    
    if (blockedHosts.includes(parsedUrl.hostname.toLowerCase())) {
      throw new Error('Cannot scan internal/localhost URLs');
    }
    
    for (const pattern of blockedPatterns) {
      if (pattern.test(parsedUrl.hostname)) {
        throw new Error('Cannot scan internal network URLs');
      }
    }
    
    if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
      throw new Error('Only HTTP/HTTPS URLs are allowed');
    }
  }

  async runAudit(url: string): Promise<LighthouseResult> {
    // Validate URL before launching browser
    this.validateUrl(url);
    
    let browser: Browser | null = null;
    
    try {
      browser = await puppeteer.launch({
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-gpu',
          '--no-first-run',
          '--no-zygote',
          '--single-process',
        ],
      });

      const { default: lighthouse } = await import('lighthouse');
      
      const wsUrl = new URL(browser.wsEndpoint());
      const port = parseInt(wsUrl.port, 10);
      
      const result = await lighthouse(url, {
        port,
        output: 'json',
        logLevel: 'error',
        onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo', 'pwa'],
        formFactor: 'desktop',
        screenEmulation: {
          mobile: false,
          width: 1350,
          height: 940,
          deviceScaleFactor: 1,
          disabled: false,
        },
        throttling: {
          rttMs: 40,
          throughputKbps: 10240,
          cpuSlowdownMultiplier: 1,
          requestLatencyMs: 0,
          downloadThroughputKbps: 0,
          uploadThroughputKbps: 0,
        },
      });

      if (!result || !result.lhr) {
        throw new Error('Lighthouse audit failed - no result returned');
      }

      const lhr = result.lhr;
      const categories = lhr.categories;
      const audits = lhr.audits;

      const extractedAudits = [
        'first-contentful-paint',
        'largest-contentful-paint',
        'total-blocking-time',
        'cumulative-layout-shift',
        'speed-index',
        'interactive',
        'server-response-time',
        'render-blocking-resources',
        'uses-responsive-images',
        'uses-optimized-images',
        'uses-text-compression',
        'uses-rel-preconnect',
        'font-display',
      ].map(id => {
        const audit = audits[id];
        return audit ? {
          id,
          title: audit.title,
          score: audit.score,
          displayValue: audit.displayValue,
        } : null;
      }).filter(Boolean) as LighthouseResult['audits'];

      return {
        performance: Math.round((categories.performance?.score || 0) * 100),
        accessibility: Math.round((categories.accessibility?.score || 0) * 100),
        bestPractices: Math.round((categories['best-practices']?.score || 0) * 100),
        seo: Math.round((categories.seo?.score || 0) * 100),
        pwa: Math.round((categories.pwa?.score || 0) * 100),
        metrics: {
          firstContentfulPaint: audits['first-contentful-paint']?.numericValue || 0,
          largestContentfulPaint: audits['largest-contentful-paint']?.numericValue || 0,
          totalBlockingTime: audits['total-blocking-time']?.numericValue || 0,
          cumulativeLayoutShift: audits['cumulative-layout-shift']?.numericValue || 0,
          speedIndex: audits['speed-index']?.numericValue || 0,
          timeToInteractive: audits['interactive']?.numericValue || 0,
        },
        audits: extractedAudits,
      };
    } finally {
      if (browser) {
        await browser.close();
      }
    }
  }

  formatMetricValue(metric: string, value: number): string {
    switch (metric) {
      case 'firstContentfulPaint':
      case 'largestContentfulPaint':
      case 'speedIndex':
      case 'timeToInteractive':
      case 'totalBlockingTime':
        return `${(value / 1000).toFixed(1)}s`;
      case 'cumulativeLayoutShift':
        return value.toFixed(3);
      default:
        return String(value);
    }
  }

  getScoreColor(score: number): 'green' | 'orange' | 'red' {
    if (score >= 90) return 'green';
    if (score >= 50) return 'orange';
    return 'red';
  }
}

export const lighthouseService = new LighthouseService();
