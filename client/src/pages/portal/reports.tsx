import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { TermsModal } from "@/components/terms-modal";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { 
  FileText, 
  Settings, 
  ExternalLink, 
  Copy, 
  Check,
  Globe,
  Lock,
  Palette,
  Code,
  ShoppingCart,
  ArrowLeft,
  LogOut
} from "lucide-react";
import type { ReportSubscription } from "@shared/schema";

interface ReportSubscriptionData {
  data: ReportSubscription[];
}

export default function ReportsPortal() {
  const [, setLocation] = useLocation();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const { data: subscriptionsData, isLoading } = useQuery<ReportSubscriptionData>({
    queryKey: ["/api/user/report-subscriptions"],
    enabled: !!user,
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<ReportSubscription> }) => {
      const res = await fetch(`/api/user/report-subscriptions/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to update");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user/report-subscriptions"] });
      toast({ title: "Settings saved", description: "Your report settings have been updated." });
      setEditingId(null);
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const copyToClipboard = async (text: string, field: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast({
        title: "Session Required",
        description: "Please sign in to access reports.",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
    }
  }, [isAuthenticated, authLoading, toast]);

  const subscriptions = subscriptionsData?.data || [];

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const needsTermsAcceptance = !user?.termsAcceptedAt;

  return (
    <div className="min-h-screen bg-background">
      <TermsModal isOpen={needsTermsAcceptance} userTermsVersion={user?.termsVersion} />
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setLocation("/portal/dashboard")}
                className="text-muted-foreground hover:text-foreground"
                data-testid="btn-back-dashboard"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Dashboard
              </Button>
              <div className="h-6 w-px bg-border" />
              <h1 className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                Website Grade Reports
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">
                {user?.email || user?.firstName || "User"}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => window.location.href = "/api/logout"}
                className="text-muted-foreground hover:text-foreground"
                data-testid="btn-logout"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="mb-8">
            <p className="text-muted-foreground">
              Manage your white-label website grader subscriptions. Embed the grader on your site or access via API.
            </p>
          </div>

          {isLoading ? (
            <Card>
              <CardContent className="p-6">
                <div className="animate-pulse space-y-4">
                  <div className="h-4 bg-muted rounded w-1/4" />
                  <div className="h-4 bg-muted rounded w-1/2" />
                </div>
              </CardContent>
            </Card>
          ) : subscriptions.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold mb-2">No Report Subscriptions</h3>
                <p className="text-muted-foreground mb-6">
                  Purchase a Website Grade Report subscription to embed the grader on your own website.
                </p>
                <Button asChild data-testid="btn-purchase-report">
                  <a href="/store">
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    View Products
                  </a>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {subscriptions.map((sub) => (
                <ReportSubscriptionCard
                  key={sub.id}
                  subscription={sub}
                  isEditing={editingId === sub.id}
                  onEdit={() => setEditingId(sub.id)}
                  onSave={(data) => updateMutation.mutate({ id: sub.id, data })}
                  onCancel={() => setEditingId(null)}
                  isSaving={updateMutation.isPending}
                  copyToClipboard={copyToClipboard}
                  copiedField={copiedField}
                />
              ))}
            </div>
          )}
        </motion.div>
      </main>
    </div>
  );
}

function ReportSubscriptionCard({
  subscription,
  isEditing,
  onEdit,
  onSave,
  onCancel,
  isSaving,
  copyToClipboard,
  copiedField,
}: {
  subscription: ReportSubscription;
  isEditing: boolean;
  onEdit: () => void;
  onSave: (data: Partial<ReportSubscription>) => void;
  onCancel: () => void;
  isSaving: boolean;
  copyToClipboard: (text: string, field: string) => void;
  copiedField: string | null;
}) {
  const [formData, setFormData] = useState({
    targetUrl: subscription.targetUrl || "",
    companyName: subscription.companyName || "",
    brandColor: subscription.brandColor || "#00d4ff",
    slug: subscription.slug,
    visibility: subscription.visibility,
    embedEnabled: subscription.embedEnabled === 1,
    apiEnabled: subscription.apiEnabled === 1,
  });

  const embedUrl = `${window.location.origin}/grade/${subscription.slug}`;
  const apiEndpoint = `${window.location.origin}/api/v1/grade/${subscription.slug}`;

  const handleSave = () => {
    onSave({
      targetUrl: formData.targetUrl,
      companyName: formData.companyName,
      brandColor: formData.brandColor,
      slug: formData.slug,
      visibility: formData.visibility as "public" | "private",
      embedEnabled: formData.embedEnabled ? 1 : 0,
      apiEnabled: formData.apiEnabled ? 1 : 0,
    });
  };

  return (
    <Card data-testid={`card-report-${subscription.id}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FileText className="w-6 h-6 text-primary" />
            <div>
              <CardTitle className="flex items-center gap-2">
                {subscription.companyName || subscription.slug}
                <Badge variant={subscription.status === "active" ? "default" : "secondary"}>
                  {subscription.status}
                </Badge>
              </CardTitle>
              <CardDescription>
                Slug: <code className="text-xs bg-muted px-1 rounded">{subscription.slug}</code>
              </CardDescription>
            </div>
          </div>
          {!isEditing && (
            <Button variant="outline" onClick={onEdit} data-testid={`btn-edit-report-${subscription.id}`}>
              <Settings className="w-4 h-4 mr-2" />
              Configure
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent>
        {isEditing ? (
          <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="companyName">Company Name</Label>
                <Input
                  id="companyName"
                  value={formData.companyName}
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                  placeholder="Your Company Name"
                  data-testid="input-company-name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="targetUrl">Target Website URL</Label>
                <Input
                  id="targetUrl"
                  value={formData.targetUrl}
                  onChange={(e) => setFormData({ ...formData, targetUrl: e.target.value })}
                  placeholder="https://example.com"
                  data-testid="input-target-url"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="slug">Custom Slug</Label>
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-') })}
                  placeholder="my-company"
                  data-testid="input-slug"
                />
                <p className="text-xs text-muted-foreground">
                  URL will be: {window.location.origin}/grade/{formData.slug}
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="brandColor">Brand Color</Label>
                <div className="flex gap-2">
                  <Input
                    id="brandColor"
                    type="color"
                    value={formData.brandColor}
                    onChange={(e) => setFormData({ ...formData, brandColor: e.target.value })}
                    className="w-12 h-10 p-1 cursor-pointer"
                    data-testid="input-brand-color"
                  />
                  <Input
                    value={formData.brandColor}
                    onChange={(e) => setFormData({ ...formData, brandColor: e.target.value })}
                    placeholder="#00d4ff"
                    className="flex-1"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-2">
                {formData.visibility === "public" ? <Globe className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                <div>
                  <p className="font-medium">Visibility</p>
                  <p className="text-sm text-muted-foreground">
                    {formData.visibility === "public" ? "Anyone can access" : "Restricted access"}
                  </p>
                </div>
              </div>
              <Switch
                checked={formData.visibility === "public"}
                onCheckedChange={(checked) => setFormData({ ...formData, visibility: checked ? "public" : "private" })}
                data-testid="switch-visibility"
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-2">
                  <Code className="w-4 h-4" />
                  <span>Embed Access</span>
                </div>
                <Switch
                  checked={formData.embedEnabled}
                  onCheckedChange={(checked) => setFormData({ ...formData, embedEnabled: checked })}
                  data-testid="switch-embed"
                />
              </div>
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-2">
                  <ExternalLink className="w-4 h-4" />
                  <span>API Access</span>
                </div>
                <Switch
                  checked={formData.apiEnabled}
                  onCheckedChange={(checked) => setFormData({ ...formData, apiEnabled: checked })}
                  data-testid="switch-api"
                />
              </div>
            </div>

            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={onCancel} disabled={isSaving}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={isSaving} data-testid="btn-save-report">
                {isSaving ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </div>
        ) : (
          <Tabs defaultValue="embed">
            <TabsList>
              <TabsTrigger value="embed">Embed Code</TabsTrigger>
              <TabsTrigger value="api">API Access</TabsTrigger>
              <TabsTrigger value="preview">Preview</TabsTrigger>
            </TabsList>

            <TabsContent value="embed" className="space-y-4">
              <div className="space-y-2">
                <Label>Public URL</Label>
                <div className="flex gap-2">
                  <Input value={embedUrl} readOnly className="font-mono text-sm" />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => copyToClipboard(embedUrl, "embed-url")}
                    data-testid="btn-copy-embed-url"
                  >
                    {copiedField === "embed-url" ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </Button>
                  <Button variant="outline" size="icon" asChild>
                    <a href={embedUrl} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Iframe Embed Code</Label>
                <div className="relative">
                  <pre className="bg-muted p-4 rounded-lg text-xs overflow-x-auto">
                    {`<iframe
  src="${embedUrl}"
  width="100%"
  height="800"
  frameborder="0"
  style="border: none;"
></iframe>`}
                  </pre>
                  <Button
                    variant="outline"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={() => copyToClipboard(`<iframe src="${embedUrl}" width="100%" height="800" frameborder="0" style="border: none;"></iframe>`, "embed-code")}
                    data-testid="btn-copy-embed-code"
                  >
                    {copiedField === "embed-code" ? <Check className="w-3 h-3 mr-1" /> : <Copy className="w-3 h-3 mr-1" />}
                    Copy
                  </Button>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="api" className="space-y-4">
              <div className="space-y-2">
                <Label>API Endpoint</Label>
                <div className="flex gap-2">
                  <Input value={apiEndpoint} readOnly className="font-mono text-sm" />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => copyToClipboard(apiEndpoint, "api-endpoint")}
                    data-testid="btn-copy-api-endpoint"
                  >
                    {copiedField === "api-endpoint" ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Example Request</Label>
                <pre className="bg-muted p-4 rounded-lg text-xs overflow-x-auto">
{`curl -X POST "${apiEndpoint}" \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -d '{"url": "https://example.com"}'`}
                </pre>
              </div>
            </TabsContent>

            <TabsContent value="preview">
              <div className="p-4 border rounded-lg">
                <div className="flex items-center gap-4 mb-4">
                  {subscription.logoUrl ? (
                    <img src={subscription.logoUrl} alt="Logo" className="w-12 h-12 object-contain" />
                  ) : (
                    <div 
                      className="w-12 h-12 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: subscription.brandColor || "#00d4ff" }}
                    >
                      <Palette className="w-6 h-6 text-white" />
                    </div>
                  )}
                  <div>
                    <h3 className="font-semibold">{subscription.companyName || "Your Company"}</h3>
                    <p className="text-sm text-muted-foreground">Website Grade Report</p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  This preview shows how your branding will appear on the public grader page.
                </p>
              </div>
            </TabsContent>
          </Tabs>
        )}
      </CardContent>
    </Card>
  );
}
