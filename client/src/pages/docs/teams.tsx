import { DocsLayout, DocsSection, DocsCard, DocsCodeBlock } from "@/components/layout/docs-layout";
import { Users, Building2, Shield, Zap, HeadphonesIcon, Settings, UserPlus, Lock } from "lucide-react";

export default function Teams() {
  return (
    <DocsLayout 
      title="Teams & Enterprise"
      description="Collaborate with your team and access enterprise-grade features for your organization."
    >
      <DocsSection title="Team Features">
        <div className="space-y-6">
          <div className="glass-panel p-6 rounded-xl">
            <div className="flex items-center gap-3 mb-4">
              <UserPlus className="w-6 h-6 text-primary" />
              <h3 className="text-lg font-semibold text-white">Team Seats</h3>
            </div>
            <p className="text-muted-foreground mb-4">
              Add team members to your organization and share access to website monitoring, reports, 
              and API usage across your team.
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2">
              <li>Invite team members via email</li>
              <li>Shared dashboard with all team scans</li>
              <li>Collaborative report editing</li>
              <li>Unified billing for all seats</li>
            </ul>
          </div>
          
          <div className="glass-panel p-6 rounded-xl">
            <div className="flex items-center gap-3 mb-4">
              <Lock className="w-6 h-6 text-primary" />
              <h3 className="text-lg font-semibold text-white">Role-Based Access</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left py-3 text-white">Role</th>
                    <th className="text-left py-3 text-white">Permissions</th>
                  </tr>
                </thead>
                <tbody className="text-muted-foreground">
                  <tr className="border-b border-white/10">
                    <td className="py-3 font-medium text-white">Owner</td>
                    <td className="py-3">Full access, billing, team management, delete organization</td>
                  </tr>
                  <tr className="border-b border-white/10">
                    <td className="py-3 font-medium text-white">Admin</td>
                    <td className="py-3">Manage team members, API keys, all scans and reports</td>
                  </tr>
                  <tr className="border-b border-white/10">
                    <td className="py-3 font-medium text-white">Member</td>
                    <td className="py-3">Create scans, view reports, use API</td>
                  </tr>
                  <tr>
                    <td className="py-3 font-medium text-white">Viewer</td>
                    <td className="py-3">View-only access to reports and dashboards</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          
          <div className="glass-panel p-6 rounded-xl">
            <div className="flex items-center gap-3 mb-4">
              <Settings className="w-6 h-6 text-primary" />
              <h3 className="text-lg font-semibold text-white">Team Settings</h3>
            </div>
            <ul className="list-disc list-inside text-muted-foreground space-y-2">
              <li>Custom organization branding for reports</li>
              <li>Default compliance checks for all scans</li>
              <li>Shared website monitoring lists</li>
              <li>Team-wide notification preferences</li>
              <li>API key management with usage tracking per member</li>
            </ul>
          </div>
        </div>
      </DocsSection>

      <DocsSection title="Enterprise Plan">
        <div className="space-y-6">
          <div className="glass-panel p-6 rounded-xl border-primary/30">
            <div className="flex items-center gap-3 mb-4">
              <Building2 className="w-6 h-6 text-primary" />
              <h3 className="text-lg font-semibold text-white">Enterprise Features</h3>
              <span className="px-2 py-1 bg-primary/20 text-primary text-xs rounded-full">$99.99/month</span>
            </div>
            <div className="grid md:grid-cols-2 gap-4 text-muted-foreground">
              <ul className="list-disc list-inside space-y-2">
                <li>10,000 API calls/month</li>
                <li>Unlimited team seats</li>
                <li>White-label PDF reports</li>
                <li>Custom branding</li>
                <li>Priority scanning queue</li>
              </ul>
              <ul className="list-disc list-inside space-y-2">
                <li>SSO integration (SAML, OAuth)</li>
                <li>Dedicated account manager</li>
                <li>99.9% uptime SLA</li>
                <li>Custom integrations</li>
                <li>On-premise deployment option</li>
              </ul>
            </div>
          </div>
          
          <div className="glass-panel p-6 rounded-xl">
            <div className="flex items-center gap-3 mb-4">
              <Shield className="w-6 h-6 text-primary" />
              <h3 className="text-lg font-semibold text-white">Security & Compliance</h3>
            </div>
            <ul className="list-disc list-inside text-muted-foreground space-y-2">
              <li>SOC 2 Type II compliance</li>
              <li>GDPR Data Processing Agreement (DPA)</li>
              <li>HIPAA BAA available</li>
              <li>Custom data retention policies</li>
              <li>Audit logs for all actions</li>
              <li>IP allowlisting</li>
            </ul>
          </div>
          
          <div className="glass-panel p-6 rounded-xl">
            <div className="flex items-center gap-3 mb-4">
              <HeadphonesIcon className="w-6 h-6 text-primary" />
              <h3 className="text-lg font-semibold text-white">Priority Support</h3>
            </div>
            <ul className="list-disc list-inside text-muted-foreground space-y-2">
              <li>24/7 priority support channel</li>
              <li>Dedicated Slack/Teams channel</li>
              <li>Quarterly business reviews</li>
              <li>Custom onboarding and training</li>
              <li>Direct access to engineering team</li>
            </ul>
          </div>
        </div>
      </DocsSection>

      <DocsSection title="SSO Integration">
        <div className="space-y-6">
          <div className="glass-panel p-6 rounded-xl">
            <h3 className="text-lg font-semibold text-white mb-4">Supported Providers</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-muted-foreground">
              <div className="p-3 bg-white/5 rounded-lg text-center">Okta</div>
              <div className="p-3 bg-white/5 rounded-lg text-center">Azure AD</div>
              <div className="p-3 bg-white/5 rounded-lg text-center">Google Workspace</div>
              <div className="p-3 bg-white/5 rounded-lg text-center">OneLogin</div>
            </div>
            <p className="text-muted-foreground mt-4">
              We support SAML 2.0 and OAuth 2.0/OIDC. Custom identity provider integration available 
              for Enterprise customers.
            </p>
          </div>
          
          <div className="glass-panel p-6 rounded-xl">
            <h3 className="text-lg font-semibold text-white mb-4">Setting Up SSO</h3>
            <ol className="list-decimal list-inside text-muted-foreground space-y-3">
              <li>Contact your account manager to enable SSO</li>
              <li>Configure your IdP with the provided metadata</li>
              <li>Test the connection with a pilot group</li>
              <li>Enable SSO enforcement for your organization</li>
            </ol>
            <DocsCodeBlock 
              code={`# SSO Metadata Endpoint
https://api.trifused.com/sso/metadata/{org_id}

# ACS URL
https://api.trifused.com/sso/callback

# Entity ID
https://api.trifused.com`}
            />
          </div>
        </div>
      </DocsSection>

      <DocsSection title="Getting Started">
        <div className="grid md:grid-cols-2 gap-4">
          <DocsCard
            icon={Users}
            title="Start Team Trial"
            description="Try Teams features free for 14 days. No credit card required."
            href="/store"
          />
          <DocsCard
            icon={Building2}
            title="Contact Sales"
            description="Talk to our team about Enterprise pricing and custom solutions."
            href="/contact"
          />
        </div>
      </DocsSection>
    </DocsLayout>
  );
}
