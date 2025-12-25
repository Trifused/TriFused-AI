import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, HelpCircle, ChevronRight, ChevronLeft, Lightbulb } from "lucide-react";
import { Button } from "./button";
import { useHelp } from "@/context/help-context";

interface HelpTooltipProps {
  id: string;
  title: string;
  content: string;
  children: React.ReactNode;
  placement?: "top" | "bottom" | "left" | "right";
  showOnHover?: boolean;
  showOnce?: boolean;
  delay?: number;
}

export function HelpTooltip({
  id,
  title,
  content,
  children,
  placement = "top",
  showOnHover = false,
  showOnce = true,
  delay = 500,
}: HelpTooltipProps) {
  const { dismissedTips, dismissTip, isNewUser } = useHelp();
  const [isVisible, setIsVisible] = useState(false);
  const [hasShown, setHasShown] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isDismissed = dismissedTips.includes(id);

  useEffect(() => {
    if (isNewUser && !isDismissed && !hasShown && !showOnHover) {
      timeoutRef.current = setTimeout(() => {
        setIsVisible(true);
        setHasShown(true);
      }, delay);
    }
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [isNewUser, isDismissed, hasShown, showOnHover, delay]);

  const handleDismiss = () => {
    setIsVisible(false);
    if (showOnce) {
      dismissTip(id);
    }
  };

  const handleMouseEnter = () => {
    if (showOnHover && !isDismissed) {
      setIsVisible(true);
    }
  };

  const handleMouseLeave = () => {
    if (showOnHover) {
      setIsVisible(false);
    }
  };

  const placementStyles = {
    top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
    bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
    left: "right-full top-1/2 -translate-y-1/2 mr-2",
    right: "left-full top-1/2 -translate-y-1/2 ml-2",
  };

  const arrowStyles = {
    top: "top-full left-1/2 -translate-x-1/2 border-l-transparent border-r-transparent border-b-transparent border-t-cyan-500/30",
    bottom: "bottom-full left-1/2 -translate-x-1/2 border-l-transparent border-r-transparent border-t-transparent border-b-cyan-500/30",
    left: "left-full top-1/2 -translate-y-1/2 border-t-transparent border-b-transparent border-r-transparent border-l-cyan-500/30",
    right: "right-full top-1/2 -translate-y-1/2 border-t-transparent border-b-transparent border-l-transparent border-r-cyan-500/30",
  };

  return (
    <div
      className="relative inline-block"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.2 }}
            className={`absolute z-50 ${placementStyles[placement]}`}
          >
            <div className="bg-background/95 backdrop-blur-lg border border-cyan-500/30 rounded-xl p-4 shadow-xl shadow-cyan-500/10 min-w-[250px] max-w-[320px]">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-cyan-500/20 flex items-center justify-center flex-shrink-0">
                  <Lightbulb className="w-4 h-4 text-cyan-400" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-semibold text-sm text-foreground">{title}</h4>
                    <button
                      onClick={handleDismiss}
                      className="text-muted-foreground hover:text-foreground transition-colors p-1"
                      data-testid={`dismiss-tip-${id}`}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">{content}</p>
                </div>
              </div>
              <div
                className={`absolute w-0 h-0 border-8 ${arrowStyles[placement]}`}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

interface GuidedTourProps {
  steps: {
    id: string;
    target: string;
    title: string;
    content: string;
    placement?: "top" | "bottom" | "left" | "right";
  }[];
  onComplete?: () => void;
  tourId: string;
}

export function GuidedTour({ steps, onComplete, tourId }: GuidedTourProps) {
  const { dismissedTips, dismissTip, isNewUser } = useHelp();
  const [currentStep, setCurrentStep] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);

  const isDismissed = dismissedTips.includes(`tour_${tourId}`);

  useEffect(() => {
    if (isNewUser && !isDismissed) {
      const timer = setTimeout(() => setIsActive(true), 1000);
      return () => clearTimeout(timer);
    }
  }, [isNewUser, isDismissed]);

  const updateTargetRect = () => {
    if (isActive && steps[currentStep]) {
      const target = document.querySelector(steps[currentStep].target);
      if (target) {
        const rect = target.getBoundingClientRect();
        setTargetRect(rect);
      } else {
        setTargetRect(null);
      }
    }
  };

  useEffect(() => {
    if (isActive && steps[currentStep]) {
      const target = document.querySelector(steps[currentStep].target);
      if (target) {
        const rect = target.getBoundingClientRect();
        setTargetRect(rect);
        target.scrollIntoView({ behavior: "smooth", block: "center" });
        setTimeout(updateTargetRect, 500);
      } else {
        if (currentStep < steps.length - 1) {
          setCurrentStep(currentStep + 1);
        } else {
          setIsActive(false);
          dismissTip(`tour_${tourId}`);
        }
      }
    }
  }, [isActive, currentStep, steps]);

  useEffect(() => {
    if (!isActive) return;

    const handleResize = () => updateTargetRect();
    const handleScroll = () => updateTargetRect();

    window.addEventListener("resize", handleResize);
    window.addEventListener("scroll", handleScroll, true);

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("scroll", handleScroll, true);
    };
  }, [isActive, currentStep, steps]);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    setIsActive(false);
    dismissTip(`tour_${tourId}`);
    onComplete?.();
  };

  const handleSkip = () => {
    setIsActive(false);
    dismissTip(`tour_${tourId}`);
  };

  if (!isActive || !targetRect) return null;

  const step = steps[currentStep];
  const placement = step.placement || "bottom";

  const getTooltipPosition = () => {
    const padding = 16;
    switch (placement) {
      case "top":
        return {
          top: targetRect.top - padding,
          left: targetRect.left + targetRect.width / 2,
          transform: "translate(-50%, -100%)",
        };
      case "bottom":
        return {
          top: targetRect.bottom + padding,
          left: targetRect.left + targetRect.width / 2,
          transform: "translate(-50%, 0)",
        };
      case "left":
        return {
          top: targetRect.top + targetRect.height / 2,
          left: targetRect.left - padding,
          transform: "translate(-100%, -50%)",
        };
      case "right":
        return {
          top: targetRect.top + targetRect.height / 2,
          left: targetRect.right + padding,
          transform: "translate(0, -50%)",
        };
    }
  };

  return (
    <div className="fixed inset-0 z-[100]" data-testid={`guided-tour-${tourId}`}>
      <div className="absolute inset-0 bg-black/60" onClick={handleSkip} />
      
      <div
        className="absolute bg-transparent border-2 border-cyan-400 rounded-lg pointer-events-none"
        style={{
          top: targetRect.top - 4,
          left: targetRect.left - 4,
          width: targetRect.width + 8,
          height: targetRect.height + 8,
          boxShadow: "0 0 0 9999px rgba(0, 0, 0, 0.6), 0 0 20px rgba(6, 182, 212, 0.5)",
        }}
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="absolute bg-background/95 backdrop-blur-lg border border-cyan-500/30 rounded-xl p-5 shadow-xl shadow-cyan-500/20 w-[320px]"
        style={getTooltipPosition()}
      >
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-full bg-cyan-500/20 flex items-center justify-center">
            <HelpCircle className="w-4 h-4 text-cyan-400" />
          </div>
          <div>
            <h4 className="font-semibold text-foreground">{step.title}</h4>
            <span className="text-xs text-muted-foreground">
              Step {currentStep + 1} of {steps.length}
            </span>
          </div>
        </div>

        <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
          {step.content}
        </p>

        <div className="flex items-center justify-between">
          <button
            onClick={handleSkip}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            Skip tour
          </button>
          <div className="flex gap-2">
            {currentStep > 0 && (
              <Button size="sm" variant="outline" onClick={handlePrev}>
                <ChevronLeft className="w-4 h-4" />
              </Button>
            )}
            <Button size="sm" onClick={handleNext} className="bg-cyan-500 hover:bg-cyan-600 text-black">
              {currentStep === steps.length - 1 ? "Finish" : "Next"}
              {currentStep < steps.length - 1 && <ChevronRight className="w-4 h-4 ml-1" />}
            </Button>
          </div>
        </div>

        <div className="flex justify-center gap-1 mt-3">
          {steps.map((_, i) => (
            <div
              key={i}
              className={`w-2 h-2 rounded-full transition-colors ${
                i === currentStep ? "bg-cyan-400" : "bg-white/20"
              }`}
            />
          ))}
        </div>
      </motion.div>
    </div>
  );
}

export function HelpButton() {
  const { setShowHelp, showHelp, resetTips } = useHelp();

  return (
    <Button
      variant="outline"
      size="sm"
      className="fixed bottom-24 right-6 z-40 rounded-full w-12 h-12 p-0 border-cyan-500/30 hover:border-cyan-500/50 hover:bg-cyan-500/10 shadow-lg"
      onClick={() => setShowHelp(!showHelp)}
      data-testid="button-help-toggle"
    >
      <HelpCircle className="w-5 h-5 text-cyan-400" />
    </Button>
  );
}
