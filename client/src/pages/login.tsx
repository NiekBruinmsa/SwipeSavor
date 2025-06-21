import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface LoginData {
  username: string;
  password: string;
}

interface RegisterData {
  username: string;
  password: string;
  displayName: string;
}

export default function Login() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [loginData, setLoginData] = useState<LoginData>({ username: "", password: "" });
  const [registerData, setRegisterData] = useState<RegisterData>({ 
    username: "", 
    password: "", 
    displayName: "" 
  });

  const loginMutation = useMutation({
    mutationFn: async (data: LoginData) => {
      const response = await fetch("/api/login", {
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
      localStorage.setItem("currentUser", JSON.stringify(response.user));
      toast({
        title: "Welcome back!",
        description: `Logged in as ${response.user.displayName}`,
      });
      setLocation("/join-session");
    },
    onError: (error: any) => {
      toast({
        title: "Login failed",
        description: error.message || "Invalid username or password",
        variant: "destructive",
      });
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (data: RegisterData) => {
      const response = await fetch("/api/register", {
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
      localStorage.setItem("currentUser", JSON.stringify(response.user));
      toast({
        title: "Account created!",
        description: `Welcome ${response.user.displayName}!`,
      });
      setLocation("/join-session");
    },
    onError: (error: any) => {
      toast({
        title: "Registration failed",
        description: error.message || "Username might already exist",
        variant: "destructive",
      });
    },
  });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (loginData.username && loginData.password) {
      loginMutation.mutate(loginData);
    }
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (registerData.username && registerData.password && registerData.displayName) {
      registerMutation.mutate(registerData);
    }
  };

  const createDemoUsers = () => {
    const user1 = { id: 1, username: "alex", displayName: "Alex", avatar: "A" };
    const user2 = { id: 2, username: "sam", displayName: "Sam", avatar: "S" };
    
    localStorage.setItem("currentUser", JSON.stringify(user1));
    localStorage.setItem("demoUser1", JSON.stringify(user1));
    localStorage.setItem("demoUser2", JSON.stringify(user2));
    
    toast({
      title: "Demo users created!",
      description: "You're logged in as Alex. Open another tab to login as Sam.",
    });
    setLocation("/join-session");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-400 via-yellow-500 to-orange-500 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-black mb-2">Swipe & Savor</h1>
          <p className="text-black/80">Find your perfect meal together</p>
        </div>

        <Card className="bg-white/95 shadow-2xl border-0">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-black">Welcome</CardTitle>
            <CardDescription>Login or create an account to start swiping</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="register">Register</TabsTrigger>
              </TabsList>

              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-username">Username</Label>
                    <Input
                      id="login-username"
                      value={loginData.username}
                      onChange={(e) => setLoginData({ ...loginData, username: e.target.value })}
                      placeholder="Enter your username"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="login-password">Password</Label>
                    <Input
                      id="login-password"
                      type="password"
                      value={loginData.password}
                      onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                      placeholder="Enter your password"
                      required
                    />
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-semibold"
                    disabled={loginMutation.isPending}
                  >
                    {loginMutation.isPending ? "Logging in..." : "Login"}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="register">
                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="register-displayname">Display Name</Label>
                    <Input
                      id="register-displayname"
                      value={registerData.displayName}
                      onChange={(e) => setRegisterData({ ...registerData, displayName: e.target.value })}
                      placeholder="Your name"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="register-username">Username</Label>
                    <Input
                      id="register-username"
                      value={registerData.username}
                      onChange={(e) => setRegisterData({ ...registerData, username: e.target.value })}
                      placeholder="Choose a username"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="register-password">Password</Label>
                    <Input
                      id="register-password"
                      type="password"
                      value={registerData.password}
                      onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                      placeholder="Create a password"
                      required
                    />
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-semibold"
                    disabled={registerMutation.isPending}
                  >
                    {registerMutation.isPending ? "Creating account..." : "Create Account"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>

            <div className="mt-6 pt-6 border-t">
              <Button 
                onClick={createDemoUsers}
                variant="outline" 
                className="w-full border-yellow-400 text-yellow-700 hover:bg-yellow-50"
              >
                Try Demo Mode
              </Button>
              <p className="text-xs text-gray-600 mt-2 text-center">
                Creates Alex & Sam for testing
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}