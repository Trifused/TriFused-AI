import * as cheerio from 'cheerio';

export interface AIReadinessFinding {
  category: 'ai-readiness';
  subcategory: 'content-accessibility' | 'structured-data' | 'mcp-compliance' | 'llms-txt' | 'crawlability';
  issue: string;
  impact: string;
  priority: 'critical' | 'important' | 'optional';
  howToFix: string;
  codeExample?: string;
  passed: boolean;
}

export interface AIReadinessResult {
  score: number;
  breakdown: {
    contentAccessibility: number;
    structuredData: number;
    mcpCompliance: number;
    crawlability: number;
  };
  findings: AIReadinessFinding[];
  metadata: {
    isSSR: boolean;
    hasLlmsTxt: boolean;
    hasMcpEndpoint: boolean;
    jsonLdCount: number;
    contentExtractionRate: number;
  };
}

export async function validateAIReadiness(
  url: string,
  rawHtml: string,
  renderedHtml: string | null,
  responseHeaders: Record<string, string>
): Promise<AIReadinessResult> {
  const findings: AIReadinessFinding[] = [];
  const $ = cheerio.load(rawHtml);
  const $rendered = renderedHtml ? cheerio.load(renderedHtml) : null;
  
  let contentAccessibilityScore = 100;
  let structuredDataScore = 100;
  let mcpComplianceScore = 100;
  let crawlabilityScore = 100;

  const parsedUrl = new URL(url);
  const baseUrl = `${parsedUrl.protocol}//${parsedUrl.host}`;

  // ========================================
  // 1. CONTENT ACCESSIBILITY (SSR vs CSR)
  // ========================================
  
  const rawBodyText = $('body').text().replace(/\s+/g, ' ').trim();
  const rawBodyLength = rawBodyText.length;
  
  let renderedBodyLength = rawBodyLength;
  let isSSR = true;
  let contentExtractionRate = 100;
  
  if ($rendered) {
    const renderedBodyText = $rendered('body').text().replace(/\s+/g, ' ').trim();
    renderedBodyLength = renderedBodyText.length;
    
    if (renderedBodyLength > 0) {
      contentExtractionRate = Math.round((rawBodyLength / renderedBodyLength) * 100);
    }
    
    if (contentExtractionRate < 50) {
      isSSR = false;
      findings.push({
        category: 'ai-readiness',
        subcategory: 'content-accessibility',
        issue: `Only ${contentExtractionRate}% of content visible without JavaScript`,
        impact: 'AI crawlers and LLMs cannot access JavaScript-rendered content, limiting discoverability',
        priority: 'critical',
        howToFix: 'Implement Server-Side Rendering (SSR) or Static Site Generation (SSG) for critical content',
        codeExample: `// Next.js example with SSR
export async function getServerSideProps() {
  const data = await fetchData();
  return { props: { data } };
}`,
        passed: false,
      });
      contentAccessibilityScore -= 40;
    } else if (contentExtractionRate < 80) {
      isSSR = false;
      findings.push({
        category: 'ai-readiness',
        subcategory: 'content-accessibility',
        issue: `${contentExtractionRate}% of content accessible without JavaScript (needs improvement)`,
        impact: 'Some content may not be indexed by AI crawlers',
        priority: 'important',
        howToFix: 'Move critical content to server-rendered HTML or use progressive enhancement',
        passed: false,
      });
      contentAccessibilityScore -= 20;
    } else {
      isSSR = true;
      findings.push({
        category: 'ai-readiness',
        subcategory: 'content-accessibility',
        issue: 'Content is accessible without JavaScript (SSR/SSG detected)',
        impact: 'AI crawlers can fully access your content',
        priority: 'optional',
        howToFix: '',
        passed: true,
      });
    }
  } else {
    if (rawBodyLength < 500) {
      findings.push({
        category: 'ai-readiness',
        subcategory: 'content-accessibility',
        issue: 'Very little content in initial HTML (likely client-side rendered)',
        impact: 'AI crawlers may not be able to extract meaningful content',
        priority: 'critical',
        howToFix: 'Implement SSR or include critical content in initial HTML response',
        passed: false,
      });
      contentAccessibilityScore -= 35;
      isSSR = false;
    }
  }

  const noscriptContent = $('noscript').text().trim();
  if (!noscriptContent && rawBodyLength < 1000) {
    findings.push({
      category: 'ai-readiness',
      subcategory: 'content-accessibility',
      issue: 'No <noscript> fallback content',
      impact: 'Users and crawlers without JavaScript see nothing useful',
      priority: 'important',
      howToFix: 'Add <noscript> tag with meaningful fallback content',
      codeExample: `<noscript>
  <p>This site requires JavaScript. Please enable JavaScript or visit our sitemap.</p>
  <a href="/sitemap">View Sitemap</a>
</noscript>`,
      passed: false,
    });
    contentAccessibilityScore -= 10;
  }

  // ========================================
  // 2. STRUCTURED DATA (JSON-LD, OpenGraph)
  // ========================================
  
  const jsonLdScripts = $('script[type="application/ld+json"]');
  const jsonLdCount = jsonLdScripts.length;
  
  if (jsonLdCount === 0) {
    findings.push({
      category: 'ai-readiness',
      subcategory: 'structured-data',
      issue: 'No JSON-LD structured data found',
      impact: 'AI systems cannot understand your content structure, reducing discoverability',
      priority: 'critical',
      howToFix: 'Add JSON-LD structured data using schema.org vocabulary',
      codeExample: `<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Your Company",
  "url": "${url}",
  "description": "Your company description"
}
</script>`,
      passed: false,
    });
    structuredDataScore -= 30;
  } else {
    let validJsonLd = 0;
    let hasOrganization = false;
    let hasWebsite = false;
    let hasWebPage = false;
    
    jsonLdScripts.each((_, el) => {
      try {
        const content = $(el).html() || '';
        const parsed = JSON.parse(content);
        validJsonLd++;
        
        const type = parsed['@type'] || (Array.isArray(parsed) ? parsed[0]?.['@type'] : null);
        if (type === 'Organization' || type === 'LocalBusiness') hasOrganization = true;
        if (type === 'WebSite') hasWebsite = true;
        if (type === 'WebPage' || type === 'Article') hasWebPage = true;
      } catch {
        findings.push({
          category: 'ai-readiness',
          subcategory: 'structured-data',
          issue: 'Invalid JSON-LD syntax detected',
          impact: 'Malformed structured data is ignored by AI systems',
          priority: 'critical',
          howToFix: 'Validate your JSON-LD at https://validator.schema.org/',
          passed: false,
        });
        structuredDataScore -= 15;
      }
    });
    
    if (validJsonLd > 0) {
      findings.push({
        category: 'ai-readiness',
        subcategory: 'structured-data',
        issue: `${validJsonLd} valid JSON-LD schema(s) found`,
        impact: 'Structured data helps AI understand your content',
        priority: 'optional',
        howToFix: '',
        passed: true,
      });
      
      if (!hasOrganization && !hasWebsite) {
        findings.push({
          category: 'ai-readiness',
          subcategory: 'structured-data',
          issue: 'Missing Organization or WebSite schema',
          impact: 'AI systems may not properly identify your brand/organization',
          priority: 'important',
          howToFix: 'Add Organization schema with name, logo, and contact info',
          passed: false,
        });
        structuredDataScore -= 10;
      }
    }
  }

  const ogTitle = $('meta[property="og:title"]').attr('content');
  const ogDescription = $('meta[property="og:description"]').attr('content');
  const ogImage = $('meta[property="og:image"]').attr('content');
  const ogType = $('meta[property="og:type"]').attr('content');
  
  const ogTagsPresent = [ogTitle, ogDescription, ogImage, ogType].filter(Boolean).length;
  
  if (ogTagsPresent === 0) {
    findings.push({
      category: 'ai-readiness',
      subcategory: 'structured-data',
      issue: 'No Open Graph meta tags found',
      impact: 'Content previews in AI chat interfaces and social media will be poor',
      priority: 'important',
      howToFix: 'Add Open Graph meta tags for title, description, image, and type',
      codeExample: `<meta property="og:title" content="Your Page Title">
<meta property="og:description" content="Your page description">
<meta property="og:image" content="https://example.com/image.jpg">
<meta property="og:type" content="website">`,
      passed: false,
    });
    structuredDataScore -= 20;
  } else if (ogTagsPresent < 4) {
    findings.push({
      category: 'ai-readiness',
      subcategory: 'structured-data',
      issue: `Only ${ogTagsPresent}/4 required Open Graph tags present`,
      impact: 'Incomplete metadata may result in poor content previews',
      priority: 'important',
      howToFix: `Add missing OG tags: ${!ogTitle ? 'og:title, ' : ''}${!ogDescription ? 'og:description, ' : ''}${!ogImage ? 'og:image, ' : ''}${!ogType ? 'og:type' : ''}`,
      passed: false,
    });
    structuredDataScore -= 10;
  } else {
    findings.push({
      category: 'ai-readiness',
      subcategory: 'structured-data',
      issue: 'Complete Open Graph metadata present',
      impact: 'Content will display well in AI interfaces and social shares',
      priority: 'optional',
      howToFix: '',
      passed: true,
    });
  }

  const twitterCard = $('meta[name="twitter:card"]').attr('content');
  if (!twitterCard) {
    findings.push({
      category: 'ai-readiness',
      subcategory: 'structured-data',
      issue: 'Missing Twitter Card meta tags',
      impact: 'Content previews on Twitter/X will be limited',
      priority: 'optional',
      howToFix: 'Add twitter:card meta tag (summary_large_image recommended)',
      passed: false,
    });
    structuredDataScore -= 5;
  }

  // ========================================
  // 3. MCP COMPLIANCE & CRAWLABILITY
  // ========================================
  
  let hasMcpEndpoint = false;
  let hasLlmsTxt = false;
  
  try {
    const mcpResponse = await fetch(`${baseUrl}/.well-known/mcp`, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
      signal: AbortSignal.timeout(5000),
    });
    
    if (mcpResponse.ok) {
      hasMcpEndpoint = true;
      try {
        const mcpData = await mcpResponse.json();
        if (mcpData.name && mcpData.tools) {
          findings.push({
            category: 'ai-readiness',
            subcategory: 'mcp-compliance',
            issue: 'MCP server endpoint detected and valid',
            impact: 'AI agents can discover and use your MCP tools',
            priority: 'optional',
            howToFix: '',
            passed: true,
          });
          mcpComplianceScore += 10;
        } else {
          findings.push({
            category: 'ai-readiness',
            subcategory: 'mcp-compliance',
            issue: 'MCP endpoint found but response is incomplete',
            impact: 'AI agents may not properly discover your tools',
            priority: 'important',
            howToFix: 'Ensure MCP endpoint returns name, version, and tools array',
            passed: false,
          });
        }
      } catch {
        findings.push({
          category: 'ai-readiness',
          subcategory: 'mcp-compliance',
          issue: 'MCP endpoint returns invalid JSON',
          impact: 'AI agents cannot parse your MCP configuration',
          priority: 'important',
          howToFix: 'Return valid JSON from /.well-known/mcp endpoint',
          passed: false,
        });
        mcpComplianceScore -= 10;
      }
    }
  } catch {
    // No MCP endpoint - not an error, just not implemented
  }
  
  if (!hasMcpEndpoint) {
    findings.push({
      category: 'ai-readiness',
      subcategory: 'mcp-compliance',
      issue: 'No MCP server endpoint detected',
      impact: 'AI agents cannot interact with your site via Model Context Protocol',
      priority: 'optional',
      howToFix: 'Consider implementing an MCP server for AI agent integration',
      codeExample: `// MCP discovery endpoint at /.well-known/mcp
{
  "name": "your-service",
  "version": "1.0.0",
  "tools": [{ "name": "your_tool", "description": "..." }]
}`,
      passed: false,
    });
  }

  try {
    const llmsResponse = await fetch(`${baseUrl}/llms.txt`, {
      method: 'GET',
      signal: AbortSignal.timeout(5000),
    });
    
    if (llmsResponse.ok) {
      hasLlmsTxt = true;
      const llmsContent = await llmsResponse.text();
      
      if (llmsContent.length > 100) {
        findings.push({
          category: 'ai-readiness',
          subcategory: 'llms-txt',
          issue: 'llms.txt file present with content',
          impact: 'LLMs can understand your site structure and services',
          priority: 'optional',
          howToFix: '',
          passed: true,
        });
        crawlabilityScore += 10;
      } else {
        findings.push({
          category: 'ai-readiness',
          subcategory: 'llms-txt',
          issue: 'llms.txt file is too short (< 100 characters)',
          impact: 'Limited information for AI crawlers',
          priority: 'important',
          howToFix: 'Add comprehensive content to llms.txt describing your services',
          passed: false,
        });
      }
    }
  } catch {
    // No llms.txt - check below
  }
  
  if (!hasLlmsTxt) {
    findings.push({
      category: 'ai-readiness',
      subcategory: 'llms-txt',
      issue: 'No llms.txt file found',
      impact: 'LLMs have no dedicated documentation about your site',
      priority: 'important',
      howToFix: 'Create /llms.txt with a summary of your site for AI crawlers',
      codeExample: `# Your Company Name

> Brief description of your company

## Services
- Service 1: Description
- Service 2: Description

## Contact
website: https://yoursite.com
email: hello@yoursite.com`,
      passed: false,
    });
    crawlabilityScore -= 15;
  }

  try {
    const robotsResponse = await fetch(`${baseUrl}/robots.txt`, {
      method: 'GET',
      signal: AbortSignal.timeout(5000),
    });
    
    if (robotsResponse.ok) {
      const robotsContent = await robotsResponse.text();
      
      const aiCrawlers = ['GPTBot', 'ChatGPT-User', 'Claude-Web', 'Anthropic', 'PerplexityBot', 'Google-Extended'];
      const blockedCrawlers = aiCrawlers.filter(crawler => 
        robotsContent.toLowerCase().includes(`user-agent: ${crawler.toLowerCase()}`) &&
        robotsContent.toLowerCase().includes('disallow: /')
      );
      
      if (blockedCrawlers.length > 0) {
        findings.push({
          category: 'ai-readiness',
          subcategory: 'crawlability',
          issue: `AI crawlers blocked in robots.txt: ${blockedCrawlers.join(', ')}`,
          impact: 'These AI systems cannot index your content',
          priority: 'important',
          howToFix: 'Review robots.txt and consider allowing AI crawlers if desired',
          passed: false,
        });
        crawlabilityScore -= 20;
      } else if (robotsContent.includes('Disallow: /') && !robotsContent.includes('Allow:')) {
        findings.push({
          category: 'ai-readiness',
          subcategory: 'crawlability',
          issue: 'robots.txt may be blocking all crawlers',
          impact: 'AI systems may not be able to access your content',
          priority: 'important',
          howToFix: 'Review your robots.txt rules to ensure desired pages are accessible',
          passed: false,
        });
        crawlabilityScore -= 15;
      } else {
        const explicitlyAllowed = aiCrawlers.filter(crawler =>
          robotsContent.toLowerCase().includes(`user-agent: ${crawler.toLowerCase()}`) &&
          robotsContent.toLowerCase().includes('allow: /')
        );
        
        if (explicitlyAllowed.length > 0) {
          findings.push({
            category: 'ai-readiness',
            subcategory: 'crawlability',
            issue: `AI crawlers explicitly allowed: ${explicitlyAllowed.join(', ')}`,
            impact: 'Good! These AI systems can freely index your content',
            priority: 'optional',
            howToFix: '',
            passed: true,
          });
        } else {
          findings.push({
            category: 'ai-readiness',
            subcategory: 'crawlability',
            issue: 'robots.txt allows general crawling',
            impact: 'AI crawlers can access your content',
            priority: 'optional',
            howToFix: '',
            passed: true,
          });
        }
      }
      
      if (robotsContent.toLowerCase().includes('sitemap:')) {
        findings.push({
          category: 'ai-readiness',
          subcategory: 'crawlability',
          issue: 'Sitemap reference in robots.txt',
          impact: 'Crawlers can discover all your pages efficiently',
          priority: 'optional',
          howToFix: '',
          passed: true,
        });
      } else {
        findings.push({
          category: 'ai-readiness',
          subcategory: 'crawlability',
          issue: 'No sitemap reference in robots.txt',
          impact: 'Crawlers may not discover all pages',
          priority: 'optional',
          howToFix: 'Add Sitemap: https://yoursite.com/sitemap.xml to robots.txt',
          passed: false,
        });
        crawlabilityScore -= 5;
      }
    } else {
      findings.push({
        category: 'ai-readiness',
        subcategory: 'crawlability',
        issue: 'No robots.txt file found',
        impact: 'Crawlers have no guidance on how to access your site',
        priority: 'important',
        howToFix: 'Create a robots.txt file in your site root',
        passed: false,
      });
      crawlabilityScore -= 10;
    }
  } catch {
    findings.push({
      category: 'ai-readiness',
      subcategory: 'crawlability',
      issue: 'Could not fetch robots.txt',
      impact: 'Unable to verify crawler accessibility',
      priority: 'optional',
      howToFix: 'Ensure robots.txt is accessible',
      passed: false,
    });
  }

  contentAccessibilityScore = Math.max(0, Math.min(100, contentAccessibilityScore));
  structuredDataScore = Math.max(0, Math.min(100, structuredDataScore));
  mcpComplianceScore = Math.max(0, Math.min(100, mcpComplianceScore));
  crawlabilityScore = Math.max(0, Math.min(100, crawlabilityScore));

  const overallScore = Math.round(
    (contentAccessibilityScore * 0.30) +
    (structuredDataScore * 0.25) +
    (mcpComplianceScore * 0.20) +
    (crawlabilityScore * 0.25)
  );

  return {
    score: Math.max(0, Math.min(100, overallScore)),
    breakdown: {
      contentAccessibility: contentAccessibilityScore,
      structuredData: structuredDataScore,
      mcpCompliance: mcpComplianceScore,
      crawlability: crawlabilityScore,
    },
    findings,
    metadata: {
      isSSR,
      hasLlmsTxt,
      hasMcpEndpoint,
      jsonLdCount,
      contentExtractionRate,
    },
  };
}
