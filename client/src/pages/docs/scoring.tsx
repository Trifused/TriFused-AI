import { DocsLayout, DocsSection, DocsCodeBlock } from "@/components/layout/docs-layout";
import { Calculator, Search, Shield, Zap, Key, Accessibility, Smartphone, Mail, Scale, Building, CreditCard, Cookie, AlertTriangle, CheckCircle2 } from "lucide-react";

export default function Scoring() {
  return (
    <DocsLayout 
      title="Scoring Logic Deep Dive"
      description="Understand exactly how your website scores are calculated across all categories."
    >
      <DocsSection title="Overview">
        <div className="glass-panel p-6 rounded-xl mb-6">
          <div className="flex items-center gap-3 mb-4">
            <Calculator className="w-6 h-6 text-primary" />
            <h3 className="text-lg font-semibold text-white">How Scores Are Calculated</h3>
          </div>
          <p className="text-muted-foreground mb-4">
            Each category starts at <strong className="text-white">100 points</strong> and deducts points for each issue found. 
            The final score is capped between 0 and 100. Your <strong className="text-white">Overall Score</strong> is the 
            average of all six main category scores.
          </p>
          <DocsCodeBlock 
            code={`Overall Score = (SEO + Security + Performance + Keywords + Accessibility + Mobile) / 6

Each category: Starts at 100, minus penalties for issues found
Final score: Math.max(0, Math.min(100, score))`}
          />
        </div>
        
        <div className="glass-panel p-6 rounded-xl">
          <h3 className="text-lg font-semibold text-white mb-4">Grade Scale</h3>
          <div className="grid grid-cols-5 gap-4 text-center">
            <div className="p-3 bg-green-500/20 rounded-lg border border-green-500/30">
              <div className="text-2xl font-bold text-green-400">A</div>
              <div className="text-sm text-muted-foreground">90-100</div>
            </div>
            <div className="p-3 bg-cyan-500/20 rounded-lg border border-cyan-500/30">
              <div className="text-2xl font-bold text-cyan-400">B</div>
              <div className="text-sm text-muted-foreground">80-89</div>
            </div>
            <div className="p-3 bg-yellow-500/20 rounded-lg border border-yellow-500/30">
              <div className="text-2xl font-bold text-yellow-400">C</div>
              <div className="text-sm text-muted-foreground">70-79</div>
            </div>
            <div className="p-3 bg-orange-500/20 rounded-lg border border-orange-500/30">
              <div className="text-2xl font-bold text-orange-400">D</div>
              <div className="text-sm text-muted-foreground">60-69</div>
            </div>
            <div className="p-3 bg-red-500/20 rounded-lg border border-red-500/30">
              <div className="text-2xl font-bold text-red-400">F</div>
              <div className="text-sm text-muted-foreground">0-59</div>
            </div>
          </div>
        </div>
      </DocsSection>

      <DocsSection title="SEO Score">
        <div className="space-y-4">
          <div className="glass-panel p-6 rounded-xl">
            <div className="flex items-center gap-3 mb-4">
              <Search className="w-6 h-6 text-primary" />
              <h3 className="text-lg font-semibold text-white">Search Engine Optimization</h3>
            </div>
            <p className="text-muted-foreground mb-4">
              Measures how well your page is optimized for search engine discovery and ranking.
            </p>
            
            <h4 className="font-semibold text-white mb-3">Penalty Breakdown:</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left py-2 text-white">Check</th>
                    <th className="text-center py-2 text-white">Penalty</th>
                    <th className="text-left py-2 text-white">Priority</th>
                  </tr>
                </thead>
                <tbody className="text-muted-foreground">
                  <tr className="border-b border-white/10">
                    <td className="py-2">Missing page title</td>
                    <td className="text-center py-2 text-red-400">-15</td>
                    <td className="py-2"><span className="px-2 py-0.5 bg-red-500/20 text-red-400 rounded text-xs">Critical</span></td>
                  </tr>
                  <tr className="border-b border-white/10">
                    <td className="py-2">Title too short (&lt;30) or long (&gt;70 chars)</td>
                    <td className="text-center py-2 text-yellow-400">-5</td>
                    <td className="py-2"><span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-400 rounded text-xs">Important</span></td>
                  </tr>
                  <tr className="border-b border-white/10">
                    <td className="py-2">Missing meta description</td>
                    <td className="text-center py-2 text-red-400">-15</td>
                    <td className="py-2"><span className="px-2 py-0.5 bg-red-500/20 text-red-400 rounded text-xs">Critical</span></td>
                  </tr>
                  <tr className="border-b border-white/10">
                    <td className="py-2">Meta description length issues</td>
                    <td className="text-center py-2 text-yellow-400">-5</td>
                    <td className="py-2"><span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-400 rounded text-xs">Important</span></td>
                  </tr>
                  <tr className="border-b border-white/10">
                    <td className="py-2">Missing H1 tag</td>
                    <td className="text-center py-2 text-yellow-400">-10</td>
                    <td className="py-2"><span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-400 rounded text-xs">Important</span></td>
                  </tr>
                  <tr className="border-b border-white/10">
                    <td className="py-2">Multiple H1 tags</td>
                    <td className="text-center py-2 text-yellow-400">-5</td>
                    <td className="py-2"><span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-400 rounded text-xs">Important</span></td>
                  </tr>
                  <tr className="border-b border-white/10">
                    <td className="py-2">Images missing alt text (per 5 images)</td>
                    <td className="text-center py-2 text-yellow-400">-5</td>
                    <td className="py-2"><span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-400 rounded text-xs">Important</span></td>
                  </tr>
                  <tr className="border-b border-white/10">
                    <td className="py-2">Missing Open Graph tags</td>
                    <td className="text-center py-2 text-gray-400">-5</td>
                    <td className="py-2"><span className="px-2 py-0.5 bg-white/10 text-gray-400 rounded text-xs">Optional</span></td>
                  </tr>
                  <tr className="border-b border-white/10">
                    <td className="py-2">Missing robots.txt</td>
                    <td className="text-center py-2 text-gray-400">-5</td>
                    <td className="py-2"><span className="px-2 py-0.5 bg-white/10 text-gray-400 rounded text-xs">Optional</span></td>
                  </tr>
                  <tr>
                    <td className="py-2">Missing sitemap.xml</td>
                    <td className="text-center py-2 text-gray-400">-5</td>
                    <td className="py-2"><span className="px-2 py-0.5 bg-white/10 text-gray-400 rounded text-xs">Optional</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </DocsSection>

      <DocsSection title="Security Score">
        <div className="space-y-4">
          <div className="glass-panel p-6 rounded-xl">
            <div className="flex items-center gap-3 mb-4">
              <Shield className="w-6 h-6 text-primary" />
              <h3 className="text-lg font-semibold text-white">Website Security</h3>
            </div>
            <p className="text-muted-foreground mb-4">
              Evaluates your website's security configuration including HTTPS, security headers, and protection against common attacks.
            </p>
            
            <h4 className="font-semibold text-white mb-3">Penalty Breakdown:</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left py-2 text-white">Check</th>
                    <th className="text-center py-2 text-white">Penalty</th>
                    <th className="text-left py-2 text-white">Priority</th>
                  </tr>
                </thead>
                <tbody className="text-muted-foreground">
                  <tr className="border-b border-white/10">
                    <td className="py-2">Not using HTTPS</td>
                    <td className="text-center py-2 text-red-400">-30</td>
                    <td className="py-2"><span className="px-2 py-0.5 bg-red-500/20 text-red-400 rounded text-xs">Critical</span></td>
                  </tr>
                  <tr className="border-b border-white/10">
                    <td className="py-2">Missing Content-Security-Policy header</td>
                    <td className="text-center py-2 text-yellow-400">-15</td>
                    <td className="py-2"><span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-400 rounded text-xs">Important</span></td>
                  </tr>
                  <tr className="border-b border-white/10">
                    <td className="py-2">Missing X-Frame-Options header</td>
                    <td className="text-center py-2 text-yellow-400">-10</td>
                    <td className="py-2"><span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-400 rounded text-xs">Important</span></td>
                  </tr>
                  <tr className="border-b border-white/10">
                    <td className="py-2">Missing X-Content-Type-Options header</td>
                    <td className="text-center py-2 text-yellow-400">-10</td>
                    <td className="py-2"><span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-400 rounded text-xs">Important</span></td>
                  </tr>
                  <tr className="border-b border-white/10">
                    <td className="py-2">Missing Strict-Transport-Security (HSTS)</td>
                    <td className="text-center py-2 text-yellow-400">-10</td>
                    <td className="py-2"><span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-400 rounded text-xs">Important</span></td>
                  </tr>
                  <tr className="border-b border-white/10">
                    <td className="py-2">Missing X-XSS-Protection header</td>
                    <td className="text-center py-2 text-gray-400">-5</td>
                    <td className="py-2"><span className="px-2 py-0.5 bg-white/10 text-gray-400 rounded text-xs">Optional</span></td>
                  </tr>
                  <tr>
                    <td className="py-2">Missing Referrer-Policy header</td>
                    <td className="text-center py-2 text-gray-400">-5</td>
                    <td className="py-2"><span className="px-2 py-0.5 bg-white/10 text-gray-400 rounded text-xs">Optional</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
            
            <div className="mt-4 p-4 bg-purple-500/10 border border-purple-500/30 rounded-lg">
              <h4 className="font-semibold text-purple-400 mb-2">Pro Feature: Advanced Security Scanning</h4>
              <p className="text-muted-foreground text-sm">
                Pro tier users get additional checks for exposed secrets (API keys, tokens), sensitive files (.env, .git, backups), and more detailed vulnerability assessment.
              </p>
            </div>
          </div>
        </div>
      </DocsSection>

      <DocsSection title="Performance Score">
        <div className="space-y-4">
          <div className="glass-panel p-6 rounded-xl">
            <div className="flex items-center gap-3 mb-4">
              <Zap className="w-6 h-6 text-primary" />
              <h3 className="text-lg font-semibold text-white">Core Web Vitals & Speed</h3>
            </div>
            <p className="text-muted-foreground mb-4">
              When Lighthouse is enabled, the performance score is taken directly from Google Lighthouse. 
              Otherwise, it's estimated based on page characteristics.
            </p>
            
            <h4 className="font-semibold text-white mb-3">Lighthouse Mode (Recommended):</h4>
            <div className="overflow-x-auto mb-6">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left py-2 text-white">Metric</th>
                    <th className="text-center py-2 text-white">Good</th>
                    <th className="text-center py-2 text-white">Needs Improvement</th>
                    <th className="text-center py-2 text-white">Poor</th>
                  </tr>
                </thead>
                <tbody className="text-muted-foreground">
                  <tr className="border-b border-white/10">
                    <td className="py-2 font-medium text-white">LCP (Largest Contentful Paint)</td>
                    <td className="text-center py-2 text-green-400">&lt; 2.5s</td>
                    <td className="text-center py-2 text-yellow-400">2.5s - 4s</td>
                    <td className="text-center py-2 text-red-400">&gt; 4s</td>
                  </tr>
                  <tr className="border-b border-white/10">
                    <td className="py-2 font-medium text-white">CLS (Cumulative Layout Shift)</td>
                    <td className="text-center py-2 text-green-400">&lt; 0.1</td>
                    <td className="text-center py-2 text-yellow-400">0.1 - 0.25</td>
                    <td className="text-center py-2 text-red-400">&gt; 0.25</td>
                  </tr>
                  <tr className="border-b border-white/10">
                    <td className="py-2 font-medium text-white">TBT (Total Blocking Time)</td>
                    <td className="text-center py-2 text-green-400">&lt; 200ms</td>
                    <td className="text-center py-2 text-yellow-400">200ms - 600ms</td>
                    <td className="text-center py-2 text-red-400">&gt; 600ms</td>
                  </tr>
                  <tr className="border-b border-white/10">
                    <td className="py-2 font-medium text-white">FCP (First Contentful Paint)</td>
                    <td className="text-center py-2 text-green-400">&lt; 1.8s</td>
                    <td className="text-center py-2 text-yellow-400">1.8s - 3s</td>
                    <td className="text-center py-2 text-red-400">&gt; 3s</td>
                  </tr>
                  <tr>
                    <td className="py-2 font-medium text-white">Speed Index</td>
                    <td className="text-center py-2 text-green-400">&lt; 3.4s</td>
                    <td className="text-center py-2 text-yellow-400">3.4s - 5.8s</td>
                    <td className="text-center py-2 text-red-400">&gt; 5.8s</td>
                  </tr>
                </tbody>
              </table>
            </div>
            
            <h4 className="font-semibold text-white mb-3">Estimated Mode (Without Lighthouse):</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left py-2 text-white">Check</th>
                    <th className="text-center py-2 text-white">Penalty</th>
                  </tr>
                </thead>
                <tbody className="text-muted-foreground">
                  <tr className="border-b border-white/10">
                    <td className="py-2">Large page size (&gt; 3MB)</td>
                    <td className="text-center py-2 text-yellow-400">-10 to -20</td>
                  </tr>
                  <tr className="border-b border-white/10">
                    <td className="py-2">Many external scripts</td>
                    <td className="text-center py-2 text-yellow-400">-5 to -15</td>
                  </tr>
                  <tr className="border-b border-white/10">
                    <td className="py-2">Unoptimized images</td>
                    <td className="text-center py-2 text-yellow-400">-5 to -10</td>
                  </tr>
                  <tr>
                    <td className="py-2">No caching headers</td>
                    <td className="text-center py-2 text-gray-400">-5</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </DocsSection>

      <DocsSection title="Keywords Score">
        <div className="space-y-4">
          <div className="glass-panel p-6 rounded-xl">
            <div className="flex items-center gap-3 mb-4">
              <Key className="w-6 h-6 text-primary" />
              <h3 className="text-lg font-semibold text-white">Keyword Optimization</h3>
            </div>
            <p className="text-muted-foreground mb-4">
              Analyzes your page content to identify top keywords and check if they're properly placed 
              in title, H1, and meta description.
            </p>
            
            <h4 className="font-semibold text-white mb-3">Penalty Breakdown:</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left py-2 text-white">Check</th>
                    <th className="text-center py-2 text-white">Penalty</th>
                    <th className="text-left py-2 text-white">Priority</th>
                  </tr>
                </thead>
                <tbody className="text-muted-foreground">
                  <tr className="border-b border-white/10">
                    <td className="py-2">No significant keywords found</td>
                    <td className="text-center py-2 text-yellow-400">-20</td>
                    <td className="py-2"><span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-400 rounded text-xs">Important</span></td>
                  </tr>
                  <tr className="border-b border-white/10">
                    <td className="py-2">Top keyword not in title or H1</td>
                    <td className="text-center py-2 text-yellow-400">-15</td>
                    <td className="py-2"><span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-400 rounded text-xs">Important</span></td>
                  </tr>
                  <tr>
                    <td className="py-2">Keyword density &gt; 3% (stuffing)</td>
                    <td className="text-center py-2 text-yellow-400">-10</td>
                    <td className="py-2"><span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-400 rounded text-xs">Important</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
            
            <div className="mt-4 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
              <h4 className="font-semibold text-blue-400 mb-2">Keyword Density Target: 1-2%</h4>
              <p className="text-muted-foreground text-sm">
                Keyword density is calculated as: (keyword occurrences / total words) × 100. 
                Aim for 1-2% for your primary keyword to avoid being flagged as keyword stuffing.
              </p>
            </div>
          </div>
        </div>
      </DocsSection>

      <DocsSection title="Accessibility Score">
        <div className="space-y-4">
          <div className="glass-panel p-6 rounded-xl">
            <div className="flex items-center gap-3 mb-4">
              <Accessibility className="w-6 h-6 text-primary" />
              <h3 className="text-lg font-semibold text-white">WCAG Accessibility</h3>
            </div>
            <p className="text-muted-foreground mb-4">
              Checks for Web Content Accessibility Guidelines (WCAG) compliance to ensure your site 
              is usable by people with disabilities.
            </p>
            
            <h4 className="font-semibold text-white mb-3">Penalty Breakdown:</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left py-2 text-white">Check</th>
                    <th className="text-center py-2 text-white">Penalty</th>
                    <th className="text-left py-2 text-white">Priority</th>
                  </tr>
                </thead>
                <tbody className="text-muted-foreground">
                  <tr className="border-b border-white/10">
                    <td className="py-2">Form inputs without labels</td>
                    <td className="text-center py-2 text-red-400">-5 per input (max -20)</td>
                    <td className="py-2"><span className="px-2 py-0.5 bg-red-500/20 text-red-400 rounded text-xs">Critical</span></td>
                  </tr>
                  <tr className="border-b border-white/10">
                    <td className="py-2">Buttons without accessible text</td>
                    <td className="text-center py-2 text-yellow-400">-5 per button (max -15)</td>
                    <td className="py-2"><span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-400 rounded text-xs">Important</span></td>
                  </tr>
                  <tr className="border-b border-white/10">
                    <td className="py-2">Links without accessible names</td>
                    <td className="text-center py-2 text-yellow-400">-5 per link (max -15)</td>
                    <td className="py-2"><span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-400 rounded text-xs">Important</span></td>
                  </tr>
                  <tr className="border-b border-white/10">
                    <td className="py-2">Missing skip navigation link</td>
                    <td className="text-center py-2 text-yellow-400">-10</td>
                    <td className="py-2"><span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-400 rounded text-xs">Important</span></td>
                  </tr>
                  <tr className="border-b border-white/10">
                    <td className="py-2">Inconsistent heading hierarchy</td>
                    <td className="text-center py-2 text-yellow-400">-10</td>
                    <td className="py-2"><span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-400 rounded text-xs">Important</span></td>
                  </tr>
                  <tr className="border-b border-white/10">
                    <td className="py-2">Missing lang attribute on html</td>
                    <td className="text-center py-2 text-yellow-400">-10</td>
                    <td className="py-2"><span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-400 rounded text-xs">Important</span></td>
                  </tr>
                  <tr>
                    <td className="py-2">Positive tabindex values</td>
                    <td className="text-center py-2 text-gray-400">-5</td>
                    <td className="py-2"><span className="px-2 py-0.5 bg-white/10 text-gray-400 rounded text-xs">Optional</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </DocsSection>

      <DocsSection title="Mobile Score">
        <div className="space-y-4">
          <div className="glass-panel p-6 rounded-xl">
            <div className="flex items-center gap-3 mb-4">
              <Smartphone className="w-6 h-6 text-primary" />
              <h3 className="text-lg font-semibold text-white">Mobile Optimization</h3>
            </div>
            <p className="text-muted-foreground mb-4">
              Evaluates how well your site is optimized for mobile devices, including responsive 
              design, font sizes, and touch targets.
            </p>
            
            <h4 className="font-semibold text-white mb-3">Penalty Breakdown:</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left py-2 text-white">Check</th>
                    <th className="text-center py-2 text-white">Penalty</th>
                    <th className="text-left py-2 text-white">Priority</th>
                  </tr>
                </thead>
                <tbody className="text-muted-foreground">
                  <tr className="border-b border-white/10">
                    <td className="py-2">Missing viewport meta tag</td>
                    <td className="text-center py-2 text-red-400">-25</td>
                    <td className="py-2"><span className="px-2 py-0.5 bg-red-500/20 text-red-400 rounded text-xs">Critical</span></td>
                  </tr>
                  <tr className="border-b border-white/10">
                    <td className="py-2">Viewport missing width=device-width</td>
                    <td className="text-center py-2 text-yellow-400">-15</td>
                    <td className="py-2"><span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-400 rounded text-xs">Important</span></td>
                  </tr>
                  <tr className="border-b border-white/10">
                    <td className="py-2">Small inline font sizes (&lt; 12px)</td>
                    <td className="text-center py-2 text-yellow-400">-10</td>
                    <td className="py-2"><span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-400 rounded text-xs">Important</span></td>
                  </tr>
                  <tr className="border-b border-white/10">
                    <td className="py-2">Images missing dimensions</td>
                    <td className="text-center py-2 text-yellow-400">-10</td>
                    <td className="py-2"><span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-400 rounded text-xs">Important</span></td>
                  </tr>
                  <tr className="border-b border-white/10">
                    <td className="py-2">Unminified CSS/JS detected</td>
                    <td className="text-center py-2 text-gray-400">-5</td>
                    <td className="py-2"><span className="px-2 py-0.5 bg-white/10 text-gray-400 rounded text-xs">Optional</span></td>
                  </tr>
                  <tr>
                    <td className="py-2">Multiple redirects detected</td>
                    <td className="text-center py-2 text-gray-400">-5</td>
                    <td className="py-2"><span className="px-2 py-0.5 bg-white/10 text-gray-400 rounded text-xs">Optional</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </DocsSection>

      <DocsSection title="Email Security Score">
        <div className="space-y-4">
          <div className="glass-panel p-6 rounded-xl">
            <div className="flex items-center gap-3 mb-4">
              <Mail className="w-6 h-6 text-primary" />
              <h3 className="text-lg font-semibold text-white">Email Authentication</h3>
            </div>
            <p className="text-muted-foreground mb-4">
              Checks DNS records for email authentication mechanisms that prevent spoofing and improve deliverability.
            </p>
            
            <h4 className="font-semibold text-white mb-3">Penalty Breakdown:</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left py-2 text-white">Check</th>
                    <th className="text-center py-2 text-white">Penalty</th>
                    <th className="text-left py-2 text-white">Priority</th>
                  </tr>
                </thead>
                <tbody className="text-muted-foreground">
                  <tr className="border-b border-white/10">
                    <td className="py-2">Missing SPF record</td>
                    <td className="text-center py-2 text-red-400">-25</td>
                    <td className="py-2"><span className="px-2 py-0.5 bg-red-500/20 text-red-400 rounded text-xs">Critical</span></td>
                  </tr>
                  <tr className="border-b border-white/10">
                    <td className="py-2">Missing MX records</td>
                    <td className="text-center py-2 text-yellow-400">-20</td>
                    <td className="py-2"><span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-400 rounded text-xs">Important</span></td>
                  </tr>
                  <tr className="border-b border-white/10">
                    <td className="py-2">Missing DMARC record</td>
                    <td className="text-center py-2 text-yellow-400">-20</td>
                    <td className="py-2"><span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-400 rounded text-xs">Important</span></td>
                  </tr>
                  <tr className="border-b border-white/10">
                    <td className="py-2">DMARC policy is "none"</td>
                    <td className="text-center py-2 text-yellow-400">-10</td>
                    <td className="py-2"><span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-400 rounded text-xs">Important</span></td>
                  </tr>
                  <tr>
                    <td className="py-2">Missing DKIM record</td>
                    <td className="text-center py-2 text-gray-400">-10</td>
                    <td className="py-2"><span className="px-2 py-0.5 bg-white/10 text-gray-400 rounded text-xs">Optional</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </DocsSection>

      <DocsSection title="Compliance Scores (Optional)">
        <div className="space-y-4">
          <p className="text-muted-foreground mb-4">
            These optional checks are available for specific industries and regulations. 
            Enable them during your scan to get compliance-specific scores.
          </p>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div className="glass-panel p-4 rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <Building className="w-5 h-5 text-primary" />
                <h4 className="font-semibold text-white">FDIC</h4>
              </div>
              <p className="text-sm text-muted-foreground">
                Checks for "Member FDIC" text, FDIC logo/badge, and proper deposit insurance signage for banking websites.
              </p>
            </div>
            
            <div className="glass-panel p-4 rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <Scale className="w-5 h-5 text-primary" />
                <h4 className="font-semibold text-white">SEC</h4>
              </div>
              <p className="text-sm text-muted-foreground">
                Validates securities disclosures, investment advisor registrations, and Form ADV/CRS links.
              </p>
            </div>
            
            <div className="glass-panel p-4 rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <Accessibility className="w-5 h-5 text-primary" />
                <h4 className="font-semibold text-white">ADA/WCAG</h4>
              </div>
              <p className="text-sm text-muted-foreground">
                Extended accessibility checks beyond the standard score, focusing on WCAG 2.1 AA compliance.
              </p>
            </div>
            
            <div className="glass-panel p-4 rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <CreditCard className="w-5 h-5 text-primary" />
                <h4 className="font-semibold text-white">PCI DSS</h4>
              </div>
              <p className="text-sm text-muted-foreground">
                Payment card industry checks for secure payment forms, TLS configuration, and data handling.
              </p>
            </div>
            
            <div className="glass-panel p-4 rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <Building className="w-5 h-5 text-primary" />
                <h4 className="font-semibold text-white">FCA</h4>
              </div>
              <p className="text-sm text-muted-foreground">
                UK Financial Conduct Authority compliance for financial services websites.
              </p>
            </div>
            
            <div className="glass-panel p-4 rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <Cookie className="w-5 h-5 text-primary" />
                <h4 className="font-semibold text-white">GDPR</h4>
              </div>
              <p className="text-sm text-muted-foreground">
                Privacy policy presence, cookie consent mechanisms, and data protection disclosures.
              </p>
            </div>
          </div>
        </div>
      </DocsSection>

      <DocsSection title="Priority Levels Explained">
        <div className="glass-panel p-6 rounded-xl">
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="p-2 bg-red-500/20 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <h4 className="font-semibold text-white mb-1">Critical</h4>
                <p className="text-muted-foreground text-sm">
                  Issues that severely impact your SEO rankings, security, or user experience. 
                  Fix these immediately. Examples: missing HTTPS, no page title, major accessibility barriers.
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-4">
              <div className="p-2 bg-yellow-500/20 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-yellow-400" />
              </div>
              <div>
                <h4 className="font-semibold text-white mb-1">Important</h4>
                <p className="text-muted-foreground text-sm">
                  Issues that noticeably affect rankings or user experience but aren't severe. 
                  Address these soon. Examples: suboptimal title length, missing security headers.
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-4">
              <div className="p-2 bg-white/10 rounded-lg">
                <CheckCircle2 className="w-5 h-5 text-gray-400" />
              </div>
              <div>
                <h4 className="font-semibold text-white mb-1">Optional</h4>
                <p className="text-muted-foreground text-sm">
                  Nice-to-have improvements that provide minor benefits. Low priority unless you're 
                  aiming for a perfect score. Examples: missing sitemap, Open Graph tags.
                </p>
              </div>
            </div>
          </div>
        </div>
      </DocsSection>
    </DocsLayout>
  );
}
