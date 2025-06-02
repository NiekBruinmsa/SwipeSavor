import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SwipeProvider } from "@/lib/swipe-context";
import Onboarding from "@/pages/onboarding";
import Categories from "@/pages/categories";
import Swipe from "@/pages/swipe";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Onboarding} />
      <Route path="/categories" component={Categories} />
      <Route path="/swipe" component={Swipe} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <SwipeProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </SwipeProvider>
    </QueryClientProvider>
  );
}

export default App;
