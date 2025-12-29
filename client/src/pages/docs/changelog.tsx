import { DocsLayout } from "@/components/layout/docs-layout";
import { Sparkles, Bug, Zap, Shield } from "lucide-react";

interface ChangelogEntry {
  version: string;
  date: string;
  type: "feature" | "improvement" | "fix" | "security";
  title: string;
  description: string;
  items?: string[];
}

const changelog: ChangelogEntry[] = [
  {
    version: "2.6.0",
    date: "December 29, 2025",
    type: "feature",
    title: "AI Readiness Score",
    description: "New scoring category to measure how well websites are optimized for AI crawlers and agents.",
    items: [
      "AI Readiness score displayed on grader scorecard (0-100)",
      "Content Accessibility checks: SSR vs CSR detection, noscript fallback",
      "Structured Data validation: JSON-LD, OpenGraph, Twitter Cards",
      "MCP Compliance: endpoint detection and response validation",
      "Crawlability analysis: robots.txt, llms.txt, AI bot permissions",
      "Weighted scoring breakdown stored in database",
      "Findings integrated into main grader results",
    ]
  },
  {
    version: "2.5.0",
    date: "December 28, 2025",
    type: "feature",
    title: "MCP (Model Context Protocol) Integration",
    description: "Added AI agent integration through the Model Context Protocol for automated website health checks.",
    items: [
      "MCP discovery endpoint at /.well-known/mcp",
      "JSON-RPC 2.0 endpoint at /mcp/v1 for tool calls",
      "New tools: check_website_health, get_website_grade, list_graded_websites",
      "Company info tools: get_services, get_blog_posts, get_about, get_api_documentation",
      "MCP interaction logging for admin visibility",
      "API key authentication and tier-based rate limiting for MCP",
    ]
  },
  {
    version: "2.4.0",
    date: "December 26, 2025",
    type: "feature",
    title: "Documentation Hub",
    description: "Launched comprehensive documentation with tutorials, trust & billing info, and team features.",
    items: [
      "New /docs section with sidebar navigation",
      "Step-by-step API integration tutorials",
      "Trust & Billing page with security details",
      "Teams & Enterprise feature documentation",
    ]
  },
  {
    version: "2.3.0",
    date: "December 25, 2025",
    type: "feature",
    title: "HubSpot-Style Website Grader",
    description: "Redesigned the Website Grader with improved messaging and FAQ section.",
    items: [
      "New hero section: 'Instant Website Performance Audit for Google Search'",
      "17+ key metrics in under 30 seconds messaging",
      "Feature callouts for Core Web Vitals, Security, Mobile, SEO",
      "Added FAQ section with SEO education content",
    ]
  },
  {
    version: "2.2.0",
    date: "December 23, 2025",
    type: "feature",
    title: "API Subscription Checkout",
    description: "Added guest checkout for API subscriptions directly from the grader results page.",
    items: [
      "Sale button on grader results: 'Buy API Access - $25.67/yr'",
      "Guest checkout flow (no account required)",
      "Feature flag toggle for admin control",
    ]
  },
  {
    version: "2.1.0",
    date: "December 22, 2025",
    type: "feature",
    title: "Custom Domain Support",
    description: "Added subdomain routing for portal, shop, and store domains.",
    items: [
      "portal.trifused.com → User Portal",
      "shop.trifused.com → Store",
      "store.trifused.com → Store",
      "grader.trifused.com → Website Grader",
    ]
  },
  {
    version: "2.0.0",
    date: "December 17, 2025",
    type: "feature",
    title: "Mobile Diagnostics Overlay",
    description: "Improved mobile experience with gamified progress animation.",
    items: [
      "Fixed mobile input with proper keyboard support",
      "Gamified progress messages during scans",
      "iOS-specific CSS fixes for input visibility",
      "Responsive scorecard layout",
    ]
  },
  {
    version: "1.9.0",
    date: "December 12, 2025",
    type: "feature",
    title: "Security Scanning Pro",
    description: "Premium security scanning features for Pro tier users.",
    items: [
      "Secrets detection (API keys, tokens, passwords)",
      "Exposed file scanning (.env, .git, backups)",
      "Security header analysis",
      "SSL certificate validation",
    ]
  },
  {
    version: "1.8.0",
    date: "December 12, 2025",
    type: "feature",
    title: "Google Lighthouse Integration",
    description: "Free Core Web Vitals analysis powered by Lighthouse.",
    items: [
      "LCP (Largest Contentful Paint) measurement",
      "CLS (Cumulative Layout Shift) tracking",
      "TBT (Total Blocking Time) analysis",
      "Performance, Accessibility, SEO, Best Practices scores",
    ]
  },
  {
    version: "1.7.0",
    date: "December 9, 2025",
    type: "feature",
    title: "Compliance Checks",
    description: "Industry-specific compliance scanning for regulated businesses.",
    items: [
      "FDIC compliance for banking websites",
      "SEC disclosures for securities firms",
      "ADA/WCAG accessibility checking",
      "PCI compliance for payment processing",
      "FCA compliance for UK financial services",
      "GDPR privacy compliance",
    ]
  },
  {
    version: "1.6.0",
    date: "December 7, 2025",
    type: "feature",
    title: "Shareable Reports",
    description: "Generate and share website grade reports with QR codes.",
    items: [
      "Unique shareable URLs for each scan",
      "QR code generation for printed materials",
      "Public report pages (no login required)",
      "Scan history stored in browser localStorage",
    ]
  },
  {
    version: "1.5.0",
    date: "December 6, 2025",
    type: "feature",
    title: "Stripe Integration",
    description: "Full e-commerce support with Stripe payments.",
    items: [
      "AI Compliance Report one-time purchase ($9.99)",
      "API subscription tiers (Starter, Pro, Enterprise)",
      "Stripe Customer Portal integration",
      "Webhook handling for subscription events",
    ]
  },
  {
    version: "1.4.0",
    date: "December 6, 2025",
    type: "improvement",
    title: "Performance Optimizations",
    description: "Improved scanning speed and reliability.",
    items: [
      "24-hour result caching for faster repeat scans",
      "Parallel processing for multiple checks",
      "Reduced memory usage during scans",
      "Better error handling and recovery",
    ]
  },
  {
    version: "1.3.0",
    date: "December 6, 2025",
    type: "feature",
    title: "User Portal",
    description: "Full-featured dashboard for managing scans and subscriptions.",
    items: [
      "Dashboard with recent scans",
      "API key management",
      "Billing and subscription management",
      "Profile settings",
    ]
  },
  {
    version: "1.2.0",
    date: "December 6, 2025",
    type: "security",
    title: "Security Enhancements",
    description: "Improved security across the platform.",
    items: [
      "reCAPTCHA v3 protection on forms",
      "Rate limiting on API endpoints",
      "Session management improvements",
      "XSS and CSRF protection",
    ]
  },
  {
    version: "1.1.0",
    date: "December 6, 2025",
    type: "improvement",
    title: "Email Security Scoring",
    description: "Added email security analysis to website grading.",
    items: [
      "SPF record validation",
      "DKIM signature checking",
      "DMARC policy analysis",
      "MX record verification",
    ]
  },
  {
    version: "1.0.0",
    date: "December 6, 2025",
    type: "feature",
    title: "Initial Release",
    description: "Launch of TriFused Website Grader.",
    items: [
      "SEO analysis (meta tags, headings, images)",
      "Security scanning (HTTPS, headers)",
      "Performance scoring",
      "Accessibility checking",
      "Keyword optimization analysis",
    ]
  },
];

