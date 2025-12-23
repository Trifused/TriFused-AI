import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { motion } from "framer-motion";
import { useEffect, useState, useRef } from "react";
import { useParams } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { 
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
  Accessibility,
  Mail,
  Server,
  MapPin,
  Send,
  Building,
  Scale,
  CreditCard,
  Cookie,
  RefreshCw,
  Search,
  History,
  ExternalLink,
  Trash2,
  Copy,
  Check
} from "lucide-react";
import { trackPageView } from "@/lib/analytics";

interface Finding {
  category: "seo" | "security" | "performance" | "keywords" | "accessibility" | "email" | "fdic" | "sec" | "ada" | "pci" | "fca" | "gdpr";
  issue: string;
  impact: string;
  priority: "critical" | "important" | "optional";
  howToFix: string;
  passed: boolean;
}

interface GradeResult {
  id: string;
  url: string;
  domain: string;
  overallScore: number;
  seoScore: number;
  securityScore: number;
  performanceScore: number;
  keywordsScore: number;
  accessibilityScore: number;
  emailSecurityScore: number;
  findings: Finding[];
  companyName: string | null;
  hostIp: string | null;
  hostCountry: string | null;
  hostCity: string | null;
  hostProvider: string | null;
  blacklistStatus: string | null;
  createdAt: string;
  qrCodeData: string | null;
  fdicScore: number | null;
  secScore: number | null;
  adaScore: number | null;
  pciScore: number | null;
  fcaScore: number | null;
  gdprScore: number | null;
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

interface ScanHistoryItem {
  id: string;
  url: string;
  overallScore: number;
  createdAt: string;
  shareToken: string | null;
}

const HISTORY_KEY = 'trifused_scan_history';

function loadHistory(): ScanHistoryItem[] {
  try {
    const stored = localStorage.getItem(HISTORY_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

const complianceOptions = [
  { id: "fdic", label: "FDIC", description: "Bank deposit insurance signage" },
  { id: "sec", label: "SEC", description: "Securities disclosures" },
  { id: "ada", label: "ADA", description: "Accessibility (WCAG)" },
  { id: "pci", label: "PCI", description: "Payment card security" },
  { id: "fca", label: "FCA", description: "UK financial promotions" },
  { id: "gdpr", label: "GDPR", description: "EU privacy compliance" },
];

export default function Report() {
  const params = useParams<{ shareToken: string }>();
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [contactForm, setContactForm] = useState({ name: "", email: "", company: "", message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [scanUrl, setScanUrl] = useState("");
  const [scanHistory, setScanHistory] = useState<ScanHistoryItem[]>([]);
  const [showHistory, setShowHistory] = useState(true);
  const [selectedCompliance, setSelectedCompliance] = useState<string[]>([]);
  const viewTrackedRef = useRef(false);
  const { toast } = useToast();

  useEffect(() => {
    trackPageView('/report');
    setScanHistory(loadHistory());
  }, []);
  
  const toggleCompliance = (id: string) => {
    setSelectedCompliance(prev => 
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    );
  };
  
  const handleScanSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let processedUrl = scanUrl.trim();
    if (!processedUrl) return;
    if (!processedUrl.startsWith("http://") && !processedUrl.startsWith("https://")) {
      processedUrl = "https://" + processedUrl;
    }
    let graderUrl = `/grader?rescan=${encodeURIComponent(processedUrl)}`;
    if (selectedCompliance.length > 0) {
      graderUrl += `&compliance=${selectedCompliance.join(',')}`;
    }
    window.location.href = graderUrl;
  };
  
  const handleHistoryClick = (item: ScanHistoryItem) => {
    if (item.shareToken) {
      window.location.href = `/report/${item.shareToken}`;
    }
  };
  
  const clearHistory = () => {
    setScanHistory([]);
    localStorage.removeItem(HISTORY_KEY);
    toast({ title: "History cleared" });
  };

  // Track view on mount (only once)
  useEffect(() => {
    if (params.shareToken && !viewTrackedRef.current) {
      viewTrackedRef.current = true;
      fetch(`/api/report/${params.shareToken}/events`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventType: 'view' }),
      }).catch(() => {});
    }
  }, [params.shareToken]);

  const { data: result, isLoading, error } = useQuery<GradeResult>({
    queryKey: ['report', params.shareToken],
    queryFn: async () => {
      const response = await fetch(`/api/report/${params.shareToken}`);
      if (!response.ok) {
        throw new Error("Report not found");
      }
      return response.json();
    },
  });
  
  const [copied, setCopied] = useState(false);
  
  useEffect(() => {
    if (result?.url) {
      setScanUrl(result.url);
    }
  }, [result?.url]);
  
  const handleCopyForAI = () => {
    if (!result) return;
    const failures = result.findings.filter(f => !f.passed);
    const passes = result.findings.filter(f => f.passed);
    
    const text = `Website Grade Report for ${result.url}
(Free Tool - For informational purposes only)

Overall Score: ${result.overallScore}/100 (Grade: ${getGradeLetter(result.overallScore)})

Category Scores:
- SEO: ${result.seoScore}/100
- Security: ${result.securityScore}/100
- Performance: ${result.performanceScore}/100
- Keywords: ${result.keywordsScore}/100
- Accessibility: ${result.accessibilityScore}/100
- Email Security: ${result.emailSecurityScore || 0}/100

${failures.length > 0 ? `Issues Found (${failures.length}):
${failures.map(f => `- [${f.priority.toUpperCase()}] ${f.issue}: ${f.impact}
  Fix: ${f.howToFix}`).join('\n\n')}` : 'No issues found!'}

${passes.length > 0 ? `Passing Checks (${passes.length}):
${passes.map(f => `- ${f.issue}`).join('\n')}` : ''}`;
    
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({ title: "Copied!", description: "Report copied to clipboard for AI analysis" });
  };

  const handleDownloadPDF = async () => {
    if (!result || !params.shareToken) return;
    try {
      const response = await fetch(`/api/report/${params.shareToken}/pdf`);
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
      console.error("Failed to download PDF:", error);
      toast({ title: "Error", description: "Failed to download PDF", variant: "destructive" });
    }
  };

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactForm.name || !contactForm.email || !contactForm.message) {
      toast({ title: "Missing fields", description: "Please fill in all required fields", variant: "destructive" });
      return;
    }
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contactForm),
      });
      if (!response.ok) throw new Error("Failed to submit");
      setContactForm({ name: "", email: "", company: "", message: "" });
      toast({ title: "Message sent!", description: "We'll be in touch soon." });
    } catch (error) {
      toast({ title: "Error", description: "Failed to send message", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredFindings = result?.findings?.filter(f => 
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
      </div>
    );
  }

  if (error || !result) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-3xl font-bold text-white mb-4">Report Not Found</h1>
          <p className="text-muted-foreground">This report link may have expired or is invalid.</p>
          <Button className="mt-6" onClick={() => window.location.href = "/grader"}>
            Analyze Your Website
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 pt-24 pb-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto"
        >
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Website Grade Report</h1>
            <p className="text-xs text-muted-foreground mb-2">Free Tool - For informational purposes only</p>
            <p className="text-cyan-400 font-mono">{result.url}</p>
            {result.companyName && (
              <p className="text-muted-foreground mt-1">{result.companyName}</p>
            )}
            <p className="text-sm text-muted-foreground mt-2">
              Generated: {new Date(result.createdAt).toLocaleDateString()}
            </p>
          </div>

          <div className="bg-white/5 rounded-2xl p-8 border border-white/10 mb-8">
            <div className="flex flex-col items-center mb-8">
              <div className="relative w-32 h-32 mb-4">
                <svg className="w-32 h-32 -rotate-90" viewBox="0 0 100 100">
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
                    className={getGradeColor(result.overallScore)}
                    initial={{ strokeDashoffset: 2 * Math.PI * 40 }}
                    animate={{ strokeDashoffset: 2 * Math.PI * 40 - (result.overallScore / 100) * 2 * Math.PI * 40 }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    style={{ strokeDasharray: 2 * Math.PI * 40 }}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className={`text-4xl font-bold ${getGradeColor(result.overallScore)}`}>
                    {getGradeLetter(result.overallScore)}
                  </span>
                  <span className="text-sm text-muted-foreground">{result.overallScore}/100</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
              <ScoreCircle score={result.seoScore} label="SEO" icon={FileText} />
              <ScoreCircle score={result.securityScore} label="Security" icon={Shield} />
              <ScoreCircle score={result.performanceScore} label="Speed" icon={Zap} />
              <ScoreCircle score={result.keywordsScore} label="Keywords" icon={Key} />
              <ScoreCircle score={result.accessibilityScore} label="A11y" icon={Accessibility} />
              <ScoreCircle score={result.emailSecurityScore || 0} label="Email" icon={Mail} />
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
          </div>

          {(result.hostProvider || result.hostCountry) && (
            <div className="bg-white/5 rounded-xl p-4 border border-white/10 mb-8">
              <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
                <Server className="w-4 h-4 text-cyan-400" />
                Hosting Information
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                {result.hostProvider && (
                  <div>
                    <span className="text-muted-foreground">Provider:</span>
                    <p className="text-white">{result.hostProvider}</p>
                  </div>
                )}
                {result.hostCountry && (
                  <div className="flex items-start gap-1">
                    <MapPin className="w-3 h-3 mt-1 text-muted-foreground" />
                    <div>
                      <span className="text-muted-foreground">Location:</span>
                      <p className="text-white">{result.hostCity ? `${result.hostCity}, ` : ''}{result.hostCountry}</p>
                    </div>
                  </div>
                )}
                {result.hostIp && (
                  <div>
                    <span className="text-muted-foreground">IP Address:</span>
                    <p className="text-white font-mono text-xs">{result.hostIp}</p>
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

          <div className="flex flex-wrap gap-2 mb-6">
            {categories.map(({ id, label, icon: Icon }) => (
              <Button
                key={id}
                variant={activeCategory === id ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveCategory(id)}
                className={activeCategory === id ? "bg-cyan-500 hover:bg-cyan-600" : ""}
                data-testid={`filter-${id}`}
              >
                <Icon className="w-4 h-4 mr-1" />
                {label}
              </Button>
            ))}
          </div>

          <div className="space-y-4 mb-8">
            {filteredFindings.map((finding, index) => (
              <FindingCard key={index} finding={finding} />
            ))}
          </div>

          <div className="flex flex-wrap justify-center gap-3 mb-12">
            <Button onClick={handleDownloadPDF} className="gap-2" data-testid="button-download-pdf">
              <Download className="w-4 h-4" />
              Download PDF
            </Button>
            <Button 
              variant="outline"
              onClick={handleCopyForAI}
              className="gap-2"
              data-testid="button-copy-ai"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? "Copied!" : "Copy for AI"}
            </Button>
            <Button 
              variant="outline" 
              onClick={() => {
                const url = encodeURIComponent(result?.url || '');
                window.location.href = `/grader?rescan=${url}`;
              }} 
              className="gap-2"
              data-testid="button-rescan"
            >
              <RefreshCw className="w-4 h-4" />
              Rescan
            </Button>
          </div>

          <div className="bg-white/5 rounded-xl p-6 border border-white/10 mb-8">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Search className="w-5 h-5 text-cyan-400" />
              Rescan Website
            </h3>
            <form onSubmit={handleScanSubmit} className="space-y-4">
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <Input
                    value={scanUrl}
                    onChange={(e) => setScanUrl(e.target.value)}
                    placeholder="Enter website URL..."
                    className="bg-white/5 border-white/10"
                    data-testid="input-rescan-url-bottom"
                  />
                </div>
                <Button type="submit" className="bg-cyan-500 hover:bg-cyan-600" data-testid="button-rescan-bottom">
                  <Search className="w-4 h-4 mr-2" />
                  Scan
                </Button>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {complianceOptions.map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => toggleCompliance(opt.id)}
                    className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                      selectedCompliance.includes(opt.id)
                        ? "bg-cyan-500 text-black font-medium"
                        : "bg-white/5 text-white/70 hover:bg-white/10"
                    }`}
                    data-testid={`button-compliance-${opt.id}`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
              <p className="mt-3 text-xs text-muted-foreground text-center">
                Free tool - Results are for informational purposes only
              </p>
            </form>
          </div>
          
          {scanHistory.length > 0 && (
            <div className="bg-white/5 rounded-xl p-6 border border-white/10 mb-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <History className="w-5 h-5 text-cyan-400" />
                  Scan History
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearHistory}
                  className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
                  data-testid="button-clear-history"
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  Clear
                </Button>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-left text-sm font-medium text-muted-foreground py-2">Website</th>
                      <th className="text-center text-sm font-medium text-muted-foreground py-2">Grade</th>
                      <th className="text-right text-sm font-medium text-muted-foreground py-2">Date</th>
                      <th className="text-right text-sm font-medium text-muted-foreground py-2"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {scanHistory.map((item, index) => (
                      <tr 
                        key={item.id}
                        className="border-b border-white/5 hover:bg-white/5 cursor-pointer transition-colors"
                        onClick={() => handleHistoryClick(item)}
                        data-testid={`row-history-${index}`}
                      >
                        <td className="py-3">
                          <span className="text-sm text-cyan-400 font-mono">{item.url}</span>
                        </td>
                        <td className="py-3 text-center">
                          <span className={`text-lg font-bold ${
                            item.overallScore >= 80 ? "text-green-400" :
                            item.overallScore >= 60 ? "text-yellow-400" : "text-red-400"
                          }`}>
                            {getGradeLetter(item.overallScore)}
                          </span>
                        </td>
                        <td className="py-3 text-right">
                          <span className="text-sm text-muted-foreground">
                            {new Date(item.createdAt).toLocaleDateString()}
                          </span>
                        </td>
                        <td className="py-3 text-right">
                          <ExternalLink className="w-4 h-4 text-muted-foreground inline" />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <div className="bg-white/5 rounded-2xl p-8 border border-white/10 mb-8">
            <h3 className="text-xl font-bold text-white mb-2 text-center">Need Help Improving Your Score?</h3>
            <p className="text-muted-foreground text-center mb-6">
              Our team can help you fix these issues and improve your website performance.
            </p>
            <form onSubmit={handleContactSubmit} className="max-w-md mx-auto space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="contact-name" className="text-white">Name *</Label>
                  <Input
                    id="contact-name"
                    value={contactForm.name}
                    onChange={(e) => setContactForm(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Your name"
                    className="mt-1"
                    data-testid="input-contact-name"
                  />
                </div>
                <div>
                  <Label htmlFor="contact-email" className="text-white">Email *</Label>
                  <Input
                    id="contact-email"
                    type="email"
                    value={contactForm.email}
                    onChange={(e) => setContactForm(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="you@example.com"
                    className="mt-1"
                    data-testid="input-contact-email"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="contact-company" className="text-white">Company</Label>
                <Input
                  id="contact-company"
                  value={contactForm.company}
                  onChange={(e) => setContactForm(prev => ({ ...prev, company: e.target.value }))}
                  placeholder="Your company (optional)"
                  className="mt-1"
                  data-testid="input-contact-company"
                />
              </div>
              <div>
                <Label htmlFor="contact-message" className="text-white">Message *</Label>
                <Textarea
                  id="contact-message"
                  value={contactForm.message}
                  onChange={(e) => setContactForm(prev => ({ ...prev, message: e.target.value }))}
                  placeholder="How can we help you?"
                  className="mt-1"
                  rows={3}
                  data-testid="input-contact-message"
                />
              </div>
              <Button type="submit" className="w-full gap-2" disabled={isSubmitting} data-testid="button-submit-contact">
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                {isSubmitting ? "Sending..." : "Send Message"}
              </Button>
            </form>
          </div>

          {result.qrCodeData && (
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-2">Scan to view this report:</p>
              <img src={result.qrCodeData} alt="QR Code" className="inline-block rounded-lg" />
            </div>
          )}
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}
