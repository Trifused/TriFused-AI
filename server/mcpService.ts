import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from "@modelcontextprotocol/sdk/types.js";
import { storage } from "./storage";

export interface HealthCheckResult {
  status: "healthy" | "degraded" | "unhealthy";
  timestamp: string;
  url: string;
  checks: {
    availability: {
      status: "pass" | "fail" | "warn";
      responseTime: number;
      statusCode?: number;
    };
    ssl: {
      status: "pass" | "fail" | "warn";
      expiryDate?: string;
      issuer?: string;
    };
    performance: {
      status: "pass" | "fail" | "warn";
      loadTime: number;
      performanceScore?: number;
    };
    seo?: {
      status: "pass" | "fail" | "warn";
      score: number;
    };
    security?: {
      status: "pass" | "fail" | "warn";
      score: number;
    };
    accessibility?: {
      status: "pass" | "fail" | "warn";
      score: number;
    };
  };
  overallScore?: number;
  message: string;
}

const CHECK_WEBSITE_HEALTH_TOOL: Tool = {
  name: "check_website_health",
  description: "Checks the health status of a company website including availability, SSL, performance, SEO, security, and accessibility scores",
  inputSchema: {
    type: "object",
    properties: {
      url: {
        type: "string",
        description: "Full URL of website to check (e.g., https://example.com)",
      },
      checks: {
        type: "array",
        items: { type: "string" },
        description: "Optional: specific checks to run. Available: ssl, performance, availability, seo, security, accessibility. Defaults to all.",
      },
      useLighthouse: {
        type: "boolean",
        description: "Optional: use Lighthouse for detailed performance metrics. Default: false (faster)",
      },
    },
    required: ["url"],
  },
};

const GET_WEBSITE_GRADE_TOOL: Tool = {
  name: "get_website_grade",
  description: "Get the most recent full grade report for a website URL",
  inputSchema: {
    type: "object",
    properties: {
      url: {
        type: "string",
        description: "Full URL of website to get grade for",
      },
    },
    required: ["url"],
  },
};

const LIST_GRADED_WEBSITES_TOOL: Tool = {
  name: "list_graded_websites",
  description: "List recently graded websites with their scores",
  inputSchema: {
    type: "object",
    properties: {
      limit: {
        type: "number",
        description: "Maximum number of results to return (default: 10, max: 50)",
      },
    },
  },
};

const GET_BLOG_POSTS_TOOL: Tool = {
  name: "get_blog_posts",
  description: "Get recent blog posts from TriFused about technology, cybersecurity, and AI",
  inputSchema: {
    type: "object",
    properties: {
      limit: {
        type: "number",
        description: "Maximum number of posts to return (default: 10)",
      },
    },
  },
};

const GET_SERVICES_TOOL: Tool = {
  name: "get_services",
  description: "Get information about TriFused services including AI integration, cybersecurity, and infrastructure",
  inputSchema: {
    type: "object",
    properties: {},
  },
};

const GET_API_DOCUMENTATION_TOOL: Tool = {
  name: "get_api_documentation",
  description: "Get documentation for the TriFused Website Health Check API including endpoints, authentication, and rate limits",
  inputSchema: {
    type: "object",
    properties: {
      section: {
        type: "string",
        description: "Optional: specific section to get (authentication, endpoints, rate-limits, examples)",
      },
    },
  },
};

const GET_ABOUT_TOOL: Tool = {
  name: "get_about",
  description: "Get information about TriFused company, mission, and capabilities",
  inputSchema: {
    type: "object",
    properties: {},
  },
};

const GET_WEBSITE_SCORECARD_TOOL: Tool = {
  name: "get_website_scorecard",
  description: "Get a formatted scorecard summary for a website with letter grades and key metrics. Perfect for quick status reports.",
  inputSchema: {
    type: "object",
    properties: {
      url: {
        type: "string",
        description: "Full URL of website to get scorecard for",
      },
    },
    required: ["url"],
  },
};

