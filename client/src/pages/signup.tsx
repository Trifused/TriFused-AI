import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLocation } from "wouter";
import { Rocket, ArrowRight, Check, LogIn, Mail, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState, useCallback, useRef } from "react";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

declare global {
  interface Window {
    grecaptcha: {
      ready: (callback: () => void) => void;
      render: (container: string | HTMLElement, options: { sitekey: string; callback: (token: string) => void; theme?: string; size?: string }) => number;
      reset: (widgetId?: number) => void;
      getResponse: (widgetId?: number) => string;
    };
    onRecaptchaLoad?: () => void;
  }
}

export default function Signup() {
  const [, setLocation] = useLocation();
  const { isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [siteKey, setSiteKey] = useState<string | null>(null);
  const captchaRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<number | null>(null);

  useEffect(() => {
    fetch('/api/recaptcha-site-key')
      .then(res => res.json())
      .then(data => {
        if (data.siteKey) {
          setSiteKey(data.siteKey);
        }
      })
      .catch(err => console.error('Failed to load reCAPTCHA config:', err));
  }, []);

  const subscribeMutation = useMutation({
    mutationFn: async (data: { email: string; captchaToken: string }) => {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to subscribe');
      }
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Success!",
        description: "You're on the list. We'll be in touch soon.",
      });
      setEmail("");
      setCaptchaToken(null);
      if (window.grecaptcha && widgetIdRef.current !== null) {
        window.grecaptcha.reset(widgetIdRef.current);
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const onCaptchaVerify = useCallback((token: string) => {
    setCaptchaToken(token);
  }, []);

  useEffect(() => {
    if (!siteKey) return;

    const renderCaptcha = () => {
      if (captchaRef.current && widgetIdRef.current === null && window.grecaptcha) {
        try {
          widgetIdRef.current = window.grecaptcha.render(captchaRef.current, {
            sitekey: siteKey,
            callback: onCaptchaVerify,
            theme: 'dark',
          });
        } catch (e) {
          console.log("reCAPTCHA already rendered");
        }
      }
    };

    if (typeof window.grecaptcha !== 'undefined' && typeof window.grecaptcha.render === 'function') {
      renderCaptcha();
    } else {
      const existingScript = document.querySelector('script[src*="recaptcha/api.js"]');
      if (!existingScript) {
        window.onRecaptchaLoad = renderCaptcha;
        
        const script = document.createElement('script');
        script.src = 'https://www.google.com/recaptcha/api.js?onload=onRecaptchaLoad&render=explicit';
        script.async = true;
        script.defer = true;
        script.id = 'recaptcha-script';
        document.head.appendChild(script);
      } else {
        window.onRecaptchaLoad = renderCaptcha;
      }
    }
  }, [siteKey, onCaptchaVerify]);

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      setLocation("/portal/dashboard");
    }
  }, [isAuthenticated, isLoading, setLocation]);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !captchaToken) return;
    subscribeMutation.mutate({ email, captchaToken });
  };

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

          {/* Email Capture Box */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass-panel rounded-2xl p-6 mt-6"
          >
            <div className="flex items-center gap-2 mb-4">
              <Mail className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-semibold text-white">Stay Updated</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Not ready to sign up? Get early access updates and exclusive insights delivered to your inbox.
            </p>
            <form onSubmit={handleSubscribe} className="space-y-4">
              <Input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-white/5 border-white/20 text-white placeholder:text-muted-foreground"
                required
                data-testid="input-subscribe-email"
              />
              <div ref={captchaRef} className="flex justify-center" data-testid="recaptcha-container" />
              <Button
                type="submit"
                disabled={!email || !captchaToken || subscribeMutation.isPending}
                className="w-full bg-primary/80 hover:bg-primary text-black font-semibold"
                data-testid="button-subscribe"
              >
                {subscribeMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Subscribing...
                  </>
                ) : (
                  <>
                    <Mail className="w-4 h-4 mr-2" />
                    Get Updates
                  </>
                )}
              </Button>
            </form>
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
