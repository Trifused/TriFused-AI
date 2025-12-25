import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface TourStep {
  id: string;
  target: string;
  title: string;
  content: string;
  placement?: "top" | "bottom" | "left" | "right";
}

interface HelpContextType {
  showTour: boolean;
  setShowTour: (show: boolean) => void;
  currentTourStep: number;
  setCurrentTourStep: (step: number) => void;
  tourSteps: TourStep[];
  setTourSteps: (steps: TourStep[]) => void;
  dismissedTips: string[];
  dismissTip: (tipId: string) => void;
  resetTips: () => void;
  isNewUser: boolean;
  markUserOnboarded: () => void;
  showHelp: boolean;
  setShowHelp: (show: boolean) => void;
}

const HelpContext = createContext<HelpContextType | undefined>(undefined);

const STORAGE_KEY = "trifused_help_state";

interface StoredState {
  dismissedTips: string[];
  isOnboarded: boolean;
}

export function HelpProvider({ children }: { children: ReactNode }) {
  const [showTour, setShowTour] = useState(false);
  const [currentTourStep, setCurrentTourStep] = useState(0);
  const [tourSteps, setTourSteps] = useState<TourStep[]>([]);
  const [dismissedTips, setDismissedTips] = useState<string[]>([]);
  const [isNewUser, setIsNewUser] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const state: StoredState = JSON.parse(stored);
        setDismissedTips(state.dismissedTips || []);
        setIsNewUser(!state.isOnboarded);
      } catch {
        // Invalid stored state, use defaults
      }
    }
  }, []);

  const saveState = (tips: string[], onboarded: boolean) => {
    const state: StoredState = {
      dismissedTips: tips,
      isOnboarded: onboarded,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  };

  const dismissTip = (tipId: string) => {
    const newTips = [...dismissedTips, tipId];
    setDismissedTips(newTips);
    saveState(newTips, !isNewUser);
  };

  const resetTips = () => {
    setDismissedTips([]);
    setIsNewUser(true);
    saveState([], false);
  };

  const markUserOnboarded = () => {
    setIsNewUser(false);
    saveState(dismissedTips, true);
  };

  return (
    <HelpContext.Provider
      value={{
        showTour,
        setShowTour,
        currentTourStep,
        setCurrentTourStep,
        tourSteps,
        setTourSteps,
        dismissedTips,
        dismissTip,
        resetTips,
        isNewUser,
        markUserOnboarded,
        showHelp,
        setShowHelp,
      }}
    >
      {children}
    </HelpContext.Provider>
  );
}

export function useHelp() {
  const context = useContext(HelpContext);
  if (!context) {
    throw new Error("useHelp must be used within a HelpProvider");
  }
  return context;
}