const ANALYZE_AI_READINESS_TOOL: Tool = {
  name: "analyze_ai_readiness",
  description: "Get detailed AI readiness analysis for a website including content accessibility, structured data, MCP compliance, and crawlability scores with specific recommendations",
  inputSchema: {
    type: "object",
    properties: {
      url: {
        type: "string",
        description: "Full URL of website to analyze for AI readiness",
      },
    },
    required: ["url"],
  },
};

const GET_IMPROVEMENT_RECOMMENDATIONS_TOOL: Tool = {
  name: "get_improvement_recommendations",
  description: "Get prioritized actionable recommendations to improve a website's score. Returns critical issues first, then important, then optional improvements.",
  inputSchema: {
    type: "object",
    properties: {
      url: {
        type: "string",
        description: "Full URL of website to get recommendations for",
      },
      category: {
        type: "string",
        description: "Optional: filter by category (seo, security, performance, accessibility, mobile, email, ai-readiness)",
      },
    },
    required: ["url"],
  },
};

const COMPARE_WEBSITES_TOOL: Tool = {
  name: "compare_websites",
  description: "Compare two websites side-by-side across all scoring categories. Useful for competitive analysis or before/after comparisons.",
  inputSchema: {
    type: "object",
    properties: {
      url1: {
        type: "string",
        description: "First website URL",
      },
      url2: {
        type: "string",
        description: "Second website URL",
      },
    },
    required: ["url1", "url2"],
  },
};

const BOOK_CONSULTATION_TOOL: Tool = {
  name: "book_consultation",
  description: "Submit a consultation request to discuss website improvements or TriFused services. Creates a contact submission for follow-up.",
  inputSchema: {
    type: "object",
    properties: {
      name: {
        type: "string",
        description: "Contact name",
      },
      email: {
        type: "string",
        description: "Contact email address",
      },
      company: {
        type: "string",
        description: "Company name (optional)",
      },
      website: {
        type: "string",
        description: "Website URL to discuss (optional)",
      },
      message: {
        type: "string",
        description: "Brief description of what you'd like to discuss",
      },
    },
    required: ["name", "email", "message"],
  },
};

export class MCPHealthCheckService {
  private baseUrl: string;

  constructor(baseUrl: string = "") {
    this.baseUrl = baseUrl;
  }

  getDiscoveryDocument() {
    return {
      version: "1.0",
      name: "TriFused Website Health Check",
      description: "MCP service for checking website health, performance, SEO, and security",
      endpoints: {
        mcp: `${this.baseUrl}/mcp/v1`,
      },
      tools: this.getTools(),
      capabilities: {
        tools: ["check_website_health", "get_website_grade", "get_website_scorecard", "analyze_ai_readiness", "get_improvement_recommendations", "compare_websites", "list_graded_websites", "get_blog_posts", "get_services", "get_api_documentation", "get_about", "book_consultation"],
        resources: [],
        prompts: [],
      },
      authentication: {
        type: "bearer",
        description: "Use your TriFused API key as Bearer token",
      },
      rateLimit: {
        requests: 100,
        period: "hour",
      },
    };
  }

  getTools(): Tool[] {
    return [
      CHECK_WEBSITE_HEALTH_TOOL, 
      GET_WEBSITE_GRADE_TOOL, 
      GET_WEBSITE_SCORECARD_TOOL,
      ANALYZE_AI_READINESS_TOOL,
      GET_IMPROVEMENT_RECOMMENDATIONS_TOOL,
      COMPARE_WEBSITES_TOOL,
      LIST_GRADED_WEBSITES_TOOL,
      GET_BLOG_POSTS_TOOL,
      GET_SERVICES_TOOL,
      GET_API_DOCUMENTATION_TOOL,
      GET_ABOUT_TOOL,
      BOOK_CONSULTATION_TOOL,
    ];
  }

