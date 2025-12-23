import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Hero } from "@/components/sections/hero";
import { Services } from "@/components/sections/services";
import { Ventures } from "@/components/sections/ventures";
import { ChatWidget } from "@/components/ui/chat-widget";
import { CookieConsent } from "@/components/ui/cookie-consent";
import { ContactFormDialog } from "@/components/features/contact-form-dialog";
import { motion } from "framer-motion";
import { useLocation, useSearch } from "wouter";
import { ArrowRight, Terminal } from "lucide-react";
import { useState, useEffect } from "react";

export default function Home() {
  const [, setLocation] = useLocation();
  const searchString = useSearch();
  const [contactOpen, setContactOpen] = useState(false);
  const [contactMessage, setContactMessage] = useState("");
  
  useEffect(() => {
    const params = new URLSearchParams(searchString);
    if (params.get('contact') === 'true') {
      const message = params.get('message') || '';
      setContactMessage(message);
      setContactOpen(true);
      window.history.replaceState({}, '', '/');
    }
  }, [searchString]);

  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary/30">
      <Navbar />
      <main id="main-content">
        <Hero />
        <Services />
        <Ventures />
        
        {/* Partners Section */}
        <section className="py-24 border-t border-white/10 bg-black/40">
          <div className="container mx-auto px-6 text-center">
            <h2 className="text-sm font-mono text-muted-foreground uppercase tracking-widest mb-12">
              Strategic Technology Alliance
            </h2>
            
            <div className="flex flex-wrap justify-center gap-x-16 gap-y-12 items-center opacity-70">
               {/* Neon Tech */}
               <div className="flex items-center gap-2 group cursor-pointer hover:opacity-100 transition-opacity">
                 <div className="text-2xl font-bold font-heading tracking-tight text-white group-hover:text-[#00E599] transition-colors">Neon</div>
               </div>

               {/* Replit */}
               <div className="flex items-center gap-2 group cursor-pointer hover:opacity-100 transition-opacity">
                 <div className="text-2xl font-bold font-heading tracking-tight text-white group-hover:text-[#F26207] transition-colors">Replit</div>
               </div>

               {/* Lovable */}
               <div className="flex items-center gap-2 group cursor-pointer hover:opacity-100 transition-opacity">
                 <div className="text-2xl font-bold font-heading tracking-tight text-white group-hover:text-[#FF3366] transition-colors">Lovable</div>
               </div>

               {/* Famous AI */}
               <div className="flex items-center gap-2 group cursor-pointer hover:opacity-100 transition-opacity">
                 <div className="text-2xl font-bold font-heading tracking-tight text-white group-hover:text-purple-400 transition-colors">Famous</div>
               </div>

               {/* Vibe Coding */}
               <div className="flex items-center gap-2 group cursor-pointer hover:opacity-100 transition-opacity">
                 <div className="text-2xl font-bold font-heading tracking-tight text-white group-hover:text-blue-400 transition-colors">Vibe Coding</div>
               </div>
            </div>
          </div>
        </section>

        {/* Latest Intelligence Teaser */}
        <section className="py-24 border-t border-white/10 bg-black/20">
          <div className="container mx-auto px-6">
            <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/20 bg-primary/5 text-primary text-xs font-mono uppercase tracking-widest mb-4">
                  <Terminal className="w-3 h-3" />
                  System Logs
                </div>
                <h2 className="text-3xl md:text-5xl font-bold font-heading">
                  Latest <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-500">Intelligence</span>
                </h2>
              </div>
              <button 
                onClick={() => setLocation('/blog')}
                className="group flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors cursor-pointer"
                data-testid="link-blog-archives"
              >
                Access Full Archives 
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {[
                { title: "DIY Email Security Upgrade", date: "April 15, 2023", tag: "Security" },
                { title: "Windows God Mode Protocol", date: "June 22, 2024", tag: "OS Hacks" },
                { title: "PowerShell Vulnerability Scan", date: "January 12, 2020", tag: "Scripting" }
              ].map((post, i) => (
                <div 
                  key={i}
                  onClick={() => setLocation('/blog')}
                  className="block group cursor-pointer"
                  data-testid={`card-blog-post-${i}`}
                >
                  <div className="glass-panel p-6 rounded-xl border border-white/5 hover:border-primary/30 transition-all h-full flex flex-col">
                    <div className="flex justify-between items-start mb-4">
                      <span className="text-xs font-mono px-2 py-1 rounded bg-white/5 text-primary/80 border border-white/10">
                        #{post.tag}
                      </span>
                      <span className="text-xs text-muted-foreground font-mono">{post.date}</span>
                    </div>
                    <h3 className="text-lg font-bold font-heading group-hover:text-primary transition-colors mb-2">
                      {post.title}
                    </h3>
                    <div className="mt-auto pt-4 flex items-center text-sm text-muted-foreground group-hover:text-white transition-colors">
                      <span className="font-mono text-xs">Read Log_</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
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
            <ContactFormDialog 
              defaultOpen={contactOpen}
              defaultMessage={contactMessage}
              onOpenChange={setContactOpen}
            />
          </div>
        </section>
      </main>

      <Footer />
      <ChatWidget />
      <CookieConsent />
    </div>
  );
}
