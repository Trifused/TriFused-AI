import { Navbar } from "@/components/layout/navbar";
import { Hero } from "@/components/sections/hero";
import { Services } from "@/components/sections/services";
import { ChatWidget } from "@/components/ui/chat-widget";
import { motion } from "framer-motion";

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary/30">
      <Navbar />
      <main>
        <Hero />
        <Services />
        
        {/* Placeholder for other sections */}
        <section className="py-24 border-t border-white/10">
          <div className="container mx-auto px-6 text-center">
            <h2 className="text-3xl font-heading font-bold mb-8">Trusted by Future-Forward Companies</h2>
            <div className="flex flex-wrap justify-center gap-12 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
               {/* Mock Logos */}
               {['Nexus', 'CyberDyne', 'OmniCorp', 'Massive Dynamic'].map((company) => (
                 <div key={company} className="text-2xl font-bold font-heading">{company}</div>
               ))}
            </div>
          </div>
        </section>

        <section className="py-24 bg-primary text-background relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />
          <div className="container mx-auto px-6 relative z-10 text-center">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-4xl md:text-6xl font-bold font-heading mb-6"
            >
              Ready to Upgrade?
            </motion.h2>
            <p className="text-xl mb-10 max-w-2xl mx-auto font-medium">
              Join the new era of autonomous business operations.
            </p>
            <button className="bg-black text-white px-10 py-4 rounded-full text-lg font-bold hover:scale-105 transition-transform shadow-2xl">
              Schedule Consultation
            </button>
          </div>
        </section>
      </main>

      <footer className="py-12 border-t border-white/10 bg-black/20">
        <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-2xl font-bold font-heading tracking-tighter">
            <span className="text-primary">Tri</span>Fused
          </div>
          <div className="text-sm text-muted-foreground">
            © 2025 TriFused Technologies. All systems operational.
          </div>
        </div>
      </footer>
      
      <ChatWidget />
    </div>
  );
}