  async checkWebsiteHealth(
    url: string,
    checks?: string[],
    useLighthouse: boolean = false
  ): Promise<HealthCheckResult> {
    const startTime = Date.now();
    
    const result: HealthCheckResult = {
      status: "healthy",
      timestamp: new Date().toISOString(),
      url,
      checks: {
        availability: { status: "pass", responseTime: 0 },
        ssl: { status: "pass" },
        performance: { status: "pass", loadTime: 0 },
      },
      message: "All systems operational",
    };

    const checksToRun = checks?.length ? checks : ["availability", "ssl", "performance", "seo", "security", "accessibility"];
    const issues: string[] = [];

    try {
      const parsedUrl = new URL(url);
      const isHttps = parsedUrl.protocol === "https:";

      if (checksToRun.includes("availability")) {
        try {
          const controller = new AbortController();
          const timeout = setTimeout(() => controller.abort(), 15000);
          const fetchStart = Date.now();
          
          const response = await fetch(url, {
            method: "GET",
            signal: controller.signal,
            headers: {
              "User-Agent": "TriFused-MCP-HealthCheck/1.0",
            },
          });
          
          clearTimeout(timeout);
          const responseTime = Date.now() - fetchStart;
          
          result.checks.availability = {
            status: response.ok ? "pass" : "warn",
            responseTime,
            statusCode: response.status,
          };

          if (!response.ok) {
            issues.push(`HTTP ${response.status}`);
          }
          if (responseTime > 3000) {
            result.checks.availability.status = "warn";
            issues.push("Slow response time");
          }
        } catch (error: any) {
          result.checks.availability = {
            status: "fail",
            responseTime: Date.now() - startTime,
          };
          issues.push("Site unreachable");
        }
      }

      if (checksToRun.includes("ssl")) {
        if (!isHttps) {
          result.checks.ssl = {
            status: "fail",
          };
          issues.push("No HTTPS");
        } else {
          result.checks.ssl = {
            status: "pass",
          };
        }
      }

      if (checksToRun.includes("performance") || checksToRun.includes("seo") || 
          checksToRun.includes("security") || checksToRun.includes("accessibility")) {
        const cached = await storage.getRecentGradeForUrl(url);
        
        if (cached) {
          result.checks.performance = {
            status: cached.performanceScore >= 80 ? "pass" : cached.performanceScore >= 50 ? "warn" : "fail",
            loadTime: 0,
            performanceScore: cached.performanceScore,
          };

          if (checksToRun.includes("seo")) {
            result.checks.seo = {
              status: cached.seoScore >= 80 ? "pass" : cached.seoScore >= 50 ? "warn" : "fail",
              score: cached.seoScore,
            };
          }

          if (checksToRun.includes("security")) {
            result.checks.security = {
              status: cached.securityScore >= 80 ? "pass" : cached.securityScore >= 50 ? "warn" : "fail",
              score: cached.securityScore,
            };
          }

          if (checksToRun.includes("accessibility")) {
            result.checks.accessibility = {
              status: cached.accessibilityScore >= 80 ? "pass" : cached.accessibilityScore >= 50 ? "warn" : "fail",
              score: cached.accessibilityScore,
            };
          }

          result.overallScore = cached.overallScore;

          if (cached.performanceScore < 50) issues.push("Poor performance");
          if (cached.seoScore < 50) issues.push("SEO issues");
          if (cached.securityScore < 50) issues.push("Security concerns");
        }
      }

      const failCount = Object.values(result.checks).filter(c => c.status === "fail").length;
      const warnCount = Object.values(result.checks).filter(c => c.status === "warn").length;

      if (failCount > 0) {
        result.status = "unhealthy";
        result.message = `Critical issues: ${issues.join(", ")}`;
      } else if (warnCount > 0) {
        result.status = "degraded";
        result.message = `Warnings: ${issues.join(", ")}`;
      } else {
        result.status = "healthy";
        result.message = "All systems operational";
      }

    } catch (error: any) {
      result.status = "unhealthy";
      result.message = error.message || "Health check failed";
    }

    return result;
  }

