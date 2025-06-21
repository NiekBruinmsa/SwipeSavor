import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { LogOut, Users, Heart } from "lucide-react";

interface User {
  id: number;
  username: string;
  displayName: string;
  avatar: string;
}

interface SessionData {
  userId: number;
  partnerUsername: string;
  category: string;
}

export default function JoinSession() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [sessionData, setSessionData] = useState<SessionData>({
    userId: 0,
    partnerUsername: "",
    category: ""
  });

  useEffect(() => {
    const userData = localStorage.getItem("currentUser");
    if (!userData) {
      setLocation("/login");
      return;
    }
    
    const user = JSON.parse(userData);
    setCurrentUser(user);
    setSessionData(prev => ({ ...prev, userId: user.id }));
  }, [setLocation]);

  const joinSessionMutation = useMutation({
    mutationFn: async (data: SessionData) => {
      const response = await fetch("/api/join-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error(await response.text());
      }
      return await response.json();
    },
    onSuccess: (response) => {
      // Store session and partner info
      localStorage.setItem("currentSession", JSON.stringify(response.session));
      localStorage.setItem("partner", JSON.stringify(response.partner));
      
      toast({
        title: "Session joined!",
        description: `Connected with ${response.partner.displayName}`,
      });
      
      // Navigate to swipe with session data
      setLocation(`/swipe?session=${response.session.id}&category=${response.session.category}`);
    },
    onError: (error: any) => {
      toast({
        title: "Failed to join session",
        description: error.message || "Could not connect with partner",
        variant: "destructive",
      });
    },
  });

  const handleJoinSession = (e: React.FormEvent) => {
    e.preventDefault();
    if (sessionData.partnerUsername && sessionData.category) {
      joinSessionMutation.mutate(sessionData);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("currentUser");
    localStorage.removeItem("currentSession");
    localStorage.removeItem("partner");
    setLocation("/login");
  };

  const startDemoSession = () => {
    // For demo mode, automatically connect Alex and Sam
    const demoSession = {
      id: 1,
      userId1: 1,
      userId2: 2,
      category: "cooking",
      filters: []
    };
    
    const demoPartner = { id: 2, displayName: "Sam", avatar: "S" };
    
    localStorage.setItem("currentSession", JSON.stringify(demoSession));
    localStorage.setItem("partner", JSON.stringify(demoPartner));
    
    toast({
      title: "Demo session started!",
      description: "You're connected with Sam in cooking mode",
    });
    
    setLocation(`/swipe?session=1&category=cooking`);
  };

  if (!currentUser) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-400 via-yellow-500 to-orange-500 p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Avatar className="h-12 w-12 bg-white border-2 border-black">
              <AvatarFallback className="text-black font-bold">
                {currentUser.avatar}
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-xl font-bold text-black">{currentUser.displayName}</h2>
              <Badge variant="secondary" className="bg-black/20 text-black">
                @{currentUser.username}
              </Badge>
            </div>
          </div>
          <Button
            onClick={handleLogout}
            variant="outline"
            size="sm"
            className="border-black/30 text-black hover:bg-black/10"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>

        {/* Main Content */}
        <div className="grid gap-6">
          <Card className="bg-white/95 shadow-2xl border-0">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl text-black flex items-center justify-center space-x-2">
                <Users className="h-6 w-6" />
                <span>Join Swipe Session</span>
              </CardTitle>
              <CardDescription>
                Connect with your partner to start swiping together
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleJoinSession} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="partner-username">Partner's Username</Label>
                  <Input
                    id="partner-username"
                    value={sessionData.partnerUsername}
                    onChange={(e) => setSessionData({ ...sessionData, partnerUsername: e.target.value })}
                    placeholder="Enter your partner's username"
                    required
                  />
                  <p className="text-sm text-gray-600">
                    Your partner needs to create an account first
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Food Category</Label>
                  <Select 
                    value={sessionData.category} 
                    onValueChange={(value) => setSessionData({ ...sessionData, category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choose what you're looking for" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cooking">🍳 Cooking Together</SelectItem>
                      <SelectItem value="delivery">🚚 Food Delivery</SelectItem>
                      <SelectItem value="dining">🍽️ Dining Out</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-semibold text-lg py-3"
                  disabled={joinSessionMutation.isPending}
                >
                  {joinSessionMutation.isPending ? (
                    "Connecting..."
                  ) : (
                    <>
                      <Heart className="h-5 w-5 mr-2" />
                      Start Swiping Together
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Demo Mode Card */}
          <Card className="bg-black/20 border-0">
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <h3 className="text-lg font-semibold text-black">Demo Mode</h3>
                <p className="text-black/80 text-sm">
                  Try the app instantly with pre-configured demo users
                </p>
                <Button
                  onClick={startDemoSession}
                  variant="outline"
                  className="border-black/30 text-black hover:bg-black/10"
                >
                  Start Demo Session
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}