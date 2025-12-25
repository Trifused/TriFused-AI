import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
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
  Code
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
  const [activeTab, setActiveTab] = useState("websites");

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

  const websites: UserWebsite[] = websitesData?.data || [];
  const scans: WebsiteGrade[] = scansData?.data || [];

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
            <TabsList className="grid w-full grid-cols-4 bg-white/5 border border-white/10">
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
                <p className="text-muted-foreground">View all your past website scans and reports.</p>
              </div>

              {scansLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
                </div>
              ) : scans.length === 0 ? (
                <div className="text-center py-16 bg-white/5 rounded-xl border border-white/10">
                  <History className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <h3 className="text-lg font-medium text-white mb-2">No scan history yet</h3>
                  <p className="text-muted-foreground">
                    Run scans on your websites to build your scan history.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {scans.map((scan) => (
                    <div
                      key={scan.id}
                      className="p-4 bg-white/5 rounded-lg border border-white/10 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-4">
                        <span className={`px-3 py-1 rounded-full text-sm font-bold ${getGradeBg(scan.overallScore)} ${getGradeColor(scan.overallScore)}`}>
                          {getGradeLetter(scan.overallScore)}
                        </span>
                        <div>
                          <p className="text-white font-medium">{new URL(scan.url).hostname}</p>
                          <p className="text-sm text-muted-foreground">
                            Score: {scan.overallScore}/100 • {format(new Date(scan.createdAt), "MMM d, yyyy h:mm a")}
                          </p>
                        </div>
                      </div>
                      {scan.shareToken && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setLocation(`/report/${scan.shareToken}`)}
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
              </div>

              <div className="p-4 bg-cyan-500/10 border border-cyan-500/30 rounded-lg">
                <p className="text-sm text-cyan-400">
                  <Code className="w-4 h-4 inline mr-2" />
                  All API requests require authentication. Use session cookies or API keys from the API Keys tab.
                </p>
              </div>
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