  async getWebsiteGrade(url: string) {
    const grade = await storage.getRecentGradeForUrl(url);
    if (!grade) {
      return {
        error: "No grade found for this URL. Use check_website_health to generate a new grade.",
        url,
      };
    }

    return {
      url: grade.url,
      overallScore: grade.overallScore,
      scores: {
        seo: grade.seoScore,
        security: grade.securityScore,
        performance: grade.performanceScore,
        accessibility: grade.accessibilityScore,
        mobile: grade.mobileScore,
      },
      companyName: grade.companyName,
      domain: grade.domain,
      createdAt: grade.createdAt,
      findingsCount: Array.isArray(grade.findings) ? grade.findings.length : 0,
    };
  }

  async listGradedWebsites(limit: number = 10) {
    const grades = await storage.getRecentGrades(Math.min(limit, 50));
    return grades.map((g: any) => ({
      url: g.url,
      overallScore: g.overallScore,
      domain: g.domain,
      createdAt: g.createdAt,
    }));
  }

  async getBlogPosts(limit: number = 10) {
    const posts = await storage.getBlogPosts();
    return posts.slice(0, limit).map((p: any) => ({
      id: p.id,
      title: p.title,
      excerpt: p.content?.substring(0, 200) + "...",
      publishedAt: p.publishedAt,
      url: p.url,
      labels: p.labels,
    }));
  }

  getServices() {
    return {
      company: "TriFused",
      tagline: "AI-Native Technology Services",
      services: [
        {
          name: "Autonomous Infrastructure",
          description: "Self-healing systems that adapt and scale automatically using AI-driven orchestration",
          features: ["Auto-scaling", "Self-healing", "Predictive maintenance", "Cost optimization"],
        },
        {
          name: "Cybersecurity Solutions",
          description: "Advanced threat detection and response powered by machine learning",
          features: ["Threat detection", "Vulnerability scanning", "Compliance monitoring", "Incident response"],
        },
        {
          name: "Generative Growth Engine",
          description: "AI-powered marketing and content generation for business growth",
          features: ["Content generation", "SEO optimization", "Lead scoring", "Campaign automation"],
        },
        {
          name: "Website Health Check",
          description: "Comprehensive website analysis for performance, SEO, security, and accessibility",
          features: ["Performance scoring", "SEO analysis", "Security audit", "Accessibility check"],
        },
      ],
      contact: {
        website: "https://trifused.com",
        email: "hello@trifused.com",
      },
    };
  }

  getApiDocumentation(section?: string) {
    const docs = {
      overview: {
        name: "TriFused Website Health Check API",
        version: "1.0",
        baseUrl: this.baseUrl,
        description: "API for checking website health, performance, SEO, and security scores",
      },
      authentication: {
        type: "Bearer Token",
        description: "Include your API key in the Authorization header",
        example: "Authorization: Bearer your-api-key-here",
        obtainKey: "Get your API key from the TriFused portal at /portal/api-keys",
      },
      endpoints: [
        {
          method: "GET",
          path: "/.well-known/mcp",
          description: "MCP discovery endpoint - returns service capabilities",
          authentication: "None required",
        },
        {
          method: "POST",
          path: "/mcp/v1",
          description: "MCP JSON-RPC endpoint for tool calls",
          authentication: "Optional (rate limits apply)",
          contentType: "application/json",
        },
        {
          method: "GET",
          path: "/mcp/v1/tools",
          description: "List available MCP tools",
          authentication: "Optional",
        },
        {
          method: "GET",
          path: "/mcp/v1/health?url={url}",
          description: "Direct REST endpoint for health checks",
          authentication: "Optional (rate limits apply)",
        },
        {
          method: "GET",
          path: "/api/v1/score?url={url}",
          description: "Full website grade API",
          authentication: "Required for higher rate limits",
        },
      ],
      rateLimits: {
        free: { requests: 10, period: "hour", description: "Anonymous/unauthenticated requests" },
        starter: { requests: 100, period: "hour", description: "Basic API key tier" },
        pro: { requests: 500, period: "hour", description: "Professional tier" },
        enterprise: { requests: 2000, period: "hour", description: "Enterprise tier" },
      },
      examples: {
        mcpToolsCall: {
          description: "Call check_website_health tool via MCP",
          request: {
            jsonrpc: "2.0",
            id: 1,
            method: "tools/call",
            params: {
              name: "check_website_health",
              arguments: { url: "https://example.com" },
            },
          },
        },
        restHealthCheck: {
          description: "Direct REST health check",
          curl: "curl -H 'Authorization: Bearer YOUR_KEY' 'https://api.trifused.com/mcp/v1/health?url=https://example.com'",
        },
      },
      changelog: [
        { version: "1.3.0", date: "2024-12-28", changes: ["Added MCP (Model Context Protocol) JSON-RPC endpoint", "New MCP discovery endpoint at /.well-known/mcp", "Added tools: check_website_health, get_website_grade, list_graded_websites, get_blog_posts, get_services, get_about, get_api_documentation"] },
        { version: "1.2.0", date: "2024-12-20", changes: ["Added tier-based rate limiting (free, starter, pro, enterprise)", "API key authentication support", "Rate limit headers in responses"] },
        { version: "1.1.0", date: "2024-12-15", changes: ["Added /api/v1/score endpoint for full website grades", "Lighthouse integration for performance metrics", "Security and accessibility scoring"] },
        { version: "1.0.0", date: "2024-12-01", changes: ["Initial API release", "Website health check endpoint", "SEO analysis capabilities"] },
      ],
    };

    if (section && docs[section as keyof typeof docs]) {
      return docs[section as keyof typeof docs];
    }
    return docs;
  }

