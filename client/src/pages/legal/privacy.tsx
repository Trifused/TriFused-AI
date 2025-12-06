import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { motion } from "framer-motion";
import { Lock, ShieldCheck, Eye } from "lucide-react";

export default function Privacy() {
  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary/30">
      <Navbar />
      <main className="pt-32 pb-20 container mx-auto px-6 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="prose prose-invert prose-lg max-w-none"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 rounded-xl bg-primary/10 border border-primary/20">
              <Lock className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-4xl font-heading font-bold m-0">Privacy Protocol</h1>
          </div>
          
          <p className="lead text-xl text-muted-foreground">
            Effective Date: December 06, 2025
          </p>

          <div className="glass-panel p-8 rounded-2xl border border-white/5 my-12">
            <h3 className="text-primary mt-0">1. Data Collection Heuristics</h3>
            <p>
              TriFused collects minimal telemetry data required for system optimization. This includes but is not limited to: IP addresses (for security triangulation), browser fingerprints (for UX rendering), and interaction logs.
            </p>

            <h3 className="text-primary">2. Neural Processing & Storage</h3>
            <p>
              All client data is encrypted at rest using AES-256 standards. Our autonomous agents process data in ephemeral states, ensuring that sensitive information is never permanently stored without explicit cryptographic consent.
            </p>

            <h3 className="text-primary">3. Third-Party Integrations</h3>
            <p>
              We utilize select partners (Neon, Replit, Lovable) for infrastructure scalability. Data shared with these entities is strictly governed by zero-trust architecture protocols.
            </p>
          </div>
        </motion.div>
      </main>
      <Footer />
    </div>
  );
}
