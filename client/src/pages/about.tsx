import { DocsLayout, DocsSection } from "@/components/layout/docs-layout";
import { Building2, Target, Lightbulb, Shield, Zap, BarChart3, Users, Heart, Clock } from "lucide-react";

interface ChangelogEntry {
  version: string;
  date: string;
  changes: string[];
}

const changelog: ChangelogEntry[] = [
  { version: "2.5.0", date: "December 28, 2025", changes: ["MCP (Model Context Protocol) integration for AI agents", "MCP interaction logging for admin visibility", "New tools: get_services, get_blog_posts, get_about, get_api_documentation"] },
  { version: "2.4.0", date: "December 27, 2025", changes: ["Automated website report card emails with scheduling", "Token-based payment system for premium features", "Self-service subscription cancellation"] },
  { version: "2.3.0", date: "December 20, 2025", changes: ["Multi-language support (i18n)", "Resend receipt functionality", "Expandable transaction management"] },
  { version: "2.2.0", date: "December 15, 2025", changes: ["API access with tier-based rate limiting", "Website grader with detailed scoring", "Admin management dashboard"] },
  { version: "2.1.0", date: "December 10, 2025", changes: ["Stripe subscription integration", "Customer portal accounts", "Automated lead analytics reporting"] },
  { version: "2.0.0", date: "December 1, 2025", changes: ["Complete platform redesign", "AI-native technology services launch", "Website health check API"] },
];

const capabilities = [
  { icon: Zap, title: "AI Integration & Automation", description: "Leverage cutting-edge AI to automate workflows and enhance productivity" },
  { icon: Shield, title: "Cybersecurity & Compliance", description: "Protect your digital assets with enterprise-grade security solutions" },
  { icon: Building2, title: "Infrastructure Management", description: "Self-healing systems that adapt and scale automatically" },
  { icon: BarChart3, title: "Website Performance Optimization", description: "Analyze and improve your website's speed, SEO, and accessibility" },
  { icon: Users, title: "Lead Generation & Analytics", description: "Data-driven insights to grow your business" },
];

const values = [
  { icon: Lightbulb, title: "Innovation", description: "Continuously pushing the boundaries of what's possible with AI" },
  { icon: Shield, title: "Security", description: "Building trust through robust protection and compliance" },
  { icon: Target, title: "Simplicity", description: "Making complex technology accessible and easy to use" },
  { icon: Heart, title: "Results", description: "Focusing on measurable outcomes that drive business growth" },
];

export default function About() {
  return (
    <DocsLayout 
      title="About TriFused"
      description="AI-Native Technology Services - Empowering businesses with solutions that automate, protect, and grow."
    >
      <DocsSection title="Our Mission">
        <p className="text-muted-foreground mb-6 leading-relaxed text-lg">
          TriFused is a technology services company focused on bringing enterprise-grade AI capabilities to businesses of all sizes. 
          We empower organizations with AI-native solutions that automate operations, protect digital assets, and drive sustainable growth.
        </p>
        
        <div className="glass-panel p-6 rounded-xl mb-8 border-l-4 border-primary">
          <p className="text-xl text-white italic">
            "Empowering businesses with AI-native technology solutions that automate, protect, and grow."
          </p>
        </div>
      </DocsSection>

      <DocsSection title="What We Do">
        <div className="grid md:grid-cols-2 gap-4 mb-8">
          {capabilities.map((cap, i) => (
            <div key={i} className="glass-panel p-5 rounded-xl" data-testid={`capability-${i}`}>
              <div className="flex items-center gap-3 mb-2">
                <cap.icon className="w-6 h-6 text-primary" />
                <h3 className="text-lg font-semibold text-white">{cap.title}</h3>
              </div>
              <p className="text-muted-foreground text-sm">{cap.description}</p>
            </div>
          ))}
        </div>
      </DocsSection>

      <DocsSection title="Our Values">
        <div className="grid md:grid-cols-2 gap-4 mb-8">
          {values.map((val, i) => (
            <div key={i} className="glass-panel p-5 rounded-xl" data-testid={`value-${i}`}>
              <div className="flex items-center gap-3 mb-2">
                <val.icon className="w-6 h-6 text-primary" />
                <h3 className="text-lg font-semibold text-white">{val.title}</h3>
              </div>
              <p className="text-muted-foreground text-sm">{val.description}</p>
            </div>
          ))}
        </div>
      </DocsSection>

      <DocsSection title="Platform Changelog">
        <p className="text-muted-foreground mb-6">
          Recent updates and improvements to the TriFused platform.
        </p>
        
        <div className="space-y-4">
          {changelog.map((entry, i) => (
            <div key={i} className="glass-panel p-5 rounded-xl" data-testid={`changelog-${entry.version}`}>
              <div className="flex items-center gap-3 mb-3">
                <Clock className="w-5 h-5 text-primary" />
                <div className="flex items-center gap-2">
                  <span className="text-white font-semibold">v{entry.version}</span>
                  <span className="text-muted-foreground text-sm">- {entry.date}</span>
                </div>
              </div>
              <ul className="list-disc list-inside text-muted-foreground text-sm space-y-1">
                {entry.changes.map((change, j) => (
                  <li key={j}>{change}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </DocsSection>

      <DocsSection title="Contact">
        <div className="glass-panel p-6 rounded-xl">
          <p className="text-muted-foreground mb-4">
            Ready to transform your business with AI-native technology? Get in touch with us.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <a 
              href="https://trifused.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
              data-testid="link-website"
            >
              <Building2 className="w-4 h-4" />
              Visit Website
            </a>
            <a 
              href="mailto:hello@trifused.com"
              className="inline-flex items-center gap-2 px-4 py-2 border border-primary text-primary rounded-lg hover:bg-primary/10 transition-colors"
              data-testid="link-email"
            >
              Contact Us
            </a>
          </div>
        </div>
      </DocsSection>
    </DocsLayout>
  );
}