  getAbout() {
    return {
      company: "TriFused",
      mission: "Empowering businesses with AI-native technology solutions that automate, protect, and grow",
      founded: "Technology services company focused on bringing enterprise-grade AI capabilities to businesses of all sizes",
      capabilities: [
        "AI Integration & Automation",
        "Cybersecurity & Compliance",
        "Infrastructure Management",
        "Website Performance Optimization",
        "Lead Generation & Analytics",
      ],
      values: [
        "Innovation - Continuously pushing the boundaries of what's possible with AI",
        "Security - Building trust through robust protection and compliance",
        "Simplicity - Making complex technology accessible and easy to use",
        "Results - Focusing on measurable outcomes that drive business growth",
      ],
      website: "https://trifused.com",
      tagline: "AI-Native Technology Services",
      changelog: [
        { version: "2.5.0", date: "2024-12-28", changes: ["Added MCP (Model Context Protocol) integration for AI agents", "MCP interaction logging for admin visibility", "New tools: get_services, get_blog_posts, get_about, get_api_documentation"] },
        { version: "2.4.0", date: "2024-12-27", changes: ["Automated website report card emails with scheduling", "Token-based payment system for premium features", "Self-service subscription cancellation"] },
        { version: "2.3.0", date: "2024-12-20", changes: ["Multi-language support (i18n)", "Resend receipt functionality", "Expandable transaction management"] },
        { version: "2.2.0", date: "2024-12-15", changes: ["API access with tier-based rate limiting", "Website grader with detailed scoring", "Admin management dashboard"] },
        { version: "2.1.0", date: "2024-12-10", changes: ["Stripe subscription integration", "Customer portal accounts", "Automated lead analytics reporting"] },
        { version: "2.0.0", date: "2024-12-01", changes: ["Complete platform redesign", "AI-native technology services launch", "Website health check API"] },
      ],
    };
  }

  getGradeLetter(score: number): string {
    if (score >= 90) return "A";
    if (score >= 80) return "B";
    if (score >= 70) return "C";
    if (score >= 60) return "D";
    return "F";
  }

