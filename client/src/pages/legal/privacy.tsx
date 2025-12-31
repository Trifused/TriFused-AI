import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { motion } from "framer-motion";
import { Lock, Shield, Globe, Cookie, Users, Mail, AlertTriangle } from "lucide-react";

export default function Privacy() {
  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary/30">
      <Navbar />
      <main id="main-content" className="pt-32 pb-20 container mx-auto px-6 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="prose prose-invert prose-lg max-w-none"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 rounded-xl bg-primary/10 border border-primary/20">
              <Lock className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-4xl font-heading font-bold m-0">Privacy Policy</h1>
          </div>
          
          <p className="lead text-xl text-muted-foreground">
            Effective Date: December 06, 2025 | Last Updated: December 31, 2025
          </p>

          <div className="glass-panel p-8 rounded-2xl border border-white/5 my-8">
            <div className="flex items-center gap-2 mb-4">
              <Globe className="w-5 h-5 text-primary" />
              <h2 className="text-2xl font-bold text-white m-0">1. Introduction & Scope</h2>
            </div>
            <p>
              TriFused ("we," "our," or "us") respects your privacy and is committed to protecting your personal data. This Privacy Policy explains how we collect, use, store, and share information when you use our services, in compliance with applicable data protection laws worldwide, including:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-1">
              <li>EU General Data Protection Regulation (GDPR)</li>
              <li>California Consumer Privacy Act (CCPA) / California Privacy Rights Act (CPRA)</li>
              <li>Japan's Act on the Protection of Personal Information (APPI)</li>
              <li>Other applicable regional data protection laws</li>
            </ul>
            <p className="mt-4">
              <strong className="text-primary">Your Rights:</strong> Depending on your location, you may have specific rights regarding your personal data. See Section 8 below.
            </p>
          </div>

          <div className="glass-panel p-8 rounded-2xl border border-white/5 my-8">
            <div className="flex items-center gap-2 mb-4">
              <Shield className="w-5 h-5 text-primary" />
              <h2 className="text-2xl font-bold text-white m-0">2. Data We Collect</h2>
            </div>
            <p>We collect minimal data necessary for system optimization and service delivery:</p>
            
            <h3 className="text-primary mt-6">Automatically Collected Data:</h3>
            <ul className="list-disc list-inside text-muted-foreground space-y-1">
              <li>IP addresses (for security, fraud prevention, and geolocation)</li>
              <li>Browser fingerprints and device information (for UX optimization and security)</li>
              <li>Interaction logs and usage analytics (pages viewed, features used, timestamps)</li>
              <li>Cookies and similar tracking technologies (see Section 5)</li>
            </ul>

            <h3 className="text-primary mt-6">Information You Provide:</h3>
            <ul className="list-disc list-inside text-muted-foreground space-y-1">
              <li>Account information (email, username, authentication credentials)</li>
              <li>User-generated content and website URLs you submit for analysis</li>
              <li>Communication data (support inquiries, feedback)</li>
            </ul>

            <h3 className="text-primary mt-6">Legal Basis for Processing (GDPR):</h3>
            <ul className="list-disc list-inside text-muted-foreground space-y-1">
              <li>Contractual necessity (to provide our services)</li>
              <li>Legitimate interests (security, fraud prevention, service improvement)</li>
              <li>Consent (where required by law, such as for non-essential cookies)</li>
            </ul>
          </div>

          <div className="glass-panel p-8 rounded-2xl border border-white/5 my-8">
            <h2 className="text-2xl font-bold text-white mt-0">3. How We Use Your Data</h2>
            <p>We process your data for the following purposes:</p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2">
              <li><strong className="text-white">Service Delivery:</strong> Operating and maintaining our platform, performing website analysis</li>
              <li><strong className="text-white">Security & Fraud Prevention:</strong> Protecting against unauthorized access, abuse, and attacks</li>
              <li><strong className="text-white">Service Improvement:</strong> Analyzing usage patterns to enhance features and performance</li>
              <li><strong className="text-white">Communications:</strong> Responding to inquiries and sending service-related notifications</li>
              <li><strong className="text-white">Legal Compliance:</strong> Meeting regulatory requirements and responding to lawful requests</li>
            </ul>
            <p className="mt-4">
              <strong className="text-primary">Data Retention:</strong> We retain personal data only as long as necessary for these purposes or as required by law. Interaction logs are typically retained for 90 days unless needed for security investigations.
            </p>
          </div>

          <div className="glass-panel p-8 rounded-2xl border border-white/5 my-8">
            <h2 className="text-2xl font-bold text-white mt-0">4. Neural Processing & Data Security</h2>
            <h3 className="text-primary">Encryption & Security Measures:</h3>
            <ul className="list-disc list-inside text-muted-foreground space-y-1">
              <li>All data is encrypted at rest using AES-256 encryption standards</li>
              <li>Data in transit is protected using TLS 1.3 or higher</li>
              <li>Our autonomous agents process data in ephemeral states, minimizing persistent storage</li>
              <li>Access controls and authentication mechanisms protect against unauthorized access</li>
            </ul>
            <p className="mt-4">
              <strong className="text-primary">Data Processing:</strong> Sensitive information is processed ephemerally and is never permanently stored without your explicit cryptographic consent.
            </p>
            <p className="text-muted-foreground text-sm mt-4">
              Despite our security measures, no system is completely secure. We cannot guarantee absolute security of your data.
            </p>
          </div>

          <div className="glass-panel p-8 rounded-2xl border border-white/5 my-8">
            <div className="flex items-center gap-2 mb-4">
              <Cookie className="w-5 h-5 text-primary" />
              <h2 className="text-2xl font-bold text-white m-0">5. Cookies & Tracking Technologies</h2>
            </div>
            <h3 className="text-primary">Cookie Types We Use:</h3>
            <ul className="list-disc list-inside text-muted-foreground space-y-2">
              <li><strong className="text-white">Essential Cookies</strong> (no consent required) - Necessary for authentication, security, and basic site functionality</li>
              <li><strong className="text-white">Analytics Cookies</strong> (consent required in EU/UK) - Track usage patterns to improve our service</li>
              <li><strong className="text-white">Preference Cookies</strong> - Remember your settings and choices</li>
            </ul>
            <h3 className="text-primary mt-6">Your Cookie Choices:</h3>
            <ul className="list-disc list-inside text-muted-foreground space-y-1">
              <li>EU/UK/Switzerland users: We obtain consent before deploying non-essential cookies</li>
              <li>You can manage cookie preferences through your browser settings or our cookie consent tool</li>
              <li>Blocking cookies may limit certain functionality</li>
            </ul>
          </div>

          <div className="glass-panel p-8 rounded-2xl border border-white/5 my-8">
            <h2 className="text-2xl font-bold text-white mt-0">6. reCAPTCHA & Bot Protection</h2>
            <p>This site uses Google reCAPTCHA to prevent spam, abuse, and automated attacks.</p>
            <h3 className="text-primary mt-4">Data Collected by reCAPTCHA:</h3>
            <ul className="list-disc list-inside text-muted-foreground space-y-1">
              <li>IP address</li>
              <li>Browser type, version, and settings</li>
              <li>Device and application data</li>
              <li>Date, time, and referring URL of your request</li>
              <li>Interaction data (mouse movements, keystrokes on forms)</li>
            </ul>
            <p className="mt-4">
              <strong className="text-primary">Purpose:</strong> This data is used solely for security purposes to distinguish humans from bots. Google does not use this data for personalized advertising in reCAPTCHA contexts.
            </p>
            <p className="mt-4">
              <strong className="text-primary">Third-Party Governance:</strong> Your use of reCAPTCHA is subject to{" "}
              <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                Google's Privacy Policy
              </a>{" "}
              and{" "}
              <a href="https://policies.google.com/terms" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                Terms of Service
              </a>.
            </p>
          </div>

          <div className="glass-panel p-8 rounded-2xl border border-white/5 my-8">
            <h2 className="text-2xl font-bold text-white mt-0">7. Third-Party Services & Data Sharing</h2>
            <p>We work with select service providers for infrastructure and functionality:</p>
            <h3 className="text-primary mt-4">Service Providers:</h3>
            <ul className="list-disc list-inside text-muted-foreground space-y-1">
              <li><strong className="text-white">Neon, Replit, Lovable</strong> - Infrastructure and development platforms</li>
              <li><strong className="text-white">Cloud hosting providers</strong> - Data storage and processing</li>
              <li><strong className="text-white">Analytics providers</strong> - Service improvement</li>
            </ul>
            <h3 className="text-primary mt-6">Data Sharing Principles:</h3>
            <ul className="list-disc list-inside text-muted-foreground space-y-1">
              <li>Zero-trust architecture protocols govern all third-party data sharing</li>
              <li>Service providers are contractually bound to protect your data</li>
              <li>We share only the minimum data necessary for specific purposes</li>
              <li>We do not sell your personal data to third parties</li>
            </ul>
            <p className="mt-4">
              <strong className="text-primary">International Transfers:</strong> Your data may be transferred to and processed in countries outside your residence. We implement appropriate safeguards (Standard Contractual Clauses, adequacy decisions) to protect your data during international transfers.
            </p>
          </div>

          <div className="glass-panel p-8 rounded-2xl border border-white/5 my-8">
            <div className="flex items-center gap-2 mb-4">
              <Users className="w-5 h-5 text-primary" />
              <h2 className="text-2xl font-bold text-white m-0">8. Your Privacy Rights</h2>
            </div>
            <p>Depending on your location, you may have the following rights:</p>
            
            <h3 className="text-primary mt-6">GDPR Rights (EU/UK/Switzerland):</h3>
            <ul className="list-disc list-inside text-muted-foreground space-y-1">
              <li><strong className="text-white">Access:</strong> Request a copy of your personal data</li>
              <li><strong className="text-white">Rectification:</strong> Correct inaccurate data</li>
              <li><strong className="text-white">Erasure:</strong> Request deletion ("right to be forgotten")</li>
              <li><strong className="text-white">Restriction:</strong> Limit how we process your data</li>
              <li><strong className="text-white">Portability:</strong> Receive your data in a structured format</li>
              <li><strong className="text-white">Objection:</strong> Object to processing based on legitimate interests</li>
              <li><strong className="text-white">Withdraw Consent:</strong> Where processing is based on consent</li>
              <li><strong className="text-white">Lodge a Complaint:</strong> Contact your local data protection authority</li>
            </ul>

            <h3 className="text-primary mt-6">CCPA/CPRA Rights (California):</h3>
            <ul className="list-disc list-inside text-muted-foreground space-y-1">
              <li>Know what personal information is collected, used, and shared</li>
              <li>Delete personal information</li>
              <li>Opt-out of sale/sharing (we do not sell personal data)</li>
              <li>Correct inaccurate information</li>
              <li>Limit use of sensitive personal information</li>
              <li>Non-discrimination for exercising your rights</li>
            </ul>

            <h3 className="text-primary mt-6">APPI Rights (Japan):</h3>
            <ul className="list-disc list-inside text-muted-foreground space-y-1">
              <li>Request disclosure of personal information</li>
              <li>Request correction or deletion</li>
              <li>Request suspension of use or provision to third parties</li>
            </ul>

            <p className="mt-4">
              <strong className="text-primary">Exercising Your Rights:</strong> To exercise any of these rights, contact us at{" "}
              <a href="mailto:privacy@trifused.com" className="text-primary hover:underline">privacy@trifused.com</a>. 
              We will respond within the timeframes required by applicable law (typically 30 days).
            </p>
          </div>

          <div className="glass-panel p-8 rounded-2xl border border-white/5 my-8">
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle className="w-5 h-5 text-primary" />
              <h2 className="text-2xl font-bold text-white m-0">9. Children's Privacy</h2>
            </div>
            <p>
              Our services are not directed to individuals under 18 (or the age of majority in your jurisdiction). We do not knowingly collect data from minors. If you believe we have collected data from a minor, please contact us immediately.
            </p>
          </div>

          <div className="glass-panel p-8 rounded-2xl border border-white/5 my-8">
            <h2 className="text-2xl font-bold text-white mt-0">10. Changes to This Policy</h2>
            <p>We may update this Privacy Policy to reflect changes in our practices or legal requirements. We will notify you of material changes by:</p>
            <ul className="list-disc list-inside text-muted-foreground space-y-1">
              <li>Posting the updated policy with a new "Last Updated" date</li>
              <li>Sending email notifications for significant changes (where required)</li>
              <li>Requesting renewed consent where legally necessary</li>
            </ul>
          </div>

          <div className="glass-panel p-8 rounded-2xl border border-white/5 my-8">
            <div className="flex items-center gap-2 mb-4">
              <Mail className="w-5 h-5 text-primary" />
              <h2 className="text-2xl font-bold text-white m-0">11. Contact Information</h2>
            </div>
            <p><strong className="text-white">Data Controller:</strong> TriFused</p>
            <p><strong className="text-white">Privacy Contact:</strong>{" "}
              <a href="mailto:privacy@trifused.com" className="text-primary hover:underline">privacy@trifused.com</a>
            </p>
            <p className="mt-4">
              <strong className="text-primary">For GDPR Supervisory Authority Complaints:</strong><br />
              Contact your local data protection authority.{" "}
              <a href="https://edpb.europa.eu/about-edpb/board/members_en" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                List of EU authorities
              </a>
            </p>
          </div>

        </motion.div>
      </main>
      <Footer />
    </div>
  );
}
