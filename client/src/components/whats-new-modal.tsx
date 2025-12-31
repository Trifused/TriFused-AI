import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sparkles, Zap, Shield, Bug, ChevronRight, X, ExternalLink } from "lucide-react";
import { useLocation } from "wouter";

interface ChangelogEntry {
  version: string;
  date: string;
  type: "feature" | "improvement" | "fix" | "security";
  title: string;
  description: string;
  items?: string[];
}

const WHATS_NEW_VERSION = "2.7.0";
const STORAGE_KEY = "trifused_whats_new_seen";

const recentChanges: ChangelogEntry[] = [
  {
    version: "2.7.0",
    date: "December 31, 2025",
    type: "feature",
    title: "Rate Limit Monitoring Dashboard",
    description: "Enhanced admin panel with comprehensive rate limiting visualization and analytics.",
    items: [
      "Tier distribution pie chart showing requests breakdown",
      "Blocked by tier bar chart with visual comparison",
      "Top endpoints horizontal bar chart",
    ]
  },
  {
    version: "2.6.0",
    date: "December 29, 2025",
    type: "feature",
    title: "AI Readiness Score",
    description: "Measure how well websites are optimized for AI crawlers and agents.",
    items: [
      "AI Readiness score on grader scorecard",
      "SSR detection and structured data validation",
      "MCP compliance and crawlability checks",
    ]
  },
  {
    version: "2.5.0",
    date: "December 28, 2025",
    type: "feature",
    title: "MCP Integration",
    description: "AI agent integration through the Model Context Protocol.",
    items: [
      "MCP discovery endpoint at /.well-known/mcp",
      "Website health check tools for AI agents",
    ]
  },
];

const typeConfig = {
  feature: { icon: Sparkles, color: "text-green-400", bg: "bg-green-500/20" },
  improvement: { icon: Zap, color: "text-blue-400", bg: "bg-blue-500/20" },
  fix: { icon: Bug, color: "text-yellow-400", bg: "bg-yellow-500/20" },
  security: { icon: Shield, color: "text-red-400", bg: "bg-red-500/20" },
};

interface WhatsNewModalProps {
  forceShow?: boolean;
  onClose?: () => void;
}

export function WhatsNewModal({ forceShow = false, onClose }: WhatsNewModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (forceShow) {
      setIsOpen(true);
      return;
    }

    const seenVersion = localStorage.getItem(STORAGE_KEY);
    if (seenVersion !== WHATS_NEW_VERSION) {
      const timer = setTimeout(() => setIsOpen(true), 1000);
      return () => clearTimeout(timer);
    }
  }, [forceShow]);

  const handleClose = () => {
    localStorage.setItem(STORAGE_KEY, WHATS_NEW_VERSION);
    setIsOpen(false);
    onClose?.();
  };

  const handleViewChangelog = () => {
    handleClose();
    setLocation("/docs/changelog");
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) handleClose(); }}>
      <DialogContent className="max-w-lg bg-slate-900/95 backdrop-blur-xl border-primary/20 p-0 overflow-hidden">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-purple-500/10" />
          
          <DialogHeader className="relative p-6 pb-4">
            <div className="flex items-center gap-3">
              <motion.div 
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", duration: 0.6 }}
                className="p-3 rounded-xl bg-primary/20 border border-primary/30"
              >
                <Sparkles className="w-6 h-6 text-primary" />
              </motion.div>
              <div>
                <DialogTitle className="text-2xl font-bold text-white">What's New</DialogTitle>
                <DialogDescription className="text-sm text-muted-foreground mt-1">Recent updates to TriFused</DialogDescription>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="absolute right-4 top-4 p-2 rounded-lg hover:bg-white/10 transition-colors"
              data-testid="btn-close-whats-new"
            >
              <X className="w-5 h-5 text-muted-foreground" />
            </button>
          </DialogHeader>

          <ScrollArea className="max-h-[400px] px-6">
            <div className="space-y-4 pb-4">
              {recentChanges.map((entry, index) => {
                const config = typeConfig[entry.type];
                const Icon = config.icon;
                
                return (
                  <motion.div
                    key={entry.version}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="relative"
                  >
                    <div className="glass-panel rounded-xl p-4 border border-white/5 hover:border-primary/20 transition-colors">
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-lg ${config.bg} shrink-0`}>
                          <Icon className={`w-4 h-4 ${config.color}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-semibold text-white">{entry.title}</h3>
                            <span className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-muted-foreground">
                              v{entry.version}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">{entry.description}</p>
                          {entry.items && (
                            <ul className="mt-2 space-y-1">
                              {entry.items.slice(0, 3).map((item, i) => (
                                <li key={i} className="text-xs text-muted-foreground flex items-start gap-2">
                                  <ChevronRight className="w-3 h-3 mt-0.5 text-primary shrink-0" />
                                  <span>{item}</span>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </ScrollArea>

          <div className="relative p-6 pt-4 border-t border-white/5 flex items-center justify-between gap-4">
            <Button
              variant="ghost"
              onClick={handleViewChangelog}
              className="text-muted-foreground hover:text-white"
              data-testid="btn-view-changelog"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              View Full Changelog
            </Button>
            <Button
              onClick={handleClose}
              className="bg-primary hover:bg-primary/90"
              data-testid="btn-got-it"
            >
              Got it!
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
