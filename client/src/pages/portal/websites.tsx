import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { 
  LayoutDashboard, 
  LogOut, 
  Globe,
  Plus,
  Trash2,
  RefreshCw,
  ArrowLeft,
  ExternalLink,
  Clock,
  BarChart3,
  CheckCircle,
  AlertTriangle,
  Loader2,
  Search
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  const queryClient = useQueryClient();
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [newUrl, setNewUrl] = useState("");
  const [newName, setNewName] = useState("");
  const [scanningId, setScanningId] = useState<string | null>(null);

  const { data: websitesData, isLoading: websitesLoading, refetch: refetchWebsites } = useQuery({
    queryKey: ["/api/user/websites"],
    queryFn: async () => {
      const res = await fetch("/api/user/websites", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch websites");
      return res.json();
    },
    enabled: isAuthenticated,
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
