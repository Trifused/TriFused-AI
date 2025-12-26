import { DocsLayout, DocsSection, DocsCard, DocsCodeBlock } from "@/components/layout/docs-layout";
import { Search, Zap, Key, Shield, Globe, BarChart3 } from "lucide-react";

export default function Docs() {
  return (
    <DocsLayout 
      title="Getting Started"
      description="Welcome to TriFused documentation. Learn how to analyze, optimize, and monitor your website's performance."
    >
      <DocsSection title="What is TriFused?">
        <p className="text-muted-foreground mb-6 leading-relaxed">
          TriFused is an AI-native technology services platform that helps you understand and improve your website's performance, 
          security, and compliance. Our flagship tool, the Website Grader, analyzes your site across 17+ key metrics in under 
          30 seconds, providing actionable recommendations to improve visibility in Google search.
        </p>
        
        <div className="grid md:grid-cols-2 gap-4 mb-8">
          <DocsCard
            icon={Search}
            title="Website Grader"
            description="Free instant analysis of your website's SEO, security, performance, and accessibility."
            href="/grader"
          />
          <DocsCard
            icon={Key}
            title="API Access"
            description="Integrate website analysis into your CI/CD pipelines and monitoring systems."
            href="/docs/tutorials"
          />
          <DocsCard
            icon={Shield}
            title="Compliance Checks"
            description="FDIC, SEC, ADA, PCI, FCA, and GDPR compliance scanning for regulated industries."
            href="/grader"
          />
          <DocsCard
            icon={BarChart3}
            title="Performance Reports"
            description="Shareable PDF reports with QR codes for stakeholder presentations."
            href="/store"
          />
        </div>
      </DocsSection>

      <DocsSection title="Quick Start">
        <div className="space-y-6">
          <div className="glass-panel p-6 rounded-xl">
            <h3 className="text-lg font-semibold text-white mb-3">1. Analyze Your Website</h3>
            <p className="text-muted-foreground mb-4">
              Enter any website URL in our free Website Grader to get an instant performance report.
            </p>
            <DocsCodeBlock code="https://trifused.com/grader" />
          </div>
          
          <div className="glass-panel p-6 rounded-xl">
            <h3 className="text-lg font-semibold text-white mb-3">2. Review Your Scores</h3>
            <p className="text-muted-foreground mb-4">
              Your website is scored across multiple categories:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2">
              <li><strong className="text-white">SEO Score</strong> - Meta tags, headings, images, Open Graph</li>
              <li><strong className="text-white">Security Score</strong> - HTTPS, security headers, vulnerabilities</li>
              <li><strong className="text-white">Performance Score</strong> - Page speed, Core Web Vitals</li>
              <li><strong className="text-white">Accessibility Score</strong> - WCAG compliance, screen reader support</li>
              <li><strong className="text-white">Mobile Score</strong> - Responsive design, touch targets</li>
            </ul>
          </div>
          
          <div className="glass-panel p-6 rounded-xl">
            <h3 className="text-lg font-semibold text-white mb-3">3. Follow Recommendations</h3>
            <p className="text-muted-foreground mb-4">
              Each finding includes a priority level (critical, important, optional) and specific 
              instructions on how to fix the issue. Focus on critical issues first for maximum impact.
            </p>
          </div>
          
          <div className="glass-panel p-6 rounded-xl">
            <h3 className="text-lg font-semibold text-white mb-3">4. Share Your Results</h3>
            <p className="text-muted-foreground mb-4">
              Generate a shareable link or QR code to share your report with team members, clients, 
              or stakeholders. Reports are accessible without requiring an account.
            </p>
          </div>
        </div>
      </DocsSection>

      <DocsSection title="Core Features">
        <div className="space-y-4">
          <div className="glass-panel p-6 rounded-xl">
            <div className="flex items-center gap-3 mb-3">
              <Globe className="w-6 h-6 text-primary" />
              <h3 className="text-lg font-semibold text-white">Core Web Vitals</h3>
            </div>
            <p className="text-muted-foreground">
              Powered by Google Lighthouse, we measure LCP (Largest Contentful Paint), 
              CLS (Cumulative Layout Shift), and TBT (Total Blocking Time) to give you 
              the same metrics Google uses for ranking.
            </p>
          </div>
          
          <div className="glass-panel p-6 rounded-xl">
            <div className="flex items-center gap-3 mb-3">
              <Shield className="w-6 h-6 text-primary" />
              <h3 className="text-lg font-semibold text-white">Security Scanning</h3>
            </div>
            <p className="text-muted-foreground">
              We check for HTTPS configuration, security headers (CSP, HSTS, X-Frame-Options), 
              SSL certificate validity, and common vulnerabilities. Pro users get additional 
              scans for exposed secrets and sensitive files.
            </p>
          </div>
          
          <div className="glass-panel p-6 rounded-xl">
            <div className="flex items-center gap-3 mb-3">
              <Zap className="w-6 h-6 text-primary" />
              <h3 className="text-lg font-semibold text-white">Compliance Checks</h3>
            </div>
            <p className="text-muted-foreground">
              Enable industry-specific compliance scanning for FDIC (banking), SEC (securities), 
              ADA/WCAG (accessibility), PCI (payments), FCA (UK financial), and GDPR (privacy).
            </p>
          </div>
        </div>
      </DocsSection>

      <DocsSection title="Next Steps">
        <div className="grid md:grid-cols-2 gap-4">
          <DocsCard
            title="Read Tutorials"
            description="Step-by-step guides for using the Website Grader and API."
            href="/docs/tutorials"
          />
          <DocsCard
            title="View Pricing"
            description="Explore our API subscription plans and premium features."
            href="/store"
          />
        </div>
      </DocsSection>
    </DocsLayout>
  );
}
