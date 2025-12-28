import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { 
  Coins,
  Package,
  History,
  ArrowUpRight,
  ArrowDownRight,
  ShoppingCart,
  Sparkles,
  RefreshCw,
  ArrowLeft,
  Check,
  TrendingUp
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface TokenPackage {
  id: string;
  name: string;
  description: string | null;
  tokens: number;
  bonusTokens: number;
  priceUsd: number;
  status: string;
}

interface TokenTransaction {
  id: string;
  userId: string;
  type: string;
  source: string;
  amount: number;
  balanceAfter: number;
  description: string | null;
  referenceId: string | null;
  referenceType: string | null;
  createdAt: string;
}

interface TokenBalance {
  balance: number;
  totalEarned: number;
  totalSpent: number;
}

export default function Tokens() {
  const [, setLocation] = useLocation();
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("balance");

  const urlParams = new URLSearchParams(window.location.search);
  const purchaseSuccess = urlParams.get('success') === 'true';
  const purchaseCanceled = urlParams.get('canceled') === 'true';

  useEffect(() => {
    if (purchaseSuccess) {
      toast({
        title: "Purchase Successful!",
        description: "Your tokens have been added to your wallet.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/tokens/balance"] });
      queryClient.invalidateQueries({ queryKey: ["/api/tokens/transactions"] });
      window.history.replaceState({}, '', '/portal/tokens');
    }
    if (purchaseCanceled) {
      toast({
        title: "Purchase Canceled",
        description: "Your purchase was canceled. No charges were made.",
        variant: "destructive",
      });
      window.history.replaceState({}, '', '/portal/tokens');
    }
  }, [purchaseSuccess, purchaseCanceled, toast, queryClient]);

  const { data: balanceData, isLoading: balanceLoading } = useQuery<TokenBalance>({
    queryKey: ["/api/tokens/balance"],
    queryFn: async () => {
      const res = await fetch("/api/tokens/balance", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch balance");
      return res.json();
    },
    enabled: isAuthenticated,
  });

  const { data: packagesData, isLoading: packagesLoading } = useQuery<TokenPackage[]>({
    queryKey: ["/api/tokens/packages"],
    queryFn: async () => {
      const res = await fetch("/api/tokens/packages", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch packages");
      return res.json();
    },
    enabled: isAuthenticated,
  });

  const { data: transactionsData, isLoading: transactionsLoading } = useQuery<TokenTransaction[]>({
    queryKey: ["/api/tokens/transactions"],
    queryFn: async () => {
      const res = await fetch("/api/tokens/transactions", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch transactions");
      return res.json();
    },
    enabled: isAuthenticated,
  });

  const purchaseMutation = useMutation({
    mutationFn: async (packageId: string) => {
      const res = await fetch("/api/tokens/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ packageId }),
        credentials: "include",
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to start checkout");
      }
      return res.json();
    },
    onSuccess: (data) => {
      if (data.url) {
        window.location.href = data.url;
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Checkout Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Session Required",
        description: "Please sign in to access your token wallet.",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
    }
  }, [isAuthenticated, isLoading, toast]);

  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-cyan-950 flex items-center justify-center">
        <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin" />
      </div>
    );
  }

  const balance = balanceData?.balance ?? 0;
  const packages = packagesData || [];
  const transactions = transactionsData || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-cyan-950">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setLocation("/portal/dashboard")}
                className="text-slate-400 hover:text-white"
                data-testid="button-back-dashboard"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                  <Coins className="w-8 h-8 text-yellow-400" />
                  Token Wallet
                </h1>
                <p className="text-slate-400 mt-1">
                  Purchase and manage your tokens for premium features
                </p>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 rounded-xl p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <Coins className="w-10 h-10 text-yellow-400" />
                <span className="text-xs text-yellow-400 bg-yellow-400/10 px-2 py-1 rounded">Current Balance</span>
              </div>
              <p className="text-4xl font-bold text-white" data-testid="text-token-balance">{balance.toLocaleString()}</p>
              <p className="text-slate-400 text-sm mt-1">tokens available</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-slate-800/50 border border-slate-700 rounded-xl p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <TrendingUp className="w-10 h-10 text-green-400" />
                <span className="text-xs text-green-400 bg-green-400/10 px-2 py-1 rounded">Total Earned</span>
              </div>
              <p className="text-4xl font-bold text-white" data-testid="text-total-earned">{(balanceData?.totalEarned || 0).toLocaleString()}</p>
              <p className="text-slate-400 text-sm mt-1">tokens lifetime</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-slate-800/50 border border-slate-700 rounded-xl p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <Sparkles className="w-10 h-10 text-purple-400" />
                <span className="text-xs text-purple-400 bg-purple-400/10 px-2 py-1 rounded">Total Spent</span>
              </div>
              <p className="text-4xl font-bold text-white" data-testid="text-total-spent">{(balanceData?.totalSpent || 0).toLocaleString()}</p>
              <p className="text-slate-400 text-sm mt-1">tokens used</p>
            </motion.div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="bg-slate-800/50 border border-slate-700 p-1">
              <TabsTrigger value="balance" className="data-[state=active]:bg-cyan-600" data-testid="tab-packages">
                <Package className="w-4 h-4 mr-2" />
                Buy Tokens
              </TabsTrigger>
              <TabsTrigger value="history" className="data-[state=active]:bg-cyan-600" data-testid="tab-history">
                <History className="w-4 h-4 mr-2" />
                Transaction History
              </TabsTrigger>
            </TabsList>

            <TabsContent value="balance" className="mt-6">
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                {packagesLoading ? (
                  <div className="col-span-full flex justify-center py-8">
                    <RefreshCw className="w-6 h-6 text-cyan-400 animate-spin" />
                  </div>
                ) : packages.length === 0 ? (
                  <div className="col-span-full text-center py-8 text-slate-400">
                    No token packages available at this time.
                  </div>
                ) : (
                  packages.map((pkg, index) => (
                    <motion.div
                      key={pkg.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={`relative bg-slate-800/50 border rounded-xl p-6 ${
                        index === 1 ? 'border-cyan-500 ring-2 ring-cyan-500/20' : 'border-slate-700'
                      }`}
                      data-testid={`card-package-${pkg.id}`}
                    >
                      {index === 1 && (
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-cyan-500 text-white text-xs px-3 py-1 rounded-full font-medium">
                          Most Popular
                        </div>
                      )}
                      <h3 className="text-lg font-semibold text-white mb-2">{pkg.name}</h3>
                      <p className="text-slate-400 text-sm mb-4 h-10">{pkg.description}</p>
                      
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center gap-2">
                          <Coins className="w-4 h-4 text-yellow-400" />
                          <span className="text-white font-medium">{pkg.tokens.toLocaleString()} tokens</span>
                        </div>
                        {pkg.bonusTokens > 0 && (
                          <div className="flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-purple-400" />
                            <span className="text-purple-400 font-medium">+{pkg.bonusTokens.toLocaleString()} bonus</span>
                          </div>
                        )}
                      </div>

                      <div className="mb-4">
                        <span className="text-3xl font-bold text-white">${(pkg.priceUsd / 100).toFixed(2)}</span>
                        <span className="text-slate-400 text-sm ml-1">USD</span>
                      </div>

                      <Button
                        onClick={() => purchaseMutation.mutate(pkg.id)}
                        disabled={purchaseMutation.isPending}
                        className={`w-full ${
                          index === 1 
                            ? 'bg-cyan-600 hover:bg-cyan-700' 
                            : 'bg-slate-700 hover:bg-slate-600'
                        }`}
                        data-testid={`button-buy-${pkg.id}`}
                      >
                        {purchaseMutation.isPending ? (
                          <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <ShoppingCart className="w-4 h-4 mr-2" />
                        )}
                        Buy Now
                      </Button>
                    </motion.div>
                  ))
                )}
              </div>
            </TabsContent>

            <TabsContent value="history" className="mt-6">
              <div className="bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden">
                {transactionsLoading ? (
                  <div className="flex justify-center py-8">
                    <RefreshCw className="w-6 h-6 text-cyan-400 animate-spin" />
                  </div>
                ) : transactions.length === 0 ? (
                  <div className="text-center py-12 text-slate-400">
                    <History className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No transactions yet</p>
                    <p className="text-sm mt-1">Purchase tokens to get started</p>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-700">
                    {transactions.map((tx) => (
                      <div key={tx.id} className="flex items-center justify-between p-4 hover:bg-slate-700/30 transition-colors" data-testid={`row-transaction-${tx.id}`}>
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            tx.type === 'credit' || tx.type === 'bonus' || tx.type === 'adjustment' && tx.amount > 0
                              ? 'bg-green-500/20 text-green-400'
                              : 'bg-red-500/20 text-red-400'
                          }`}>
                            {tx.amount > 0 ? (
                              <ArrowDownRight className="w-5 h-5" />
                            ) : (
                              <ArrowUpRight className="w-5 h-5" />
                            )}
                          </div>
                          <div>
                            <p className="text-white font-medium">{tx.description || tx.type}</p>
                            <p className="text-slate-400 text-sm">
                              {format(new Date(tx.createdAt), "MMM d, yyyy 'at' h:mm a")}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`font-bold ${tx.amount > 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {tx.amount > 0 ? '+' : ''}{tx.amount.toLocaleString()}
                          </p>
                          <p className="text-slate-400 text-sm">
                            Balance: {tx.balanceAfter.toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
}
