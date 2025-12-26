import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { CheckCircle, Package, ArrowRight, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

export default function CheckoutSuccess() {
  const [, setLocation] = useLocation();
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [termsAccepted, setTermsAccepted] = useState(false);

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

          <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Checkbox 
                id="terms" 
                checked={termsAccepted}
                onCheckedChange={(checked) => setTermsAccepted(checked === true)}
                data-testid="checkbox-accept-terms"
                className="mt-0.5"
              />
              <Label htmlFor="terms" className="text-sm text-muted-foreground leading-relaxed cursor-pointer">
                I agree to the{" "}
                <button 
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    setLocation("/legal/terms");
                  }}
                  className="text-primary hover:underline"
                >
                  Terms of Service
                </button>
                {" "}and{" "}
                <button 
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    setLocation("/legal/privacy");
                  }}
                  className="text-primary hover:underline"
                >
                  Privacy Policy
                </button>
                {" "}for using TriFused services.
              </Label>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <Button 
              onClick={() => setLocation("/portal/dashboard")}
              className="w-full"
              disabled={!termsAccepted}
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
          
          {!termsAccepted && (
            <p className="text-xs text-center text-muted-foreground">
              <FileText className="w-3 h-3 inline mr-1" />
              Please accept the terms to access your dashboard
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
