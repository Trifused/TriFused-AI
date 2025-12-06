import { motion } from "framer-motion";
import { Github, ArrowRight, Code, FileText, Lock, Rocket, Eye, Users, Shield, Cpu } from "lucide-react";

const ventures = [
  {
    name: "Spacevana",
    url: "https://spacevana.com",
    description: "Exploring the frontiers of space technology and innovation. A platform dedicated to space enthusiasts and industry insights.",
    icon: Rocket,
    tags: ["Space Tech", "Innovation"],
    color: "from-blue-500 to-purple-500"
  },
  {
    name: "Logeyeball",
    url: "https://logeyeball.com",
    description: "Advanced visual monitoring and analytics platform. Providing intelligent insights through cutting-edge observation technology.",
    icon: Eye,
    tags: ["Analytics", "Monitoring"],
    color: "from-green-500 to-teal-500"
  },
  {
    name: "LeadKik",
    url: "https://leadkik.com",
    description: "Next-generation lead generation and customer acquisition platform. Empowering businesses with intelligent prospect targeting.",
    icon: Users,
    tags: ["Lead Gen", "Marketing"],
    color: "from-orange-500 to-red-500"
  },
  {
    name: "CloneWarden",
    url: "https://clonewarden.com",
    description: "Digital identity protection and clone detection services. Safeguarding your online presence from unauthorized replication.",
    icon: Shield,
    tags: ["Security", "Identity"],
    color: "from-primary to-cyan-500"
  },
  {
    name: "TechizUp",
    url: "https://techizup.com",
    description: "Technology news, reviews, and insights platform. Staying ahead of the curve with the latest in tech innovation.",
    icon: Cpu,
    tags: ["Tech News", "Reviews"],
    color: "from-purple-500 to-pink-500"
  }
];

export function Ventures() {
  return (
    <section id="ventures" className="py-24 relative overflow-hidden bg-black/40 border-t border-white/10">
      <div className="container mx-auto px-6 relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/20 bg-primary/5 text-primary text-xs font-mono uppercase tracking-widest mb-4">
              <Rocket className="w-3 h-3" />
              Portfolio Companies
            </div>
            <h2 className="text-3xl md:text-5xl font-bold font-heading">
              TriFused <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-500">Ventures</span>
            </h2>
          </div>
          <div className="max-w-md text-muted-foreground text-sm md:text-base flex flex-col items-end text-right">
            <p className="mb-2">Our portfolio of innovative technology ventures, each pushing the boundaries of their respective industries.</p>
            <a 
              href="https://github.com/Trifused" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-primary hover:text-white transition-colors text-xs font-mono flex items-center gap-1 group"
            >
              View Our GitHub 
              <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
            </a>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {ventures.map((venture, index) => {
            const IconComponent = venture.icon;
            return (
              <motion.div
                key={venture.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="group relative"
                data-testid={`card-venture-${venture.name.toLowerCase()}`}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${venture.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500 rounded-2xl`} />
                
                <div className="glass-panel p-6 rounded-2xl border border-white/10 hover:border-primary/30 transition-all h-full relative overflow-hidden flex flex-col">
                  <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-4">
                      <div className={`p-3 rounded-lg bg-gradient-to-br ${venture.color} bg-opacity-20`}>
                        <IconComponent className="w-5 h-5 text-white" />
                      </div>
                      {venture.tags.map((tag) => (
                        <div key={tag} className="text-xs font-mono px-2 py-1 rounded bg-white/5 text-primary/80 border border-white/10">
                          {tag}
                        </div>
                      ))}
                    </div>

                    <h3 className="text-xl font-bold font-heading mb-2 group-hover:text-primary transition-colors">
                      {venture.name}
                    </h3>
                    
                    <p className="text-muted-foreground text-sm mb-4 leading-relaxed">
                      {venture.description}
                    </p>
                  </div>

                  <div className="mt-auto pt-4 border-t border-white/5">
                    <a 
                      href={venture.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full bg-white/5 hover:bg-white text-white hover:text-black font-bold py-2.5 rounded-lg text-center transition-colors flex items-center justify-center gap-2 text-sm"
                      data-testid={`link-venture-${venture.name.toLowerCase()}`}
                    >
                      Visit Site
                      <ArrowRight className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              </motion.div>
            );
          })}

          {/* NACHA Report - Open Source Tool */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5 }}
            className="group relative"
            data-testid="card-venture-nacha"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl" />
            
            <div className="glass-panel p-6 rounded-2xl border border-white/10 hover:border-primary/30 transition-all h-full relative overflow-hidden flex flex-col">
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                    <FileText className="w-5 h-5 text-primary" />
                  </div>
                  <div className="text-xs font-mono px-2 py-1 rounded bg-white/5 text-primary/80 border border-white/10">
                    Open Source
                  </div>
                  <div className="text-xs font-mono px-2 py-1 rounded bg-white/5 text-purple-400/80 border border-white/10">
                    FinTech
                  </div>
                </div>

                <h3 className="text-xl font-bold font-heading mb-2 group-hover:text-primary transition-colors">
                  NACHA File Report
                </h3>
                
                <p className="text-muted-foreground text-sm mb-4 leading-relaxed">
                  PowerShell forensic tool for analyzing NACHA financial transaction files with automatic redaction.
                </p>

                <div className="flex items-center gap-2 mb-4">
                  <div className="text-xs font-mono text-green-400 flex items-center gap-1">
                    <Lock className="w-3 h-3" />
                    Auto-Redaction
                  </div>
                </div>
              </div>

              <div className="mt-auto pt-4 border-t border-white/5 flex items-center gap-3">
                <a 
                  href="https://github.com/Trifused/nacha-report" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex-1 bg-white/5 hover:bg-white text-white hover:text-black font-bold py-2.5 rounded-lg text-center transition-colors flex items-center justify-center gap-2 text-sm"
                  data-testid="link-venture-nacha-github"
                >
                  <Github className="w-4 h-4" />
                  GitHub
                </a>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
