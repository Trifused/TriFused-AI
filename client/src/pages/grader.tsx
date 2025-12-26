import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FeatureBadge } from "@/components/ui/feature-badge";
import { GuidedTour, HelpButton } from "@/components/ui/help-tooltip";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import { useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { 
  Search, 
  Shield, 
  Zap, 
  FileText, 
  Key, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle,
  Download,
  Loader2,
  Globe,
  Copy,
  Check,
  Accessibility,
  MessageSquare,
  ArrowRight,
  Mail,
  Share2,
  Server,
  MapPin,
  Link2,
  Building,
  Scale,
  CreditCard,
  Cookie,
  RefreshCw,
  History,
  ExternalLink,
  Trash2,
  Smartphone
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { trackEvent, trackPageView } from "@/lib/analytics";
import { FEATURE_FLAGS, type FeatureStatus } from "@shared/feature-flags";

interface Finding {
  category: "seo" | "security" | "performance" | "keywords" | "accessibility" | "email" | "mobile" | "fdic" | "sec" | "ada" | "pci" | "fca" | "gdpr";
  issue: string;
  impact: string;
  priority: "critical" | "important" | "optional";
  howToFix: string;
  passed: boolean;
}

interface CoreWebVitals {
  lcp: number | null;
  cls: number | null;
  tbt: number | null;
  fcp: number | null;
  speedIndex: number | null;
  tti: number | null;
  lighthousePerformance: number | null;
  lighthouseAccessibility: number | null;
  lighthouseSeo: number | null;
  lighthouseBestPractices: number | null;
}

interface GradeResult {
  id: string;
  url: string;
  overallScore: number;
  seoScore: number;
  securityScore: number;
  performanceScore: number;
  keywordsScore: number;
  accessibilityScore: number;
  emailSecurityScore: number;
  mobileScore: number;
  findings: Finding[];
  createdAt: string;
  shareToken: string | null;
  qrCodeData: string | null;
  hostIp: string | null;
  hostCountry: string | null;
  hostCity: string | null;
  hostProvider: string | null;
  blacklistStatus: string | null;
  fdicScore: number | null;
  secScore: number | null;
  adaScore: number | null;
  pciScore: number | null;
  fcaScore: number | null;
  gdprScore: number | null;
  coreWebVitals?: CoreWebVitals | null;
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
  if (score >= 90) return "from-green-500/20 to-green-500/5";
  if (score >= 80) return "from-cyan-500/20 to-cyan-500/5";
  if (score >= 70) return "from-yellow-500/20 to-yellow-500/5";
  if (score >= 60) return "from-orange-500/20 to-orange-500/5";
  return "from-red-500/20 to-red-500/5";
}

function ScoreCircle({ score, label, icon: Icon }: { score: number; label: string; icon: any }) {
  const color = getGradeColor(score);
  const circumference = 2 * Math.PI * 40;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative w-24 h-24">
        <svg className="w-24 h-24 -rotate-90" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r="40"
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            className="text-white/10"
          />
          <motion.circle
            cx="50"
            cy="50"
            r="40"
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            strokeLinecap="round"
            className={color}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
            style={{ strokeDasharray: circumference }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={`text-2xl font-bold ${color}`}>{score}</span>
        </div>
      </div>
      <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
        <Icon className="w-4 h-4" />
        <span>{label}</span>
      </div>
    </div>
  );
}

function FindingCard({ finding }: { finding: Finding }) {
  const priorityColors = {
    critical: "border-red-500/50 bg-red-500/10",
    important: "border-yellow-500/50 bg-yellow-500/10",
    optional: "border-green-500/50 bg-green-500/10",
  };

  const priorityIcons = {
    critical: XCircle,
    important: AlertTriangle,
    optional: CheckCircle2,
  };

  const Icon = finding.passed ? CheckCircle2 : priorityIcons[finding.priority];
  const colorClass = finding.passed ? "border-green-500/50 bg-green-500/10" : priorityColors[finding.priority];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`p-4 rounded-lg border ${colorClass}`}
    >
      <div className="flex items-start gap-3">
        <Icon className={`w-5 h-5 mt-0.5 flex-shrink-0 ${finding.passed ? "text-green-400" : finding.priority === "critical" ? "text-red-400" : finding.priority === "important" ? "text-yellow-400" : "text-green-400"}`} />
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-white">{finding.issue}</h4>
          <p className="text-sm text-muted-foreground mt-1">{finding.impact}</p>
          {!finding.passed && finding.howToFix && (
            <div className="mt-3 p-3 bg-black/30 rounded-md">
              <p className="text-xs font-mono text-cyan-400 uppercase tracking-wider mb-1">How to fix:</p>
              <p className="text-sm text-white/80">{finding.howToFix}</p>
            </div>
          )}
        </div>
        {!finding.passed && (
          <span className={`text-xs font-mono uppercase px-2 py-1 rounded ${finding.priority === "critical" ? "bg-red-500/20 text-red-400" : finding.priority === "important" ? "bg-yellow-500/20 text-yellow-400" : "bg-white/10 text-white/60"}`}>
            {finding.priority}
          </span>
        )}
      </div>
    </motion.div>
  );
}

