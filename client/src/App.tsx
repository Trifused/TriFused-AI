import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useEffect, lazy, Suspense } from "react";
import { initGA } from "./lib/analytics";
import { useAnalytics } from "./hooks/use-analytics";
import { CartProvider } from "./context/cart-context";
import { ImpersonationBanner } from "@/components/ui/impersonation-banner";

// Eager load Home for fast initial paint
import Home from "@/pages/home";
import NotFound from "@/pages/not-found";

// Lazy load all other pages for code splitting
const Blog = lazy(() => import("@/pages/blog"));
const Signup = lazy(() => import("@/pages/signup"));
const Grader = lazy(() => import("@/pages/grader"));
const Report = lazy(() => import("@/pages/report"));
const Store = lazy(() => import("@/pages/store"));
const PortalLogin = lazy(() => import("@/pages/portal/login"));
const Dashboard = lazy(() => import("@/pages/portal/dashboard"));
const Admin = lazy(() => import("@/pages/portal/admin"));
const MFT = lazy(() => import("@/pages/portal/mft"));
const Media = lazy(() => import("@/pages/portal/media"));
const Integrations = lazy(() => import("@/pages/portal/integrations"));
const Billing = lazy(() => import("@/pages/portal/billing"));
const ApiPortal = lazy(() => import("@/pages/portal/api"));
const ReportsPortal = lazy(() => import("@/pages/portal/reports"));
const WebsitesPortal = lazy(() => import("@/pages/portal/websites"));
const GradeEmbed = lazy(() => import("@/pages/grade-embed"));
const PublicMedia = lazy(() => import("@/pages/public-media"));
const Privacy = lazy(() => import("@/pages/legal/privacy"));
const Terms = lazy(() => import("@/pages/legal/terms"));
const Cookies = lazy(() => import("@/pages/legal/cookies"));
const CheckoutSuccess = lazy(() => import("@/pages/checkout-success"));
const BackupCalculator = lazy(() => import("@/pages/backup-calculator"));

// Loading fallback for lazy components
const PageLoader = () => (
  <div className="min-h-screen bg-background flex items-center justify-center">
    <div className="animate-pulse text-primary font-mono">Loading...</div>
  </div>
);

function Router() {
  useAnalytics();
  
  return (
    <Suspense fallback={<PageLoader />}>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/blog" component={Blog} />
        <Route path="/signup" component={Signup} />
        <Route path="/grader" component={Grader} />
        <Route path="/report/:shareToken" component={Report} />
        <Route path="/store" component={Store} />
        <Route path="/shop">{() => { window.location.replace('/store'); return null; }}</Route>
        <Route path="/checkout/success" component={CheckoutSuccess} />
        <Route path="/portal" component={PortalLogin} />
        <Route path="/portal/dashboard" component={Dashboard} />
        <Route path="/portal/admin" component={Admin} />
        <Route path="/portal/mft" component={MFT} />
        <Route path="/portal/media" component={Media} />
        <Route path="/portal/integrations" component={Integrations} />
        <Route path="/portal/billing" component={Billing} />
        <Route path="/portal/api" component={ApiPortal} />
        <Route path="/portal/reports" component={ReportsPortal} />
        <Route path="/portal/websites" component={WebsitesPortal} />
        <Route path="/grade/:slug" component={GradeEmbed} />
        <Route path="/media" component={PublicMedia} />
        <Route path="/legal/privacy" component={Privacy} />
        <Route path="/legal/terms" component={Terms} />
        <Route path="/legal/cookies" component={Cookies} />
        <Route path="/backup-calculator" component={BackupCalculator} />
        <Route component={NotFound} />
      </Switch>
    </Suspense>
  );
}

function App() {
  useEffect(() => {
    initGA();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <CartProvider>
        <TooltipProvider>
          <ImpersonationBanner />
          <Toaster />
          <Router />
        </TooltipProvider>
      </CartProvider>
    </QueryClientProvider>
  );
}

export default App;
