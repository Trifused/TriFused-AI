import { useEffect, useState, useRef } from "react";
import { useLocation } from "wouter";
import { CheckCircle, Package, ArrowRight, LogIn, UserPlus, Loader2, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";

export default function CheckoutSuccess() {
  const [, setLocation] = useLocation();
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [purchaseEmail, setPurchaseEmail] = useState<string | null>(null);
  const [isLinking, setIsLinking] = useState(false);
  const [linkComplete, setLinkComplete] = useState(false);
  const linkAttempted = useRef(false);
  const { user, isLoading, isAuthenticated } = useAuth();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sid = params.get("session_id");
    setSessionId(sid);
    
    // Fetch the purchase email to display to user
    if (sid) {
      fetch(`/api/checkout-session-email?session_id=${encodeURIComponent(sid)}`)
        .then(res => res.json())
        .then(data => {
          if (data.email) {
            setPurchaseEmail(data.email);
          }
        })
        .catch(err => console.error("Failed to fetch purchase email:", err));
    }
  }, []);

  const [linkError, setLinkError] = useState<string | null>(null);

  // Auto-link purchase when user is authenticated and has a session ID
  useEffect(() => {
    if (sessionId && isAuthenticated && !isLoading && !linkAttempted.current && !linkComplete) {
      linkAttempted.current = true;
      setIsLinking(true);
      
      fetch("/api/link-purchase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId }),
        credentials: "include",
      })
        .then(async (response) => {
          if (!response.ok) {
            const data = await response.json().catch(() => ({}));
            throw new Error(data.error || "Failed to link purchase");
          }
          setLinkComplete(true);
        })
        .catch((error) => {
          console.error("Auto-link purchase failed:", error);
          setLinkError(error instanceof Error ? error.message : "Failed to link purchase");
        })
        .finally(() => {
          setIsLinking(false);
        });
    }
  }, [sessionId, isAuthenticated, isLoading, linkComplete]);

  const handleGoToDashboard = () => {
    setLocation("/portal/dashboard");
  };

  const handleLogin = () => {
    const returnUrl = `/checkout/success${sessionId ? `?session_id=${sessionId}` : ''}`;
    window.location.href = `/api/login?returnTo=${encodeURIComponent(returnUrl)}`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-background/95 flex items-center justify-center p-4">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/95 flex items-center justify-center p-4">
      <Card className="max-w-md w-full border-primary/20 bg-card/50 backdrop-blur">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center">
            <CheckCircle className="w-10 h-10 text-green-500" />
          </div>
          <CardTitle className="text-2xl text-foreground">Payment Successful!</CardTitle>
          <CardDescription className="text-muted-foreground">
            Thank you for your purchase
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-muted/50 rounded-lg p-4 space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Package className="w-4 h-4" />
              <span>Your order is being processed</span>
            </div>
            <p className="text-sm text-muted-foreground">
              You will receive a confirmation email shortly with your order details and any digital products.
            </p>
          </div>

          {sessionId && (
            <div className="text-xs text-muted-foreground/60 text-center font-mono">
              Order ID: {sessionId.slice(0, 20)}...
            </div>
          )}

          {!isAuthenticated ? (
            <div className="space-y-4">
              {purchaseEmail && (
                <div className="bg-primary/10 border border-primary/30 rounded-lg p-4">
                  <div className="flex items-center gap-2 justify-center mb-2">
                    <Mail className="w-4 h-4 text-primary" />
                    <span className="text-sm font-medium text-primary">Purchase Email</span>
                  </div>
                  <p className="text-center text-white font-mono text-sm bg-black/20 rounded px-3 py-2" data-testid="text-purchase-email">
                    {purchaseEmail}
                  </p>
                  <p className="text-xs text-muted-foreground text-center mt-2">
                    Sign up with this email to link your purchase automatically
                  </p>
                </div>
              )}
              
              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
                <p className="text-sm text-yellow-200 text-center">
                  Sign in or create an account to access your purchase in the portal
                </p>
              </div>
              
              <Button 
                onClick={handleLogin}
                className="w-full"
                data-testid="button-login-onboard"
              >
                <LogIn className="w-4 h-4 mr-2" />
                Sign In to Continue
              </Button>
              
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-white/10" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">New to TriFused?</span>
                </div>
              </div>
              
              <Button 
                variant="outline"
                onClick={handleLogin}
                className="w-full"
                data-testid="button-signup-onboard"
              >
                <UserPlus className="w-4 h-4 mr-2" />
                Create Account
              </Button>
            </div>
          ) : (
            <>
              <div className={`${linkComplete ? 'bg-green-500/10 border-green-500/30' : isLinking ? 'bg-blue-500/10 border-blue-500/30' : 'bg-green-500/10 border-green-500/30'} border rounded-lg p-3`}>
                <p className={`text-sm text-center ${linkComplete ? 'text-green-200' : isLinking ? 'text-blue-200' : 'text-green-200'}`}>
                  {isLinking ? (
                    <>Linking your purchase to your account...</>
                  ) : linkComplete ? (
                    <>Your purchase has been linked to your account!</>
                  ) : (
                    <>Welcome back, {user?.firstName || user?.email || 'there'}!</>
                  )}
                </p>
              </div>

              <div className="flex flex-col gap-3">
                <Button 
                  onClick={handleGoToDashboard}
                  className="w-full"
                  disabled={isLinking}
                  data-testid="button-go-dashboard"
                >
                  {isLinking ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Linking Purchase...
                    </>
                  ) : (
                    <>
                      Go to Dashboard
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setLocation("/store")}
                  className="w-full"
                  data-testid="button-continue-shopping"
                >
                  Continue Shopping
                </Button>
              </div>
              
              {linkError && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
                  <p className="text-sm text-red-200 text-center">
                    {linkError}. Please try again or contact support.
                  </p>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