// Compliance check options with feature flag integration
const complianceOptions: Array<{
  id: string;
  label: string;
  description: string;
  featureKey: keyof typeof FEATURE_FLAGS;
  status: FeatureStatus;
  tier?: 'basic' | 'pro' | 'enterprise' | 'api';
}> = [
  { id: "fdic", label: "FDIC", description: "Bank deposit insurance signage", featureKey: "GRADER_COMPLIANCE_FDIC", status: FEATURE_FLAGS.GRADER_COMPLIANCE_FDIC.status },
  { id: "sec", label: "SEC", description: "Securities disclosures", featureKey: "GRADER_COMPLIANCE_SEC", status: FEATURE_FLAGS.GRADER_COMPLIANCE_SEC.status },
  { id: "ada", label: "ADA", description: "Accessibility (WCAG)", featureKey: "GRADER_COMPLIANCE_ADA", status: FEATURE_FLAGS.GRADER_COMPLIANCE_ADA.status },
  { id: "pci", label: "PCI", description: "Payment card security", featureKey: "GRADER_COMPLIANCE_PCI", status: FEATURE_FLAGS.GRADER_COMPLIANCE_PCI.status },
  { id: "fca", label: "FCA", description: "UK financial promotions", featureKey: "GRADER_COMPLIANCE_FCA", status: FEATURE_FLAGS.GRADER_COMPLIANCE_FCA.status },
  { id: "gdpr", label: "GDPR", description: "EU privacy compliance", featureKey: "GRADER_COMPLIANCE_GDPR", status: FEATURE_FLAGS.GRADER_COMPLIANCE_GDPR.status },
];

// Premium features (coming soon) - all grader and report related features (filter out free ones)
const premiumFeatures = [
  { ...FEATURE_FLAGS.GRADER_LIGHTHOUSE },
  { ...FEATURE_FLAGS.GRADER_VISION_DETECTION },
  { ...FEATURE_FLAGS.GRADER_SCHEDULED_SCANS },
  { ...FEATURE_FLAGS.GRADER_MULTI_SITE },
  { ...FEATURE_FLAGS.GRADER_BULK_SCANS },
  { ...FEATURE_FLAGS.REPORT_AI_ADVANCED },
  { ...FEATURE_FLAGS.REPORT_WHITE_LABEL },
  { ...FEATURE_FLAGS.REPORT_PDF_EXPORT },
  { ...FEATURE_FLAGS.API_ACCESS },
].filter(f => f.status !== 'free');

interface ScanHistoryItem {
  id: string;
  url: string;
  overallScore: number;
  createdAt: string;
  shareToken: string | null;
  historyKey: string; // Unique key for each scan (id + timestamp)
}

const HISTORY_KEY = 'trifused_scan_history';
const MAX_HISTORY_ITEMS = 10;

function loadHistory(): ScanHistoryItem[] {
  try {
    const stored = localStorage.getItem(HISTORY_KEY);
    if (!stored) return [];
    const items = JSON.parse(stored);
    // Add historyKey to old items that don't have it
    return items.map((item: ScanHistoryItem) => ({
      ...item,
      historyKey: item.historyKey || `${item.id}-${new Date(item.createdAt).getTime()}`,
    }));
  } catch {
    return [];
  }
}

function saveHistory(history: ScanHistoryItem[]) {
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history.slice(0, MAX_HISTORY_ITEMS)));
}

