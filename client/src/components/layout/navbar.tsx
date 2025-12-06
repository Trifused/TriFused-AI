import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";

export function Navbar() {
  return (
    <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-background/50 backdrop-blur-lg">
      <div className="container mx-auto px-6 h-20 flex items-center justify-between">
        <Link href="/">
          <a className="text-2xl font-bold font-heading tracking-tighter flex items-center gap-2">
            <span className="text-primary">Tri</span>Fused
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          </a>
        </Link>

        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
          <a href="/#services" className="hover:text-primary transition-colors">Services</a>
          <a href="/#ventures" className="hover:text-primary transition-colors">Ventures</a>
          <Link href="/blog">
            <a className="hover:text-primary transition-colors">Intelligence Logs</a>
          </Link>
          <a href="/#about" className="hover:text-primary transition-colors">About</a>
        </div>

        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            className="hidden md:flex border-primary/20 hover:bg-primary/10 hover:text-primary hover:border-primary/50 text-foreground transition-all duration-300"
            onClick={() => window.open('https://portal.trifused.com', '_blank')}
          >
            Client Portal
          </Button>
          <Button 
            className="bg-primary text-background font-bold hover:bg-primary/90 shadow-[0_0_20px_rgba(6,182,212,0.3)] hover:shadow-[0_0_30px_rgba(6,182,212,0.5)] transition-all duration-300"
            onClick={() => {
              const event = new CustomEvent('open-chat');
              window.dispatchEvent(event);
            }}
          >
            <Sparkles className="w-4 h-4 mr-2" />
            Initialize AI
          </Button>
        </div>
      </div>
    </nav>
  );
}
