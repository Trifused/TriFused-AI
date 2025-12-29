import { DocsLayout, DocsSection } from "@/components/layout/docs-layout";
import { Bot, Globe, FileText, Building2, Code, Key, Zap, Terminal, ExternalLink, Shield, Wrench } from "lucide-react";
import { Link } from "wouter";

const mcpTools = [
  { 
    name: "check_website_health", 
    description: "Comprehensive website analysis including SEO, security headers, performance metrics, accessibility, and compliance checks",
    icon: Globe,
    params: "url (required)"
  },
  { 
    name: "get_website_grade", 
    description: "Retrieve an existing grade for a previously analyzed URL from the database",
    icon: Globe,
    params: "url (required)"
  },
  { 
    name: "list_graded_websites", 
    description: "List all websites that have been graded, with their scores and last scan dates",
    icon: Globe,
    params: "limit (optional, default 10)"
  },
  { 
    name: "get_services", 
    description: "Get detailed information about available services, pricing tiers, and API capabilities",
    icon: Zap,
    params: "none"
  },
  { 
    name: "get_blog_posts", 
    description: "Fetch recent blog posts and articles from the TriFused blog",
    icon: FileText,
    params: "none"
  },
  { 
    name: "get_api_documentation", 
    description: "Access comprehensive API documentation for integration",
    icon: Code,
    params: "none"
  },
  { 
    name: "get_about", 
    description: "Get company mission, values, capabilities, and platform changelog",
    icon: Building2,
    params: "none"
  },
];

const features = [
  { icon: Bot, title: "AI Agent Integration", description: "Connect AI assistants like Claude, ChatGPT, and custom agents to TriFused services" },
  { icon: Shield, title: "Secure API Access", description: "Token-based authentication with tier-based rate limiting" },
  { icon: Zap, title: "Real-time Analysis", description: "Get instant website health checks and performance metrics" },
  { icon: Terminal, title: "Developer Friendly", description: "JSON-RPC 2.0 protocol with comprehensive documentation" },
];

