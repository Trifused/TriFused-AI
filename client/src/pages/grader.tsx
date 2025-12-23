import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
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
  Link2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { trackEvent, trackPageView } from "@/lib/analytics";

interface Finding {
  category: "seo" | "security" | "performance" | "keywords" | "accessibility" | "email";
  issue: string;
  impact: string;
  priority: "critical" | "important" | "optional";
  howToFix: string;
  passed: boolean;
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
  findings: Finding[];
  createdAt: string;
  shareToken: string | null;
  qrCodeData: string | null;
  hostIp: string | null;
  hostCountry: string | null;
  hostCity: string | null;
  hostProvider: string | null;
  blacklistStatus: string | null;
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

// Compliance check options
const complianceOptions = [
  { id: "fdic", label: "FDIC", description: "Bank deposit insurance signage" },
  { id: "sec", label: "SEC", description: "Securities disclosures" },
  { id: "ada", label: "ADA", description: "Accessibility (WCAG)" },
  { id: "pci", label: "PCI", description: "Payment card security" },
  { id: "fca", label: "FCA", description: "UK financial promotions" },
  { id: "gdpr", label: "GDPR", description: "EU privacy compliance" },
];

export default function Grader() {
  const [url, setUrl] = useState("");
  const [result, setResult] = useState<GradeResult | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [copied, setCopied] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);
  const [complianceChecks, setComplianceChecks] = useState<Record<string, boolean>>({});
  const { toast } = useToast();

  useEffect(() => {
    trackPageView('/grader');
  }, []);

  const gradeMutation = useMutation({
    mutationFn: async (websiteUrl: string) => {
      const response = await fetch("/api/grade", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: websiteUrl, complianceChecks }),
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
    },
  });

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

## Overall Score: ${result.overallScore}/100 (Grade: ${getGradeLetter(result.overallScore)})

### Category Scores:
- SEO: ${result.seoScore}/100
- Security: ${result.securityScore}/100
- Performance: ${result.performanceScore}/100
- Keywords: ${result.keywordsScore}/100
- Accessibility: ${result.accessibilityScore}/100

## Issues Found (${issues.length}):
${issues.map(f => `
### [${f.category.toUpperCase()}] ${f.issue} (${f.priority})
**Impact:** ${f.impact}
**How to fix:** ${f.howToFix}
`).join('')}

## Passed Checks (${passes.length}):
${passes.map(f => `- [${f.category.toUpperCase()}] ${f.issue}`).join('\n')}

---
Analyzed on ${new Date(result.createdAt).toLocaleString()}
Generated by TriFused Website Grader`;

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

  const categories = [
    { id: "all", label: "All", icon: Globe },
    { id: "seo", label: "SEO", icon: FileText },
    { id: "security", label: "Security", icon: Shield },
    { id: "performance", label: "Performance", icon: Zap },
    { id: "keywords", label: "Keywords", icon: Key },
    { id: "accessibility", label: "Accessibility", icon: Accessibility },
    { id: "email", label: "Email Security", icon: Mail },
  ];

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
            <h1 className="text-4xl md:text-6xl font-bold font-heading mb-4">
              Website <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-500">Grader</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Get a comprehensive analysis of your website's SEO, security, performance, accessibility (WCAG), and keyword optimization with actionable recommendations.
            </p>
          </motion.div>

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
                    onClick={() => toggleCompliance(option.id)}
                    className={`px-3 py-2 rounded-lg border text-sm font-medium transition-all ${
                      complianceChecks[option.id]
                        ? "bg-primary/20 border-primary text-primary"
                        : "bg-white/5 border-white/10 text-muted-foreground hover:border-white/30"
                    }`}
                    data-testid={`checkbox-compliance-${option.id}`}
                  >
                    <span className="font-bold">{option.label}</span>
                    <span className="ml-1 text-xs opacity-70">({option.description})</span>
                  </button>
                ))}
              </div>
            </div>

            {gradeMutation.isError && (
              <p className="mt-3 text-red-400 text-sm text-center">
                {gradeMutation.error.message}
              </p>
            )}
          </motion.form>

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
                      )}
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
    </div>
  );
}
