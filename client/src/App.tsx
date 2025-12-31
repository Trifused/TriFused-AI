import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useEffect, lazy, Suspense } from "react";
import { initGA } from "./lib/analytics";
import { useAnalytics } from "./hooks/use-analytics";
import { CartProvider } from "./context/cart-context";
import { HelpProvider } from "./context/help-context";
import { LanguageProvider } from "./context/language-context";
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
const Tokens = lazy(() => import("@/pages/portal/tokens"));
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
const Docs = lazy(() => import("@/pages/docs/index"));
const DocsTutorials = lazy(() => import("@/pages/docs/tutorials"));
const DocsTrustBilling = lazy(() => import("@/pages/docs/trust-billing"));
const DocsTeams = lazy(() => import("@/pages/docs/teams"));
const DocsChangelog = lazy(() => import("@/pages/docs/changelog"));
const DocsScoring = lazy(() => import("@/pages/docs/scoring"));
const Auth = lazy(() => import("@/pages/auth"));
const About = lazy(() => import("@/pages/about"));
const MCP = lazy(() => import("@/pages/mcp"));
const MCPToolbox = lazy(() => import("@/pages/mcp-toolbox"));
const Vibe2A = lazy(() => import("@/pages/vibe2a"));

// Loading fallback for lazy components
const PageLoader = () => (
  <div className="min-h-screen bg-background flex items-center justify-center">
    <div className="animate-pulse text-primary font-mono">Loading...</div>
  </div>
);

function Router() {
  useAnalytics();
  
  // Domain-based routing: serve Vibe2A on vibe2a.com domain
  const isVibe2ADomain = window.location.hostname.includes('vibe2a');
  const HomeOrVibe2A = isVibe2ADomain ? Vibe2A : Home;
  
  return (
    <Suspense fallback={<PageLoader />}>
      <Switch>
        <Route path="/" component={HomeOrVibe2A} />
        <Route path="/blog" component={Blog} />
        <Route path="/signup" component={Signup} />
        <Route path="/auth" component={Auth} />
        <Route path="/grader" component={Grader} />
        <Route path="/report/:shareToken" component={Report} />
        <Route path="/store" component={Store} />
        <Route path="/shop">{() => { window.location.replace('/store'); return null; }}</Route>
        <Route path="/checkout/success" component={CheckoutSuccess} />
        <Route path="/portal" component={PortalLogin} />
        <Route path="/portal/login">{() => { window.location.replace('/portal'); return null; }}</Route>
        <Route path="/portal/signup">{() => { window.location.replace('/signup'); return null; }}</Route>
        <Route path="/portal/dashboard" component={Dashboard} />
        <Route path="/portal/admin" component={Admin} />
        <Route path="/portal/mft" component={MFT} />
        <Route path="/portal/media" component={Media} />
        <Route path="/portal/integrations" component={Integrations} />
        <Route path="/portal/billing" component={Billing} />
        <Route path="/portal/tokens" component={Tokens} />
        <Route path="/portal/api" component={ApiPortal} />
        <Route path="/portal/reports" component={ReportsPortal} />
        <Route path="/portal/websites" component={WebsitesPortal} />
        <Route path="/grade/:slug" component={GradeEmbed} />
        <Route path="/media" component={PublicMedia} />
        <Route path="/privacy" component={Privacy} />
        <Route path="/legal/privacy" component={Privacy} />
        <Route path="/terms" component={Terms} />
        <Route path="/legal/terms" component={Terms} />
        <Route path="/cookies" component={Cookies} />
        <Route path="/legal/cookies" component={Cookies} />
        <Route path="/backup-calculator" component={BackupCalculator} />
        <Route path="/docs" component={Docs} />
        <Route path="/docs/tutorials" component={DocsTutorials} />
        <Route path="/docs/trust-billing" component={DocsTrustBilling} />
        <Route path="/docs/teams" component={DocsTeams} />
        <Route path="/docs/changelog" component={DocsChangelog} />
        <Route path="/docs/scoring" component={DocsScoring} />
        <Route path="/about" component={About} />
        <Route path="/mcp" component={MCP} />
        <Route path="/mcp-toolbox" component={MCPToolbox} />
        <Route path="/vibe2a" component={Vibe2A} />
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
      <LanguageProvider>
        <CartProvider>
          <HelpProvider>
            <TooltipProvider>
              <ImpersonationBanner />
              <Toaster />
              <Router />
            </TooltipProvider>
          </HelpProvider>
        </CartProvider>
      </LanguageProvider>
    </QueryClientProvider>
  );
}

export default App;
