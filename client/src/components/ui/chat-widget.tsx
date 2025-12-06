import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, X, Send, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <div className="fixed bottom-6 right-6 z-50">
        <AnimatePresence>
          {!isOpen && (
            <motion.button
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              onClick={() => setIsOpen(true)}
              className="w-14 h-14 rounded-full bg-primary text-background flex items-center justify-center shadow-[0_0_20px_hsl(190,100%,50%,0.5)] hover:scale-110 transition-transform"
            >
              <MessageSquare className="w-6 h-6" />
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-6 right-6 z-50 w-[350px] md:w-[400px] h-[500px] glass-panel rounded-2xl flex flex-col shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="p-4 border-b border-white/10 flex items-center justify-between bg-white/5">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center border border-primary/50">
                  <Bot className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <div className="text-sm font-bold text-white">TriFused AI</div>
                  <div className="text-xs text-primary flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                    Online
                  </div>
                </div>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setIsOpen(false)}
                className="hover:bg-white/10 text-muted-foreground hover:text-white"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* Chat Area */}
            <div className="flex-1 p-4 space-y-4 overflow-y-auto">
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex-shrink-0 flex items-center justify-center mt-1">
                  <Bot className="w-4 h-4 text-primary" />
                </div>
                <div className="bg-white/10 p-3 rounded-2xl rounded-tl-none text-sm text-white/90">
                  Hello. I am the TriFused autonomous agent. How can I assist with your infrastructure or cybersecurity needs today?
                </div>
              </div>
              
              <div className="flex gap-3 flex-row-reverse">
                <div className="w-8 h-8 rounded-full bg-purple-500/20 flex-shrink-0 flex items-center justify-center mt-1">
                  <div className="w-4 h-4 rounded-full bg-purple-500" />
                </div>
                <div className="bg-primary/10 border border-primary/20 p-3 rounded-2xl rounded-tr-none text-sm text-white/90">
                  I'm interested in AI-driven security.
                </div>
              </div>

              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex-shrink-0 flex items-center justify-center mt-1">
                  <Bot className="w-4 h-4 text-primary" />
                </div>
                <div className="bg-white/10 p-3 rounded-2xl rounded-tl-none text-sm text-white/90">
                  Excellent choice. Our Cognitive Cybersecurity protocols use predictive modeling to neutralize threats before they execute. Would you like to schedule a demo of our Sentinel system?
                </div>
              </div>
            </div>

            {/* Input */}
            <div className="p-4 border-t border-white/10 bg-white/5">
              <div className="relative">
                <input 
                  type="text" 
                  placeholder="Type your query..." 
                  className="w-full bg-black/40 border border-white/10 rounded-full py-3 pl-4 pr-12 text-sm text-white focus:outline-none focus:border-primary/50 transition-colors"
                />
                <button className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-primary text-black rounded-full hover:bg-primary/90 transition-colors">
                  <Send className="w-3 h-3" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
