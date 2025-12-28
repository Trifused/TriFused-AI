import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { TermsModal } from "@/components/terms-modal";
import { 
  LogOut, 
  Globe,
  Plus,
  Trash2,
  ArrowLeft,
  ExternalLink,
  Clock,
  BarChart3,
  CheckCircle,
  Loader2,
  Search,
  Key,
  FileText,
  History,
  Copy,
  Code,
  Play,
  Terminal,
  AlertTriangle,
  Mail
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation } from "@tanstack/react-query";
import { formatDistanceToNow, format } from "date-fns";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
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

interface UserWebsite {
  id: string;
  userId: string;
  url: string;
  name: string | null;
  lastScannedAt: string | null;
  lastGradeId: string | null;
  lastShareToken: string | null;
  lastScore: number | null;
  scanCount: number;
  isActive: number;
  createdAt: string;
}

interface WebsiteGrade {
  id: string;
  url: string;
  overallScore: number;
  shareToken: string | null;
  createdAt: string;
}

function getGradeLetter(score: number): string {
  if (score >= 90) return "A";
  if (score >= 80) return "B";
  if (score >= 70) return "C";
  if (score >= 60) return "D";
  return "F";
}

function getGradeColor(score: number): string {
  if (score >= 90) return "text-green-400";
  if (score >= 80) return "text-cyan-400";
  if (score >= 70) return "text-yellow-400";
  if (score >= 60) return "text-orange-400";
  return "text-red-400";
}

function getGradeBg(score: number): string {
  if (score >= 90) return "bg-green-500/20";
  if (score >= 80) return "bg-cyan-500/20";
  if (score >= 70) return "bg-yellow-500/20";
  if (score >= 60) return "bg-orange-500/20";
  return "bg-red-500/20";
}

