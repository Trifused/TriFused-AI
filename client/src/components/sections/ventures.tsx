import { motion } from "framer-motion";
import { Github, ArrowRight, Code, FileText, Lock } from "lucide-react";

export function Ventures() {
  return (
    <section id="ventures" className="py-24 relative overflow-hidden bg-black/40 border-t border-white/10">
      <div className="container mx-auto px-6 relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/20 bg-primary/5 text-primary text-xs font-mono uppercase tracking-widest mb-4">
              <Code className="w-3 h-3" />
              Open Source Intelligence
            </div>
            <h2 className="text-3xl md:text-5xl font-bold font-heading">
              TriFused <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-500">Labs</span>
            </h2>
          </div>
          <div className="max-w-md text-muted-foreground text-sm md:text-base">
            We release select internal tools to the community to advance the state of open security protocols.
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Nacha Report Project */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="group relative"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl" />
            
            <div className="glass-panel p-8 rounded-2xl border border-white/10 hover:border-primary/30 transition-all h-full relative overflow-hidden flex flex-col">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Github className="w-32 h-32 text-white transform rotate-12 -translate-y-8 translate-x-8" />
              </div>

              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                    <FileText className="w-6 h-6 text-primary" />
                  </div>
                  <div className="text-xs font-mono px-2 py-1 rounded bg-white/5 text-primary/80 border border-white/10">
                    PowerShell
                  </div>
                  <div className="text-xs font-mono px-2 py-1 rounded bg-white/5 text-purple-400/80 border border-white/10">
                    FinTech
                  </div>
                </div>

                <h3 className="text-2xl font-bold font-heading mb-3 group-hover:text-primary transition-colors">
                  NACHA File Report
                </h3>
                
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  A specialized PowerShell forensic tool for analyzing NACHA formatted financial transaction files. 
                  Generates human-readable reports while automatically redacting sensitive account information for secure auditing.
                </p>

                <div className="grid grid-cols-2 gap-4 mb-8">
                  <div className="bg-black/20 p-3 rounded border border-white/5">
                    <div className="text-xs text-muted-foreground mb-1">Security</div>
                    <div className="text-sm font-mono text-white flex items-center gap-2">
                      <Lock className="w-3 h-3 text-green-400" />
                      Auto-Redaction
                    </div>
                  </div>
                  <div className="bg-black/20 p-3 rounded border border-white/5">
                    <div className="text-xs text-muted-foreground mb-1">Format</div>
                    <div className="text-sm font-mono text-white">
                      ACH / NACHA
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-auto pt-6 border-t border-white/5 flex items-center gap-4">
                <a 
                  href="https://github.com/Trifused/nacha-report" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex-1 bg-white text-black font-bold py-3 rounded-lg text-center hover:bg-primary hover:text-white transition-colors flex items-center justify-center gap-2"
                >
                  <Github className="w-4 h-4" />
                  View Source
                </a>
                <a 
                  href="https://blog.trifused.com/2024/03/ach-nacha-file-report-script-in.html" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="px-4 py-3 rounded-lg border border-white/10 hover:bg-white/5 transition-colors text-white"
                >
                  Read Docs
                </a>
              </div>
            </div>
          </motion.div>

          {/* Placeholder for Next Project */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="group relative opacity-50 hover:opacity-100 transition-opacity"
          >
            <div className="glass-panel p-8 rounded-2xl border border-white/5 border-dashed hover:border-white/20 transition-all h-full flex flex-col items-center justify-center text-center min-h-[400px]">
              <div className="p-4 rounded-full bg-white/5 mb-6">
                <Code className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-bold font-heading mb-2">
                Classified Project
              </h3>
              <p className="text-muted-foreground max-w-xs mx-auto mb-6">
                Next-generation security tool currently under development. 
                Declassification scheduled for Q3 2025.
              </p>
              <div className="text-xs font-mono px-3 py-1 rounded bg-white/5 text-muted-foreground border border-white/10">
                STATUS: IN DEVELOPMENT
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
