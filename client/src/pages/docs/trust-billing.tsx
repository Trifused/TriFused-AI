import { DocsLayout, DocsSection, DocsCard, DocsCodeBlock } from "@/components/layout/docs-layout";
import { Shield, Lock, Eye, CreditCard, Receipt, HelpCircle, Server, Globe } from "lucide-react";

export default function TrustBilling() {
  return (
    <DocsLayout 
      title="Trust & Billing"
      description="Learn about our security practices, data handling, and billing policies."
    >
      <DocsSection title="Security">
        <div className="space-y-6">
          <div className="glass-panel p-6 rounded-xl">
            <div className="flex items-center gap-3 mb-4">
              <Lock className="w-6 h-6 text-primary" />
              <h3 className="text-lg font-semibold text-white">Data Encryption</h3>
            </div>
            <ul className="list-disc list-inside text-muted-foreground space-y-2">
              <li>All data transmitted via TLS 1.3 encryption</li>
              <li>API keys stored using industry-standard encryption at rest</li>
              <li>Passwords hashed using bcrypt with secure salt rounds</li>
              <li>Database connections encrypted with SSL</li>
            </ul>
          </div>
          
          <div className="glass-panel p-6 rounded-xl">
            <div className="flex items-center gap-3 mb-4">
              <Server className="w-6 h-6 text-primary" />
              <h3 className="text-lg font-semibold text-white">Infrastructure</h3>
            </div>
            <ul className="list-disc list-inside text-muted-foreground space-y-2">
              <li>Hosted on secure cloud infrastructure with SOC 2 compliance</li>
              <li>Regular security audits and penetration testing</li>
              <li>DDoS protection and rate limiting</li>
              <li>Automated backups with point-in-time recovery</li>
              <li>99.9% uptime SLA for enterprise customers</li>
            </ul>
          </div>
          
          <div className="glass-panel p-6 rounded-xl">
            <div className="flex items-center gap-3 mb-4">
              <Shield className="w-6 h-6 text-primary" />
              <h3 className="text-lg font-semibold text-white">Security Headers</h3>
            </div>
            <p className="text-muted-foreground mb-4">
              We implement comprehensive security headers on all responses:
            </p>
            <DocsCodeBlock 
              code={`Content-Security-Policy: default-src 'self'
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Strict-Transport-Security: max-age=31536000
Referrer-Policy: strict-origin-when-cross-origin`}
            />
          </div>
        </div>
      </DocsSection>

      <DocsSection title="Privacy & Data Handling">
        <div className="space-y-6">
          <div className="glass-panel p-6 rounded-xl">
            <div className="flex items-center gap-3 mb-4">
              <Eye className="w-6 h-6 text-primary" />
              <h3 className="text-lg font-semibold text-white">What We Collect</h3>
            </div>
            <div className="text-muted-foreground space-y-4">
              <div>
                <strong className="text-white">Website Scans:</strong>
                <ul className="list-disc list-inside mt-2 ml-4">
                  <li>URL being scanned (public information)</li>
                  <li>Scan results and scores</li>
                  <li>Timestamp of scan</li>
                </ul>
              </div>
              <div>
                <strong className="text-white">Account Information:</strong>
                <ul className="list-disc list-inside mt-2 ml-4">
                  <li>Email address</li>
                  <li>Name (optional)</li>
                  <li>Company name (optional)</li>
                </ul>
              </div>
              <div>
                <strong className="text-white">Usage Analytics:</strong>
                <ul className="list-disc list-inside mt-2 ml-4">
                  <li>Anonymous page views and feature usage</li>
                  <li>Device type and browser (anonymized)</li>
                </ul>
              </div>
            </div>
          </div>
          
          <div className="glass-panel p-6 rounded-xl">
            <h3 className="text-lg font-semibold text-white mb-4">Data Retention</h3>
            <ul className="list-disc list-inside text-muted-foreground space-y-2">
              <li><strong className="text-white">Scan Results:</strong> Retained for 90 days (free), 1 year (paid)</li>
              <li><strong className="text-white">Account Data:</strong> Retained until account deletion</li>
              <li><strong className="text-white">API Logs:</strong> Retained for 30 days</li>
              <li><strong className="text-white">Payment Records:</strong> Retained as required by law</li>
            </ul>
          </div>
          
          <div className="glass-panel p-6 rounded-xl">
            <h3 className="text-lg font-semibold text-white mb-4">Your Rights (GDPR)</h3>
            <ul className="list-disc list-inside text-muted-foreground space-y-2">
              <li><strong className="text-white">Access:</strong> Request a copy of your data</li>
              <li><strong className="text-white">Rectification:</strong> Update incorrect information</li>
              <li><strong className="text-white">Erasure:</strong> Request deletion of your data</li>
              <li><strong className="text-white">Portability:</strong> Export your data in standard formats</li>
              <li><strong className="text-white">Objection:</strong> Opt out of marketing communications</li>
            </ul>
            <p className="text-muted-foreground mt-4">
              Contact <a href="mailto:privacy@trifused.com" className="text-primary hover:underline">privacy@trifused.com</a> for data requests.
            </p>
          </div>
        </div>
      </DocsSection>

      <DocsSection title="Billing">
        <div className="space-y-6">
          <div className="glass-panel p-6 rounded-xl">
            <div className="flex items-center gap-3 mb-4">
              <CreditCard className="w-6 h-6 text-primary" />
              <h3 className="text-lg font-semibold text-white">Payment Methods</h3>
            </div>
            <ul className="list-disc list-inside text-muted-foreground space-y-2">
              <li>All major credit cards (Visa, Mastercard, Amex, Discover)</li>
              <li>Debit cards</li>
              <li>Invoicing available for Enterprise plans</li>
            </ul>
            <p className="text-muted-foreground mt-4">
              All payments are processed securely through Stripe. We never store your full card details.
            </p>
          </div>
          
          <div className="glass-panel p-6 rounded-xl">
            <div className="flex items-center gap-3 mb-4">
              <Receipt className="w-6 h-6 text-primary" />
              <h3 className="text-lg font-semibold text-white">Subscription Billing</h3>
            </div>
            <ul className="list-disc list-inside text-muted-foreground space-y-2">
              <li>Subscriptions billed monthly or annually</li>
              <li>Annual plans receive a 20% discount</li>
              <li>Billing date is the day you subscribe</li>
              <li>Invoices sent via email on each billing date</li>
              <li>Unused API calls do not roll over</li>
            </ul>
          </div>
          
          <div className="glass-panel p-6 rounded-xl">
            <h3 className="text-lg font-semibold text-white mb-4">Refund Policy</h3>
            <div className="text-muted-foreground space-y-3">
              <p>
                <strong className="text-white">Subscriptions:</strong> We offer a 7-day money-back guarantee 
                for first-time subscribers. Cancel within 7 days for a full refund.
              </p>
              <p>
                <strong className="text-white">One-Time Purchases:</strong> AI Compliance Reports and API 
                call packs are non-refundable once delivered, as they involve immediate service consumption.
              </p>
              <p>
                <strong className="text-white">Pro-Rata Refunds:</strong> If you downgrade mid-cycle, you'll 
                receive credit toward your next billing period.
              </p>
            </div>
          </div>
          
          <div className="glass-panel p-6 rounded-xl">
            <h3 className="text-lg font-semibold text-white mb-4">Cancellation</h3>
            <ul className="list-disc list-inside text-muted-foreground space-y-2">
              <li>Cancel anytime from your Portal dashboard</li>
              <li>Access continues until end of billing period</li>
              <li>No cancellation fees</li>
              <li>Data retained for 30 days after cancellation</li>
            </ul>
          </div>
        </div>
      </DocsSection>

      <DocsSection title="FAQ">
        <div className="space-y-4">
          <div className="glass-panel p-6 rounded-xl">
            <div className="flex items-center gap-3 mb-3">
              <HelpCircle className="w-5 h-5 text-primary" />
              <h3 className="font-semibold text-white">Do you sell my data?</h3>
            </div>
            <p className="text-muted-foreground">
              No. We never sell, rent, or share your personal data with third parties for marketing purposes.
            </p>
          </div>
          
          <div className="glass-panel p-6 rounded-xl">
            <div className="flex items-center gap-3 mb-3">
              <HelpCircle className="w-5 h-5 text-primary" />
              <h3 className="font-semibold text-white">Can I get an invoice for my purchase?</h3>
            </div>
            <p className="text-muted-foreground">
              Yes, invoices are automatically emailed after each payment. You can also download past invoices 
              from the Billing section in your Portal.
            </p>
          </div>
          
          <div className="glass-panel p-6 rounded-xl">
            <div className="flex items-center gap-3 mb-3">
              <HelpCircle className="w-5 h-5 text-primary" />
              <h3 className="font-semibold text-white">What happens if I exceed my API limit?</h3>
            </div>
            <p className="text-muted-foreground">
              You'll receive a warning at 80% usage. If you exceed your limit, additional calls will return 
              a 429 error. You can purchase additional call packs or upgrade your plan at any time.
            </p>
          </div>
          
          <div className="glass-panel p-6 rounded-xl">
            <div className="flex items-center gap-3 mb-3">
              <HelpCircle className="w-5 h-5 text-primary" />
              <h3 className="font-semibold text-white">Is TriFused GDPR compliant?</h3>
            </div>
            <p className="text-muted-foreground">
              Yes. We are fully GDPR compliant and offer Data Processing Agreements (DPAs) for enterprise 
              customers. Contact us at <a href="mailto:legal@trifused.com" className="text-primary hover:underline">legal@trifused.com</a>.
            </p>
          </div>
        </div>
      </DocsSection>
    </DocsLayout>
  );
}