export default function WebsitesPortal() {
  const [, setLocation] = useLocation();
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [newUrl, setNewUrl] = useState("");
  const [newName, setNewName] = useState("");
  const [scanningId, setScanningId] = useState<string | null>(null);
  const [sendingReportId, setSendingReportId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("websites");
  const [testUrl, setTestUrl] = useState("");
  const [testApiKey, setTestApiKey] = useState("");
  const [testManualKey, setTestManualKey] = useState("");
  const [testThreshold, setTestThreshold] = useState("70");
  
  const [testResult, setTestResult] = useState<any>(null);
  const [testError, setTestError] = useState<string | null>(null);

  const { data: websitesData, isLoading: websitesLoading, refetch: refetchWebsites } = useQuery({
    queryKey: ["/api/user/websites"],
    queryFn: async () => {
      const res = await fetch("/api/user/websites", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch websites");
      return res.json();
    },
    enabled: isAuthenticated,
  });

  const { data: scansData, isLoading: scansLoading } = useQuery({
    queryKey: ["/api/user/scans"],
    queryFn: async () => {
      const res = await fetch("/api/user/scans", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch scans");
      return res.json();
    },
    enabled: isAuthenticated && activeTab === "history",
  });

  const { data: apiUsageData, isLoading: apiUsageLoading } = useQuery({
    queryKey: ["/api/user/api-usage"],
    queryFn: async () => {
      const res = await fetch("/api/user/api-usage", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch API usage");
      return res.json();
    },
    enabled: isAuthenticated && activeTab === "history",
  });

  const { data: apiKeysData } = useQuery({
    queryKey: ["/api/user/api-keys"],
    queryFn: async () => {
      const res = await fetch("/api/user/api-keys", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch API keys");
      return res.json();
    },
    enabled: isAuthenticated && activeTab === "test-api",
  });

  const apiKeys = apiKeysData?.data || [];

  const addWebsiteMutation = useMutation({
    mutationFn: async ({ url, name }: { url: string; name: string }) => {
      const res = await fetch("/api/user/websites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ url, name: name || undefined }),
      });
      if (!res.ok) throw new Error("Failed to add website");
      return res.json();
    },
    onSuccess: () => {
      setNewUrl("");
      setNewName("");
      setAddDialogOpen(false);
      refetchWebsites();
      toast({ title: "Website added", description: "You can now run scans on this website." });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to add website", variant: "destructive" });
    },
  });

  const deleteWebsiteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/user/websites/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to delete website");
      return res.json();
    },
    onSuccess: () => {
      refetchWebsites();
      toast({ title: "Website removed" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to delete website", variant: "destructive" });
    },
  });

  const scanWebsiteMutation = useMutation({
    mutationFn: async (id: string) => {
      setScanningId(id);
      const res = await fetch(`/api/user/websites/${id}/scan`, {
        method: "POST",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to scan website");
      return res.json();
    },
    onSuccess: (data) => {
      setScanningId(null);
      refetchWebsites();
      toast({ 
        title: "Scan completed", 
        description: `Score: ${data.data.overallScore}/100 (${getGradeLetter(data.data.overallScore)})` 
      });
    },
    onError: () => {
      setScanningId(null);
      toast({ title: "Error", description: "Failed to scan website", variant: "destructive" });
    },
  });

  const sendReportMutation = useMutation({
    mutationFn: async (id: string) => {
      setSendingReportId(id);
      const res = await fetch(`/api/user/websites/${id}/send-report`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to send report");
      }
      return res.json();
    },
    onSuccess: () => {
      setSendingReportId(null);
      toast({ 
        title: "Report Sent", 
        description: "Website report card has been emailed to you." 
      });
    },
    onError: (error: Error) => {
      setSendingReportId(null);
      toast({ 
        title: "Error", 
        description: error.message || "Failed to send report", 
        variant: "destructive" 
      });
    },
  });

  const testApiMutation = useMutation({
    mutationFn: async ({ url, threshold, apiKeyId, manualKey }: { url: string; threshold: number; apiKeyId?: string; manualKey?: string }) => {
      setTestResult(null);
      setTestError(null);
      
      // If manual key provided, use the actual /api/v1/score endpoint with X-API-Key header
      if (manualKey) {
        const res = await fetch(`/api/v1/score?url=${encodeURIComponent(url)}&threshold=${threshold}`, {
          method: "GET",
          headers: { "X-API-Key": manualKey },
        });
        const data = await res.json();
        return { data: { ...data, _usedManualKey: true }, status: res.status, ok: res.ok };
      }
      
      // Otherwise use the test-score endpoint with session auth + optional apiKeyId
      const res = await fetch("/api/v1/test-score", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, threshold, apiKeyId: apiKeyId || undefined }),
      });
      const data = await res.json();
      return { data, status: res.status, ok: res.ok };
    },
    onSuccess: ({ data, status, ok }) => {
      setTestResult({ ...data, _httpStatus: status, _passed: ok });
    },
    onError: (error: Error) => {
      setTestError(error.message || "Failed to run API test");
    },
  });

  const websites: UserWebsite[] = websitesData?.data || [];
  const scans: WebsiteGrade[] = scansData?.data || [];
  const apiUsageLogs: any[] = apiUsageData?.recent || [];
  
  // Merge scans and API usage into unified history
  const mergedHistory = [
    ...scans.map(scan => ({
      id: scan.id,
      type: 'scan' as const,
      url: scan.url,
      score: scan.overallScore,
      shareToken: scan.shareToken,
      createdAt: new Date(scan.createdAt),
    })),
    ...apiUsageLogs.map(log => ({
      id: log.id,
      type: 'api_call' as const,
      url: log.metadata?.url || log.endpoint,
      score: log.metadata?.score || null,
      shareToken: log.metadata?.shareToken || null,
      createdAt: new Date(log.calledAt),
      statusCode: log.statusCode,
      responseTime: log.responseTimeMs,
      method: log.method,
      endpoint: log.endpoint,
    })),
  ].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Session Required",
        description: "Please sign in to access your websites.",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
    }
  }, [isAuthenticated, isLoading, toast]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const needsTermsAcceptance = !user?.termsAcceptedAt;

  const handleAddWebsite = () => {
    if (!newUrl) {
      toast({ title: "Error", description: "URL is required", variant: "destructive" });
      return;
    }
    let url = newUrl.trim();
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      url = "https://" + url;
    }
    addWebsiteMutation.mutate({ url, name: newName.trim() });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copied to clipboard" });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
      <TermsModal isOpen={needsTermsAcceptance} userTermsVersion={user?.termsVersion} />
      <header className="border-b border-white/10 bg-slate-900/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
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
            <div className="flex items-center gap-2">
              <Globe className="w-5 h-5 text-cyan-400" />
              <h1 className="text-xl font-semibold text-white">My Websites</h1>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              {user?.firstName} {user?.lastName}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => window.location.href = "/api/logout"}
              className="text-muted-foreground hover:text-white"
              data-testid="btn-logout"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-5 bg-white/5 border border-white/10">
              <TabsTrigger value="websites" className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400">
                <Globe className="w-4 h-4 mr-2" />
                Websites
              </TabsTrigger>
              <TabsTrigger value="history" className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400">
                <History className="w-4 h-4 mr-2" />
                Scan History
              </TabsTrigger>
              <TabsTrigger value="api-keys" className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400">
                <Key className="w-4 h-4 mr-2" />
                API Keys
              </TabsTrigger>
              <TabsTrigger value="api-docs" className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400">
                <FileText className="w-4 h-4 mr-2" />
                API Docs
              </TabsTrigger>
              <TabsTrigger value="test-api" className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-400">
                <Terminal className="w-4 h-4 mr-2" />
                Test API
              </TabsTrigger>
            </TabsList>

            <TabsContent value="websites" className="mt-6 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground">
                    Add your websites and run scans to track their performance and security.
                  </p>
                </div>
                <Button
                  onClick={() => setAddDialogOpen(true)}
                  className="bg-cyan-500 hover:bg-cyan-600"
                  data-testid="btn-add-website"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Website
                </Button>
              </div>

              {websitesLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
                </div>
              ) : websites.length === 0 ? (
                <div className="text-center py-16 bg-white/5 rounded-xl border border-white/10">
                  <Globe className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <h3 className="text-lg font-medium text-white mb-2">No websites added yet</h3>
                  <p className="text-muted-foreground mb-6">
                    Add your first website to start tracking its performance and security score.
                  </p>
                  <Button
                    onClick={() => setAddDialogOpen(true)}
                    className="bg-cyan-500 hover:bg-cyan-600"
                    data-testid="btn-add-first-website"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Your First Website
                  </Button>
                </div>
              ) : (
                <div className="grid gap-4">
                  {websites.map((website) => (
                    <motion.div
                      key={website.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-6 bg-white/5 rounded-xl border border-white/10 hover:border-cyan-500/30 transition-colors"
                      data-testid={`website-card-${website.id}`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <Globe className="w-5 h-5 text-cyan-400" />
                            <h3 className="font-medium text-white text-lg">
                              {website.name || new URL(website.url).hostname}
                            </h3>
                            {website.lastScore !== null && (
                              <span className={`px-3 py-1 rounded-full text-sm font-bold ${getGradeBg(website.lastScore)} ${getGradeColor(website.lastScore)}`}>
                                {getGradeLetter(website.lastScore)} ({website.lastScore})
                              </span>
                            )}
                          </div>
                          
                          <a
                            href={website.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-cyan-400 hover:text-cyan-300 text-sm flex items-center gap-1 mb-3"
                            data-testid={`link-website-${website.id}`}
                          >
                            {website.url}
                            <ExternalLink className="w-3 h-3" />
                          </a>

                          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <BarChart3 className="w-4 h-4" />
                              {website.scanCount} scans
                            </span>
                            {website.lastScannedAt && (
                              <span className="flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                Last scanned {formatDistanceToNow(new Date(website.lastScannedAt), { addSuffix: true })}
                              </span>
                            )}
                            <span className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              Added {formatDistanceToNow(new Date(website.createdAt), { addSuffix: true })}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => scanWebsiteMutation.mutate(website.id)}
                            disabled={scanningId === website.id}
                            className="border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/10"
                            data-testid={`btn-scan-${website.id}`}
                          >
                            {scanningId === website.id ? (
                              <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Scanning...
                              </>
                            ) : (
                              <>
                                <Search className="w-4 h-4 mr-2" />
                                Run Scan
                              </>
                            )}
                          </Button>

                          {website.lastShareToken && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setLocation(`/report/${website.lastShareToken}`)}
                              className="text-muted-foreground hover:text-white"
                              data-testid={`btn-view-report-${website.id}`}
                            >
                              <ExternalLink className="w-4 h-4" />
                            </Button>
                          )}

                          {website.lastScore !== null && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => sendReportMutation.mutate(website.id)}
                              disabled={sendingReportId === website.id}
                              className="border-purple-500/50 text-purple-400 hover:bg-purple-500/10"
                              data-testid={`btn-send-report-${website.id}`}
                              title="Email report card to yourself"
                            >
                              {sendingReportId === website.id ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <Mail className="w-4 h-4" />
                              )}
                            </Button>
                          )}

                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                                data-testid={`btn-delete-${website.id}`}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="bg-slate-900 border-white/10">
                              <AlertDialogHeader>
                                <AlertDialogTitle className="text-white">Remove Website?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This will remove the website from your tracking list. Your scan history will still be accessible.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel className="bg-transparent border-white/10 text-white hover:bg-white/5">
                                  Cancel
                                </AlertDialogCancel>
                                <AlertDialogAction
                                  className="bg-red-500 hover:bg-red-600"
                                  onClick={() => deleteWebsiteMutation.mutate(website.id)}
                                  data-testid={`btn-confirm-delete-${website.id}`}
                                >
                                  Remove
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="history" className="mt-6 space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-white mb-2">Scan History</h2>
                <p className="text-muted-foreground">View all your past website scans and API calls.</p>
              </div>

              {(scansLoading || apiUsageLoading) ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
                </div>
              ) : mergedHistory.length === 0 ? (
                <div className="text-center py-16 bg-white/5 rounded-xl border border-white/10">
                  <History className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <h3 className="text-lg font-medium text-white mb-2">No history yet</h3>
                  <p className="text-muted-foreground">
                    Run scans on your websites or make API calls to build your history.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {mergedHistory.map((item) => (
                    <div
                      key={item.id}
                      className="p-4 bg-white/5 rounded-lg border border-white/10 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-4">
                        {item.type === 'scan' ? (
                          <span className={`px-3 py-1 rounded-full text-sm font-bold ${getGradeBg(item.score!)} ${getGradeColor(item.score!)}`}>
                            {getGradeLetter(item.score!)}
                          </span>
                        ) : item.score ? (
                          <span className={`px-3 py-1 rounded-full text-sm font-bold ${getGradeBg(item.score)} ${getGradeColor(item.score)}`}>
                            {getGradeLetter(item.score)}
                          </span>
                        ) : (
                          <span className={`px-3 py-1 rounded-full text-sm font-bold ${item.statusCode === 200 ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                            API
                          </span>
                        )}
                        <div>
                          {item.type === 'scan' ? (
                            <>
                              <p className="text-white font-medium">{new URL(item.url).hostname}</p>
                              <p className="text-sm text-muted-foreground">
                                Score: {item.score}/100 • {format(item.createdAt, "MMM d, yyyy h:mm a")}
                              </p>
                            </>
                          ) : (
                            <>
                              <p className="text-white font-medium">
                                {item.url?.startsWith('http') ? new URL(item.url).hostname : item.url}
                                <span className="text-xs text-muted-foreground ml-2 font-mono">{item.endpoint}</span>
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {item.score ? `Score: ${item.score}/100 • ` : ''}Status: {item.statusCode} • {item.responseTime}ms • {format(item.createdAt, "MMM d, yyyy h:mm a")}
                              </p>
                            </>
                          )}
                        </div>
                      </div>
                      {item.shareToken && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setLocation(`/report/${item.shareToken}`)}
                          className="border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/10"
                        >
                          <ExternalLink className="w-4 h-4 mr-2" />
                          View Report
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="api-keys" className="mt-6 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-white mb-2">API Keys</h2>
                  <p className="text-muted-foreground">Manage your API keys for programmatic access.</p>
                </div>
                <Button
                  onClick={() => setLocation("/portal/api")}
                  className="bg-cyan-500 hover:bg-cyan-600"
                >
                  <Key className="w-4 h-4 mr-2" />
                  Manage API Keys
                </Button>
              </div>

              <div className="p-6 bg-white/5 rounded-xl border border-white/10">
                <div className="flex items-start gap-4">
                  <Key className="w-8 h-8 text-cyan-400 mt-1" />
                  <div>
                    <h3 className="text-white font-medium mb-2">API Access</h3>
                    <p className="text-muted-foreground text-sm mb-4">
                      Create API keys to access your website data programmatically. Use these keys to integrate with your own applications or automate your workflow.
                    </p>
                    <Button
                      variant="outline"
                      onClick={() => setLocation("/portal/api")}
                      className="border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/10"
                    >
                      Go to API Portal
                    </Button>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="api-docs" className="mt-6 space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-white mb-2">API Documentation</h2>
                <p className="text-muted-foreground">Available endpoints for your user assets.</p>
              </div>

              <div className="space-y-4">
                <div className="p-6 bg-white/5 rounded-xl border border-white/10">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs font-mono rounded">GET</span>
                    <code className="text-cyan-400 font-mono">/api/user/websites</code>
                    <Button variant="ghost" size="sm" onClick={() => copyToClipboard("/api/user/websites")}>
                      <Copy className="w-3 h-3" />
                    </Button>
                  </div>
                  <p className="text-muted-foreground text-sm mb-3">List all your tracked websites with their latest scores.</p>
                  <div className="bg-slate-800 rounded p-3">
                    <pre className="text-xs text-gray-300 overflow-x-auto">{`{
  "data": [
    {
      "id": "uuid",
      "url": "https://example.com",
      "name": "My Website",
      "lastScore": 85,
      "scanCount": 5,
      "lastScannedAt": "2025-01-01T00:00:00Z"
    }
  ]
}`}</pre>
                  </div>
                </div>

                <div className="p-6 bg-white/5 rounded-xl border border-white/10">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs font-mono rounded">GET</span>
                    <code className="text-cyan-400 font-mono">/api/user/websites/:id/scans</code>
                    <Button variant="ghost" size="sm" onClick={() => copyToClipboard("/api/user/websites/:id/scans")}>
                      <Copy className="w-3 h-3" />
                    </Button>
                  </div>
                  <p className="text-muted-foreground text-sm mb-3">Get scan history for a specific website.</p>
                  <div className="bg-slate-800 rounded p-3">
                    <pre className="text-xs text-gray-300 overflow-x-auto">{`{
  "data": [
    {
      "id": "uuid",
      "url": "https://example.com",
      "overallScore": 85,
      "shareToken": "abc123",
      "createdAt": "2025-01-01T00:00:00Z"
    }
  ]
}`}</pre>
                  </div>
                </div>

                <div className="p-6 bg-white/5 rounded-xl border border-white/10">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs font-mono rounded">GET</span>
                    <code className="text-cyan-400 font-mono">/api/user/scans</code>
                    <Button variant="ghost" size="sm" onClick={() => copyToClipboard("/api/user/scans")}>
                      <Copy className="w-3 h-3" />
                    </Button>
                  </div>
                  <p className="text-muted-foreground text-sm mb-3">Get all your scans across all tracked websites.</p>
                </div>

                <div className="p-6 bg-white/5 rounded-xl border border-white/10">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs font-mono rounded">GET</span>
                    <code className="text-cyan-400 font-mono">/api/user/assets</code>
                    <Button variant="ghost" size="sm" onClick={() => copyToClipboard("/api/user/assets")}>
                      <Copy className="w-3 h-3" />
                    </Button>
                  </div>
                  <p className="text-muted-foreground text-sm mb-3">Get a summary of all your assets (websites and recent scans).</p>
                </div>

                <div className="p-6 bg-white/5 rounded-xl border border-white/10">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs font-mono rounded">POST</span>
                    <code className="text-cyan-400 font-mono">/api/user/websites/:id/scan</code>
                    <Button variant="ghost" size="sm" onClick={() => copyToClipboard("/api/user/websites/:id/scan")}>
                      <Copy className="w-3 h-3" />
                    </Button>
                  </div>
                  <p className="text-muted-foreground text-sm mb-3">Run a new scan on a tracked website.</p>
                </div>

                <div className="mt-8">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <Code className="w-5 h-5 text-cyan-400" />
                    CI/CD Pipeline Integration
                  </h3>
                </div>

                <div className="p-6 bg-gradient-to-r from-cyan-500/10 to-purple-500/10 rounded-xl border border-cyan-500/30">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs font-mono rounded">GET</span>
                    <code className="text-cyan-400 font-mono">/api/v1/score?url=...&threshold=70</code>
                    <Button variant="ghost" size="sm" onClick={() => copyToClipboard("/api/v1/score?url=https://example.com&threshold=70")}>
                      <Copy className="w-3 h-3" />
                    </Button>
                  </div>
                  <p className="text-muted-foreground text-sm mb-3">Get a CI/CD-friendly JSON report card with pass/fail status based on threshold.</p>
                  <div className="bg-slate-800 rounded p-3 mb-3">
                    <pre className="text-xs text-gray-300 overflow-x-auto">{`{
  "status": "pass",
  "passed": true,
  "url": "https://example.com",
  "overallScore": 85,
  "grade": "B",
  "threshold": 70,
  "scores": {
    "seo": { "score": 90, "grade": "A", "status": "pass" },
    "security": { "score": 85, "grade": "B", "status": "pass" },
    "performance": { "score": 80, "grade": "B", "status": "pass" },
    "accessibility": { "score": 88, "grade": "B", "status": "pass" }
  },
  "compliance": {
    "fdic": { "score": 75, "status": "pass" },
    "gdpr": { "score": 90, "status": "pass" }
  },
  "issues": {
    "critical": 0, "high": 2, "medium": 5, "low": 3, "total": 10
  },
  "exitCode": 0,
  "meta": {
    "scanId": "uuid",
    "shareToken": "abc123",
    "reportUrl": "https://example.com/report/abc123"
  }
}`}</pre>
                  </div>
                  <p className="text-xs text-muted-foreground">Returns HTTP 200 if score &gt;= threshold (pass), HTTP 422 if below (fail). Use <code className="text-cyan-400">exitCode</code> in shell scripts.</p>
                </div>

                <div className="p-6 bg-white/5 rounded-xl border border-white/10 mt-4">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs font-mono rounded">POST</span>
                    <code className="text-cyan-400 font-mono">/api/v1/score</code>
                    <Button variant="ghost" size="sm" onClick={() => copyToClipboard("curl -X POST -H 'Content-Type: application/json' -d '{\"url\":\"https://example.com\",\"threshold\":70,\"forceRefresh\":true}' https://your-domain/api/v1/score")}>
                      <Copy className="w-3 h-3" />
                    </Button>
                  </div>
                  <p className="text-muted-foreground text-sm mb-3">Run a fresh scan and get CI/CD report (use forceRefresh: true for new scans).</p>
                </div>

                <div className="mt-8">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <Key className="w-5 h-5 text-cyan-400" />
                    API Key Authentication
                  </h3>
                </div>

                <div className="p-6 bg-gradient-to-r from-purple-500/10 to-cyan-500/10 rounded-xl border border-purple-500/30">
                  <p className="text-muted-foreground text-sm mb-4">
                    Use API keys for automated access. Create keys in the <span className="text-cyan-400">API Keys</span> tab.
                  </p>
                  <div className="bg-slate-800 rounded p-3 mb-4">
                    <pre className="text-xs text-gray-300 overflow-x-auto">{`# Authentication Header
Authorization: Bearer tf_your_api_key_here

# Example: Get website score with API key
curl -X GET "https://your-domain/api/v1/score?url=https://example.com&threshold=70" \\
  -H "Authorization: Bearer tf_54e072ee9abc123..."

# Example: Run fresh scan with API key
curl -X POST "https://your-domain/api/v1/score" \\
  -H "Authorization: Bearer tf_54e072ee9abc123..." \\
  -H "Content-Type: application/json" \\
  -d '{"url":"https://example.com","threshold":70,"forceRefresh":true}'`}</pre>
                  </div>
                  <p className="text-xs text-muted-foreground">API keys start with <code className="text-cyan-400">tf_</code> prefix. Keep your keys secure and never commit them to version control.</p>
                </div>

                <div className="p-6 bg-white/5 rounded-xl border border-white/10 mt-4">
                  <h4 className="text-white font-medium mb-3">GitHub Actions Example</h4>
                  <div className="bg-slate-800 rounded p-3">
                    <pre className="text-xs text-gray-300 overflow-x-auto">{`# .github/workflows/website-check.yml
name: Website Health Check

on:
  push:
    branches: [main]
  schedule:
    - cron: '0 9 * * 1'  # Weekly on Monday 9am

jobs:
  grade:
    runs-on: ubuntu-latest
    steps:
      - name: Check Website Score
        run: |
          RESPONSE=$(curl -s -w "\\n%{http_code}" \\
            -H "Authorization: Bearer \${{ secrets.TRIFUSED_API_KEY }}" \\
            "https://trifused.com/api/v1/score?url=\${{ vars.SITE_URL }}&threshold=70")
          
          HTTP_CODE=$(echo "$RESPONSE" | tail -1)
          BODY=$(echo "$RESPONSE" | head -n -1)
          
          echo "Score: $(echo $BODY | jq -r '.overallScore')"
          echo "Grade: $(echo $BODY | jq -r '.grade')"
          
          if [ "$HTTP_CODE" != "200" ]; then
            echo "::error::Website grade below threshold!"
            exit 1
          fi`}</pre>
                  </div>
                </div>

                <div className="p-6 bg-white/5 rounded-xl border border-white/10 mt-4">
                  <h4 className="text-white font-medium mb-3">GitLab CI Example</h4>
                  <div className="bg-slate-800 rounded p-3">
                    <pre className="text-xs text-gray-300 overflow-x-auto">{`# .gitlab-ci.yml
website-grade:
  stage: test
  script:
    - |
      RESULT=$(curl -sf -H "Authorization: Bearer $TRIFUSED_API_KEY" \\
        "https://trifused.com/api/v1/score?url=$SITE_URL&threshold=70")
      echo "Grade: $(echo $RESULT | jq -r '.grade')"
      [ $(echo $RESULT | jq -r '.passed') = "true" ] || exit 1
  only:
    - main`}</pre>
                  </div>
                </div>

                <div className="p-6 bg-white/5 rounded-xl border border-white/10 mt-4">
                  <h4 className="text-white font-medium mb-3">Jenkins Pipeline Example</h4>
                  <div className="bg-slate-800 rounded p-3">
                    <pre className="text-xs text-gray-300 overflow-x-auto">{`// Jenkinsfile
pipeline {
    agent any
    environment {
        TRIFUSED_API_KEY = credentials('trifused-api-key')
    }
    stages {
        stage('Website Grade Check') {
            steps {
                script {
                    def response = sh(
                        script: '''
                            curl -sf -H "Authorization: Bearer $TRIFUSED_API_KEY" \\
                            "https://trifused.com/api/v1/score?url=$SITE_URL&threshold=70"
                        ''',
                        returnStdout: true
                    ).trim()
                    def grade = readJSON text: response
                    echo "Score: \${grade.overallScore} (\${grade.grade})"
                    if (!grade.passed) { error("Grade below threshold") }
                }
            }
        }
    }
}`}</pre>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-cyan-500/10 border border-cyan-500/30 rounded-lg">
                <p className="text-sm text-cyan-400">
                  <Code className="w-4 h-4 inline mr-2" />
                  All API requests require authentication. Use the <code className="text-white">Authorization: Bearer</code> header with your API key.
                </p>
              </div>
            </TabsContent>

            <TabsContent value="test-api" className="mt-6 space-y-6">
              <div className="p-6 bg-gradient-to-r from-purple-500/10 to-cyan-500/10 rounded-xl border border-purple-500/30">
                <div className="flex items-center gap-3 mb-4">
                  <Terminal className="w-6 h-6 text-purple-400" />
                  <div>
                    <h2 className="text-xl font-bold text-white">API Test Console</h2>
                    <p className="text-sm text-muted-foreground">Test the scoring API live. Each test consumes 1 API credit.</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-white mb-2 block">Select Website</Label>
                      <select
                        value={testUrl}
                        onChange={(e) => setTestUrl(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 text-white rounded-md px-3 py-2 text-sm"
                        data-testid="select-test-website"
                      >
                        <option value="" className="bg-slate-800">-- Select a website --</option>
                        {websites.map((w) => (
                          <option key={w.id} value={w.url} className="bg-slate-800">
                            {w.name || w.url}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <Label className="text-white mb-2 block">Or Enter URL</Label>
                      <Input
                        type="url"
                        inputMode="url"
                        autoCapitalize="off"
                        autoCorrect="off"
                        placeholder="https://example.com"
                        value={testUrl}
                        onChange={(e) => setTestUrl(e.target.value)}
                        className="bg-white/5 border-white/10 text-white"
                        data-testid="input-test-url"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-white mb-2 block">
                        <Key className="w-3 h-3 inline mr-1" />
                        API Key (Select)
                      </Label>
                      <select
                        value={testApiKey}
                        onChange={(e) => {
                          setTestApiKey(e.target.value);
                          setTestManualKey("");
                        }}
                        className="w-full bg-white/5 border border-white/10 text-white rounded-md px-3 py-2 text-sm"
                        data-testid="select-api-key"
                      >
                        <option value="" className="bg-slate-800">-- Use session auth --</option>
                        {apiKeys.map((k: any) => (
                          <option key={k.id} value={k.id} className="bg-slate-800">
                            {k.name} ({k.keyPrefix}...)
                          </option>
                        ))}
                      </select>
                      {apiKeys.length === 0 && (
                        <p className="text-xs text-muted-foreground mt-1">
                          No API keys. Create one in API Keys tab.
                        </p>
                      )}
                    </div>
                    <div>
                      <Label className="text-white mb-2 block">
                        <Key className="w-3 h-3 inline mr-1" />
                        Or Paste API Key
                      </Label>
                      <Input
                        type="password"
                        placeholder="tf_xxxxxxxx..."
                        value={testManualKey}
                        onChange={(e) => {
                          setTestManualKey(e.target.value);
                          if (e.target.value) setTestApiKey("");
                        }}
                        className="bg-white/5 border-white/10 text-white font-mono"
                        data-testid="input-manual-api-key"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Paste your full API key to test auth
                      </p>
                    </div>
                  </div>

                  <div>
                    <Label className="text-white mb-2 block">Threshold (pass/fail)</Label>
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      value={testThreshold}
                      onChange={(e) => setTestThreshold(e.target.value)}
                      className="bg-white/5 border-white/10 text-white w-32"
                      data-testid="input-threshold"
                    />
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <div className="text-xs text-muted-foreground flex items-center gap-2">
                      <AlertTriangle className="w-3 h-3 text-yellow-400" />
                      Running a test will consume 1 API credit from your account.
                    </div>
                    <Button
                      onClick={() => {
                        let url = testUrl.trim();
                        if (!url.startsWith("http://") && !url.startsWith("https://")) {
                          url = "https://" + url;
                        }
                        testApiMutation.mutate({ 
                          url, 
                          threshold: parseInt(testThreshold) || 70,
                          apiKeyId: testApiKey || undefined,
                          manualKey: testManualKey || undefined
                        });
                      }}
                      disabled={!testUrl || testApiMutation.isPending}
                      className="bg-purple-500 hover:bg-purple-600"
                      data-testid="btn-run-test"
                    >
                      {testApiMutation.isPending ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Play className="w-4 h-4 mr-2" />
                      )}
                      Run Test
                    </Button>
                  </div>
                </div>
              </div>

              {testApiMutation.isPending && (
                <div className="p-6 bg-white/5 rounded-xl border border-white/10">
                  <div className="flex items-center gap-3">
                    <Loader2 className="w-5 h-5 animate-spin text-purple-400" />
                    <span className="text-white">Running API test...</span>
                  </div>
                </div>
              )}

              {testError && (
                <div className="p-6 bg-red-500/10 rounded-xl border border-red-500/30">
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="w-5 h-5 text-red-400" />
                    <span className="text-red-400">{testError}</span>
                  </div>
                </div>
              )}

              {testResult && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                      <Code className="w-5 h-5 text-cyan-400" />
                      API Response
                    </h3>
                    <div className="flex items-center gap-3">
                      <span className={`px-3 py-1 rounded-full text-sm font-mono ${
                        testResult._passed 
                          ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                          : 'bg-red-500/20 text-red-400 border border-red-500/30'
                      }`}>
                        HTTP {testResult._httpStatus} - {testResult._passed ? 'PASS' : 'FAIL'}
                      </span>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => {
                          const { _httpStatus, _passed, ...cleanResult } = testResult;
                          copyToClipboard(JSON.stringify(cleanResult, null, 2));
                        }}
                      >
                        <Copy className="w-4 h-4 mr-2" />
                        Copy JSON
                      </Button>
                    </div>
                  </div>

                  {testResult.overallScore !== undefined && (
                    <div className="grid grid-cols-3 gap-4">
                      <div className="p-4 bg-white/5 rounded-xl border border-white/10 text-center">
                        <div className={`text-4xl font-bold ${getGradeColor(testResult.overallScore)}`}>
                          {getGradeLetter(testResult.overallScore)}
                        </div>
                        <div className="text-muted-foreground text-sm mt-1">Grade</div>
                      </div>
                      <div className="p-4 bg-white/5 rounded-xl border border-white/10 text-center">
                        <div className="text-4xl font-bold text-white">{testResult.overallScore}</div>
                        <div className="text-muted-foreground text-sm mt-1">Score</div>
                      </div>
                      <div className="p-4 bg-white/5 rounded-xl border border-white/10 text-center">
                        <div className={`text-4xl font-bold ${testResult.passed ? 'text-green-400' : 'text-red-400'}`}>
                          {testResult.passed ? 'PASS' : 'FAIL'}
                        </div>
                        <div className="text-muted-foreground text-sm mt-1">Status</div>
                      </div>
                    </div>
                  )}

                  <div className="bg-slate-800 rounded-xl p-4 overflow-hidden">
                    <pre className="text-xs text-gray-300 overflow-x-auto max-h-96 overflow-y-auto">
                      {JSON.stringify(
                        (() => {
                          const { _httpStatus, _passed, ...cleanResult } = testResult;
                          return cleanResult;
                        })(),
                        null,
                        2
                      )}
                    </pre>
                  </div>

                  <div className="p-4 bg-purple-500/10 border border-purple-500/30 rounded-lg">
                    <p className="text-sm text-purple-400">
                      <CheckCircle className="w-4 h-4 inline mr-2" />
                      1 API credit consumed. Use <code className="text-white">threshold</code> parameter to customize pass/fail threshold (default: 70).
                    </p>
                  </div>
                </div>
              )}

              {!testResult && !testError && !testApiMutation.isPending && (
                <div className="p-8 bg-white/5 rounded-xl border border-white/10 text-center">
                  <Terminal className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Enter a URL and click "Run Test" to see the API response.</p>
                </div>
              )}
            </TabsContent>
          </Tabs>

          <div className="p-4 bg-cyan-500/10 border border-cyan-500/30 rounded-lg">
            <p className="text-sm text-cyan-400">
              <CheckCircle className="w-4 h-4 inline mr-2" />
              Each scan analyzes your website's SEO, security, performance, accessibility, and compliance. 
              <a href="/grader" className="underline ml-1" target="_blank">
                Try the public grader
              </a>
            </p>
          </div>
        </motion.div>
      </main>

      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent className="bg-slate-900 border-white/10">
          <DialogHeader>
            <DialogTitle className="text-white">Add Website</DialogTitle>
            <DialogDescription>
              Enter the URL of the website you want to track and scan.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="url" className="text-white">Website URL</Label>
              <Input
                id="url"
                type="url"
                inputMode="url"
                autoCapitalize="off"
                autoCorrect="off"
                placeholder="https://example.com"
                value={newUrl}
                onChange={(e) => setNewUrl(e.target.value)}
                className="bg-white/5 border-white/10 text-white"
                data-testid="input-website-url"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="name" className="text-white">Display Name (optional)</Label>
              <Input
                id="name"
                placeholder="My Company Website"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="bg-white/5 border-white/10 text-white"
                data-testid="input-website-name"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setAddDialogOpen(false)}
              className="text-muted-foreground"
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddWebsite}
              disabled={!newUrl || addWebsiteMutation.isPending}
              className="bg-cyan-500 hover:bg-cyan-600"
              data-testid="btn-confirm-add-website"
            >
              {addWebsiteMutation.isPending ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Plus className="w-4 h-4 mr-2" />
              )}
              Add Website
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}
