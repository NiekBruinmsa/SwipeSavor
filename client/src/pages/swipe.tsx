import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowLeft, X, Heart, Info, Sliders } from "lucide-react";
import { useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSwipeContext } from "@/lib/swipe-context";
import { SwipeCard } from "@/components/swipe-card";
import { MatchModal } from "@/components/match-modal";
import { RecipeModal } from "@/components/recipe-modal";
import { apiRequest } from "@/lib/queryClient";
import { type FoodItem } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

export default function Swipe() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const { 
    currentCategory, 
    activeFilters, 
    currentSession, 
    setCurrentSession,
    currentUser,
    partner 
  } = useSwipeContext();

  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [showMatchModal, setShowMatchModal] = useState(false);
  const [showRecipeModal, setShowRecipeModal] = useState(false);
  const [matchedItem, setMatchedItem] = useState<FoodItem | null>(null);
  const [selectedItem, setSelectedItem] = useState<FoodItem | null>(null);
  const [userSwipes, setUserSwipes] = useState<number[]>([]);

  // Fetch food items
  const { data: foodItems = [], isLoading } = useQuery({
    queryKey: ["/api/food-items", currentCategory, activeFilters],
    queryFn: async () => {
      const params = new URLSearchParams({
        category: currentCategory,
        ...(activeFilters.length > 0 && { filters: activeFilters.join(",") }),
      });
      const response = await fetch(`/api/food-items?${params}`);
      if (!response.ok) throw new Error("Failed to fetch food items");
      return response.json();
    },
  });

  // Create demo users if none exist
  const createDemoUsersMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/demo-users");
      return response.json();
    },
    onSuccess: (data) => {
      // Store demo users in context (simplified for demo)
      sessionStorage.setItem("demoUsers", JSON.stringify(data));
    },
  });

  // Create swipe session
  const createSessionMutation = useMutation({
    mutationFn: async () => {
      // Get or create demo users
      let demoUsers = JSON.parse(sessionStorage.getItem("demoUsers") || "null");
      if (!demoUsers) {
        const response = await apiRequest("POST", "/api/demo-users");
        demoUsers = await response.json();
        sessionStorage.setItem("demoUsers", JSON.stringify(demoUsers));
      }

      const response = await apiRequest("POST", "/api/swipe-sessions", {
        userId1: demoUsers.user1.id,
        userId2: demoUsers.user2.id,
        category: currentCategory,
        filters: activeFilters,
      });
      return response.json();
    },
    onSuccess: (session) => {
      setCurrentSession(session);
    },
  });

  // Submit swipe
  const swipeMutation = useMutation({
    mutationFn: async ({ liked, foodItemId }: { liked: boolean; foodItemId: number }) => {
      const demoUsers = JSON.parse(sessionStorage.getItem("demoUsers") || "{}");
      const response = await apiRequest("POST", "/api/swipes", {
        sessionId: currentSession!.id,
        userId: demoUsers.user1.id,
        foodItemId,
        liked,
      });
      return response.json();
    },
    onSuccess: (data, variables) => {
      setUserSwipes(prev => [...prev, variables.foodItemId]);
      
      if (data.match) {
        const item = foodItems.find((item: FoodItem) => item.id === variables.foodItemId);
        if (item) {
          setMatchedItem(item);
          setShowMatchModal(true);
        }
      }
      
      // Move to next card
      setCurrentCardIndex(prev => prev + 1);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to submit swipe. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Initialize session
  useEffect(() => {
    if (!currentSession && !createSessionMutation.isPending) {
      createSessionMutation.mutate();
    }
  }, [currentSession, createSessionMutation]);

  // Get available cards (not yet swiped on)
  const availableCards = foodItems.filter((item: FoodItem) => !userSwipes.includes(item.id));
  const currentCard = availableCards[0]; // Always show the first available card

  const handleSwipeLeft = useCallback(() => {
    if (!currentCard || swipeMutation.isPending) return;
    swipeMutation.mutate({ liked: false, foodItemId: currentCard.id });
  }, [currentCard, swipeMutation]);

  const handleSwipeRight = useCallback(() => {
    if (!currentCard || swipeMutation.isPending) return;
    swipeMutation.mutate({ liked: true, foodItemId: currentCard.id });
  }, [currentCard, swipeMutation]);

  const handleInfo = useCallback(() => {
    if (currentCard) {
      setSelectedItem(currentCard);
      setShowRecipeModal(true);
    }
  }, [currentCard]);

  const handleStartCooking = () => {
    setShowMatchModal(false);
    toast({
      title: "Great choice!",
      description: "Enjoy your meal together! 🍽️",
    });
  };

  const handleKeepBrowsing = () => {
    setShowMatchModal(false);
  };

  const categoryTitles = {
    cooking: "Cook at Home",
    delivery: "Order Delivery", 
    dineout: "Dine Out",
  };

  if (isLoading || createSessionMutation.isPending) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-app-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Loading delicious options...</p>
        </div>
      </div>
    );
  }

  if (availableCards.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center max-w-sm">
          <div className="text-6xl mb-4">🍽️</div>
          <h2 className="text-2xl font-bold app-neutral mb-2">All done!</h2>
          <p className="text-gray-600 mb-6">
            You've seen all available options for {categoryTitles[currentCategory as keyof typeof categoryTitles]}.
          </p>
          <Button
            onClick={() => setLocation("/categories")}
            className="bg-app-primary hover:bg-app-primary/90 text-white"
          >
            Try Another Category
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-app-primary relative overflow-hidden">
      {/* Header */}
      <div className="bg-app-primary p-4 relative z-10">
        <div className="max-w-sm mx-auto flex items-center justify-between">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setLocation("/categories")}
            className="app-text hover:bg-black/10"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="text-center">
            <h3 className="font-bold app-text text-lg">
              {categoryTitles[currentCategory as keyof typeof categoryTitles]}
            </h3>
            <p className="text-sm app-text-muted">Swipe right to like!</p>
          </div>
          <Button variant="ghost" size="icon" className="app-text hover:bg-black/10">
            <Sliders className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Card Stack */}
      <div className="max-w-sm mx-auto p-4 relative" style={{ height: "600px" }}>
        <div className="relative w-full h-full">
          {/* Background cards */}
          {availableCards.slice(1, 3).map((_: FoodItem, index: number) => (
            <div
              key={`bg-card-${index}`}
              className={`absolute inset-0 bg-white rounded-3xl shadow-lg ${
                index === 0 ? "scale-97 opacity-80 z-2" : "scale-95 opacity-60 z-1"
              }`}
            />
          ))}

          {/* Active card */}
          {currentCard && (
            <SwipeCard
              foodItem={currentCard}
              onSwipeLeft={handleSwipeLeft}
              onSwipeRight={handleSwipeRight}
              onInfo={handleInfo}
              className="z-3"
            />
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="max-w-sm mx-auto px-4 pb-8">
        <div className="flex items-center justify-center space-x-8">
          <Button
            onClick={handleSwipeLeft}
            disabled={swipeMutation.isPending}
            className="w-16 h-16 bg-white rounded-full shadow-xl text-red-500 text-2xl hover:bg-red-50 border-2 border-gray-100"
            variant="outline"
          >
            <X className="w-7 h-7" />
          </Button>

          <Button
            onClick={handleInfo}
            className="w-12 h-12 bg-white rounded-full shadow-xl text-gray-600 text-lg hover:bg-gray-50 border-2 border-gray-100"
            variant="outline"
          >
            <Info className="w-5 h-5" />
          </Button>

          <Button
            onClick={handleSwipeRight}
            disabled={swipeMutation.isPending}
            className="w-16 h-16 bg-white rounded-full shadow-xl text-green-500 text-2xl hover:bg-green-50 border-2 border-gray-100"
            variant="outline"
          >
            <Heart className="w-7 h-7" />
          </Button>
        </div>
      </div>

      {/* Status Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-app-primary border-t border-black/10 p-4">
        <div className="max-w-sm mx-auto">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center text-white text-xs font-bold">
                A
              </div>
              <span className="font-medium text-black">Alex</span>
              <span className="text-black/60">liked {userSwipes.filter(Boolean).length}</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-black/60">liked {Math.floor(userSwipes.length * 0.7)}</span>
              <span className="font-medium text-black">Sam</span>
              <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center text-white text-xs font-bold">
                S
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {matchedItem && (
        <MatchModal
          isOpen={showMatchModal}
          onClose={() => setShowMatchModal(false)}
          matchedItem={matchedItem}
          onStartCooking={handleStartCooking}
          onKeepBrowsing={handleKeepBrowsing}
        />
      )}

      {selectedItem && (
        <RecipeModal
          isOpen={showRecipeModal}
          onClose={() => setShowRecipeModal(false)}
          foodItem={selectedItem}
        />
      )}
    </div>
  );
}