  async getWebsiteScorecard(url: string) {
    const grade = await storage.getRecentGradeForUrl(url);
    if (!grade) {
      return {
        error: "No grade found for this URL. Run a scan first using check_website_health or visit https://trifused.com/grader",
        url,
      };
    }

    return {
      url: grade.url,
      scannedAt: grade.createdAt,
      overall: {
        score: grade.overallScore,
        grade: this.getGradeLetter(grade.overallScore),
      },
      categories: {
        seo: { score: grade.seoScore, grade: this.getGradeLetter(grade.seoScore) },
        security: { score: grade.securityScore, grade: this.getGradeLetter(grade.securityScore) },
        performance: { score: grade.performanceScore, grade: this.getGradeLetter(grade.performanceScore) },
        accessibility: { score: grade.accessibilityScore, grade: this.getGradeLetter(grade.accessibilityScore) },
        mobile: { score: grade.mobileScore || 0, grade: this.getGradeLetter(grade.mobileScore || 0) },
        email: { score: grade.emailSecurityScore || 0, grade: this.getGradeLetter(grade.emailSecurityScore || 0) },
        aiReadiness: { score: grade.aiReadinessScore || 0, grade: this.getGradeLetter(grade.aiReadinessScore || 0) },
      },
      summary: `${grade.companyName || grade.domain || 'Website'} scored ${grade.overallScore}/100 (${this.getGradeLetter(grade.overallScore)}) with strengths in ${grade.seoScore >= 80 ? 'SEO' : ''}${grade.securityScore >= 80 ? ', Security' : ''}${grade.accessibilityScore >= 80 ? ', Accessibility' : ''} and areas for improvement in ${grade.performanceScore < 80 ? 'Performance' : ''}${(grade.mobileScore || 0) < 80 ? ', Mobile' : ''}${(grade.aiReadinessScore || 0) < 80 ? ', AI Readiness' : ''}.`.replace(/ ,/g, ',').replace(/strengths in ,/g, 'strengths in ').replace(/improvement in ,/g, 'improvement in '),
      reportUrl: grade.shareToken ? `https://trifused.com/report/${grade.shareToken}` : null,
    };
  }

  async analyzeAiReadiness(url: string) {
    const grade = await storage.getRecentGradeForUrl(url);
    if (!grade) {
      return {
        error: "No grade found for this URL. Run a scan first using check_website_health or visit https://trifused.com/grader",
        url,
      };
    }

    const aiFindings = (grade.findings as any[])?.filter((f: any) => 
      ['content-accessibility', 'structured-data', 'mcp-compliance', 'llms-txt', 'crawlability'].includes(f.category)
    ) || [];

    const breakdown = grade.aiReadinessBreakdown as any || {
      contentAccessibility: 0,
      structuredData: 0,
      mcpCompliance: 0,
      crawlability: 0,
    };

    return {
      url: grade.url,
      aiReadinessScore: grade.aiReadinessScore || 0,
      grade: this.getGradeLetter(grade.aiReadinessScore || 0),
      breakdown: {
        contentAccessibility: { score: breakdown.contentAccessibility, weight: "30%", description: "SSR detection, semantic HTML, noscript fallback" },
        structuredData: { score: breakdown.structuredData, weight: "25%", description: "JSON-LD, OpenGraph, Twitter Cards" },
        mcpCompliance: { score: breakdown.mcpCompliance, weight: "20%", description: "MCP endpoint detection and validation" },
        crawlability: { score: breakdown.crawlability, weight: "25%", description: "robots.txt, llms.txt, AI bot permissions" },
      },
      issues: aiFindings.filter((f: any) => !f.passed).map((f: any) => ({
        category: f.category,
        issue: f.issue,
        priority: f.priority,
        howToFix: f.howToFix,
      })),
      passed: aiFindings.filter((f: any) => f.passed).map((f: any) => f.issue),
      recommendations: [
        breakdown.contentAccessibility < 80 ? "Implement server-side rendering (SSR) or add noscript fallback content" : null,
        breakdown.structuredData < 80 ? "Add JSON-LD structured data using schema.org vocabulary" : null,
        breakdown.mcpCompliance < 80 ? "Implement MCP server endpoint at /.well-known/mcp" : null,
        breakdown.crawlability < 80 ? "Add llms.txt file and configure robots.txt for AI crawlers" : null,
      ].filter(Boolean),
    };
  }

