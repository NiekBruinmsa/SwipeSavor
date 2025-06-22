import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowLeft, X, Heart, Info, Users, Wifi, WifiOff } from "lucide-react";
import { useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { SwipeCard } from "@/components/swipe-card";
import { MatchModal } from "@/components/match-modal";
import { RecipeModal } from "@/components/recipe-modal";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useWebSocket } from "@/hooks/useWebSocket-simple";
import { type FoodItem } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

export default function Swipe() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // User and session state
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [partner, setPartner] = useState<any>(null);
  const [currentSession, setCurrentSession] = useState<any>(null);
  const [currentCategory, setCurrentCategory] = useState("cooking");
  
  // UI state
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [showMatchModal, setShowMatchModal] = useState(false);
  const [showRecipeModal, setShowRecipeModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<FoodItem | null>(null);
  const [matchedItem, setMatchedItem] = useState<FoodItem | null>(null);
  const [userSwipes, setUserSwipes] = useState<number[]>([]);

  // Load user data from localStorage
  useEffect(() => {
    const userData = localStorage.getItem("currentUser");
    const partnerData = localStorage.getItem("partner");
    const sessionData = localStorage.getItem("currentSession");
    
    if (!userData) {
      setLocation("/login");
      return;
    }
    
    setCurrentUser(JSON.parse(userData));
    if (partnerData) setPartner(JSON.parse(partnerData));
    if (sessionData) {
      const session = JSON.parse(sessionData);
      setCurrentSession(session);
      setCurrentCategory(session.category || "cooking");
    }
  }, [setLocation]);

  // Simplified connection status for now
  const isConnected = true;
  const partnerOnline = true;

  // Fetch food items
  const { data: foodItems = [], isLoading } = useQuery({
    queryKey: ["/api/food-items", currentCategory],
    queryFn: async () => {
      const params = new URLSearchParams({ category: currentCategory });
      const response = await fetch(`/api/food-items?${params}`);
      if (!response.ok) throw new Error("Failed to fetch food items");
      return response.json();
    },
  });

  // Swipe mutation
  const swipeMutation = useMutation({
    mutationFn: async (variables: { foodItemId: number; liked: boolean }) => {
      if (!currentSession || !currentUser) return;
      
      // Use the room-based API for multi-user sessions
      const room = `session_${currentSession.id}`;
      const userId = `user${currentUser.id}`;
      
      const response = await fetch("/swipe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          room,
          userId,
          mealId: variables.foodItemId.toString(),
          liked: variables.liked
        }),
      });
      
      if (!response.ok) throw new Error("Failed to record swipe");
      return response.json();
    },
    onSuccess: async (data, variables) => {
      // Check for matches immediately after a positive swipe
      if (variables.liked && currentUser && currentSession) {
        try {
          const room = `session_${currentSession.id}`;
          const matchResponse = await fetch(`/matches/${room}/user${currentUser.id}`);
          if (matchResponse.ok) {
            const matchData = await matchResponse.json();
            if (matchData.mealIds && matchData.mealIds.length > 0) {
              // Check if this food item is in the matches
              const foodItemIdStr = variables.foodItemId.toString();
              if (matchData.mealIds.includes(foodItemIdStr)) {
                const item = foodItems.find((item: FoodItem) => item.id === variables.foodItemId);
                if (item) {
                  setMatchedItem(item);
                  setShowMatchModal(true);
                  toast({
                    title: "It's a Match!",
                    description: "You both loved this option!",
                  });
                }
              }
            }
          }
        } catch (error) {
          console.log('Match check failed:', error);
        }
      }
      queryClient.invalidateQueries({ queryKey: ["/api/matches"] });
    },
  });

  const availableCards = foodItems.filter((item: FoodItem) => !userSwipes.includes(item.id));

  const handleSwipe = useCallback((foodItemId: number, liked: boolean) => {
    setUserSwipes(prev => [...prev, foodItemId]);
    setCurrentCardIndex(prev => prev + 1);
    swipeMutation.mutate({ foodItemId, liked });
  }, [swipeMutation]);

  const handleSwipeLeft = useCallback(() => {
    const currentItem = availableCards[0];
    if (currentItem) {
      handleSwipe(currentItem.id, false);
    }
  }, [handleSwipe, availableCards]);

  const handleSwipeRight = useCallback(() => {
    const currentItem = availableCards[0];
    if (currentItem) {
      handleSwipe(currentItem.id, true);
    }
  }, [handleSwipe, availableCards]);

  const handleInfo = useCallback(() => {
    const currentItem = availableCards[0];
    if (currentItem) {
      setSelectedItem(currentItem);
      setShowRecipeModal(true);
    }
  }, [availableCards]);

  const handleStartCooking = () => {
    setShowMatchModal(false);
    toast({
      title: "Let's cook!",
      description: "Enjoy making your matched recipe together!",
    });
  };

  const handleKeepBrowsing = () => {
    setShowMatchModal(false);
  };

  if (!currentUser) {
    return <div>Loading...</div>;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-400 via-yellow-500 to-orange-500 flex items-center justify-center">
        <div className="text-2xl font-bold text-black">Loading delicious options...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-400 via-yellow-500 to-orange-500 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-black/10">
        <Button
          onClick={() => setLocation("/join-session")}
          variant="ghost"
          size="sm"
          className="text-black hover:bg-black/20"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        <div className="flex items-center space-x-4">
          {/* Connection Status */}
          <div className="flex items-center space-x-2">
            {isConnected ? (
              <Wifi className="h-4 w-4 text-green-700" />
            ) : (
              <WifiOff className="h-4 w-4 text-red-700" />
            )}
            <span className="text-sm text-black font-medium">
              {isConnected ? "Connected" : "Offline"}
            </span>
          </div>

          {/* Partner Status */}
          {partner && (
            <div className="flex items-center space-x-2">
              <Avatar className="h-8 w-8 bg-white border border-black">
                <AvatarFallback className="text-black text-xs">
                  {partner.avatar}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span className="text-sm font-bold text-black">{partner.displayName}</span>
                <Badge 
                  variant={partnerOnline ? "default" : "secondary"}
                  className={`text-xs ${partnerOnline ? "bg-green-600" : "bg-gray-600"}`}
                >
                  {partnerOnline ? "Online" : "Offline"}
                </Badge>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Category Badge */}
      <div className="text-center py-4">
        <Badge className="bg-black text-yellow-400 text-lg px-6 py-2">
          {currentCategory === "cooking" ? "🍳 Cooking Together" : 
           currentCategory === "delivery" ? "🚚 Food Delivery" : 
           "🍽️ Dining Out"}
        </Badge>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-8">
        {availableCards.length === 0 ? (
          <div className="text-center space-y-4">
            <div className="text-6xl">🎉</div>
            <h2 className="text-3xl font-bold text-black">All done!</h2>
            <p className="text-xl text-black/80">You've swiped through all available options.</p>
            <Button
              onClick={() => setLocation("/join-session")}
              className="bg-black text-yellow-400 hover:bg-black/80"
            >
              Start New Session
            </Button>
          </div>
        ) : (
          <div className="relative w-full max-w-sm">
            <AnimatePresence mode="wait">
              {availableCards.slice(0, 3).map((item: FoodItem, index: number) => (
                <SwipeCard
                  key={item.id}
                  foodItem={item}
                  onSwipeLeft={index === 0 ? handleSwipeLeft : () => {}}
                  onSwipeRight={index === 0 ? handleSwipeRight : () => {}}
                  onInfo={index === 0 ? handleInfo : () => {}}
                  style={{
                    zIndex: 3 - index,
                    transform: `scale(${1 - index * 0.05}) translateY(${index * 4}px)`,
                  }}
                  className={index > 0 ? "pointer-events-none" : ""}
                />
              ))}
            </AnimatePresence>

            {/* Action Buttons */}
            <div className="flex justify-center space-x-6 mt-8">
              <Button
                onClick={handleSwipeLeft}
                size="lg"
                variant="outline"
                className="rounded-full h-16 w-16 border-2 border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
              >
                <X className="h-8 w-8" />
              </Button>
              
              <Button
                onClick={handleInfo}
                size="lg"
                variant="outline"
                className="rounded-full h-16 w-16 border-2 border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white"
              >
                <Info className="h-8 w-8" />
              </Button>
              
              <Button
                onClick={handleSwipeRight}
                size="lg"
                variant="outline"
                className="rounded-full h-16 w-16 border-2 border-green-500 text-green-500 hover:bg-green-500 hover:text-white"
              >
                <Heart className="h-8 w-8" />
              </Button>
            </div>
          </div>
        )}
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