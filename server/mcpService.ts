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
      capabilities: {
        tools: ["check_website_health", "get_website_grade", "list_graded_websites"],
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
      LIST_GRADED_WEBSITES_TOOL,
      GET_BLOG_POSTS_TOOL,
      GET_SERVICES_TOOL,
      GET_API_DOCUMENTATION_TOOL,
      GET_ABOUT_TOOL,
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
    };
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