export default function MCP() {
  return (
    <DocsLayout 
      title="MCP Integration"
      description="Model Context Protocol - Connect AI agents to TriFused's website analysis and company information tools"
    >
      <DocsSection title="What is MCP?">
        <p className="text-muted-foreground mb-6 leading-relaxed text-lg">
          The Model Context Protocol (MCP) is an open standard that enables AI assistants to securely access external tools and data sources.
          TriFused provides an MCP server that allows AI agents to perform website health checks, access company information, and integrate with our services.
        </p>
        
        <div className="glass-panel p-6 rounded-xl mb-8 border-l-4 border-primary">
          <p className="text-xl text-white italic">
            "Enable your AI assistant to analyze websites and access TriFused services in real-time."
          </p>
        </div>
      </DocsSection>

      <DocsSection title="Why Use TriFused MCP?">
        <div className="grid md:grid-cols-2 gap-4 mb-8">
          {features.map((feature, i) => (
            <div key={i} className="glass-panel p-5 rounded-xl" data-testid={`mcp-feature-${i}`}>
              <div className="flex items-center gap-3 mb-2">
                <feature.icon className="w-6 h-6 text-primary" />
                <h3 className="text-lg font-semibold text-white">{feature.title}</h3>
              </div>
              <p className="text-muted-foreground text-sm">{feature.description}</p>
            </div>
          ))}
        </div>
      </DocsSection>

      <DocsSection title="Available Tools">
        <p className="text-muted-foreground mb-6">
          The following tools are available through the TriFused MCP server:
        </p>
        
        <div className="space-y-4 mb-8">
          {mcpTools.map((tool, i) => (
            <div key={i} className="glass-panel p-5 rounded-xl" data-testid={`mcp-tool-${tool.name}`}>
              <div className="flex items-center gap-3 mb-2">
                <tool.icon className="w-5 h-5 text-primary" />
                <code className="text-white font-mono font-semibold">{tool.name}</code>
              </div>
              <p className="text-muted-foreground text-sm mb-2">{tool.description}</p>
              <div className="text-xs text-muted-foreground/70">
                <span className="text-primary/70">Parameters:</span> {tool.params}
              </div>
            </div>
          ))}
        </div>
      </DocsSection>

      <DocsSection title="Getting Started">
        <div className="space-y-6">
          <div className="glass-panel p-6 rounded-xl">
            <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
              <Key className="w-5 h-5 text-primary" />
              1. Get Your API Key
            </h3>
            <p className="text-muted-foreground text-sm mb-4">
              Sign up for a TriFused account and generate an API key from the portal.
            </p>
            <Link 
              href="/portal/websites"
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm"
              data-testid="link-get-api-key"
            >
              Get API Key
              <ExternalLink className="w-4 h-4" />
            </Link>
          </div>

          <div className="glass-panel p-6 rounded-xl">
            <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
              <Terminal className="w-5 h-5 text-primary" />
              2. Connect Your AI Agent
            </h3>
            <p className="text-muted-foreground text-sm mb-4">
              Configure your AI assistant to connect to the TriFused MCP server:
            </p>
            <div className="bg-black/40 rounded-lg p-4 font-mono text-sm overflow-x-auto">
              <pre className="text-green-400">
{`# MCP Server Endpoint
https://trifused.com/api/mcp

# Authentication Header
Authorization: Bearer YOUR_API_KEY

# Protocol: JSON-RPC 2.0`}
              </pre>
            </div>
          </div>

          <div className="glass-panel p-6 rounded-xl">
            <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
              <Code className="w-5 h-5 text-primary" />
              3. Make Your First Request
            </h3>
            <p className="text-muted-foreground text-sm mb-4">
              Example: Check website health
            </p>
            <div className="bg-black/40 rounded-lg p-4 font-mono text-sm overflow-x-auto">
              <pre className="text-green-400">
{`{
  "jsonrpc": "2.0",
  "method": "tools/call",
  "params": {
    "name": "check_website_health",
    "arguments": {
      "url": "https://example.com"
    }
  },
  "id": 1
}`}
              </pre>
            </div>
          </div>
        </div>
      </DocsSection>

      <DocsSection title="API Documentation">
        <div className="glass-panel p-6 rounded-xl">
          <p className="text-muted-foreground mb-4">
            For complete API documentation, code examples, and integration guides, visit the API documentation in your portal.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link 
              href="/portal/websites"
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
              data-testid="link-api-docs"
            >
              <Code className="w-4 h-4" />
              View Full API Docs
            </Link>
            <a 
              href="https://modelcontextprotocol.io"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 border border-primary text-primary rounded-lg hover:bg-primary/10 transition-colors"
              data-testid="link-mcp-spec"
            >
              <ExternalLink className="w-4 h-4" />
              MCP Specification
            </a>
          </div>
        </div>
      </DocsSection>

      <DocsSection title="Test Your Server">
        <div className="glass-panel p-6 rounded-xl bg-gradient-to-br from-primary/10 to-purple-500/10 border border-primary/30">
          <div className="flex items-center gap-3 mb-3">
            <Wrench className="w-6 h-6 text-primary" />
            <h3 className="text-xl font-semibold text-white">MCP Toolbox</h3>
          </div>
          <p className="text-muted-foreground mb-4">
            Use our interactive console to test MCP server connections, run commands, and debug your integration in real-time.
          </p>
          <Link 
            href="/mcp-toolbox"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-semibold"
            data-testid="link-mcp-toolbox"
          >
            <Terminal className="w-4 h-4" />
            Open MCP Toolbox
          </Link>
        </div>
      </DocsSection>

      <DocsSection title="Pricing">
        <div className="glass-panel p-6 rounded-xl">
          <p className="text-muted-foreground mb-4">
            MCP access is included with all API subscription tiers. Usage is counted against your API quota based on your subscription level.
          </p>
          <div className="grid sm:grid-cols-3 gap-4 mt-4">
            <div className="bg-black/20 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-white">Free</div>
              <div className="text-sm text-muted-foreground">50 calls/month</div>
            </div>
            <div className="bg-black/20 rounded-lg p-4 text-center border border-primary/30">
              <div className="text-2xl font-bold text-primary">Pro</div>
              <div className="text-sm text-muted-foreground">2,000 calls/month</div>
            </div>
            <div className="bg-black/20 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-white">Enterprise</div>
              <div className="text-sm text-muted-foreground">10,000+ calls/month</div>
            </div>
          </div>
          <div className="mt-4">
            <Link 
              href="/store"
              className="text-primary hover:underline text-sm"
              data-testid="link-pricing"
            >
              View all pricing options →
            </Link>
          </div>
        </div>
      </DocsSection>
    </DocsLayout>
  );
}
