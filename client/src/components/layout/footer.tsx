import { Link } from "wouter";
import { Shield, Lock, FileText } from "lucide-react";

export function Footer() {
  return (
    <footer className="py-12 border-t border-white/10 bg-black/40 backdrop-blur-sm relative z-10">
      <div className="container mx-auto px-6">
        <div className="grid md:grid-cols-4 gap-8 mb-12">
          <div className="col-span-1 md:col-span-2">
            <Link href="/">
              <a className="text-2xl font-bold font-heading tracking-tighter mb-4 block">
                <span className="text-primary">Tri</span>Fused
              </a>
            </Link>
            <p className="text-muted-foreground text-sm max-w-xs leading-relaxed">
              Empowering the autonomous enterprise with cognitive cybersecurity and next-gen infrastructure protocols.
            </p>
          </div>
          
          <div>
            <h3 className="font-bold text-white mb-4">Sitemap</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/"><a className="hover:text-primary transition-colors">Home</a></Link></li>
              <li><Link href="/#services"><a className="hover:text-primary transition-colors">Services</a></Link></li>
              <li><Link href="/blog"><a className="hover:text-primary transition-colors">Intelligence Logs</a></Link></li>
              <li><a href="https://portal.trifused.com" className="hover:text-primary transition-colors">Client Portal</a></li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-white mb-4">Legal Protocols</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/legal/privacy">
                  <a className="hover:text-primary transition-colors flex items-center gap-2">
                    <Lock className="w-3 h-3" /> Privacy Policy
                  </a>
                </Link>
              </li>
              <li>
                <Link href="/legal/terms">
                  <a className="hover:text-primary transition-colors flex items-center gap-2">
                    <FileText className="w-3 h-3" /> Terms of Service
                  </a>
                </Link>
              </li>
              <li>
                <Link href="/legal/cookies">
                  <a className="hover:text-primary transition-colors flex items-center gap-2">
                    <Shield className="w-3 h-3" /> Cookie Policy
                  </a>
                </Link>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-muted-foreground">
          <div>© 2025 TriFused Technologies. All systems operational.</div>
          <div className="flex items-center gap-6">
            <a href="https://github.com/Trifused" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors flex items-center gap-2">
              <span className="sr-only">GitHub</span>
              <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path></svg>
              GitHub Profile
            </a>
            <span>System Status: <span className="text-green-500">OPTIMAL</span></span>
            <span>Encryption: <span className="text-primary">256-BIT</span></span>
          </div>
        </div>
      </div>
    </footer>
  );
}