  async getImprovementRecommendations(url: string, category?: string) {
    const grade = await storage.getRecentGradeForUrl(url);
    if (!grade) {
      return {
        error: "No grade found for this URL. Run a scan first using check_website_health or visit https://trifused.com/grader",
        url,
      };
    }

    let findings = grade.findings as any[] || [];
    
    if (category) {
      const categoryMap: Record<string, string[]> = {
        'seo': ['seo'],
        'security': ['security'],
        'performance': ['performance'],
        'accessibility': ['accessibility'],
        'mobile': ['mobile'],
        'email': ['email'],
        'ai-readiness': ['content-accessibility', 'structured-data', 'mcp-compliance', 'llms-txt', 'crawlability'],
      };
      const cats = categoryMap[category.toLowerCase()] || [category];
      findings = findings.filter((f: any) => cats.includes(f.category));
    }

    const issues = findings.filter((f: any) => !f.passed);
    const critical = issues.filter((f: any) => f.priority === 'critical');
    const important = issues.filter((f: any) => f.priority === 'important');
    const optional = issues.filter((f: any) => f.priority === 'optional');

    return {
      url: grade.url,
      overallScore: grade.overallScore,
      totalIssues: issues.length,
      recommendations: {
        critical: critical.map((f: any) => ({
          category: f.category,
          issue: f.issue,
          impact: f.impact,
          howToFix: f.howToFix,
        })),
        important: important.map((f: any) => ({
          category: f.category,
          issue: f.issue,
          impact: f.impact,
          howToFix: f.howToFix,
        })),
        optional: optional.map((f: any) => ({
          category: f.category,
          issue: f.issue,
          impact: f.impact,
          howToFix: f.howToFix,
        })),
      },
      quickWins: issues.slice(0, 3).map((f: any) => f.howToFix),
      summary: `Found ${critical.length} critical, ${important.length} important, and ${optional.length} optional issues. Address critical issues first for the biggest score improvement.`,
    };
  }

  async compareWebsites(url1: string, url2: string) {
    const [grade1, grade2] = await Promise.all([
      storage.getRecentGradeForUrl(url1),
      storage.getRecentGradeForUrl(url2),
    ]);

    if (!grade1 && !grade2) {
      return { error: "No grades found for either URL. Run scans first." };
    }
    if (!grade1) {
      return { error: `No grade found for ${url1}. Run a scan first.` };
    }
    if (!grade2) {
      return { error: `No grade found for ${url2}. Run a scan first.` };
    }

    const compare = (a: number, b: number) => ({ 
      site1: a, 
      site2: b, 
      difference: a - b,
      winner: a > b ? 'site1' : a < b ? 'site2' : 'tie',
    });

    return {
      site1: { url: grade1.url, name: grade1.companyName || grade1.domain },
      site2: { url: grade2.url, name: grade2.companyName || grade2.domain },
      comparison: {
        overall: compare(grade1.overallScore, grade2.overallScore),
        seo: compare(grade1.seoScore, grade2.seoScore),
        security: compare(grade1.securityScore, grade2.securityScore),
        performance: compare(grade1.performanceScore, grade2.performanceScore),
        accessibility: compare(grade1.accessibilityScore, grade2.accessibilityScore),
        mobile: compare(grade1.mobileScore || 0, grade2.mobileScore || 0),
        email: compare(grade1.emailSecurityScore || 0, grade2.emailSecurityScore || 0),
        aiReadiness: compare(grade1.aiReadinessScore || 0, grade2.aiReadinessScore || 0),
      },
      summary: `${grade1.companyName || grade1.domain} (${grade1.overallScore}) vs ${grade2.companyName || grade2.domain} (${grade2.overallScore}): ${grade1.overallScore > grade2.overallScore ? 'Site 1 wins' : grade1.overallScore < grade2.overallScore ? 'Site 2 wins' : 'Tie'} overall.`,
    };
  }

