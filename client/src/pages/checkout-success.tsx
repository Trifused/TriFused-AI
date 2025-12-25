import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { CheckCircle, Package, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function CheckoutSuccess() {
  const [, setLocation] = useLocation();
  const [sessionId, setSessionId] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setSessionId(params.get("session_id"));
  }, []);

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

          <div className="flex flex-col gap-3">
            <Button 
              onClick={() => setLocation("/portal/dashboard")}
              className="w-full"
              data-testid="button-go-dashboard"
            >
              Go to Dashboard
              <ArrowRight className="w-4 h-4 ml-2" />
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
        </CardContent>
      </Card>
    </div>
  );
}