const typeConfig = {
  feature: { icon: Sparkles, color: "text-green-400", bg: "bg-green-500/20", label: "New" },
  improvement: { icon: Zap, color: "text-blue-400", bg: "bg-blue-500/20", label: "Improved" },
  fix: { icon: Bug, color: "text-yellow-400", bg: "bg-yellow-500/20", label: "Fixed" },
  security: { icon: Shield, color: "text-red-400", bg: "bg-red-500/20", label: "Security" },
};

export default function Changelog() {
  return (
    <DocsLayout 
      title="Changelog"
      description="Stay up to date with the latest features, improvements, and fixes."
    >
      <div className="space-y-8">
        {changelog.map((entry, index) => {
          const config = typeConfig[entry.type];
          const Icon = config.icon;
          
          return (
            <div 
              key={index}
              className="glass-panel p-6 rounded-xl relative overflow-hidden"
            >
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <span className="font-mono text-lg font-bold text-white">v{entry.version}</span>
                <span className="text-sm text-muted-foreground">{entry.date}</span>
                <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium ${config.bg} ${config.color}`}>
                  <Icon className="w-3 h-3" />
                  {config.label}
                </span>
              </div>
              
              <h3 className="text-xl font-semibold text-white mb-2">{entry.title}</h3>
              <p className="text-muted-foreground mb-4">{entry.description}</p>
              
              {entry.items && (
                <ul className="list-disc list-inside text-muted-foreground space-y-1">
                  {entry.items.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              )}
            </div>
          );
        })}
      </div>
      
      <div className="mt-12 text-center text-muted-foreground">
        <p>
          Have a feature request?{" "}
          <a href="mailto:feedback@trifused.com" className="text-primary hover:underline">
            Let us know
          </a>
        </p>
      </div>
    </DocsLayout>
  );
}
