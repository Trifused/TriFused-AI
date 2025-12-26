import { useLocation } from "wouter";
import { Shield, Lock, FileText, Calculator, Globe, Book } from "lucide-react";

export function Footer() {
  const [, setLocation] = useLocation();

  return (
    <footer className="py-12 border-t border-white/10 bg-black/40 backdrop-blur-sm relative z-10">
      <div className="container mx-auto px-6">
        <div className="grid md:grid-cols-4 gap-8 mb-12">
          <div className="col-span-1 md:col-span-2">
            <button 
              onClick={() => setLocation("/")}
              className="text-2xl font-bold font-heading tracking-tighter mb-4 block"
            >
              <span className="text-primary">Tri</span>Fused
            </button>
            <p className="text-muted-foreground text-sm max-w-xs leading-relaxed">
              Empowering the autonomous enterprise with cognitive cybersecurity and next-gen infrastructure protocols.
            </p>
          </div>
          
          <div>
            <h3 className="font-bold text-white mb-4">Sitemap</h3>
            <ul className="space-y-1 text-sm text-muted-foreground">
              <li>
                <button onClick={() => setLocation("/")} className="min-h-[44px] py-2 px-1 -ml-1 hover:text-primary transition-colors">
                  Home
                </button>
              </li>
              <li>
                <a href="/#services" className="min-h-[44px] py-2 px-1 -ml-1 inline-flex items-center hover:text-primary transition-colors">Services</a>
              </li>
              <li>
                <button onClick={() => setLocation("/blog")} className="min-h-[44px] py-2 px-1 -ml-1 hover:text-primary transition-colors">
                  Intelligence Logs
                </button>
              </li>
              <li>
                <button onClick={() => setLocation("/portal")} className="min-h-[44px] py-2 px-1 -ml-1 hover:text-primary transition-colors">
                  Client Portal
                </button>
              </li>
              <li>
                <button onClick={() => setLocation("/grader")} className="min-h-[44px] py-2 px-1 -ml-1 hover:text-primary transition-colors flex items-center gap-2">
                  <Globe className="w-4 h-4" /> Website Grader
                </button>
              </li>
              <li>
                <button onClick={() => setLocation("/backup-calculator")} className="min-h-[44px] py-2 px-1 -ml-1 hover:text-primary transition-colors flex items-center gap-2">
                  <Calculator className="w-4 h-4" /> Backup Calculator
                </button>
              </li>
              <li>
                <button onClick={() => setLocation("/docs")} className="min-h-[44px] py-2 px-1 -ml-1 hover:text-primary transition-colors flex items-center gap-2">
                  <Book className="w-4 h-4" /> Documentation
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-white mb-4">Legal Protocols</h3>
            <ul className="space-y-1 text-sm text-muted-foreground">
              <li>
                <button 
                  onClick={() => setLocation("/legal/privacy")}
                  className="min-h-[44px] py-2 px-1 -ml-1 hover:text-primary transition-colors flex items-center gap-2"
                >
                  <Lock className="w-4 h-4" /> Privacy Policy
                </button>
              </li>
              <li>
                <button 
                  onClick={() => setLocation("/legal/terms")}
                  className="min-h-[44px] py-2 px-1 -ml-1 hover:text-primary transition-colors flex items-center gap-2"
                >
                  <FileText className="w-4 h-4" /> Terms of Service
                </button>
              </li>
              <li>
                <button 
                  onClick={() => setLocation("/legal/cookies")}
                  className="min-h-[44px] py-2 px-1 -ml-1 hover:text-primary transition-colors flex items-center gap-2"
                >
                  <Shield className="w-4 h-4" /> Cookie Policy
                </button>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-muted-foreground">
          <div>© 2025 TriFused Technologies. All systems operational.</div>
          <div className="flex flex-wrap items-center justify-center gap-2 md:gap-4">
            <a href="https://github.com/Trifused" target="_blank" rel="noopener noreferrer" className="min-h-[44px] min-w-[44px] px-3 py-2 rounded-lg hover:bg-white/5 hover:text-white transition-colors flex items-center justify-center gap-2">
              <span className="sr-only">GitHub</span>
              <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path></svg>
              <span className="hidden sm:inline">GitHub</span>
            </a>
            <a href="https://www.youtube.com/@TriFused" target="_blank" rel="noopener noreferrer" className="min-h-[44px] min-w-[44px] px-3 py-2 rounded-lg hover:bg-white/5 hover:text-white transition-colors flex items-center justify-center gap-2">
              <span className="sr-only">YouTube</span>
              <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.33 29 29 0 0 0-.46-5.33z"></path><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon></svg>
              <span className="hidden sm:inline">YouTube</span>
            </a>
            <span className="px-2 py-2">Status: <span className="text-green-500">OPTIMAL</span></span>
            <span className="px-2 py-2">Encryption: <span className="text-primary">256-BIT</span></span>
          </div>
        </div>
      </div>
    </footer>
  );
}
