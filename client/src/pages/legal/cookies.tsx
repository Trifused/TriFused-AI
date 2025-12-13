import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { motion } from "framer-motion";
import { Shield, Cookie, Database } from "lucide-react";

export default function Cookies() {
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
              <Shield className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-4xl font-heading font-bold m-0">Cookie Policy</h1>
          </div>
          
          <p className="lead text-xl text-muted-foreground">
            Tracking Protocol Version 2.0
          </p>

          <div className="glass-panel p-8 rounded-2xl border border-white/5 my-12">
            <h3 className="text-primary mt-0">Why We Use Cookies</h3>
            <p>
              Cookies are essential for maintaining session state across our distributed network. They allow us to:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>Authenticate your secure session token.</li>
              <li>Remember your terminal preferences and UI configurations.</li>
              <li>Analyze traffic patterns to optimize load balancing.</li>
            </ul>

            <h3 className="text-primary mt-8">Types of Trackers</h3>
            <div className="grid md:grid-cols-2 gap-4 not-prose mt-4">
              <div className="bg-white/5 p-4 rounded-lg border border-white/10">
                <div className="flex items-center gap-2 font-bold text-white mb-2">
                  <Database className="w-4 h-4 text-primary" /> Essential
                </div>
                <p className="text-xs text-muted-foreground">Required for basic system operations and security handshakes.</p>
              </div>
              <div className="bg-white/5 p-4 rounded-lg border border-white/10">
                <div className="flex items-center gap-2 font-bold text-white mb-2">
                  <Cookie className="w-4 h-4 text-primary" /> Analytical
                </div>
                <p className="text-xs text-muted-foreground">Used to train our predictive models on user behavior patterns.</p>
              </div>
            </div>
          </div>
        </motion.div>
      </main>
      <Footer />
    </div>
  );
}
