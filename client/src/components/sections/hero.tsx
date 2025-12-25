import { Button } from "@/components/ui/button";
import { ArrowRight, Terminal, Search, Calculator } from "lucide-react";
import heroBg from "@assets/generated_images/hero_background_with_neural_network_fusion.png";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { DiagnosticsOverlay } from "@/components/features/diagnostics-overlay";

const Typewriter = ({ sequences, speed = 50, pause = 2000 }: { sequences: string[], speed?: number, pause?: number }) => {
  const [index, setIndex] = useState(0);
  const [subIndex, setSubIndex] = useState(0);
  const [reverse, setReverse] = useState(false);

  useEffect(() => {
    if (index >= sequences.length) {
      setIndex(0);
      return;
    }

    if (subIndex === sequences[index].length + 1 && !reverse) {
      const timeout = setTimeout(() => setReverse(true), pause);
      return () => clearTimeout(timeout);
    }

    if (subIndex === 0 && reverse) {
      setReverse(false);
      setIndex((prev) => (prev + 1) % sequences.length);
      return;
    }

    const timeout = setTimeout(() => {
      setSubIndex((prev) => prev + (reverse ? -1 : 1));
    }, reverse ? speed / 2 : speed);

    return () => clearTimeout(timeout);
  }, [subIndex, index, reverse, sequences, speed, pause]);

  return (
    <span>
      {sequences[index].substring(0, subIndex)}
      <span className="animate-pulse">|</span>
    </span>
  );
};

export function Hero() {
  const [showDiagnostics, setShowDiagnostics] = useState(false);
  const [, setLocation] = useLocation();

  return (
    <div className="relative min-h-screen flex items-center pt-20 overflow-hidden">
      <DiagnosticsOverlay open={showDiagnostics} onOpenChange={setShowDiagnostics} />
      
      {/* Background */}
      <div className="absolute inset-0 z-0">
        <img 
          src={heroBg} 
          alt="Neural Network Background" 
          width={1408}
          height={768}
          loading="eager"
          fetchPriority="high"
          decoding="async"
          className="w-full h-full object-cover opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-transparent to-transparent" />
      </div>

      <div className="container mx-auto px-6 relative z-10 grid lg:grid-cols-2 gap-12 items-center">
        <motion.div 
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="space-y-8"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/20 bg-primary/5 text-primary text-xs font-mono uppercase tracking-widest">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            System Online v4.0
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold font-heading leading-[1.1] tracking-tight text-white">
            We Build <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-500 text-glow">
              Intelligent
            </span> <br />
            Futures.
          </h1>

          <div className="text-xl text-muted-foreground h-[60px] font-light">
            <Typewriter 
              sequences={[
                'Deploying Cognitive Cybersecurity...',
                'Optimizing Autonomous Infrastructure...',
                'Generating Growth Engines...',
                'Supercharging Enterprise with LLMs...'
              ]}
            />
          </div>

          <div className="flex flex-col sm:flex-row flex-wrap gap-4 pt-4">
            <Button 
              size="lg" 
              className="h-14 px-8 text-base bg-white text-black hover:bg-white/90 font-bold rounded-full transition-all hover:scale-105"
              onClick={() => document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' })}
            >
              Start Transformation <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            <Button 
              size="lg" 
              className="h-14 px-8 text-base bg-primary text-black hover:bg-primary/90 font-bold rounded-full transition-all hover:scale-105"
              onClick={() => setLocation('/grader')}
              data-testid="button-hero-grader"
            >
              <Search className="mr-2 w-5 h-5" />
              Website Grader
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="h-14 px-8 text-base border-white/20 hover:bg-white/10 rounded-full font-mono"
              onClick={() => setShowDiagnostics(true)}
            >
              <Terminal className="mr-2 w-5 h-5" />
              Run Diagnostics
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="h-14 px-8 text-base border-emerald-500/30 hover:bg-emerald-500/10 hover:border-emerald-500/50 rounded-full font-mono text-emerald-400"
              onClick={() => setLocation('/backup-calculator')}
              data-testid="button-hero-backup-calculator"
            >
              <Calculator className="mr-2 w-5 h-5" />
              Backup Calculator
            </Button>
          </div>
        </motion.div>

        {/* Floating HUD Element */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="hidden lg:block relative"
        >
          <div className="glass-panel p-8 rounded-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50" />
            
            <div className="grid grid-cols-2 gap-4 font-mono text-sm">
              <div className="space-y-2">
                <div className="text-muted-foreground text-xs uppercase">System Status</div>
                <div className="text-primary flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                  OPTIMAL
                </div>
              </div>
              <div className="space-y-2">
                <div className="text-muted-foreground text-xs uppercase">Active Nodes</div>
                <div className="text-white">8,492</div>
              </div>
              <div className="space-y-2">
                <div className="text-muted-foreground text-xs uppercase">Threat Level</div>
                <div className="text-white">NULL</div>
              </div>
              <div className="space-y-2">
                <div className="text-muted-foreground text-xs uppercase">AI Compute</div>
                <div className="text-primary animate-pulse">98.4%</div>
              </div>
            </div>

            <div className="mt-8 space-y-4">
              <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-primary w-[75%] rounded-full animate-[shimmer_2s_infinite]" />
              </div>
              <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-purple-500 w-[45%] rounded-full" />
              </div>
              <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 w-[90%] rounded-full" />
              </div>
            </div>
            
            <div className="mt-6 text-xs font-mono text-muted-foreground">
              &gt; Analyzing network traffic...<br/>
              &gt; Optimizing neural pathways...<br/>
              &gt; Security protocols engaged.
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