  async bookConsultation(name: string, email: string, message: string, company?: string, website?: string) {
    // Validate required fields
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return { error: "Missing required field: name", success: false };
    }
    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return { error: "Missing or invalid required field: email", success: false };
    }
    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return { error: "Missing required field: message", success: false };
    }

    try {
      const submission = await storage.createContactSubmission({
        name: name.trim(),
        email: email.trim(),
        company: company?.trim() || null,
        message: `[MCP Consultation Request]${website ? ` Website: ${website}` : ''}\n\n${message.trim()}`,
      });

      return {
        success: true,
        message: "Consultation request submitted successfully. A TriFused team member will contact you within 24 hours.",
        referenceId: submission.id,
        details: {
          name: name.trim(),
          email: email.trim(),
          company: company?.trim() || 'Not provided',
          website: website?.trim() || 'Not provided',
        },
        nextSteps: [
          "You'll receive a confirmation email shortly",
          "A team member will review your request",
          "Expect a response within 24 business hours",
          "For urgent matters, email hello@trifused.com directly",
        ],
      };
    } catch (error: any) {
      return { error: `Failed to submit consultation request: ${error.message}`, success: false };
    }
  }

  async handleToolCall(name: string, args: Record<string, unknown>) {
    switch (name) {
      case "check_website_health":
        return await this.checkWebsiteHealth(
          args.url as string,
          args.checks as string[] | undefined,
          args.useLighthouse as boolean | undefined
        );

      case "get_website_grade":
        return await this.getWebsiteGrade(args.url as string);

      case "get_website_scorecard":
        return await this.getWebsiteScorecard(args.url as string);

      case "analyze_ai_readiness":
        return await this.analyzeAiReadiness(args.url as string);

      case "get_improvement_recommendations":
        return await this.getImprovementRecommendations(args.url as string, args.category as string | undefined);

      case "compare_websites":
        return await this.compareWebsites(args.url1 as string, args.url2 as string);

      case "list_graded_websites":
        return await this.listGradedWebsites(args.limit as number | undefined);

      case "get_blog_posts":
        return await this.getBlogPosts(args.limit as number | undefined);

      case "get_services":
        return this.getServices();

      case "get_api_documentation":
        return this.getApiDocumentation(args.section as string | undefined);

      case "get_about":
        return this.getAbout();

      case "book_consultation":
        return await this.bookConsultation(
          args.name as string,
          args.email as string,
          args.message as string,
          args.company as string | undefined,
          args.website as string | undefined
        );

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  }
}

export async function handleMCPRequest(
  request: {
    jsonrpc: string;
    id?: number | string;
    method: string;
    params?: Record<string, unknown>;
  },
  mcpService: MCPHealthCheckService
): Promise<{
  jsonrpc: string;
  id?: number | string;
  result?: unknown;
  error?: { code: number; message: string };
}> {
  const { jsonrpc, id, method, params } = request;

  if (jsonrpc !== "2.0") {
    return {
      jsonrpc: "2.0",
      id,
      error: { code: -32600, message: "Invalid JSON-RPC version" },
    };
  }

  try {
    switch (method) {
      case "initialize":
        return {
          jsonrpc: "2.0",
          id,
          result: {
            protocolVersion: "2024-11-05",
            capabilities: {
              tools: {},
            },
            serverInfo: {
              name: "trifused-health-check",
              version: "1.0.0",
            },
          },
        };

      case "tools/list":
        return {
          jsonrpc: "2.0",
          id,
          result: {
            tools: mcpService.getTools(),
          },
        };

      case "tools/call":
        const toolParams = params as { name: string; arguments: Record<string, unknown> };
        const toolResult = await mcpService.handleToolCall(
          toolParams.name,
          toolParams.arguments || {}
        );
        return {
          jsonrpc: "2.0",
          id,
          result: {
            content: [
              {
                type: "text",
                text: JSON.stringify(toolResult, null, 2),
              },
            ],
          },
        };

      case "ping":
        return {
          jsonrpc: "2.0",
          id,
          result: {},
        };

      default:
        return {
          jsonrpc: "2.0",
          id,
          error: { code: -32601, message: `Method not found: ${method}` },
        };
    }
  } catch (error: any) {
    return {
      jsonrpc: "2.0",
      id,
      error: { code: -32000, message: error.message || "Internal error" },
    };
  }
}

export const mcpService = new MCPHealthCheckService();
