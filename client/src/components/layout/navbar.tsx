import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Sparkles, User } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export function Navbar() {
  const [, setLocation] = useLocation();
  const { isAuthenticated, user } = useAuth();

  return (
    <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-background/50 backdrop-blur-lg">
      <div className="container mx-auto px-6 h-20 flex items-center justify-between">
        <button 
          onClick={() => setLocation("/")}
          className="text-2xl font-bold font-heading tracking-tighter flex items-center gap-2"
        >
          <span className="text-primary">Tri</span>Fused
          <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
        </button>

        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
          <a href="/#services" className="hover:text-primary transition-colors">Services</a>
          <a href="/#ventures" className="hover:text-primary transition-colors">Ventures</a>
          <button 
            onClick={() => setLocation("/blog")}
            className="hover:text-primary transition-colors"
          >
            Intelligence Logs
          </button>
          <a href="/#about" className="hover:text-primary transition-colors">About</a>
        </div>

        <div className="flex items-center gap-4">
          {isAuthenticated ? (
            <Button 
              variant="outline" 
              className="hidden md:flex border-primary/20 hover:bg-primary/10 hover:text-primary hover:border-primary/50 text-foreground transition-all duration-300"
              onClick={() => setLocation("/portal/dashboard")}
              data-testid="button-nav-dashboard"
            >
              {user?.profileImageUrl ? (
                <img src={user.profileImageUrl} alt="" className="w-5 h-5 rounded-full mr-2 object-cover" />
              ) : (
                <User className="w-4 h-4 mr-2" />
              )}
              Dashboard
            </Button>
          ) : (
            <Button 
              variant="outline" 
              className="hidden md:flex border-primary/20 hover:bg-primary/10 hover:text-primary hover:border-primary/50 text-foreground transition-all duration-300"
              onClick={() => setLocation("/portal")}
              data-testid="button-nav-portal"
            >
              Client Portal
            </Button>
          )}
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
