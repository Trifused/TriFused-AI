import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useLocation, useSearch } from "wouter";
import { 
  Rocket, ArrowRight, Check, LogIn, Mail, Loader2, Phone, Building2, MessageSquare,
  Monitor, HardDrive, KeyRound, Cloud, Activity, Lock, Shield, Smartphone, Database, Code, BrainCircuit, AlertCircle, HelpCircle
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useSessionTracking } from "@/hooks/useSessionTracking";

declare global {
  interface Window {
    grecaptcha: {
      ready: (callback: () => void) => void;
      execute: (siteKey: string, options: { action: string }) => Promise<string>;
    };
  }
}

const services = [
  { id: "secure-workstations", title: "Secure Workstations", icon: Monitor, color: "text-blue-400", bgColor: "bg-blue-400/10" },
  { id: "data-services", title: "Your Data Your Services", icon: HardDrive, color: "text-green-400", bgColor: "bg-green-400/10" },
  { id: "accounts-security", title: "Accounts & Security", icon: KeyRound, color: "text-yellow-400", bgColor: "bg-yellow-400/10" },
  { id: "cloud-systems", title: "Cloud Systems", icon: Cloud, color: "text-purple-400", bgColor: "bg-purple-400/10" },
  { id: "advanced-security", title: "Advanced Security", icon: Activity, color: "text-red-400", bgColor: "bg-red-400/10" },
  { id: "pentesting", title: "Advanced Pen-Testing", icon: Lock, color: "text-orange-400", bgColor: "bg-orange-400/10" },
  { id: "mdr", title: "MDR & Threat Hunting", icon: Shield, color: "text-cyan-400", bgColor: "bg-cyan-400/10" },
  { id: "mdm", title: "Mobile Device Mgmt", icon: Smartphone, color: "text-pink-400", bgColor: "bg-pink-400/10" },
  { id: "cloud-db", title: "Cloud & Database", icon: Database, color: "text-indigo-400", bgColor: "bg-indigo-400/10" },
  { id: "coding", title: "AI-Native Development", icon: Code, color: "text-emerald-400", bgColor: "bg-emerald-400/10" },
  { id: "growth", title: "Generative Growth", icon: BrainCircuit, color: "text-rose-400", bgColor: "bg-rose-400/10" },
  { id: "other", title: "Other", icon: HelpCircle, color: "text-gray-400", bgColor: "bg-gray-400/10" },
];

