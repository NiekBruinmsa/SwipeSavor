import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Login from "@/pages/login";
import JoinSession from "@/pages/join-session";
import Onboarding from "@/pages/onboarding";
import Categories from "@/pages/categories";
import Swipe from "@/pages/swipe-fixed";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Login} />
      <Route path="/login" component={Login} />
      <Route path="/join-session" component={JoinSession} />
      <Route path="/onboarding" component={Onboarding} />
      <Route path="/categories" component={Categories} />
      <Route path="/swipe" component={Swipe} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
