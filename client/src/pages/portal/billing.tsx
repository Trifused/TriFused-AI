import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { TermsModal } from "@/components/terms-modal";
import { 
  LayoutDashboard, 
  LogOut, 
  CreditCard,
  Receipt,
  RefreshCw,
  ExternalLink,
  Package,
  Clock,
  ShoppingBag,
  ArrowLeft
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation } from "@tanstack/react-query";
import { format } from "date-fns";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Order {
  session_id: string;
  payment_status: string | null;
  session_status: string | null;
  amount_total: number | null;
  currency: string | null;
  mode: string | null;
  created: number | null;
  refunded: boolean | null;
}

interface Subscription {
  subscription_id: string;
  status: string | null;
  current_period_start: number | null;
  current_period_end: number | null;
  cancel_at_period_end: boolean | null;
  canceled_at: number | null;
  created: number | null;
  product_name: string | null;
  product_description: string | null;
  unit_amount: number | null;
  currency: string | null;
  recurring: any;
}

export default function Billing() {
  const [, setLocation] = useLocation();
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("purchases");

  const { data: ordersData, isLoading: ordersLoading } = useQuery({
    queryKey: ["/api/stripe/orders"],
    queryFn: async () => {
      const res = await fetch("/api/stripe/orders", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch orders");
      return res.json();
    },
    enabled: isAuthenticated,
  });

  const { data: subscriptionsData, isLoading: subsLoading } = useQuery({
    queryKey: ["/api/stripe/subscriptions"],
    queryFn: async () => {
      const res = await fetch("/api/stripe/subscriptions", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch subscriptions");
      return res.json();
    },
    enabled: isAuthenticated,
  });

  const { data: quotaData } = useQuery({
    queryKey: ["/api/user/api-quota"],
    queryFn: async () => {
      const res = await fetch("/api/user/api-quota", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch quota");
      return res.json();
    },
    enabled: isAuthenticated,
  });

  const quota = quotaData?.quota || null;

  const portalMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/stripe/portal", {
        method: "POST",
        credentials: "include",
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to open billing portal");
      }
      return res.json();
    },
    onSuccess: (data) => {
      window.location.href = data.url;
    },
    onError: (error: Error) => {
      toast({
        title: "Cannot open billing portal",
        description: error.message === "No Stripe customer found" 
          ? "You need to make a purchase first to access billing management."
          : error.message,
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Session Required",
        description: "Please sign in to access billing.",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
    }
  }, [isAuthenticated, isLoading, toast]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading billing...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const needsTermsAcceptance = !user?.termsAcceptedAt;

  const orders = ordersData?.data || [];
  const subscriptions = subscriptionsData?.data || [];
  const hasStripeCustomer = user?.stripeCustomerId;

  return (
    <div className="min-h-screen bg-background">
      <TermsModal isOpen={needsTermsAcceptance} userTermsVersion={user?.termsVersion} />
      <header className="border-b border-white/10 bg-black/20 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setLocation("/portal/dashboard")}
                className="text-muted-foreground hover:text-white"
                data-testid="btn-back-dashboard"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Dashboard
              </Button>
              <div className="h-6 w-px bg-white/20" />
              <h1 className="text-xl font-semibold text-white flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-primary" />
                Billing & Purchases
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setLocation("/store")}
                className="border-primary/50 text-primary hover:bg-primary/10"
                data-testid="btn-store"
              >
                <ShoppingBag className="w-4 h-4 mr-2" />
                Shop
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => (window.location.href = "/api/logout")}
                className="text-muted-foreground hover:text-white"
                data-testid="btn-logout"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="mb-8">
            <p className="text-muted-foreground">
              View your purchase history, manage subscriptions, and update payment methods.
            </p>
          </div>

          {hasStripeCustomer && (
            <div className="mb-6 p-4 bg-gradient-to-r from-primary/10 to-cyan-500/10 rounded-lg border border-primary/30">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-white">Manage Your Account</h3>
                  <p className="text-sm text-muted-foreground">
                    Update payment methods, view invoices, and manage subscriptions
                  </p>
                </div>
                <Button
                  onClick={() => portalMutation.mutate()}
                  disabled={portalMutation.isPending}
                  className="bg-primary hover:bg-primary/90"
                  data-testid="btn-stripe-portal"
                >
                  {portalMutation.isPending ? (
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <ExternalLink className="w-4 h-4 mr-2" />
                  )}
                  Open Billing Portal
                </Button>
              </div>
            </div>
          )}

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="bg-white/5 border border-white/10">
              <TabsTrigger 
                value="purchases" 
                className="data-[state=active]:bg-primary"
                data-testid="tab-purchases"
              >
                <Receipt className="w-4 h-4 mr-2" />
                Purchases
              </TabsTrigger>
              <TabsTrigger 
                value="subscriptions" 
                className="data-[state=active]:bg-primary"
                data-testid="tab-subscriptions"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Subscriptions
              </TabsTrigger>
            </TabsList>

            <TabsContent value="purchases">
              {ordersLoading ? (
                <div className="py-12 text-center">
                  <Clock className="w-8 h-8 animate-spin mx-auto text-primary mb-4" />
                  <p className="text-muted-foreground">Loading purchases...</p>
                </div>
              ) : orders.length === 0 ? (
                <div className="py-12 text-center">
                  <Receipt className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-white text-lg">No purchases yet</p>
                  <p className="text-muted-foreground text-sm mt-2 mb-6">
                    Visit our store to explore available products and services.
                  </p>
                  <Button
                    onClick={() => setLocation("/store")}
                    className="bg-primary hover:bg-primary/90"
                    data-testid="btn-shop-empty"
                  >
                    <ShoppingBag className="w-4 h-4 mr-2" />
                    Browse Store
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {orders.map((order: Order) => (
                    <div
                      key={order.session_id}
                      className="p-4 bg-white/5 rounded-lg border border-white/10 hover:border-white/20 transition-colors"
                      data-testid={`order-${order.session_id}`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            <Package className="w-5 h-5 text-primary" />
                            <span className="font-medium text-white">
                              {order.mode === 'subscription' ? 'Subscription Payment' : 'One-time Purchase'}
                            </span>
                            <span className={`text-xs px-2 py-0.5 rounded ${
                              order.payment_status === 'paid' ? 'bg-green-500/20 text-green-400' :
                              order.payment_status === 'unpaid' ? 'bg-yellow-500/20 text-yellow-400' :
                              'bg-gray-500/20 text-gray-400'
                            }`}>
                              {order.payment_status === 'paid' ? 'Completed' : order.payment_status || 'Unknown'}
                            </span>
                            {order.refunded && (
                              <span className="text-xs px-2 py-0.5 rounded bg-red-500/20 text-red-400">
                                Refunded
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                            <span className="text-white font-medium">
                              {order.amount_total ? `$${(order.amount_total / 100).toFixed(2)}` : '-'}
                            </span>
                            <span>
                              {order.created ? format(new Date(order.created * 1000), 'MMM d, yyyy') : '-'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="subscriptions">
              {subsLoading ? (
                <div className="py-12 text-center">
                  <Clock className="w-8 h-8 animate-spin mx-auto text-primary mb-4" />
                  <p className="text-muted-foreground">Loading subscriptions...</p>
                </div>
              ) : subscriptions.length === 0 ? (
                <div className="py-12 text-center">
                  <RefreshCw className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-white text-lg">No active subscriptions</p>
                  <p className="text-muted-foreground text-sm mt-2 mb-6">
                    Subscribe to unlock premium features and ongoing benefits.
                  </p>
                  <Button
                    onClick={() => setLocation("/store")}
                    className="bg-primary hover:bg-primary/90"
                    data-testid="btn-subscribe-empty"
                  >
                    <ShoppingBag className="w-4 h-4 mr-2" />
                    View Plans
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {subscriptions.map((sub: Subscription) => (
                    <div
                      key={sub.subscription_id}
                      className="p-4 bg-white/5 rounded-lg border border-white/10 hover:border-white/20 transition-colors"
                      data-testid={`subscription-${sub.subscription_id}`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            <RefreshCw className="w-5 h-5 text-purple-400" />
                            <span className="font-medium text-white">
                              {sub.product_name || 'Subscription'}
                            </span>
                            <span className={`text-xs px-2 py-0.5 rounded ${
                              sub.status === 'active' ? 'bg-green-500/20 text-green-400' :
                              sub.status === 'canceled' ? 'bg-red-500/20 text-red-400' :
                              sub.status === 'past_due' ? 'bg-yellow-500/20 text-yellow-400' :
                              'bg-gray-500/20 text-gray-400'
                            }`}>
                              {sub.status || 'Unknown'}
                            </span>
                            {sub.cancel_at_period_end && (
                              <span className="text-xs px-2 py-0.5 rounded bg-orange-500/20 text-orange-400">
                                Cancels at period end
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            {sub.product_description}
                          </p>
                          <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                            <span className="text-white">
                              {sub.unit_amount ? `$${(sub.unit_amount / 100).toFixed(2)}` : '-'}
                              {sub.recurring?.interval && ` / ${sub.recurring.interval}`}
                            </span>
                            {sub.current_period_end && (
                              <span>
                                {sub.status === 'active' ? 'Renews' : 'Ends'}: {format(new Date(sub.current_period_end * 1000), 'MMM d, yyyy')}
                              </span>
                            )}
                          </div>
                          {quota && quota.totalCalls > 0 && sub.status === 'active' && (
                            <div className="mt-3 flex items-center gap-3">
                              <div className="flex-1 max-w-xs">
                                <div className="flex items-center justify-between text-xs mb-1">
                                  <span className="text-muted-foreground">API Usage</span>
                                  <span className={`font-mono ${
                                    quota.usedCalls / quota.totalCalls > 0.9 ? 'text-red-400' :
                                    quota.usedCalls / quota.totalCalls > 0.7 ? 'text-orange-400' :
                                    'text-cyan-400'
                                  }`}>
                                    {quota.usedCalls.toLocaleString()} / {quota.totalCalls >= 1000 ? `${(quota.totalCalls / 1000).toFixed(0)}K` : quota.totalCalls}
                                  </span>
                                </div>
                                <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                                  <div 
                                    className={`h-full rounded-full transition-all ${
                                      quota.usedCalls / quota.totalCalls > 0.9 ? 'bg-red-500' :
                                      quota.usedCalls / quota.totalCalls > 0.7 ? 'bg-orange-500' :
                                      'bg-cyan-500'
                                    }`}
                                    style={{ width: `${Math.min((quota.usedCalls / quota.totalCalls) * 100, 100)}%` }}
                                  />
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                        {sub.status === 'active' && hasStripeCustomer && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => portalMutation.mutate()}
                            disabled={portalMutation.isPending}
                            className="border-white/20 hover:border-white/40"
                            data-testid={`btn-manage-${sub.subscription_id}`}
                          >
                            Manage
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>

          <div className="mt-8 p-4 bg-cyan-500/10 border border-cyan-500/30 rounded-lg">
            <p className="text-sm text-cyan-400">
              <CreditCard className="w-4 h-4 inline mr-2" />
              Need help with a purchase? Contact our support team for assistance with orders, refunds, or billing questions.
            </p>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
