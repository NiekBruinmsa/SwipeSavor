import { createContext, useContext, useState, type ReactNode } from "react";
import { type User, type FoodItem, type SwipeSession } from "@shared/schema";

interface SwipeContextType {
  currentUser: User | null;
  partner: User | null;
  currentSession: SwipeSession | null;
  currentCategory: string;
  activeFilters: string[];
  setCurrentUser: (user: User | null) => void;
  setPartner: (user: User | null) => void;
  setCurrentSession: (session: SwipeSession | null) => void;
  setCurrentCategory: (category: string) => void;
  setActiveFilters: (filters: string[]) => void;
  resetSession: () => void;
}

const SwipeContext = createContext<SwipeContextType | undefined>(undefined);

interface SwipeProviderProps {
  children: ReactNode;
}

export function SwipeProvider({ children }: SwipeProviderProps) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [partner, setPartner] = useState<User | null>(null);
  const [currentSession, setCurrentSession] = useState<SwipeSession | null>(null);
  const [currentCategory, setCurrentCategory] = useState<string>("cooking");
  const [activeFilters, setActiveFilters] = useState<string[]>([]);

  const resetSession = () => {
    setCurrentSession(null);
    setActiveFilters([]);
  };

  const value: SwipeContextType = {
    currentUser,
    partner,
    currentSession,
    currentCategory,
    activeFilters,
    setCurrentUser,
    setPartner,
    setCurrentSession,
    setCurrentCategory,
    setActiveFilters,
    resetSession,
  };

  return (
    <SwipeContext.Provider value={value}>
      {children}
    </SwipeContext.Provider>
  );
}

export function useSwipeContext() {
  const context = useContext(SwipeContext);
  if (context === undefined) {
    throw new Error("useSwipeContext must be used within a SwipeProvider");
  }
  return context;
}
