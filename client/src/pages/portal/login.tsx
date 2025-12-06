import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { Lock, ArrowRight, Shield, Zap, UserPlus } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useEffect } from "react";

export default function PortalLogin() {
  const [, setLocation] = useLocation();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      setLocation("/portal/dashboard");
    }
  }, [isAuthenticated, isLoading, setLocation]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="flex-1 flex items-center justify-center px-6 py-20">
        <div className="w-full max-w-md">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/20 bg-primary/5 text-primary text-xs font-mono uppercase tracking-widest mb-6">
              <Lock className="w-3 h-3" />
              Secure Portal
            </div>
            
            <h1 className="text-3xl md:text-4xl font-bold font-heading text-white mb-3">
              Client Portal
            </h1>
            <p className="text-muted-foreground">
              Access your dashboard, projects, and secure communications.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-panel rounded-2xl p-8 space-y-6"
          >
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <Shield className="w-4 h-4 text-primary" />
                <span>End-to-end encrypted authentication</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <Zap className="w-4 h-4 text-primary" />
                <span>Instant access to your dashboard</span>
              </div>
            </div>

            <Button
              size="lg"
              className="w-full h-14 text-base bg-primary hover:bg-primary/90 text-black font-bold rounded-xl"
              onClick={() => window.location.href = "/api/login"}
              data-testid="button-login"
            >
              Sign In Securely <ArrowRight className="ml-2 w-5 h-5" />
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-white/10" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">New to TriFused?</span>
              </div>
            </div>

            <Button
              variant="outline"
              size="lg"
              className="w-full h-14 text-base border-white/20 hover:bg-white/5 rounded-xl"
              onClick={() => setLocation("/signup")}
              data-testid="button-goto-signup"
            >
              <UserPlus className="mr-2 w-5 h-5" />
              Create Account
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-8 text-center"
          >
            <button
              onClick={() => setLocation("/")}
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
              data-testid="link-back-home"
            >
              ← Back to Homepage
            </button>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
