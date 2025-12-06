import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Cookie, X, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CookieConsent() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("trifused-cookie-consent");
    if (!consent) {
      const timer = setTimeout(() => setShow(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const accept = () => {
    localStorage.setItem("trifused-cookie-consent", "accepted");
    setShow(false);
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-6 left-6 z-50 max-w-sm w-full"
        >
          <div className="glass-panel p-6 rounded-2xl border border-white/10 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
            
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-full bg-primary/10 text-primary">
                <Cookie className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-white mb-2">Digital Trace Protocols</h3>
                <p className="text-xs text-muted-foreground leading-relaxed mb-4">
                  We use cookies to optimize neural pathways and enhance system latency. 
                  By continuing, you authorize our tracking heuristics.
                </p>
                <div className="flex gap-3">
                  <Button size="sm" onClick={accept} className="bg-primary text-background hover:bg-primary/90 font-bold">
                    <Check className="w-3 h-3 mr-2" />
                    Accept
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => setShow(false)} className="hover:bg-white/10 text-muted-foreground hover:text-white">
                    <X className="w-3 h-3 mr-2" />
                    Dismiss
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
