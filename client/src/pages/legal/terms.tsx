import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { motion } from "framer-motion";
import { FileText, Shield, Scale, Globe, CreditCard, AlertTriangle, Gavel, Users, Mail } from "lucide-react";

export default function Terms() {
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
              <FileText className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-4xl font-heading font-bold m-0">Terms of Service</h1>
          </div>
          
          <p className="lead text-xl text-muted-foreground">
            Last Updated: December 31, 2025 | Effective Date: December 06, 2025
          </p>

          <div className="glass-panel p-8 rounded-2xl border border-white/5 my-8">
            <div className="flex items-center gap-2 mb-4">
              <Scale className="w-5 h-5 text-primary" />
              <h2 className="text-2xl font-bold text-white m-0">1. Acceptance of Terms</h2>
            </div>
            <p>
              By accessing or using TriFused's services, website, or platform (collectively, the "Service"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, you may not access or use the Service.
            </p>
            <p>
              <strong className="text-primary">Jurisdiction-Specific Terms:</strong> Users in certain jurisdictions may have additional rights that cannot be waived. Nothing in these Terms limits your statutory rights under applicable consumer protection laws.
            </p>
            <p>
              <strong className="text-primary">Changes to Terms:</strong> We reserve the right to modify these Terms at any time. Material changes will be notified via email or prominent notice on our Service at least 30 days before taking effect. Continued use after changes constitutes acceptance.
            </p>
          </div>

          <div className="glass-panel p-8 rounded-2xl border border-white/5 my-8">
            <div className="flex items-center gap-2 mb-4">
              <Users className="w-5 h-5 text-primary" />
              <h2 className="text-2xl font-bold text-white m-0">2. Eligibility & Account Registration</h2>
            </div>
            <p>
              <strong className="text-primary">Age Requirements:</strong> You must be at least 18 years old (or the age of majority in your jurisdiction) to use our Service. By using the Service, you represent that you meet these requirements.
            </p>
            <h3 className="text-primary mt-4">Account Security - You are responsible for:</h3>
            <ul className="list-disc list-inside text-muted-foreground space-y-1">
              <li>Maintaining the confidentiality of your account credentials</li>
              <li>All activities that occur under your account</li>
              <li>Notifying us immediately of any unauthorized access</li>
            </ul>
            <p className="mt-4">
              <strong className="text-primary">Accurate Information:</strong> You agree to provide accurate, current, and complete information during registration and to update it as necessary.
            </p>
          </div>

          <div className="glass-panel p-8 rounded-2xl border border-white/5 my-8">
            <div className="flex items-center gap-2 mb-4">
              <Shield className="w-5 h-5 text-primary" />
              <h2 className="text-2xl font-bold text-white m-0">3. System Access & Acceptable Use</h2>
            </div>
            <p>
              <strong className="text-primary">Access Rights:</strong> Access to TriFused infrastructure is granted as a limited, non-exclusive, non-transferable license. This is a privilege that may be revoked at our discretion.
            </p>
            <h3 className="text-primary mt-4">Prohibited Activities - You agree NOT to:</h3>
            <ul className="list-disc list-inside text-muted-foreground space-y-1">
              <li>Attempt unauthorized access, penetration testing, or security breaches without prior written consent</li>
              <li>Conduct or facilitate Distributed Denial of Service (DDoS) attacks or similar disruptive actions</li>
              <li>Use the Service for illegal purposes or to violate any applicable laws</li>
              <li>Reverse engineer, decompile, or attempt to extract source code from our Service</li>
              <li>Scrape, harvest, or collect data from the Service using automated means without permission</li>
              <li>Transmit malware, viruses, or harmful code</li>
              <li>Impersonate others or misrepresent your affiliation</li>
              <li>Interfere with or disrupt the Service or servers/networks connected to it</li>
              <li>Violate the intellectual property rights of TriFused or third parties</li>
            </ul>
            <h3 className="text-primary mt-6">Enforcement - We reserve the right to:</h3>
            <ul className="list-disc list-inside text-muted-foreground space-y-1">
              <li>Immediately terminate or suspend access for violations</li>
              <li>Investigate suspected violations and cooperate with law enforcement</li>
              <li>Remove content that violates these Terms</li>
              <li>Take legal action for damages resulting from violations</li>
            </ul>
          </div>

          <div className="glass-panel p-8 rounded-2xl border border-white/5 my-8">
            <h2 className="text-2xl font-bold text-white mt-0">4. Service Availability & Modifications</h2>
            <p>
              <strong className="text-primary">Uptime:</strong> While we strive for high availability, we do not guarantee uninterrupted or error-free Service.
            </p>
            <h3 className="text-primary mt-4">Changes to Service - We may:</h3>
            <ul className="list-disc list-inside text-muted-foreground space-y-1">
              <li>Modify, suspend, or discontinue any aspect of the Service at any time</li>
              <li>Impose limits on features or restrict access to parts of the Service</li>
              <li>Update our AI models, algorithms, and features without prior notice</li>
            </ul>
            <p className="mt-4">
              <strong className="text-primary">Scheduled Maintenance:</strong> We will provide reasonable notice for planned maintenance that may affect Service availability.
            </p>
          </div>

          <div className="glass-panel p-8 rounded-2xl border border-white/5 my-8">
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle className="w-5 h-5 text-yellow-400" />
              <h2 className="text-2xl font-bold text-white m-0">5. Disclaimer of Warranties</h2>
            </div>
            <p className="uppercase font-bold text-yellow-400">
              "AS IS" BASIS: THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED.
            </p>
            <h3 className="text-primary mt-4">No Guarantees - To the maximum extent permitted by law, TriFused disclaims all warranties, including but not limited to:</h3>
            <ul className="list-disc list-inside text-muted-foreground space-y-1">
              <li>Merchantability, fitness for a particular purpose, and non-infringement</li>
              <li>Accuracy, reliability, or completeness of results, analysis, or recommendations</li>
              <li>Uninterrupted, secure, or error-free operation</li>
              <li>That defects will be corrected</li>
            </ul>
            <h3 className="text-primary mt-6">AI Model Limitations - We explicitly disclaim liability for:</h3>
            <ul className="list-disc list-inside text-muted-foreground space-y-1">
              <li>AI hallucinations, errors, or inaccuracies in generated content</li>
              <li>Predictive errors or incorrect analysis results</li>
              <li>Unexpected outputs or behaviors from generative engines</li>
              <li>Any decisions made based on AI-generated recommendations</li>
            </ul>
            <h3 className="text-primary mt-6">Your Responsibility - You are solely responsible for:</h3>
            <ul className="list-disc list-inside text-muted-foreground space-y-1">
              <li>Evaluating the accuracy and appropriateness of Service outputs</li>
              <li>Verifying any recommendations or analysis before implementation</li>
              <li>Any decisions or actions taken based on Service results</li>
            </ul>
            <p className="mt-4 text-sm text-muted-foreground">
              <strong className="text-primary">Consumer Protection Laws:</strong> Some jurisdictions do not allow exclusion of implied warranties. If these laws apply to you, some of the above exclusions may not apply.
            </p>
          </div>

          <div className="glass-panel p-8 rounded-2xl border border-white/5 my-8">
            <h2 className="text-2xl font-bold text-white mt-0">6. Limitation of Liability</h2>
            <p className="uppercase font-bold text-yellow-400">
              MAXIMUM LIABILITY: TO THE FULLEST EXTENT PERMITTED BY LAW, TRIFUSED'S TOTAL LIABILITY FOR ANY CLAIMS ARISING FROM YOUR USE OF THE SERVICE SHALL NOT EXCEED THE GREATER OF: The amount you paid to TriFused in the 12 months preceding the claim, OR $100 USD.
            </p>
            <h3 className="text-primary mt-4">Excluded Damages - TriFused SHALL NOT BE LIABLE FOR:</h3>
            <ul className="list-disc list-inside text-muted-foreground space-y-1">
              <li>Indirect, incidental, special, consequential, or punitive damages</li>
              <li>Loss of profits, revenue, data, or business opportunities</li>
              <li>Service interruptions or data loss</li>
              <li>Third-party actions or content</li>
              <li>Any unintended behaviors resulting from misuse of generative AI engines</li>
            </ul>
            <h3 className="text-primary mt-6">Exceptions - Nothing in these Terms excludes or limits liability for:</h3>
            <ul className="list-disc list-inside text-muted-foreground space-y-1">
              <li>Death or personal injury caused by negligence</li>
              <li>Fraud or fraudulent misrepresentation</li>
              <li>Gross negligence or willful misconduct</li>
              <li>Any liability that cannot be excluded under applicable law</li>
            </ul>
            <p className="mt-4 text-sm text-muted-foreground">
              <strong className="text-primary">Japan-Specific:</strong> Under Japan's Consumer Contract Act, limitations that are unreasonably unfavorable to consumers may be void.
            </p>
            <p className="text-sm text-muted-foreground">
              <strong className="text-primary">EU/UK-Specific:</strong> Under EU/UK consumer protection laws, we remain liable for damages caused by our failure to exercise reasonable care.
            </p>
          </div>

          <div className="glass-panel p-8 rounded-2xl border border-white/5 my-8">
            <h2 className="text-2xl font-bold text-white mt-0">7. Intellectual Property Rights</h2>
            <h3 className="text-primary">TriFused Ownership:</h3>
            <p>All intellectual property rights in the Service, including but not limited to software, source code, algorithms, neural network architectures, trained model weights, visual assets, design elements, trademarks, branding, documentation, and proprietary methodologies remain the exclusive property of TriFused Technologies or its licensors.</p>
            
            <h3 className="text-primary mt-4">User Content:</h3>
            <p>You retain ownership of content you submit to the Service ("User Content"). By submitting User Content, you grant TriFused a worldwide, non-exclusive, royalty-free license to use, reproduce, and process User Content to provide the Service, create derivative works for service improvement and AI model training, and display results and analysis derived from your User Content.</p>
            
            <h3 className="text-primary mt-4">Generated Output:</h3>
            <ul className="list-disc list-inside text-muted-foreground space-y-1">
              <li><strong className="text-white">Standard License:</strong> You receive a limited, non-exclusive license to use generated outputs for your internal business purposes</li>
              <li><strong className="text-white">Transfer of Rights:</strong> Intellectual property rights in generated outputs may be explicitly transferred via written agreement</li>
              <li><strong className="text-white">Training Data:</strong> We may use anonymized, aggregated patterns from generated outputs to improve our models</li>
            </ul>
            
            <p className="mt-4">
              <strong className="text-primary">DMCA Compliance:</strong> If you believe content on our Service infringes your copyright, contact our DMCA agent at{" "}
              <a href="mailto:dmca@trifused.com" className="text-primary hover:underline">dmca@trifused.com</a>.
            </p>
          </div>

          <div className="glass-panel p-8 rounded-2xl border border-white/5 my-8">
            <h2 className="text-2xl font-bold text-white mt-0">8. User Data & Privacy</h2>
            <p>
              <strong className="text-primary">Data Processing:</strong> Your use of the Service is governed by our{" "}
              <a href="/privacy" className="text-primary hover:underline">Privacy Policy</a>, which is incorporated by reference into these Terms.
            </p>
            <p>
              <strong className="text-primary">Data Security:</strong> While we implement industry-standard security measures, you acknowledge that no system is completely secure. You use the Service at your own risk regarding data transmission and storage.
            </p>
            <p>
              <strong className="text-primary">Data Rights:</strong> You may have rights to access, correct, or delete your data under applicable privacy laws. See our Privacy Policy for details.
            </p>
          </div>

          <div className="glass-panel p-8 rounded-2xl border border-white/5 my-8">
            <div className="flex items-center gap-2 mb-4">
              <Globe className="w-5 h-5 text-primary" />
              <h2 className="text-2xl font-bold text-white m-0">9. Third-Party Services & Integration</h2>
            </div>
            <h3 className="text-primary">reCAPTCHA:</h3>
            <p>
              This site uses Google reCAPTCHA to protect against spam and abuse. By using our forms and interactive features, you agree to be bound by{" "}
              <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                Google's Privacy Policy
              </a>{" "}
              and{" "}
              <a href="https://policies.google.com/terms" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                Terms of Service
              </a>.
            </p>
            <p className="mt-4">
              <strong className="text-primary">Other Third-Party Services:</strong> The Service may integrate with or link to third-party services (Neon, Replit, Lovable, etc.). Your use of these services is governed by their respective terms and privacy policies. TriFused is not responsible for third-party services.
            </p>
          </div>

          <div className="glass-panel p-8 rounded-2xl border border-white/5 my-8">
            <div className="flex items-center gap-2 mb-4">
              <CreditCard className="w-5 h-5 text-primary" />
              <h2 className="text-2xl font-bold text-white m-0">10. Payment Terms</h2>
            </div>
            <h3 className="text-primary">Subscription Fees - If you subscribe to paid features:</h3>
            <ul className="list-disc list-inside text-muted-foreground space-y-1">
              <li>Fees are stated in USD or local currency and are non-refundable except as required by law</li>
              <li>You authorize recurring billing until you cancel</li>
              <li>We may change pricing with 30 days' notice</li>
              <li>Non-payment may result in service suspension or termination</li>
            </ul>
            <p className="mt-4">
              <strong className="text-primary">Taxes:</strong> You are responsible for all applicable taxes except those based on TriFused's net income.
            </p>
          </div>

          <div className="glass-panel p-8 rounded-2xl border border-white/5 my-8">
            <h2 className="text-2xl font-bold text-white mt-0">11. Indemnification</h2>
            <p>
              You agree to indemnify, defend, and hold harmless TriFused, its affiliates, officers, directors, employees, and agents from any claims, damages, losses, liabilities, and expenses (including reasonable attorneys' fees) arising from:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-1">
              <li>Your use or misuse of the Service</li>
              <li>Your violation of these Terms</li>
              <li>Your violation of any third-party rights</li>
              <li>Your User Content</li>
            </ul>
            <p className="mt-4 text-sm text-muted-foreground">
              <strong className="text-primary">Limitations:</strong> This indemnification does not apply to claims arising solely from our negligence or misconduct. Some jurisdictions may limit indemnification clauses under consumer protection laws.
            </p>
          </div>

          <div className="glass-panel p-8 rounded-2xl border border-white/5 my-8">
            <div className="flex items-center gap-2 mb-4">
              <Gavel className="w-5 h-5 text-primary" />
              <h2 className="text-2xl font-bold text-white m-0">12. Dispute Resolution</h2>
            </div>
            <p>
              <strong className="text-primary">Informal Resolution:</strong> Before filing any legal claim, you agree to contact us at{" "}
              <a href="mailto:legal@trifused.com" className="text-primary hover:underline">legal@trifused.com</a>{" "}
              to attempt informal resolution for at least 30 days.
            </p>
            <h3 className="text-primary mt-4">Governing Law:</h3>
            <ul className="list-disc list-inside text-muted-foreground space-y-1">
              <li><strong className="text-white">International Users:</strong> These Terms are governed by the laws of the State of Delaware, USA</li>
              <li><strong className="text-white">EU Users:</strong> You may also rely on mandatory consumer protection laws in your country of residence</li>
              <li><strong className="text-white">California Users:</strong> These Terms are governed by California law and applicable U.S. federal law</li>
            </ul>
            <p className="mt-4 text-sm text-muted-foreground">
              <strong className="text-primary">Class Action Waiver:</strong> To the extent permitted by law, you agree to resolve disputes individually and waive the right to participate in class actions. This waiver does not apply where prohibited by law.
            </p>
          </div>

          <div className="glass-panel p-8 rounded-2xl border border-white/5 my-8">
            <h2 className="text-2xl font-bold text-white mt-0">13. Termination</h2>
            <p>
              <strong className="text-primary">By You:</strong> You may terminate your account at any time through account settings or by contacting support.
            </p>
            <h3 className="text-primary mt-4">By Us - We may suspend or terminate your access:</h3>
            <ul className="list-disc list-inside text-muted-foreground space-y-1">
              <li>For violations of these Terms</li>
              <li>For prolonged inactivity</li>
              <li>If required by law or government request</li>
              <li>If we cease offering the Service</li>
            </ul>
            <h3 className="text-primary mt-4">Effect of Termination:</h3>
            <ul className="list-disc list-inside text-muted-foreground space-y-1">
              <li>Your license to use the Service ends immediately</li>
              <li>We may delete your User Content after a reasonable period</li>
              <li>Provisions that should survive (liability limitations, indemnification, dispute resolution) remain in effect</li>
            </ul>
            <p className="mt-4 text-sm text-muted-foreground">
              <strong className="text-primary">EU Consumer Rights:</strong> EU consumers have the right to withdraw from service contracts within 14 days under EU Directive 2011/83/EU, subject to certain conditions.
            </p>
          </div>

          <div className="glass-panel p-8 rounded-2xl border border-white/5 my-8">
            <h2 className="text-2xl font-bold text-white mt-0">14. General Provisions</h2>
            <ul className="list-disc list-inside text-muted-foreground space-y-2">
              <li><strong className="text-white">Entire Agreement:</strong> These Terms, together with our Privacy Policy, constitute the entire agreement between you and TriFused.</li>
              <li><strong className="text-white">Severability:</strong> If any provision is found unenforceable, the remaining provisions remain in full effect.</li>
              <li><strong className="text-white">No Waiver:</strong> Our failure to enforce any right or provision doesn't constitute a waiver.</li>
              <li><strong className="text-white">Assignment:</strong> You may not assign these Terms without our consent. We may assign our rights and obligations freely.</li>
              <li><strong className="text-white">Force Majeure:</strong> Neither party is liable for delays or failures due to circumstances beyond reasonable control.</li>
              <li><strong className="text-white">Export Controls:</strong> You agree to comply with all applicable export control and sanctions laws.</li>
            </ul>
          </div>

          <div className="glass-panel p-8 rounded-2xl border border-white/5 my-8">
            <div className="flex items-center gap-2 mb-4">
              <Mail className="w-5 h-5 text-primary" />
              <h2 className="text-2xl font-bold text-white m-0">15. Contact Information</h2>
            </div>
            <p><strong className="text-white">Legal Contact:</strong>{" "}
              <a href="mailto:legal@trifused.com" className="text-primary hover:underline">legal@trifused.com</a>
            </p>
            <p><strong className="text-white">DMCA Agent:</strong>{" "}
              <a href="mailto:dmca@trifused.com" className="text-primary hover:underline">dmca@trifused.com</a>
            </p>
            <p><strong className="text-white">General Inquiries:</strong>{" "}
              <a href="mailto:hello@trifused.com" className="text-primary hover:underline">hello@trifused.com</a>
            </p>
          </div>

        </motion.div>
      </main>
      <Footer />
    </div>
  );
}
