import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { 
  LayoutDashboard, 
  LogOut, 
  Key,
  Plus,
  Trash2,
  Copy,
  Eye,
  EyeOff,
  BarChart3,
  Clock,
  Package,
  Shield,
  ArrowLeft,
  RefreshCw,
  AlertTriangle
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format, formatDistanceToNow } from "date-fns";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface ApiKey {
  id: string;
  name: string;
  keyPrefix: string;
  lastUsedAt: string | null;
  expiresAt: string | null;
  isActive: number;
  createdAt: string;
}

interface Quota {
  id: string;
  userId: string;
  totalCalls: number;
  usedCalls: number;
  subscriptionCalls: number;
  packCalls: number;
  resetAt: string | null;
  remaining: number;
}

interface CallPack {
  id: string;
  packSize: number;
  callsRemaining: number;
  purchasedAt: string;
}

interface UsageLog {
  id: string;
  endpoint: string;
  method: string;
  statusCode: number;
  responseTimeMs: number;
  calledAt: string;
}

export default function ApiPortal() {
  const [, setLocation] = useLocation();
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("keys");
  const [newKeyName, setNewKeyName] = useState("");
  const [showNewKey, setShowNewKey] = useState<string | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  const { data: keysData, isLoading: keysLoading, refetch: refetchKeys } = useQuery({
    queryKey: ["/api/user/api-keys"],
    queryFn: async () => {
      const res = await fetch("/api/user/api-keys", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch API keys");
      return res.json();
    },
    enabled: isAuthenticated,
  });

  const { data: quotaData, isLoading: quotaLoading, refetch: refetchQuota } = useQuery({
    queryKey: ["/api/user/api-quota"],
    queryFn: async () => {
      const res = await fetch("/api/user/api-quota", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch quota");
      return res.json();
    },
    enabled: isAuthenticated,
  });

  const { data: usageData, isLoading: usageLoading } = useQuery({
    queryKey: ["/api/user/api-usage"],
    queryFn: async () => {
      const res = await fetch("/api/user/api-usage", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch usage");
      return res.json();
    },
    enabled: isAuthenticated,
  });

  const createKeyMutation = useMutation({
    mutationFn: async (name: string) => {
      const res = await fetch("/api/user/api-keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ name }),
      });
      if (!res.ok) throw new Error("Failed to create API key");
      return res.json();
    },
    onSuccess: (data) => {
      setShowNewKey(data.apiKey.fullKey);
      setNewKeyName("");
      refetchKeys();
      toast({ title: "API key created", description: "Make sure to copy it now!" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to create API key", variant: "destructive" });
    },
  });

  const revokeKeyMutation = useMutation({
    mutationFn: async (keyId: string) => {
      const res = await fetch(`/api/user/api-keys/${keyId}/revoke`, {
        method: "POST",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to revoke key");
      return res.json();
    },
    onSuccess: () => {
      refetchKeys();
      toast({ title: "Key revoked" });
    },
  });

  const deleteKeyMutation = useMutation({
    mutationFn: async (keyId: string) => {
      const res = await fetch(`/api/user/api-keys/${keyId}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to delete key");
      return res.json();
    },
    onSuccess: () => {
      refetchKeys();
      toast({ title: "Key deleted" });
    },
  });

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copied to clipboard" });
  };

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Session Required",
        description: "Please sign in to access API management.",
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
          <p className="text-muted-foreground">Loading API management...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const keys: ApiKey[] = keysData?.data || [];
  const quota: Quota | null = quotaData?.quota || null;
  const discount = quotaData?.discount || 0;
  const callPacks: CallPack[] = quotaData?.callPacks || [];
  const usageLogs: UsageLog[] = usageData?.recent || [];
  const usageStats = usageData?.stats || [];

  const usagePercent = quota ? Math.min((quota.usedCalls / quota.totalCalls) * 100, 100) : 0;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setLocation("/")}
                className="text-muted-foreground hover:text-foreground"
                data-testid="link-home"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Site
              </Button>
              <div className="h-6 w-px bg-border" />
              <h1 className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
                API Management
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">
                {user?.email || user?.firstName || "User"}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setLocation("/portal/billing")}
                className="text-muted-foreground hover:text-foreground"
                data-testid="link-billing"
              >
                <LayoutDashboard className="w-4 h-4 mr-2" />
                Billing
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => window.location.href = "/api/logout"}
                className="text-muted-foreground hover:text-foreground"
                data-testid="button-logout"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Quota Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-card border border-border rounded-lg p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-cyan-500/10 rounded-lg">
                  <BarChart3 className="w-5 h-5 text-cyan-400" />
                </div>
                <span className="text-sm text-muted-foreground">Total Calls</span>
              </div>
              <p className="text-2xl font-bold text-foreground">
                {quota?.totalCalls?.toLocaleString() || 0}
              </p>
            </div>

            <div className="bg-card border border-border rounded-lg p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-purple-500/10 rounded-lg">
                  <Clock className="w-5 h-5 text-purple-400" />
                </div>
                <span className="text-sm text-muted-foreground">Used This Period</span>
              </div>
              <p className="text-2xl font-bold text-foreground">
                {quota?.usedCalls?.toLocaleString() || 0}
              </p>
            </div>

            <div className="bg-card border border-border rounded-lg p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-green-500/10 rounded-lg">
                  <Package className="w-5 h-5 text-green-400" />
                </div>
                <span className="text-sm text-muted-foreground">Remaining</span>
              </div>
              <p className="text-2xl font-bold text-green-400">
                {quota?.remaining?.toLocaleString() || 0}
              </p>
            </div>

            <div className="bg-card border border-border rounded-lg p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-orange-500/10 rounded-lg">
                  <Shield className="w-5 h-5 text-orange-400" />
                </div>
                <span className="text-sm text-muted-foreground">Pack Discount</span>
              </div>
              <p className="text-2xl font-bold text-foreground">
                {discount}%
              </p>
            </div>
          </div>

          {/* Usage Bar */}
          {quota && quota.totalCalls > 0 && (
            <div className="bg-card border border-border rounded-lg p-6 mb-8">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-muted-foreground">API Usage</span>
                <span className="text-sm text-muted-foreground">
                  {quota.usedCalls.toLocaleString()} / {quota.totalCalls.toLocaleString()} calls
                </span>
              </div>
              <div className="w-full bg-muted rounded-full h-3">
                <div 
                  className={`h-3 rounded-full transition-all ${
                    usagePercent > 90 ? 'bg-red-500' : 
                    usagePercent > 70 ? 'bg-orange-500' : 
                    'bg-gradient-to-r from-cyan-500 to-purple-500'
                  }`}
                  style={{ width: `${usagePercent}%` }}
                />
              </div>
              {usagePercent > 90 && (
                <p className="text-sm text-orange-400 mt-2 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  You're running low on API calls. Consider purchasing a call pack.
                </p>
              )}
            </div>
          )}

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="bg-muted/50">
              <TabsTrigger value="keys" className="data-[state=active]:bg-background">
                <Key className="w-4 h-4 mr-2" />
                API Keys
              </TabsTrigger>
              <TabsTrigger value="usage" className="data-[state=active]:bg-background">
                <BarChart3 className="w-4 h-4 mr-2" />
                Usage History
              </TabsTrigger>
              <TabsTrigger value="packs" className="data-[state=active]:bg-background">
                <Package className="w-4 h-4 mr-2" />
                Call Packs
              </TabsTrigger>
            </TabsList>

            {/* API Keys Tab */}
            <TabsContent value="keys" className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold">Your API Keys</h2>
                <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm" data-testid="button-create-key">
                      <Plus className="w-4 h-4 mr-2" />
                      Create Key
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create API Key</DialogTitle>
                      <DialogDescription>
                        Give your API key a descriptive name to identify it later.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                      <Label htmlFor="keyName">Key Name</Label>
                      <Input
                        id="keyName"
                        value={newKeyName}
                        onChange={(e) => setNewKeyName(e.target.value)}
                        placeholder="e.g., Production Server"
                        className="mt-2"
                        data-testid="input-key-name"
                      />
                    </div>
                    <DialogFooter>
                      <Button 
                        variant="outline" 
                        onClick={() => setCreateDialogOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button 
                        onClick={() => {
                          createKeyMutation.mutate(newKeyName);
                          setCreateDialogOpen(false);
                        }}
                        disabled={!newKeyName.trim()}
                        data-testid="button-confirm-create-key"
                      >
                        Create Key
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>

              {/* New Key Display Dialog */}
              <Dialog open={!!showNewKey} onOpenChange={() => setShowNewKey(null)}>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-green-400">
                      <Key className="w-5 h-5" />
                      Your New API Key
                    </DialogTitle>
                    <DialogDescription>
                      Copy this key now. You won't be able to see it again!
                    </DialogDescription>
                  </DialogHeader>
                  <div className="py-4">
                    <div className="bg-muted rounded-lg p-4 font-mono text-sm break-all">
                      {showNewKey}
                    </div>
                  </div>
                  <DialogFooter>
                    <Button 
                      onClick={() => {
                        copyToClipboard(showNewKey || '');
                        setShowNewKey(null);
                      }}
                      className="w-full"
                      data-testid="button-copy-new-key"
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      Copy & Close
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              {keysLoading ? (
                <div className="text-center py-8">
                  <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
                </div>
              ) : keys.length === 0 ? (
                <div className="bg-muted/30 rounded-lg p-8 text-center">
                  <Key className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No API keys yet</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Create your first API key to start using the TrifusedAI API
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {keys.map((key) => (
                    <div 
                      key={key.id}
                      className={`bg-card border rounded-lg p-4 ${
                        key.isActive ? 'border-border' : 'border-red-500/30 bg-red-500/5'
                      }`}
                      data-testid={`api-key-${key.id}`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className={`p-2 rounded-lg ${
                            key.isActive ? 'bg-cyan-500/10' : 'bg-red-500/10'
                          }`}>
                            <Key className={`w-5 h-5 ${
                              key.isActive ? 'text-cyan-400' : 'text-red-400'
                            }`} />
                          </div>
                          <div>
                            <p className="font-medium">{key.name}</p>
                            <p className="text-sm text-muted-foreground font-mono">
                              {key.keyPrefix}...
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-6">
                          <div className="text-right text-sm">
                            <p className="text-muted-foreground">
                              Created {format(new Date(key.createdAt), "MMM d, yyyy")}
                            </p>
                            {key.lastUsedAt && (
                              <p className="text-muted-foreground">
                                Last used {formatDistanceToNow(new Date(key.lastUsedAt), { addSuffix: true })}
                              </p>
                            )}
                          </div>
                          <div className="flex gap-2">
                            {key.isActive ? (
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => revokeKeyMutation.mutate(key.id)}
                                data-testid={`button-revoke-${key.id}`}
                              >
                                Revoke
                              </Button>
                            ) : (
                              <span className="text-sm text-red-400 px-3 py-1.5 bg-red-500/10 rounded">
                                Revoked
                              </span>
                            )}
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                                  data-testid={`button-delete-${key.id}`}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete API Key?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    This will permanently delete the API key "{key.name}". 
                                    Any applications using this key will stop working.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => deleteKeyMutation.mutate(key.id)}
                                    className="bg-red-500 hover:bg-red-600"
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Usage History Tab */}
            <TabsContent value="usage" className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold">Recent API Calls</h2>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => queryClient.invalidateQueries({ queryKey: ["/api/user/api-usage"] })}
                  data-testid="button-refresh-usage"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh
                </Button>
              </div>

              {usageLoading ? (
                <div className="text-center py-8">
                  <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
                </div>
              ) : usageLogs.length === 0 ? (
                <div className="bg-muted/30 rounded-lg p-8 text-center">
                  <BarChart3 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No API usage yet</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Start making API calls to see your usage history
                  </p>
                </div>
              ) : (
                <div className="bg-card border border-border rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Endpoint</th>
                        <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Method</th>
                        <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Status</th>
                        <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Time</th>
                        <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {usageLogs.map((log) => (
                        <tr key={log.id} className="hover:bg-muted/20">
                          <td className="px-4 py-3 font-mono text-sm">{log.endpoint}</td>
                          <td className="px-4 py-3">
                            <span className={`text-xs font-medium px-2 py-1 rounded ${
                              log.method === 'GET' ? 'bg-green-500/10 text-green-400' :
                              log.method === 'POST' ? 'bg-blue-500/10 text-blue-400' :
                              'bg-gray-500/10 text-gray-400'
                            }`}>
                              {log.method}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`text-sm ${
                              log.statusCode >= 200 && log.statusCode < 300 ? 'text-green-400' :
                              log.statusCode >= 400 ? 'text-red-400' :
                              'text-yellow-400'
                            }`}>
                              {log.statusCode}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-muted-foreground">
                            {log.responseTimeMs}ms
                          </td>
                          <td className="px-4 py-3 text-sm text-muted-foreground">
                            {formatDistanceToNow(new Date(log.calledAt), { addSuffix: true })}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </TabsContent>

            {/* Call Packs Tab */}
            <TabsContent value="packs" className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold">Your Call Packs</h2>
                <Button 
                  size="sm" 
                  onClick={() => setLocation("/store")}
                  data-testid="button-buy-packs"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Buy More Calls
                </Button>
              </div>

              {callPacks.length === 0 ? (
                <div className="bg-muted/30 rounded-lg p-8 text-center">
                  <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No call packs purchased</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Call packs never expire and are added to your quota
                  </p>
                  {discount > 0 && (
                    <p className="text-sm text-cyan-400 mt-2">
                      Your subscription gives you {discount}% off call packs!
                    </p>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {callPacks.map((pack) => (
                    <div 
                      key={pack.id}
                      className="bg-card border border-border rounded-lg p-6"
                      data-testid={`call-pack-${pack.id}`}
                    >
                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-purple-500/10 rounded-lg">
                          <Package className="w-5 h-5 text-purple-400" />
                        </div>
                        <div>
                          <p className="font-medium">{pack.packSize.toLocaleString()} Calls</p>
                          <p className="text-xs text-muted-foreground">
                            Purchased {format(new Date(pack.purchasedAt), "MMM d, yyyy")}
                          </p>
                        </div>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Remaining</span>
                        <span className="font-medium text-green-400">
                          {pack.callsRemaining.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </motion.div>
      </main>
    </div>
  );
}
