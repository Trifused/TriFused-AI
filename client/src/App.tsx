import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useEffect } from "react";
import { initGA } from "./lib/analytics";
import { useAnalytics } from "./hooks/use-analytics";
import Home from "@/pages/home";
import Blog from "@/pages/blog";
import Signup from "@/pages/signup";
import Grader from "@/pages/grader";
import PortalLogin from "@/pages/portal/login";
import Dashboard from "@/pages/portal/dashboard";
import Admin from "@/pages/portal/admin";
import MFT from "@/pages/portal/mft";
import Media from "@/pages/portal/media";
import Integrations from "@/pages/portal/integrations";
import PublicMedia from "@/pages/public-media";
import Privacy from "@/pages/legal/privacy";
import Terms from "@/pages/legal/terms";
import Cookies from "@/pages/legal/cookies";
import NotFound from "@/pages/not-found";

function Router() {
  useAnalytics();
  
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/blog" component={Blog} />
      <Route path="/signup" component={Signup} />
      <Route path="/grader" component={Grader} />
      <Route path="/portal" component={PortalLogin} />
      <Route path="/portal/dashboard" component={Dashboard} />
      <Route path="/portal/admin" component={Admin} />
      <Route path="/portal/mft" component={MFT} />
      <Route path="/portal/media" component={Media} />
      <Route path="/portal/integrations" component={Integrations} />
      <Route path="/media" component={PublicMedia} />
      <Route path="/legal/privacy" component={Privacy} />
      <Route path="/legal/terms" component={Terms} />
      <Route path="/legal/cookies" component={Cookies} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  useEffect(() => {
    initGA();
  }, []);

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