export default function Signup() {
  const [, setLocation] = useLocation();
  const searchString = useSearch();
  const { isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const { getSessionData } = useSessionTracking();
  
  const [email, setEmail] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [message, setMessage] = useState("");
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [needHelpAsap, setNeedHelpAsap] = useState(false);
  
  const [siteKey, setSiteKey] = useState<string | null>(null);
  const [recaptchaLoaded, setRecaptchaLoaded] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(searchString);
    const serviceParam = params.get('service');
    if (serviceParam && !selectedServices.includes(serviceParam)) {
      setSelectedServices([serviceParam]);
    }
  }, [searchString]);

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

  useEffect(() => {
    if (!siteKey) return;
    
    const existingScript = document.querySelector('script[src*="recaptcha/api.js"]');
    if (!existingScript) {
      const script = document.createElement('script');
      script.src = `https://www.google.com/recaptcha/api.js?render=${siteKey}`;
      script.async = true;
      script.onload = () => setRecaptchaLoaded(true);
      script.onerror = () => setRecaptchaLoaded(true); // Allow form to work without reCAPTCHA
      document.head.appendChild(script);
      
      // Fallback: enable form after 3 seconds if reCAPTCHA doesn't load
      setTimeout(() => setRecaptchaLoaded(true), 3000);
    } else {
      setRecaptchaLoaded(true);
    }
  }, [siteKey]);

  const leadMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch('/api/service-leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to submit');
      }
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Thank you!",
        description: "We've received your inquiry and will be in touch soon.",
      });
      setEmail("");
      setBusinessName("");
      setPhoneNumber("");
      setMessage("");
      setSelectedServices([]);
      setNeedHelpAsap(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      setLocation("/portal/dashboard");
    }
  }, [isAuthenticated, isLoading, setLocation]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    
    const sessionData = getSessionData();
    
    const submitLead = (token: string | null) => {
      leadMutation.mutate({
        email,
        captchaToken: token,
        businessName: businessName || null,
        phoneNumber: phoneNumber || null,
        message: message || null,
        serviceInterests: selectedServices.length > 0 ? selectedServices : null,
        needHelpAsap,
        clickPath: sessionData.clickPath,
        pageViews: sessionData.pageViews,
        sessionDuration: sessionData.sessionDuration,
        utmParams: sessionData.utmParams,
      });
    };
    
    // Try reCAPTCHA if available, otherwise submit without it
    if (window.grecaptcha && siteKey) {
      try {
        window.grecaptcha.ready(async () => {
          try {
            const token = await window.grecaptcha.execute(siteKey, { action: 'service_lead' });
            submitLead(token);
          } catch {
            submitLead(null);
          }
        });
      } catch {
        submitLead(null);
      }
    } else {
      submitLead(null);
    }
  };

  const toggleService = (serviceId: string) => {
    setSelectedServices(prev => 
      prev.includes(serviceId) 
        ? prev.filter(s => s !== serviceId)
        : [...prev, serviceId]
    );
  };

  const benefits = [
    "Access to AI-powered security dashboards",
    "Website & API health checks (automated)",
    "Real-time monitoring, alerts, and status signals",
    "API access for grading, AI readiness & checks",
    "Dedicated project & domain management portal",
    "Priority support and consultation booking",
    "Exclusive insights, reports, and AI readiness updates",
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="flex-1 flex items-center justify-center px-6 py-20">
        <div className="w-full max-w-4xl">
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
            <p className="text-muted-foreground max-w-xl mx-auto">
              Create your account to access the TriFused client portal and unlock AI-native solutions for your enterprise.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6">
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
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="group relative"
            >
              <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
              
              <div className="glass-panel h-full rounded-2xl overflow-hidden p-1 flex flex-col hover:border-primary/50 transition-colors duration-500">
                <div className="relative h-16 rounded-xl overflow-hidden mb-4 bg-gradient-to-r from-primary/20 via-cyan-500/20 to-blue-500/20 flex items-center justify-center">
                  <div className="p-3 bg-black/50 backdrop-blur-md rounded-lg border border-white/10">
                    <Mail className="w-6 h-6 text-primary" />
                  </div>
                </div>

                <div className="px-5 pb-6 flex-1 flex flex-col">
                  <h3 className="text-xl font-bold font-heading mb-2 text-white group-hover:text-primary transition-colors">
                    Get In Touch
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed mb-4">
                    Not ready to sign up? Tell us what you need and we'll reach out.
                  </p>

                  <form onSubmit={handleSubmit} className="space-y-4 flex-1">
                    <div className="space-y-2">
                      <label className="text-xs text-muted-foreground uppercase tracking-wider">
                        What services interest you?
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {services.map((service) => {
                          const Icon = service.icon;
                          const isSelected = selectedServices.includes(service.id);
                          return (
                            <button
                              key={service.id}
                              type="button"
                              onClick={() => toggleService(service.id)}
                              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                                isSelected 
                                  ? `${service.bgColor} ${service.color} border border-current` 
                                  : 'bg-white/5 text-white/60 border border-white/10 hover:border-white/30'
                              }`}
                              data-testid={`button-service-${service.id}`}
                            >
                              <Icon className="w-3.5 h-3.5" />
                              {service.title}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setNeedHelpAsap(!needHelpAsap)}
                      className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-sm font-semibold transition-all ${
                        needHelpAsap 
                          ? 'bg-red-500/20 text-red-400 border border-red-500/50' 
                          : 'bg-white/5 text-white/60 border border-white/10 hover:border-red-500/30 hover:text-red-400'
                      }`}
                      data-testid="button-need-help-asap"
                    >
                      <AlertCircle className="w-4 h-4" />
                      Need Help ASAP
                    </button>

                    <div className="space-y-3">
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          type="email"
                          placeholder="Email address *"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="pl-10 bg-white/5 border-white/20 text-white placeholder:text-muted-foreground"
                          required
                          data-testid="input-lead-email"
                        />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3">
                        <div className="relative">
                          <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input
                            type="text"
                            placeholder="Business name"
                            value={businessName}
                            onChange={(e) => setBusinessName(e.target.value)}
                            className="pl-10 bg-white/5 border-white/20 text-white placeholder:text-muted-foreground"
                            data-testid="input-lead-business"
                          />
                        </div>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input
                            type="tel"
                            placeholder="Phone number"
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value)}
                            className="pl-10 bg-white/5 border-white/20 text-white placeholder:text-muted-foreground"
                            data-testid="input-lead-phone"
                          />
                        </div>
                      </div>

                      <div className="relative">
                        <MessageSquare className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                        <Textarea
                          placeholder="Tell us about your needs..."
                          value={message}
                          onChange={(e) => setMessage(e.target.value)}
                          className="pl-10 min-h-[80px] bg-white/5 border-white/20 text-white placeholder:text-muted-foreground resize-none"
                          data-testid="input-lead-message"
                        />
                      </div>
                    </div>

                    <Button
                      type="submit"
                      disabled={!email || leadMutation.isPending}
                      className="w-full bg-primary hover:bg-primary/90 text-black font-semibold"
                      data-testid="button-submit-lead"
                    >
                      {leadMutation.isPending ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Sending...
                        </>
                      ) : (
                        <>
                          <Mail className="w-4 h-4 mr-2" />
                          Send Inquiry
                        </>
                      )}
                    </Button>

                    <p className="text-xs text-muted-foreground text-center">
                      Protected by reCAPTCHA.{" "}
                      <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-primary/70 hover:text-primary underline">
                        Privacy
                      </a>{" "}
                      &{" "}
                      <a href="https://policies.google.com/terms" target="_blank" rel="noopener noreferrer" className="text-primary/70 hover:text-primary underline">
                        Terms
                      </a>
                    </p>
                  </form>
                </div>
              </div>
            </motion.div>
          </div>

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
