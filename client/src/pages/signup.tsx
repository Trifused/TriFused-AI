import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { Rocket, ArrowRight, Check, LogIn } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useEffect } from "react";

export default function Signup() {
  const [, setLocation] = useLocation();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      setLocation("/portal/dashboard");
    }
  }, [isAuthenticated, isLoading, setLocation]);

  const benefits = [
    "Access to AI-powered security dashboards",
    "Real-time threat monitoring and alerts",
    "Dedicated project management portal",
    "Priority support and consultation booking",
    "Exclusive insights and reports",
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="flex-1 flex items-center justify-center px-6 py-20">
        <div className="w-full max-w-lg">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/20 bg-primary/5 text-primary text-xs font-mono uppercase tracking-widest mb-6">
              <Rocket className="w-3 h-3" />
              Get Started
            </div>
            
            <h1 className="text-3xl md:text-4xl font-bold font-heading text-white mb-3">
              Join the Protocol
            </h1>
            <p className="text-muted-foreground">
              Create your account to access the TriFused client portal and unlock AI-native solutions for your enterprise.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-panel rounded-2xl p-8 space-y-6"
          >
            <div className="space-y-3">
              {benefits.map((benefit, index) => (
                <motion.div
                  key={benefit}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + index * 0.1 }}
                  className="flex items-center gap-3 text-sm text-white/80"
                >
                  <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                    <Check className="w-3 h-3 text-primary" />
                  </div>
                  <span>{benefit}</span>
                </motion.div>
              ))}
            </div>

            <div className="pt-4">
              <Button
                size="lg"
                className="w-full h-14 text-base bg-primary hover:bg-primary/90 text-black font-bold rounded-xl"
                onClick={() => window.location.href = "/api/login"}
                data-testid="button-signup"
              >
                Create Your Account <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <p className="text-xs text-muted-foreground text-center mt-4">
                Sign up with Google, GitHub, or your email address
              </p>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-white/10" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">Already have an account?</span>
              </div>
            </div>

            <Button
              variant="outline"
              size="lg"
              className="w-full h-14 text-base border-white/20 hover:bg-white/5 rounded-xl"
              onClick={() => setLocation("/portal")}
              data-testid="button-goto-login"
            >
              <LogIn className="mr-2 w-5 h-5" />
              Sign In
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
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