export default function Grader() {
  const [url, setUrl] = useState("");
  const [result, setResult] = useState<GradeResult | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [copied, setCopied] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);
  const [complianceChecks, setComplianceChecks] = useState<Record<string, boolean>>({});
  const [forceRefresh, setForceRefresh] = useState(false);
  const [useLighthouse, setUseLighthouse] = useState(false);
  const [scanHistory, setScanHistory] = useState<ScanHistoryItem[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const { toast } = useToast();
  const [location] = useLocation();
  const hasAutoScanned = useRef(false);
  const { user } = useAuth();
  const isSuperuser = user?.role === 'superuser';

  useEffect(() => {
    trackPageView('/grader');
    setScanHistory(loadHistory());
    
    // Set page title for browser tab (meta tags are handled server-side for crawlers)
    document.title = "Free Website Grader | TriFused";
    
    // Check for rescan parameter
    const params = new URLSearchParams(window.location.search);
    const rescanUrl = params.get('rescan');
    if (rescanUrl && !hasAutoScanned.current) {
      hasAutoScanned.current = true;
      const decodedUrl = decodeURIComponent(rescanUrl);
      setUrl(decodedUrl);
      // Auto-start scan after a brief delay
      setTimeout(() => {
        let processedUrl = decodedUrl.trim();
        if (!processedUrl.startsWith("http://") && !processedUrl.startsWith("https://")) {
          processedUrl = "https://" + processedUrl;
        }
        trackEvent('grader_rescan', 'website_grader', processedUrl);
        gradeMutation.mutate(processedUrl);
      }, 100);
    }
    
    return () => {
      document.title = "TriFused | AI-Native Technology Services";
    };
  }, []);

  const gradeMutation = useMutation({
    mutationFn: async (websiteUrl: string) => {
      const response = await fetch("/api/grade", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: websiteUrl, complianceChecks, forceRefresh, useLighthouse }),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to analyze website");
      }
      return response.json() as Promise<GradeResult>;
    },
    onSuccess: (data) => {
      setResult(data);
      trackEvent('grader_complete', 'website_grader', data.url, data.overallScore);
      
      // Save to history with unique key (allows multiple scans of same URL)
      const historyKey = `${data.id}-${Date.now()}`;
      const historyItem: ScanHistoryItem = {
        id: data.id,
        url: data.url,
        overallScore: data.overallScore,
        createdAt: data.createdAt,
        shareToken: data.shareToken,
        historyKey,
      };
      const newHistory = [historyItem, ...scanHistory.filter(h => h.historyKey !== historyKey)];
      setScanHistory(newHistory);
      saveHistory(newHistory);
    },
  });
  
  const handleScanAgain = () => {
    setResult(null);
    setActiveCategory("all");
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  const handleHistoryClick = (item: ScanHistoryItem) => {
    if (item.shareToken) {
      window.open(`/report/${item.shareToken}`, '_blank');
    }
  };
  
  const clearHistory = () => {
    setScanHistory([]);
    localStorage.removeItem(HISTORY_KEY);
    toast({ title: "History cleared" });
  };

  const toggleCompliance = (id: string) => {
    setComplianceChecks(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const hasAnyComplianceChecked = Object.values(complianceChecks).some(v => v);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let processedUrl = url.trim();
    if (!processedUrl.startsWith("http://") && !processedUrl.startsWith("https://")) {
      processedUrl = "https://" + processedUrl;
    }
    trackEvent('grader_start', 'website_grader', processedUrl);
    gradeMutation.mutate(processedUrl);
  };

  const handleDownloadPDF = async () => {
    if (!result) return;
    trackEvent('grader_pdf_download', 'website_grader', result.url);
    try {
      const response = await fetch(`/api/grade/${result.id}/pdf`);
      if (!response.ok) throw new Error("Failed to download PDF");
      const blob = await response.blob();
      const downloadUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = downloadUrl;
      a.download = `website-grade-${result.id}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      toast({ title: "Error", description: "Failed to download PDF", variant: "destructive" });
    }
  };

  const handleCopyResults = async () => {
    if (!result) return;
    trackEvent('grader_copy_results', 'website_grader', result.url);
    const issues = result.findings.filter(f => !f.passed);
    const passes = result.findings.filter(f => f.passed);
    
    const text = `# Website Grade Report for ${result.url}
*(Free Tool - For informational purposes only)*

## Overall Score: ${result.overallScore}/100 (Grade: ${getGradeLetter(result.overallScore)})

### Category Scores:
- SEO: ${result.seoScore}/100
- Security: ${result.securityScore}/100
- Performance: ${result.performanceScore}/100
- Keywords: ${result.keywordsScore}/100
- Accessibility: ${result.accessibilityScore}/100
- Email Security: ${result.emailSecurityScore || 0}/100
- Mobile: ${result.mobileScore || 0}/100

${issues.length > 0 ? `## Issues Found (${issues.length}):
${issues.map(f => `
### [${f.category.toUpperCase()}] ${f.issue} (${f.priority})
**Impact:** ${f.impact}
**Fix:** ${f.howToFix}
`).join('')}` : '## No issues found!'}

## Passed Checks (${passes.length}):
${passes.map(f => `- ${f.issue}`).join('\n')}

---
*Analyzed on ${new Date(result.createdAt).toLocaleString()} by TriFused Website Grader*`;

    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast({ title: "Copied!", description: "Results copied to clipboard" });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({ title: "Error", description: "Failed to copy to clipboard", variant: "destructive" });
    }
  };

  const filteredFindings = result?.findings.filter(f => 
    activeCategory === "all" || f.category === activeCategory
  ) || [];

  const baseCategories = [
    { id: "all", label: "All", icon: Globe },
    { id: "seo", label: "SEO", icon: FileText },
    { id: "security", label: "Security", icon: Shield },
    { id: "performance", label: "Performance", icon: Zap },
    { id: "keywords", label: "Keywords", icon: Key },
    { id: "accessibility", label: "Accessibility", icon: Accessibility },
    { id: "email", label: "Email Security", icon: Mail },
    { id: "mobile", label: "Mobile", icon: Smartphone },
  ];
  
  const complianceCategories = [
    { id: "fdic", label: "FDIC", icon: Building, score: result?.fdicScore },
    { id: "sec", label: "SEC", icon: Scale, score: result?.secScore },
    { id: "ada", label: "ADA", icon: Accessibility, score: result?.adaScore },
    { id: "pci", label: "PCI", icon: CreditCard, score: result?.pciScore },
    { id: "fca", label: "FCA", icon: Scale, score: result?.fcaScore },
    { id: "gdpr", label: "GDPR", icon: Cookie, score: result?.gdprScore },
  ].filter(c => c.score !== null && c.score !== undefined);
  
  const categories = [...baseCategories, ...complianceCategories];

  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary/30">
      <Navbar />
      <main id="main-content" className="pt-24 pb-16">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/20 bg-primary/5 text-primary text-xs font-mono uppercase tracking-widest mb-4">
              <Search className="w-3 h-3" />
              Free Tool
            </div>
            {result ? (
              <>
                <h1 className="text-4xl md:text-6xl font-bold font-heading mb-4">
                  Website <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-500">Grade Report</span>
                </h1>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                  Free Tool - For informational purposes only
                </p>
              </>
            ) : (
              <>
                <h1 className="text-4xl md:text-6xl font-bold font-heading mb-4">
                  Website <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-500">Grader</span>
                </h1>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                  Get a comprehensive analysis of your website's SEO, security, performance, accessibility (WCAG), and keyword optimization with actionable recommendations.
                </p>
              </>
            )}
          </motion.div>

          {!result && (
          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            onSubmit={handleSubmit}
            className="max-w-2xl mx-auto mb-16"
          >
            <div className="flex gap-4">
              <Input
                type="text"
                inputMode="url"
                autoCapitalize="off"
                autoCorrect="off"
                placeholder="Enter your website URL (e.g., example.com)"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="flex-1 h-14 text-lg bg-white/5 border-white/10 focus:border-primary"
                data-testid="input-website-url"
              />
              <Button
                type="submit"
                size="lg"
                className="h-14 px-8 bg-primary text-black hover:bg-primary/90 font-bold"
                disabled={gradeMutation.isPending || !url.trim()}
                data-testid="button-analyze"
              >
                {gradeMutation.isPending ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Search className="w-5 h-5 mr-2" />
                    Analyze
                  </>
                )}
              </Button>
            </div>

            <div className="mt-6 p-4 bg-white/5 rounded-lg border border-white/10">
              <p className="text-sm text-muted-foreground mb-3">
                <Shield className="w-4 h-4 inline mr-1" />
                Optional: Add regulatory compliance checks
              </p>
              <div className="flex flex-wrap gap-3">
                {complianceOptions.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => option.status === 'free' && toggleCompliance(option.id)}
                    disabled={option.status !== 'free'}
                    className={`min-h-[44px] px-3 py-2 rounded-lg border text-sm font-medium transition-all ${
                      option.status !== 'free'
                        ? "bg-white/5 border-white/10 text-muted-foreground opacity-60 cursor-not-allowed"
                        : complianceChecks[option.id]
                        ? "bg-primary/20 border-primary text-primary"
                        : "bg-white/5 border-white/10 text-muted-foreground hover:border-white/30"
                    }`}
                    data-testid={`checkbox-compliance-${option.id}`}
                  >
                    <span className="font-bold">{option.label}</span>
                    <span className="ml-1 text-xs opacity-70">({option.description})</span>
                    {option.status !== 'free' && (
                      <FeatureBadge status={option.status} tier={option.tier} className="ml-2" />
                    )}
                  </button>
                ))}
              </div>
              
              {premiumFeatures.length > 0 && (
                <div className="mt-4 pt-4 border-t border-white/10">
                  <p className="text-sm text-muted-foreground mb-3">
                    Premium Features:
                  </p>
                  <div className="flex flex-wrap gap-3">
                    {premiumFeatures.map((feature) => {
                      // Make Lighthouse toggleable for superusers
                      if (feature.id === 'grader_lighthouse' && isSuperuser) {
                        return (
                          <button
                            key={feature.id}
                            type="button"
                            onClick={() => setUseLighthouse(!useLighthouse)}
                            className={`min-h-[44px] px-3 py-2 rounded-lg border text-sm font-medium flex items-center gap-2 transition-all ${
                              useLighthouse
                                ? "bg-cyan-500/20 border-cyan-500 text-cyan-400"
                                : "bg-white/5 border-white/10 text-muted-foreground hover:border-white/30"
                            }`}
                            data-testid={`feature-${feature.id}`}
                          >
                            <span>{feature.name}</span>
                            {useLighthouse && <span className="text-xs">(ON)</span>}
                          </button>
                        );
                      }
                      return (
                        <div
                          key={feature.id}
                          className="min-h-[44px] px-3 py-2 rounded-lg border bg-white/5 border-white/10 text-sm font-medium opacity-60 cursor-not-allowed flex items-center gap-2"
                          data-testid={`feature-${feature.id}`}
                        >
                          <span className="text-muted-foreground">{feature.name}</span>
                          <FeatureBadge status={feature.status} tier={feature.tier} />
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
              
              <div className="mt-3 pt-3 border-t border-white/10 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => setForceRefresh(!forceRefresh)}
                  className={`min-h-[44px] flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium transition-all ${
                    forceRefresh
                      ? "bg-orange-500/20 border-orange-500 text-orange-400"
                      : "bg-white/5 border-white/10 text-muted-foreground hover:border-white/30"
                  }`}
                  data-testid="checkbox-force-refresh"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Force Fresh Scan</span>
                  <span className="text-xs opacity-70">(bypass 24h cache)</span>
                </button>
              </div>
            </div>

            {gradeMutation.isError && (
              <p className="mt-3 text-red-400 text-sm text-center">
                {gradeMutation.error.message}
              </p>
            )}
            
            <p className="mt-4 text-xs text-muted-foreground text-center">
              This is a free tool. Results are for informational purposes only and should not be considered professional advice.
            </p>
          </motion.form>
          )}

          {/* Scan History Section - only show when no results */}
          {scanHistory.length > 0 && !result && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="max-w-2xl mx-auto mb-8"
            >
              <button
                onClick={() => setShowHistory(!showHistory)}
                className="min-h-[44px] flex items-center gap-2 px-2 py-2 -ml-2 text-sm text-muted-foreground hover:text-white transition-colors mb-3"
                data-testid="button-toggle-history"
              >
                <History className="w-4 h-4" />
                Recent Scans ({scanHistory.length})
                <span className={`transition-transform ${showHistory ? 'rotate-180' : ''}`}>▼</span>
              </button>
              
              <AnimatePresence>
                {showHistory && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="glass-panel rounded-xl p-4 space-y-2 overflow-hidden"
                  >
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-xs text-muted-foreground">Click to view report</span>
                      <button
                        onClick={clearHistory}
                        className="min-h-[44px] min-w-[44px] px-3 py-2 -mr-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg flex items-center gap-2 transition-colors"
                        data-testid="button-clear-history"
                      >
                        <Trash2 className="w-4 h-4" />
                        Clear
                      </button>
                    </div>
                    {scanHistory.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => handleHistoryClick(item)}
                        className="w-full flex items-center justify-between p-3 bg-white/5 hover:bg-white/10 rounded-lg transition-colors text-left"
                        data-testid={`history-item-${item.id}`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                            item.overallScore >= 80 ? 'bg-green-500/20 text-green-400' :
                            item.overallScore >= 60 ? 'bg-yellow-500/20 text-yellow-400' :
                            'bg-red-500/20 text-red-400'
                          }`}>
                            {getGradeLetter(item.overallScore)}
                          </div>
                          <div className="min-w-0">
                            <p className="text-white text-sm truncate">{item.url}</p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(item.createdAt).toLocaleDateString()} • Score: {item.overallScore}
                            </p>
                          </div>
                        </div>
                        {item.shareToken && (
                          <ExternalLink className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                        )}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}

          <AnimatePresence mode="wait">
            {result && (
              <motion.div
                key={result.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.5 }}
              >
                <div className={`glass-panel rounded-2xl p-8 mb-8 bg-gradient-to-br ${getGradeBg(result.overallScore)}`}>
                  <div className="flex flex-col lg:flex-row items-center gap-8">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
                      className="relative"
                    >
                      <div className={`w-40 h-40 rounded-full border-4 ${getGradeColor(result.overallScore).replace('text-', 'border-')} flex items-center justify-center bg-black/50`}>
                        <div className="text-center">
                          <span className={`text-6xl font-bold ${getGradeColor(result.overallScore)}`}>
                            {getGradeLetter(result.overallScore)}
                          </span>
                          <p className="text-2xl font-bold text-white">{result.overallScore}</p>
                        </div>
                      </div>
                    </motion.div>

                    <div className="flex-1 text-center lg:text-left">
                      <h2 className="text-2xl font-bold mb-2">
                        <a href={result.url} target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">
                          {result.url}
                        </a>
                      </h2>
                      <p className="text-muted-foreground mb-4">
                        Analyzed {new Date(result.createdAt).toLocaleDateString()} at {new Date(result.createdAt).toLocaleTimeString()}
                      </p>
                      <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
                        <ScoreCircle score={result.seoScore} label="SEO" icon={FileText} />
                        <ScoreCircle score={result.securityScore} label="Security" icon={Shield} />
                        <ScoreCircle score={result.performanceScore} label="Performance" icon={Zap} />
                        <ScoreCircle score={result.keywordsScore} label="Keywords" icon={Key} />
                        <ScoreCircle score={result.accessibilityScore} label="Accessibility" icon={Accessibility} />
                        <ScoreCircle score={result.emailSecurityScore || 0} label="Email" icon={Mail} />
                        <ScoreCircle score={result.mobileScore || 0} label="Mobile" icon={Smartphone} />
                        {result.fdicScore !== null && result.fdicScore !== undefined && (
                          <ScoreCircle score={result.fdicScore} label="FDIC" icon={Building} />
                        )}
                        {result.secScore !== null && result.secScore !== undefined && (
                          <ScoreCircle score={result.secScore} label="SEC" icon={Scale} />
                        )}
                        {result.adaScore !== null && result.adaScore !== undefined && (
                          <ScoreCircle score={result.adaScore} label="ADA" icon={Accessibility} />
                        )}
                        {result.pciScore !== null && result.pciScore !== undefined && (
                          <ScoreCircle score={result.pciScore} label="PCI" icon={CreditCard} />
                        )}
                        {result.fcaScore !== null && result.fcaScore !== undefined && (
                          <ScoreCircle score={result.fcaScore} label="FCA" icon={Scale} />
                        )}
                        {result.gdprScore !== null && result.gdprScore !== undefined && (
                          <ScoreCircle score={result.gdprScore} label="GDPR" icon={Cookie} />
                        )}
                      </div>

                      {(result.hostProvider || result.hostCountry) && (
                        <div className="mt-4 p-3 bg-white/5 rounded-lg border border-white/10">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                            <Server className="w-4 h-4" />
                            <span className="font-medium text-white">Hosting Info</span>
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            {result.hostProvider && (
                              <div>
                                <span className="text-muted-foreground">Provider:</span>
                                <p className="text-white truncate">{result.hostProvider}</p>
                              </div>
                            )}
                            {result.hostCountry && (
                              <div className="flex items-start gap-1">
                                <MapPin className="w-3 h-3 mt-0.5 text-muted-foreground" />
                                <p className="text-white">{result.hostCity ? `${result.hostCity}, ` : ''}{result.hostCountry}</p>
                              </div>
                            )}
                            {result.blacklistStatus && (
                              <div>
                                <span className="text-muted-foreground">Reputation:</span>
                                <p className={result.blacklistStatus === 'clean' ? 'text-green-400' : 'text-red-400'}>
                                  {result.blacklistStatus === 'clean' ? 'Clean' : 'Blacklisted'}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {result.coreWebVitals && (
                        <div className="mt-4 p-4 bg-gradient-to-br from-purple-500/10 to-cyan-500/10 rounded-lg border border-purple-500/20">
                          <div className="flex items-center gap-2 text-sm mb-3">
                            <Zap className="w-4 h-4 text-purple-400" />
                            <span className="font-medium text-white">Core Web Vitals</span>
                            <span className="text-xs text-muted-foreground">(via Lighthouse)</span>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            {result.coreWebVitals.lcp !== null && (
                              <div className="p-2 bg-black/30 rounded-lg">
                                <p className="text-xs text-muted-foreground">LCP</p>
                                <p className={`text-lg font-bold ${
                                  result.coreWebVitals.lcp <= 2500 ? 'text-green-400' : 
                                  result.coreWebVitals.lcp <= 4000 ? 'text-yellow-400' : 'text-red-400'
                                }`}>
                                  {(result.coreWebVitals.lcp / 1000).toFixed(1)}s
                                </p>
                                <p className="text-[10px] text-muted-foreground">Largest Contentful Paint</p>
                              </div>
                            )}
                            {result.coreWebVitals.cls !== null && (
                              <div className="p-2 bg-black/30 rounded-lg">
                                <p className="text-xs text-muted-foreground">CLS</p>
                                <p className={`text-lg font-bold ${
                                  result.coreWebVitals.cls <= 0.1 ? 'text-green-400' : 
                                  result.coreWebVitals.cls <= 0.25 ? 'text-yellow-400' : 'text-red-400'
                                }`}>
                                  {result.coreWebVitals.cls.toFixed(3)}
                                </p>
                                <p className="text-[10px] text-muted-foreground">Cumulative Layout Shift</p>
                              </div>
                            )}
                            {result.coreWebVitals.tbt !== null && (
                              <div className="p-2 bg-black/30 rounded-lg">
                                <p className="text-xs text-muted-foreground">TBT</p>
                                <p className={`text-lg font-bold ${
                                  result.coreWebVitals.tbt <= 300 ? 'text-green-400' : 
                                  result.coreWebVitals.tbt <= 600 ? 'text-yellow-400' : 'text-red-400'
                                }`}>
                                  {Math.round(result.coreWebVitals.tbt)}ms
                                </p>
                                <p className="text-[10px] text-muted-foreground">Total Blocking Time</p>
                              </div>
                            )}
                            {result.coreWebVitals.fcp !== null && (
                              <div className="p-2 bg-black/30 rounded-lg">
                                <p className="text-xs text-muted-foreground">FCP</p>
                                <p className={`text-lg font-bold ${
                                  result.coreWebVitals.fcp <= 1800 ? 'text-green-400' : 
                                  result.coreWebVitals.fcp <= 3000 ? 'text-yellow-400' : 'text-red-400'
                                }`}>
                                  {(result.coreWebVitals.fcp / 1000).toFixed(1)}s
                                </p>
                                <p className="text-[10px] text-muted-foreground">First Contentful Paint</p>
                              </div>
                            )}
                            {result.coreWebVitals.speedIndex !== null && (
                              <div className="p-2 bg-black/30 rounded-lg">
                                <p className="text-xs text-muted-foreground">Speed Index</p>
                                <p className={`text-lg font-bold ${
                                  result.coreWebVitals.speedIndex <= 3400 ? 'text-green-400' : 
                                  result.coreWebVitals.speedIndex <= 5800 ? 'text-yellow-400' : 'text-red-400'
                                }`}>
                                  {(result.coreWebVitals.speedIndex / 1000).toFixed(1)}s
                                </p>
                                <p className="text-[10px] text-muted-foreground">Visual Loading Speed</p>
                              </div>
                            )}
                            {result.coreWebVitals.tti !== null && (
                              <div className="p-2 bg-black/30 rounded-lg">
                                <p className="text-xs text-muted-foreground">TTI</p>
                                <p className={`text-lg font-bold ${
                                  result.coreWebVitals.tti <= 3800 ? 'text-green-400' : 
                                  result.coreWebVitals.tti <= 7300 ? 'text-yellow-400' : 'text-red-400'
                                }`}>
                                  {(result.coreWebVitals.tti / 1000).toFixed(1)}s
                                </p>
                                <p className="text-[10px] text-muted-foreground">Time to Interactive</p>
                              </div>
                            )}
                          </div>
                          {(result.coreWebVitals.lighthousePerformance !== null || result.coreWebVitals.lighthouseAccessibility !== null) && (
                            <div className="mt-3 pt-3 border-t border-white/10">
                              <p className="text-xs text-muted-foreground mb-2">Lighthouse Scores</p>
                              <div className="flex flex-wrap gap-3">
                                {result.coreWebVitals.lighthousePerformance !== null && (
                                  <div className="flex items-center gap-1">
                                    <span className={`text-sm font-bold ${
                                      result.coreWebVitals.lighthousePerformance >= 90 ? 'text-green-400' :
                                      result.coreWebVitals.lighthousePerformance >= 50 ? 'text-yellow-400' : 'text-red-400'
                                    }`}>{result.coreWebVitals.lighthousePerformance}</span>
                                    <span className="text-xs text-muted-foreground">Performance</span>
                                  </div>
                                )}
                                {result.coreWebVitals.lighthouseAccessibility !== null && (
                                  <div className="flex items-center gap-1">
                                    <span className={`text-sm font-bold ${
                                      result.coreWebVitals.lighthouseAccessibility >= 90 ? 'text-green-400' :
                                      result.coreWebVitals.lighthouseAccessibility >= 50 ? 'text-yellow-400' : 'text-red-400'
                                    }`}>{result.coreWebVitals.lighthouseAccessibility}</span>
                                    <span className="text-xs text-muted-foreground">Accessibility</span>
                                  </div>
                                )}
                                {result.coreWebVitals.lighthouseSeo !== null && (
                                  <div className="flex items-center gap-1">
                                    <span className={`text-sm font-bold ${
                                      result.coreWebVitals.lighthouseSeo >= 90 ? 'text-green-400' :
                                      result.coreWebVitals.lighthouseSeo >= 50 ? 'text-yellow-400' : 'text-red-400'
                                    }`}>{result.coreWebVitals.lighthouseSeo}</span>
                                    <span className="text-xs text-muted-foreground">SEO</span>
                                  </div>
                                )}
                                {result.coreWebVitals.lighthouseBestPractices !== null && (
                                  <div className="flex items-center gap-1">
                                    <span className={`text-sm font-bold ${
                                      result.coreWebVitals.lighthouseBestPractices >= 90 ? 'text-green-400' :
                                      result.coreWebVitals.lighthouseBestPractices >= 50 ? 'text-yellow-400' : 'text-red-400'
                                    }`}>{result.coreWebVitals.lighthouseBestPractices}</span>
                                    <span className="text-xs text-muted-foreground">Best Practices</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col gap-3">
                      <Button
                        onClick={handleDownloadPDF}
                        variant="outline"
                        className="gap-2"
                        data-testid="button-download-pdf"
                      >
                        <Download className="w-4 h-4" />
                        Download PDF
                      </Button>
                      <Button
                        onClick={handleCopyResults}
                        variant="outline"
                        className="gap-2"
                        data-testid="button-copy-results"
                      >
                        {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        {copied ? "Copied!" : "Copy for AI"}
                      </Button>
                      {result.shareToken && (
                        <>
                          <Button
                            onClick={() => window.location.href = `/report/${result.shareToken}`}
                            variant="outline"
                            className="gap-2 border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/10"
                            data-testid="button-view-report"
                          >
                            <ExternalLink className="w-4 h-4" />
                            View Live Report
                          </Button>
                          <Button
                            onClick={() => {
                              const shareUrl = `${window.location.origin}/report/${result.shareToken}`;
                              navigator.clipboard.writeText(shareUrl);
                              setShareCopied(true);
                              setTimeout(() => setShareCopied(false), 2000);
                              trackEvent('grader_share_link_copy', 'website_grader', result.url);
                              toast({ title: "Share link copied!", description: "Anyone with this link can view the report" });
                            }}
                            variant="outline"
                            className="gap-2"
                            data-testid="button-share-link"
                          >
                            {shareCopied ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
                            {shareCopied ? "Copied!" : "Share Report"}
                          </Button>
                        </>
                      )}
                      <Button
                        onClick={handleScanAgain}
                        variant="default"
                        className="gap-2 bg-primary hover:bg-primary/90"
                        data-testid="button-scan-again"
                      >
                        <RefreshCw className="w-4 h-4" />
                        Scan Again
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="glass-panel rounded-2xl p-6">
                  <div className="flex flex-wrap gap-2 mb-6">
                    {categories.map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() => setActiveCategory(cat.id)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                          activeCategory === cat.id
                            ? "bg-primary text-black"
                            : "bg-white/5 text-white/70 hover:bg-white/10"
                        }`}
                        data-testid={`button-filter-${cat.id}`}
                      >
                        <cat.icon className="w-4 h-4" />
                        {cat.label}
                        <span className="text-xs opacity-70">
                          ({cat.id === "all" 
                            ? result.findings.length 
                            : result.findings.filter(f => f.category === cat.id).length})
                        </span>
                      </button>
                    ))}
                  </div>

                  <div className="space-y-3">
                    {filteredFindings.map((finding, index) => (
                      <FindingCard key={index} finding={finding} />
                    ))}
                  </div>
                </div>

                {/* Contact CTA after report */}
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="mt-8 glass-panel rounded-2xl p-8 bg-gradient-to-br from-primary/20 to-purple-500/10 border border-primary/30"
                >
                  <div className="flex flex-col md:flex-row items-center gap-6">
                    <div className="flex-1 text-center md:text-left">
                      <h3 className="text-2xl font-bold mb-2">
                        Need Help Fixing These Issues?
                      </h3>
                      <p className="text-muted-foreground">
                        Our team of experts can help improve your website's SEO, security, performance, and accessibility. 
                        Get a free consultation to discuss your report findings.
                      </p>
                    </div>
                    <Button
                      onClick={() => {
                        const issues = result.findings.filter(f => !f.passed).length;
                        const message = `Hi! I just ran the Website Grader on ${result.url} and got a score of ${result.overallScore}/100 (${getGradeLetter(result.overallScore)}). I have ${issues} issues to address and would like help improving my website.`;
                        window.location.href = `/?contact=true&message=${encodeURIComponent(message)}`;
                      }}
                      size="lg"
                      className="bg-primary text-black hover:bg-primary/90 font-bold gap-2 whitespace-nowrap"
                      data-testid="button-contact-expert"
                    >
                      <MessageSquare className="w-5 h-5" />
                      Talk to an Expert
                      <ArrowRight className="w-5 h-5" />
                    </Button>
                  </div>
                </motion.div>

                {/* Rescan Form - shown after results */}
                <motion.form
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  onSubmit={handleSubmit}
                  className="mt-8 glass-panel rounded-2xl p-6"
                >
                  <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                    <Search className="w-5 h-5 text-primary" />
                    Scan Another Website
                  </h3>
                  <div className="flex gap-4">
                    <Input
                      type="text"
                      inputMode="url"
                      autoCapitalize="off"
                      autoCorrect="off"
                      placeholder="Enter your website URL (e.g., example.com)"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      className="flex-1 h-12 bg-white/5 border-white/10 focus:border-primary"
                      data-testid="input-website-url-bottom"
                    />
                    <Button
                      type="submit"
                      size="lg"
                      className="h-12 px-6 bg-primary text-black hover:bg-primary/90 font-bold"
                      disabled={gradeMutation.isPending || !url.trim()}
                      data-testid="button-analyze-bottom"
                    >
                      {gradeMutation.isPending ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <>
                          <Search className="w-5 h-5 mr-2" />
                          Analyze
                        </>
                      )}
                    </Button>
                  </div>

                  <div className="mt-4 p-4 bg-white/5 rounded-lg border border-white/10">
                    <p className="text-sm text-muted-foreground mb-3">
                      <Shield className="w-4 h-4 inline mr-1" />
                      Optional: Add regulatory compliance checks
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {complianceOptions.map((option) => (
                        <button
                          key={option.id}
                          type="button"
                          onClick={() => option.status === 'free' && toggleCompliance(option.id)}
                          disabled={option.status !== 'free'}
                          className={`min-h-[44px] px-3 py-2 rounded-lg border text-sm font-medium transition-all ${
                            option.status !== 'free'
                              ? "bg-white/5 border-white/10 text-muted-foreground opacity-60 cursor-not-allowed"
                              : complianceChecks[option.id]
                              ? "bg-primary/20 border-primary text-primary"
                              : "bg-white/5 border-white/10 text-muted-foreground hover:border-white/30"
                          }`}
                          data-testid={`checkbox-compliance-${option.id}-bottom`}
                        >
                          <span className="font-bold">{option.label}</span>
                          <span className="ml-1 text-xs opacity-70">({option.description})</span>
                          {option.status !== 'free' && (
                            <FeatureBadge status={option.status} tier={option.tier} className="ml-2" />
                          )}
                        </button>
                      ))}
                    </div>
                    <div className="mt-3 pt-3 border-t border-white/10">
                      <button
                        type="button"
                        onClick={() => setForceRefresh(!forceRefresh)}
                        className={`min-h-[44px] flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium transition-all ${
                          forceRefresh
                            ? "bg-orange-500/20 border-orange-500 text-orange-400"
                            : "bg-white/5 border-white/10 text-muted-foreground hover:border-white/30"
                        }`}
                        data-testid="checkbox-force-refresh-bottom"
                      >
                        <RefreshCw className="w-4 h-4" />
                        <span>Force Fresh Scan</span>
                        <span className="text-xs opacity-70">(bypass 24h cache)</span>
                      </button>
                    </div>
                  </div>

                  {gradeMutation.isError && (
                    <p className="mt-3 text-red-400 text-sm text-center">
                      {gradeMutation.error.message}
                    </p>
                  )}
                  
                  <p className="mt-4 text-xs text-muted-foreground text-center">
                    This is a free tool. Results are for informational purposes only.
                  </p>
                </motion.form>
              </motion.div>
            )}
          </AnimatePresence>

          {!result && !gradeMutation.isPending && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-center text-muted-foreground"
            >
              <div className="grid md:grid-cols-5 gap-6 max-w-5xl mx-auto">
                {[
                  { icon: FileText, title: "SEO Analysis", desc: "Meta tags, headings, images, Open Graph" },
                  { icon: Shield, title: "Security Check", desc: "HTTPS, security headers, vulnerabilities" },
                  { icon: Zap, title: "Performance", desc: "Page speed, Core Web Vitals" },
                  { icon: Key, title: "Keywords", desc: "Keyword density, placement, optimization" },
                  { icon: Accessibility, title: "Accessibility", desc: "WCAG, screen readers, keyboard nav" },
                ].map((item, i) => (
                  <div key={i} className="glass-panel p-6 rounded-xl text-center">
                    <item.icon className="w-10 h-10 mx-auto mb-3 text-primary" />
                    <h3 className="font-bold text-white mb-2">{item.title}</h3>
                    <p className="text-sm">{item.desc}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </main>
      <Footer />

      <GuidedTour
        tourId="grader"
        steps={[
          {
            id: "url-input",
            target: "[data-testid='input-website-url']",
            title: "Enter Any Website URL",
            content: "Type or paste the website address you want to analyze. We'll scan it for SEO, security, and more.",
            placement: "bottom"
          },
          {
            id: "analyze-button",
            target: "[data-testid='button-analyze']",
            title: "Start the Analysis",
            content: "Click here to begin the website scan. Results typically appear within 30 seconds.",
            placement: "bottom"
          },
          {
            id: "history",
            target: "[data-testid='button-toggle-history']",
            title: "View Your Scan History",
            content: "Access previous scans stored in your browser. You can re-scan or share results anytime.",
            placement: "left"
          }
        ]}
        onComplete={() => console.log("Grader tour completed")}
      />
      <HelpButton />
    </div>
  );
}
