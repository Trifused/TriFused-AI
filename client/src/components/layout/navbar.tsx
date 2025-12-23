import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Sparkles, User, Menu, X } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function Navbar() {
  const [, setLocation] = useLocation();
  const { isAuthenticated, user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { label: "Services", href: "/#services" },
    { label: "Ventures", href: "/#ventures" },
    { label: "Website Grader", href: "/grader", highlight: true },
    { label: "Intelligence Logs", href: "/blog" },
    { label: "About", href: "/#about" },
  ];

  const handleNavClick = (href: string) => {
    setMobileMenuOpen(false);
    if (href.startsWith("/#")) {
      window.location.href = href;
    } else {
      setLocation(href);
    }
  };

  return (
    <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-background/50 backdrop-blur-lg">
      <div className="container mx-auto px-6 h-20 flex items-center justify-between">
        <button 
          onClick={() => setLocation("/")}
          className="text-2xl font-bold font-heading tracking-tighter flex items-center gap-2"
        >
          <span className="text-primary">Tri</span>Fused
          <div 
            className="w-6 h-6 cursor-default" 
            onClick={(e) => {
              e.stopPropagation();
              setLocation("/portal");
            }}
            data-testid="hidden-portal-link"
          />
          <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
        </button>

        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
          {navLinks.map((link) => (
            <button 
              key={link.href}
              onClick={() => handleNavClick(link.href)}
              className={`hover:text-primary transition-colors ${link.highlight ? 'text-primary font-semibold' : ''}`}
            >
              {link.label}
            </button>
          ))}
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
            className="hidden sm:flex bg-primary text-background font-bold hover:bg-primary/90 shadow-[0_0_20px_rgba(6,182,212,0.3)] hover:shadow-[0_0_30px_rgba(6,182,212,0.5)] transition-all duration-300"
            onClick={() => {
              const event = new CustomEvent('open-chat');
              window.dispatchEvent(event);
            }}
          >
            <Sparkles className="w-4 h-4 mr-2" />
            Initialize AI
          </Button>
          
          <button
            className="md:hidden p-2 text-foreground hover:text-primary transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            data-testid="button-mobile-menu"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>
      
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-white/5 bg-background/95 backdrop-blur-lg overflow-hidden"
          >
            <div className="container mx-auto px-6 py-4 flex flex-col gap-2">
              {navLinks.map((link) => (
                <button
                  key={link.href}
                  onClick={() => handleNavClick(link.href)}
                  className={`text-left py-3 px-4 rounded-lg text-sm font-medium transition-colors ${
                    link.highlight 
                      ? 'bg-primary/10 text-primary border border-primary/20' 
                      : 'text-muted-foreground hover:bg-white/5 hover:text-primary'
                  }`}
                  data-testid={`mobile-nav-${link.label.toLowerCase().replace(' ', '-')}`}
                >
                  {link.label}
                </button>
              ))}
              
              <div className="border-t border-white/10 my-2 pt-2">
                {isAuthenticated ? (
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      setLocation("/portal/dashboard");
                    }}
                    className="w-full text-left py-3 px-4 rounded-lg text-sm font-medium text-muted-foreground hover:bg-white/5 hover:text-primary transition-colors flex items-center gap-2"
                  >
                    {user?.profileImageUrl ? (
                      <img src={user.profileImageUrl} alt="" className="w-5 h-5 rounded-full object-cover" />
                    ) : (
                      <User className="w-4 h-4" />
                    )}
                    Dashboard
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      setLocation("/portal");
                    }}
                    className="w-full text-left py-3 px-4 rounded-lg text-sm font-medium text-muted-foreground hover:bg-white/5 hover:text-primary transition-colors"
                  >
                    Client Portal
                  </button>
                )}
              </div>
              
              <Button 
                className="w-full mt-2 bg-primary text-background font-bold hover:bg-primary/90"
                onClick={() => {
                  setMobileMenuOpen(false);
                  const event = new CustomEvent('open-chat');
                  window.dispatchEvent(event);
                }}
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Initialize AI
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
