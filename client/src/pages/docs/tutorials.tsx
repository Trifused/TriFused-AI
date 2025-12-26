import { DocsLayout, DocsSection, DocsCard, DocsCodeBlock } from "@/components/layout/docs-layout";
import { Search, Code, Workflow, FileJson, Terminal, Webhook } from "lucide-react";

export default function Tutorials() {
  return (
    <DocsLayout 
      title="Tutorials"
      description="Step-by-step guides to help you get the most out of TriFused's tools and API."
    >
      <DocsSection title="Website Grader">
        <div className="space-y-6">
          <div className="glass-panel p-6 rounded-xl">
            <div className="flex items-center gap-3 mb-4">
              <Search className="w-6 h-6 text-primary" />
              <h3 className="text-lg font-semibold text-white">Running Your First Scan</h3>
            </div>
            <ol className="list-decimal list-inside text-muted-foreground space-y-3">
              <li>Navigate to <a href="/grader" className="text-primary hover:underline">trifused.com/grader</a></li>
              <li>Enter your website URL (e.g., example.com or https://example.com)</li>
              <li>Optionally enable compliance checks (FDIC, SEC, ADA, PCI, FCA, GDPR)</li>
              <li>Click "Analyze" and wait 15-30 seconds for results</li>
              <li>Review your scores and actionable recommendations</li>
            </ol>
          </div>
          
          <div className="glass-panel p-6 rounded-xl">
            <h3 className="text-lg font-semibold text-white mb-4">Understanding Your Results</h3>
            <div className="space-y-4 text-muted-foreground">
              <div>
                <strong className="text-white">Grade Letters:</strong>
                <ul className="list-disc list-inside mt-2 ml-4">
                  <li><span className="text-green-400">A (90-100)</span> - Excellent, minimal improvements needed</li>
                  <li><span className="text-cyan-400">B (80-89)</span> - Good, some optimizations recommended</li>
                  <li><span className="text-yellow-400">C (70-79)</span> - Average, several issues to address</li>
                  <li><span className="text-orange-400">D (60-69)</span> - Below average, significant improvements needed</li>
                  <li><span className="text-red-400">F (0-59)</span> - Poor, critical issues requiring immediate attention</li>
                </ul>
              </div>
              
              <div>
                <strong className="text-white">Priority Levels:</strong>
                <ul className="list-disc list-inside mt-2 ml-4">
                  <li><span className="text-red-400">Critical</span> - Fix immediately, significantly impacts SEO/security</li>
                  <li><span className="text-yellow-400">Important</span> - Address soon, affects user experience</li>
                  <li><span className="text-green-400">Optional</span> - Nice to have, minor improvements</li>
                </ul>
              </div>
            </div>
          </div>
          
          <div className="glass-panel p-6 rounded-xl">
            <h3 className="text-lg font-semibold text-white mb-4">Sharing Reports</h3>
            <p className="text-muted-foreground mb-4">
              After scanning, you can share your results in several ways:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2">
              <li><strong className="text-white">Share Link</strong> - Copy a unique URL to share with anyone</li>
              <li><strong className="text-white">QR Code</strong> - Download a QR code for printed materials</li>
              <li><strong className="text-white">PDF Report</strong> - Generate a detailed PDF document (Pro feature)</li>
            </ul>
          </div>
        </div>
      </DocsSection>

      <DocsSection title="API Integration">
        <div className="space-y-6">
          <div className="glass-panel p-6 rounded-xl">
            <div className="flex items-center gap-3 mb-4">
              <Code className="w-6 h-6 text-primary" />
              <h3 className="text-lg font-semibold text-white">Getting Your API Key</h3>
            </div>
            <ol className="list-decimal list-inside text-muted-foreground space-y-3">
              <li>Sign in to your TriFused account at <a href="/portal" className="text-primary hover:underline">/portal</a></li>
              <li>Navigate to the API section in the dashboard</li>
              <li>Click "Generate New API Key"</li>
              <li>Copy and securely store your API key</li>
            </ol>
            <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
              <p className="text-yellow-400 text-sm">
                <strong>Important:</strong> Keep your API key secret. Never expose it in client-side code or public repositories.
              </p>
            </div>
          </div>
          
          <div className="glass-panel p-6 rounded-xl">
            <div className="flex items-center gap-3 mb-4">
              <Terminal className="w-6 h-6 text-primary" />
              <h3 className="text-lg font-semibold text-white">Making Your First API Call</h3>
            </div>
            <p className="text-muted-foreground mb-4">
              Use the /v1/score endpoint to analyze any website:
            </p>
            <DocsCodeBlock 
              code={`curl -X POST https://api.trifused.com/v1/score \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"url": "https://example.com"}'`}
            />
            <p className="text-muted-foreground mt-4">
              The response includes all scores and findings in JSON format:
            </p>
            <DocsCodeBlock 
              code={`{
  "url": "https://example.com",
  "overallScore": 85,
  "seoScore": 90,
  "securityScore": 80,
  "performanceScore": 75,
  "accessibilityScore": 88,
  "findings": [...]
}`}
            />
          </div>
          
          <div className="glass-panel p-6 rounded-xl">
            <div className="flex items-center gap-3 mb-4">
              <FileJson className="w-6 h-6 text-primary" />
              <h3 className="text-lg font-semibold text-white">API Response Format</h3>
            </div>
            <div className="text-muted-foreground space-y-3">
              <p><strong className="text-white">Success Response (200):</strong></p>
              <DocsCodeBlock 
                code={`{
  "success": true,
  "data": {
    "url": "string",
    "overallScore": "number (0-100)",
    "seoScore": "number",
    "securityScore": "number",
    "performanceScore": "number",
    "accessibilityScore": "number",
    "mobileScore": "number",
    "findings": "array of findings",
    "coreWebVitals": {
      "lcp": "number (ms)",
      "cls": "number",
      "tbt": "number (ms)"
    }
  }
}`}
              />
              <p><strong className="text-white">Error Response (4xx/5xx):</strong></p>
              <DocsCodeBlock 
                code={`{
  "success": false,
  "error": "Error message",
  "code": "ERROR_CODE"
}`}
              />
            </div>
          </div>
        </div>
      </DocsSection>

      <DocsSection title="CI/CD Integration">
        <div className="space-y-6">
          <div className="glass-panel p-6 rounded-xl">
            <div className="flex items-center gap-3 mb-4">
              <Workflow className="w-6 h-6 text-primary" />
              <h3 className="text-lg font-semibold text-white">GitHub Actions</h3>
            </div>
            <p className="text-muted-foreground mb-4">
              Add website health checks to your deployment pipeline:
            </p>
            <DocsCodeBlock 
              code={`name: Website Health Check
on:
  push:
    branches: [main]

jobs:
  grade:
    runs-on: ubuntu-latest
    steps:
      - name: Check Website Score
        run: |
          RESPONSE=$(curl -s -X POST https://api.trifused.com/v1/score \\
            -H "Authorization: Bearer \${{ secrets.TRIFUSED_API_KEY }}" \\
            -H "Content-Type: application/json" \\
            -d '{"url": "\${{ vars.SITE_URL }}"}')
          
          SCORE=$(echo $RESPONSE | jq '.data.overallScore')
          echo "Website Score: $SCORE"
          
          if [ "$SCORE" -lt 70 ]; then
            echo "Score below threshold (70)"
            exit 1
          fi`}
            />
          </div>
          
          <div className="glass-panel p-6 rounded-xl">
            <div className="flex items-center gap-3 mb-4">
              <Webhook className="w-6 h-6 text-primary" />
              <h3 className="text-lg font-semibold text-white">Webhook Notifications</h3>
            </div>
            <p className="text-muted-foreground mb-4">
              Configure webhooks to receive alerts when your website score drops below a threshold.
              Set up webhooks in your Portal dashboard under API Settings.
            </p>
            <DocsCodeBlock 
              code={`POST https://your-server.com/webhook
Content-Type: application/json

{
  "event": "score_alert",
  "url": "https://example.com",
  "previousScore": 85,
  "currentScore": 62,
  "threshold": 70,
  "timestamp": "2025-01-15T10:30:00Z"
}`}
            />
          </div>
        </div>
      </DocsSection>

      <DocsSection title="Rate Limits">
        <div className="glass-panel p-6 rounded-xl">
          <h3 className="text-lg font-semibold text-white mb-4">API Usage Limits</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left py-3 text-white">Plan</th>
                  <th className="text-left py-3 text-white">Calls/Month</th>
                  <th className="text-left py-3 text-white">Rate Limit</th>
                  <th className="text-left py-3 text-white">Features</th>
                </tr>
              </thead>
              <tbody className="text-muted-foreground">
                <tr className="border-b border-white/10">
                  <td className="py-3">Free</td>
                  <td className="py-3">50</td>
                  <td className="py-3">10/hour</td>
                  <td className="py-3">Basic scanning</td>
                </tr>
                <tr className="border-b border-white/10">
                  <td className="py-3">Starter ($9.99/mo)</td>
                  <td className="py-3">500</td>
                  <td className="py-3">100/hour</td>
                  <td className="py-3">JSON reports</td>
                </tr>
                <tr className="border-b border-white/10">
                  <td className="py-3">Pro ($29.99/mo)</td>
                  <td className="py-3">2,000</td>
                  <td className="py-3">500/hour</td>
                  <td className="py-3">+ GTmetrix, Lighthouse</td>
                </tr>
                <tr>
                  <td className="py-3">Enterprise ($99.99/mo)</td>
                  <td className="py-3">10,000</td>
                  <td className="py-3">Unlimited</td>
                  <td className="py-3">+ Priority support, SLA</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </DocsSection>
    </DocsLayout>
  );
}
