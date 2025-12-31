import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { CookieConsent } from "@/components/ui/cookie-consent";
import { 
  Search, 
  Shield, 
  Zap, 
  FileText, 
  Key, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle,
  Loader2,
  Globe,
  Accessibility,
  ArrowRight,
  Mail,
  Smartphone,
  Bot,
  Sparkles,
  Award,
  Lock,
  Copy,
  Check,
  Download,
  Share2,
  RefreshCw,
  ExternalLink,
  History,
  Trash2,
  Store,
  Briefcase,
  Building2,
  Stethoscope,
  Scale,
  GraduationCap,
  Dumbbell,
  Palette,
  Code,
  Rocket
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { LanguageSwitcher } from "@/components/ui/language-switcher";
import { useTranslation } from "react-i18next";

interface Finding {
  category: string;
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
  mobileScore: number;
  aiReadinessScore?: number;
  findings: Finding[];
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

function ScoreCircle({ score, label, icon: Icon }: { score: number; label: string; icon: any }) {
  const color = getGradeColor(score);
  const circumference = 2 * Math.PI * 40;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative w-20 h-20">
        <svg className="w-20 h-20 -rotate-90" viewBox="0 0 100 100">
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
            transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
            style={{ strokeDasharray: circumference }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={`text-xl font-bold ${color}`}>{score}</span>
        </div>
      </div>
      <div className="flex items-center gap-1 text-xs text-muted-foreground">
        <Icon className="w-3 h-3" />
        <span>{label}</span>
      </div>
    </div>
  );
}

export default function Vibe2A() {
  const [url, setUrl] = useState("");
  const [result, setResult] = useState<GradeResult | null>(null);
  const [copied, setCopied] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);
  const [useLighthouse, setUseLighthouse] = useState(false);
  const [useAiReadiness, setUseAiReadiness] = useState(false);
  const [forceRefresh, setForceRefresh] = useState(false);
  const [selectedNiche, setSelectedNiche] = useState<string | null>(null);

  const niches = [
    { id: 'local', label: 'Local Business', icon: Store, examples: 'Restaurant, Salon, Contractor' },
    { id: 'ecommerce', label: 'E-Commerce', icon: Briefcase, examples: 'Online Store, Retail' },
    { id: 'realestate', label: 'Real Estate', icon: Building2, examples: 'Agent, Property Listings' },
    { id: 'healthcare', label: 'Healthcare', icon: Stethoscope, examples: 'Clinic, Dentist, Therapist' },
    { id: 'legal', label: 'Legal', icon: Scale, examples: 'Law Firm, Attorney' },
    { id: 'education', label: 'Education', icon: GraduationCap, examples: 'Tutor, Online Course' },
    { id: 'fitness', label: 'Fitness', icon: Dumbbell, examples: 'Gym, Trainer, Wellness' },
    { id: 'agency', label: 'Agency', icon: Palette, examples: 'Marketing, Design, Creative' },
    { id: 'saas', label: 'SaaS / Tech', icon: Code, examples: 'Software, Developer Tools' },
    { id: 'startup', label: 'Startup', icon: Rocket, examples: 'New Venture, MVP' },
  ];
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { t } = useTranslation();

  const handleCopyResults = async () => {
    if (!result) return;
    const issues = result.findings.filter(f => !f.passed);
    const passes = result.findings.filter(f => f.passed);
    
    const text = `# Website Grade Report for ${result.url}
**Scanned:** ${new Date(result.createdAt).toLocaleString()}

## Overall Score: ${result.overallScore}/100 (Grade: ${getGradeLetter(result.overallScore)})

### Category Scores:
- SEO: ${result.seoScore}/100
- Security: ${result.securityScore}/100
- Performance: ${result.performanceScore}/100
- Keywords: ${result.keywordsScore}/100
- Accessibility: ${result.accessibilityScore}/100
- Email Security: ${result.emailSecurityScore || 0}/100
- Mobile: ${result.mobileScore || 0}/100${result.aiReadinessScore != null ? `
- AI Readiness: ${result.aiReadinessScore}/100` : ''}

${issues.length > 0 ? `## Issues Found (${issues.length}):
${issues.map(f => `
### [${f.category.toUpperCase()}] ${f.issue} (${f.priority})
**Impact:** ${f.impact}
**Fix:** ${f.howToFix}
`).join('')}` : '## No issues found!'}

## Passed Checks (${passes.length}):
${passes.map(f => `- ${f.issue}`).join('\n')}
`;

    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({ title: "Copied!", description: "Report copied to clipboard for AI" });
  };

  const handleDownloadPDF = async () => {
    if (!result) return;
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

  const handleScanAgain = () => {
    setResult(null);
    setUrl("");
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const gradeMutation = useMutation({
    mutationFn: async (websiteUrl: string) => {
      try {
        const response = await fetch("/api/grade", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: websiteUrl, useLighthouse, useAiReadiness, forceRefresh }),
        });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || errorData.message || "Failed to grade website");
        }
        return response.json();
      } catch (err: any) {
        if (err.name === 'TypeError' && err.message === 'Failed to fetch') {
          throw new Error("Network error - please check your connection and try again");
        }
        throw err;
      }
    },
    onSuccess: (data) => {
      setResult(data);
      setUrl(data.url);
      toast({ title: "Analysis Complete!", description: `Your website scored ${data.overallScore}/100` });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let processedUrl = url.trim();
    if (!processedUrl) return;
    if (!processedUrl.startsWith("http://") && !processedUrl.startsWith("https://")) {
      processedUrl = "https://" + processedUrl;
    }
    setResult(null);
    gradeMutation.mutate(processedUrl);
  };

  const features = [
    { icon: FileText, title: t('vibe2a.seo_analysis'), desc: t('vibe2a.seo_desc') },
    { icon: Shield, title: t('vibe2a.security_check'), desc: t('vibe2a.security_desc') },
    { icon: Zap, title: t('vibe2a.performance'), desc: t('vibe2a.performance_desc') },
    { icon: Key, title: t('vibe2a.keywords'), desc: t('vibe2a.keywords_desc') },
    { icon: Accessibility, title: t('vibe2a.accessibility'), desc: t('vibe2a.accessibility_desc') },
    { icon: Mail, title: t('vibe2a.email_security'), desc: t('vibe2a.email_desc') },
    { icon: Smartphone, title: t('vibe2a.mobile_ready'), desc: t('vibe2a.mobile_desc') },
    { icon: Bot, title: t('vibe2a.ai_ready'), desc: t('vibe2a.ai_desc') },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-950/80 backdrop-blur-xl border-b border-white/5">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-400 to-cyan-500 flex items-center justify-center">
              <Award className="w-5 h-5 text-slate-900" />
            </div>
            <span className="text-xl font-bold text-white">Vibe2A</span>
          </div>
          <div className="flex items-center gap-4">
            <LanguageSwitcher />
            <Button
              onClick={() => setLocation('/portal/signup')}
              className="bg-gradient-to-r from-green-500 to-cyan-500 hover:from-green-400 hover:to-cyan-400 text-slate-900 font-semibold"
              data-testid="button-signup-nav"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              {t('vibe2a.free_account')}
            </Button>
          </div>
        </div>
      </nav>

      <main className="pt-24 pb-16">
        <section className="container mx-auto px-4 text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-sm font-medium mb-6">
              <Award className="w-4 h-4" />
              {t('vibe2a.badge')}
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              {t('vibe2a.title_line1')}
              <span className="block bg-gradient-to-r from-green-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent">
                {t('vibe2a.title_line2')}
              </span>
            </h1>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto mb-10">
              {t('vibe2a.subtitle')}
            </p>
          </motion.div>

          <motion.form
            onSubmit={handleSubmit}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="max-w-2xl mx-auto"
          >
            <div className="flex gap-3 p-2 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10">
              <div className="flex-1 relative">
                <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <Input
                  type="text"
                  inputMode="url"
                  autoCapitalize="off"
                  autoCorrect="off"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  onFocus={(e) => setTimeout(() => e.target.scrollIntoView({ behavior: 'smooth', block: 'center' }), 300)}
                  placeholder={t('vibe2a.placeholder')}
                  className="pl-12 h-14 bg-transparent border-0 text-white text-lg placeholder:text-slate-500 focus-visible:ring-0"
                  data-testid="input-url"
                />
              </div>
              <Button
                type="submit"
                disabled={gradeMutation.isPending || !url.trim()}
                className="h-14 px-8 bg-gradient-to-r from-green-500 to-cyan-500 hover:from-green-400 hover:to-cyan-400 text-slate-900 font-semibold text-lg rounded-xl"
                data-testid="button-analyze"
              >
                {gradeMutation.isPending ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    {t('common.loading')}
                  </>
                ) : (
                  <>
                    <Search className="w-5 h-5 mr-2" />
                    {t('vibe2a.analyze')}
                  </>
                )}
              </Button>
            </div>
            <div className="flex items-center justify-center gap-4 mt-4 flex-wrap">
              <button
                type="button"
                onClick={() => setUseLighthouse(!useLighthouse)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-all ${
                  useLighthouse 
                    ? 'bg-cyan-500/20 border border-cyan-500/50 text-cyan-400' 
                    : 'bg-white/5 border border-white/10 text-slate-400 hover:border-white/20'
                }`}
                data-testid="checkbox-lighthouse"
              >
                <Zap className="w-4 h-4" />
                <span>{t('vibe2a.deep_scan')}</span>
                {useLighthouse && <CheckCircle2 className="w-4 h-4" />}
              </button>
              <button
                type="button"
                onClick={() => setUseAiReadiness(!useAiReadiness)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-all ${
                  useAiReadiness 
                    ? 'bg-green-500/20 border border-green-500/50 text-green-400' 
                    : 'bg-white/5 border border-white/10 text-slate-400 hover:border-white/20'
                }`}
                data-testid="checkbox-ai-readiness"
              >
                <Bot className="w-4 h-4" />
                <span>{t('vibe2a.ai_readiness')}</span>
                {useAiReadiness && <CheckCircle2 className="w-4 h-4" />}
              </button>
              <button
                type="button"
                onClick={() => setForceRefresh(!forceRefresh)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-all ${
                  forceRefresh 
                    ? 'bg-orange-500/20 border border-orange-500/50 text-orange-400' 
                    : 'bg-white/5 border border-white/10 text-slate-400 hover:border-white/20'
                }`}
                data-testid="checkbox-force-refresh"
              >
                <RefreshCw className="w-4 h-4" />
                <span>{t('vibe2a.force_refresh')}</span>
                {forceRefresh && <CheckCircle2 className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-xs text-slate-500 text-center mt-2">
              {useLighthouse && useAiReadiness ? "Full scan enabled (takes longer)" : 
               useLighthouse ? "Performance scan enabled" : 
               useAiReadiness ? "AI readiness check enabled" : 
               t('vibe2a.scan_hint')}
            </p>
          </motion.form>
        </section>

        <AnimatePresence mode="wait">
          {gradeMutation.isPending && (
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="container mx-auto px-4 mb-16"
            >
              <div className="max-w-2xl mx-auto text-center py-16">
                <div className="relative w-32 h-32 mx-auto mb-8">
                  <motion.div
                    className="absolute inset-0 rounded-full border-4 border-cyan-500/20"
                  />
                  <motion.div
                    className="absolute inset-0 rounded-full border-4 border-transparent border-t-cyan-500"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  />
                  <motion.div
                    className="absolute inset-4 rounded-full border-4 border-transparent border-t-green-500"
                    animate={{ rotate: -360 }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Search className="w-8 h-8 text-cyan-400" />
                  </div>
                </div>
                <motion.h3
                  className="text-2xl font-bold text-white mb-3"
                  animate={{ opacity: [1, 0.5, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  Analyzing Your Website
                </motion.h3>
                <p className="text-slate-400 mb-6">
                  Scanning SEO, security, performance, accessibility, and AI-readiness...
                </p>
                <div className="flex flex-wrap justify-center gap-2">
                  {["SEO", "Security", "Performance", "Keywords", "Accessibility", "Email", "Mobile", "AI"].map((item, index) => (
                    <motion.span
                      key={item}
                      className="px-3 py-1 rounded-full bg-white/5 text-xs text-slate-400 border border-white/10"
                      initial={{ opacity: 0.3 }}
                      animate={{ opacity: [0.3, 1, 0.3] }}
                      transition={{ duration: 1.5, repeat: Infinity, delay: index * 0.15 }}
                    >
                      {item}
                    </motion.span>
                  ))}
                </div>
              </div>
            </motion.section>
          )}

          {result && !gradeMutation.isPending && (
            <motion.section
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="container mx-auto px-4 mb-16"
            >
              <div className="max-w-4xl mx-auto bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 p-8">
                <div className="text-center mb-8">
                  <p className="text-slate-400 text-sm mb-2">{result.url}</p>
                  <div className="inline-flex items-center justify-center w-32 h-32 rounded-full bg-gradient-to-br from-white/10 to-white/5 mb-4">
                    <span className={`text-6xl font-bold ${getGradeColor(result.overallScore)}`}>
                      {getGradeLetter(result.overallScore)}
                    </span>
                  </div>
                  <p className="text-2xl font-semibold text-white">{result.overallScore}/100</p>
                </div>

                <div className="grid grid-cols-4 md:grid-cols-8 gap-4 mb-8">
                  <ScoreCircle score={result.seoScore} label="SEO" icon={FileText} />
                  <ScoreCircle score={result.securityScore} label="Security" icon={Shield} />
                  <ScoreCircle score={result.performanceScore} label="Speed" icon={Zap} />
                  <ScoreCircle score={result.keywordsScore} label="Keywords" icon={Key} />
                  <ScoreCircle score={result.accessibilityScore} label="A11y" icon={Accessibility} />
                  <ScoreCircle score={result.emailSecurityScore || 0} label="Email" icon={Mail} />
                  <ScoreCircle score={result.mobileScore || 0} label="Mobile" icon={Smartphone} />
                  {result.aiReadinessScore != null && (
                    <ScoreCircle score={result.aiReadinessScore} label="AI" icon={Bot} />
                  )}
                </div>

                <div className="grid md:grid-cols-2 gap-4 mb-8">
                  {result.findings.slice(0, 6).map((finding, index) => (
                    <div
                      key={index}
                      className={`flex items-start gap-3 p-4 rounded-xl ${
                        finding.passed ? "bg-green-500/10" : "bg-red-500/10"
                      }`}
                    >
                      {finding.passed ? (
                        <CheckCircle2 className="w-5 h-5 text-green-400 shrink-0 mt-0.5" />
                      ) : finding.priority === "critical" ? (
                        <XCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                      ) : (
                        <AlertTriangle className="w-5 h-5 text-yellow-400 shrink-0 mt-0.5" />
                      )}
                      <div>
                        <p className="text-white text-sm font-medium">{finding.issue}</p>
                        <p className="text-slate-400 text-xs">{finding.impact}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex flex-wrap gap-3 justify-center mb-6">
                  <Button
                    onClick={handleCopyResults}
                    variant="outline"
                    className="gap-2 border-white/20 text-white hover:bg-white/10"
                    data-testid="button-copy-results"
                  >
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    {copied ? "Copied!" : "Copy for AI"}
                  </Button>
                  <Button
                    onClick={handleDownloadPDF}
                    variant="outline"
                    className="gap-2 border-white/20 text-white hover:bg-white/10"
                    data-testid="button-download-pdf"
                  >
                    <Download className="w-4 h-4" />
                    Download PDF
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
                        View Report
                      </Button>
                      <Button
                        onClick={() => {
                          const shareUrl = `${window.location.origin}/report/${result.shareToken}`;
                          navigator.clipboard.writeText(shareUrl);
                          setShareCopied(true);
                          setTimeout(() => setShareCopied(false), 2000);
                          toast({ title: "Share link copied!", description: "Anyone with this link can view the report" });
                        }}
                        variant="outline"
                        className="gap-2 border-white/20 text-white hover:bg-white/10"
                        data-testid="button-share-link"
                      >
                        {shareCopied ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
                        {shareCopied ? "Copied!" : "Share"}
                      </Button>
                    </>
                  )}
                  <Button
                    onClick={handleScanAgain}
                    variant="outline"
                    className="gap-2 border-white/20 text-white hover:bg-white/10"
                    data-testid="button-scan-again"
                  >
                    <RefreshCw className="w-4 h-4" />
                    New Scan
                  </Button>
                  <Button
                    onClick={() => {
                      gradeMutation.mutate(result.url);
                    }}
                    disabled={gradeMutation.isPending}
                    className="gap-2 bg-gradient-to-r from-green-500 to-cyan-500 hover:from-green-400 hover:to-cyan-400 text-slate-900"
                    data-testid="button-force-rescan"
                  >
                    {gradeMutation.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <RefreshCw className="w-4 h-4" />
                    )}
                    Force Rescan
                  </Button>
                </div>

                <div className="mt-8 p-6 bg-white/5 rounded-2xl border border-white/10">
                  <div className="flex items-center gap-2 mb-4">
                    <Search className="w-5 h-5 text-cyan-400" />
                    <h3 className="text-lg font-semibold text-white">Rescan Website</h3>
                  </div>
                  <div className="flex gap-3 mb-4">
                    <Input
                      type="text"
                      inputMode="url"
                      autoCapitalize="off"
                      autoCorrect="off"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      placeholder="Enter URL to scan..."
                      className="flex-1 h-12 bg-white/5 border-white/10 text-white placeholder:text-slate-500"
                      data-testid="input-rescan-url"
                    />
                    <Button
                      onClick={() => {
                        let processedUrl = url.trim();
                        if (!processedUrl) return;
                        if (!processedUrl.startsWith("http://") && !processedUrl.startsWith("https://")) {
                          processedUrl = "https://" + processedUrl;
                        }
                        gradeMutation.mutate(processedUrl);
                      }}
                      disabled={gradeMutation.isPending || !url.trim()}
                      className="h-12 px-6 bg-gradient-to-r from-green-500 to-cyan-500 hover:from-green-400 hover:to-cyan-400 text-slate-900 font-semibold"
                      data-testid="button-rescan"
                    >
                      {gradeMutation.isPending ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          <Search className="w-4 h-4 mr-2" />
                          Scan
                        </>
                      )}
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {["FDIC", "SEC", "ADA", "PCI", "FCA", "GDPR"].map((label) => (
                      <span
                        key={label}
                        className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-sm text-slate-400"
                      >
                        {label}
                      </span>
                    ))}
                  </div>
                  <p className="text-xs text-slate-500">Free tool - Results are for informational purposes only</p>
                </div>

                <div className="mt-10 p-6 bg-gradient-to-r from-purple-500/10 via-cyan-500/10 to-green-500/10 rounded-2xl border border-cyan-500/20">
                  <div className="text-center mb-6">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/20 border border-purple-500/30 text-purple-400 text-sm font-medium mb-4">
                      <Bot className="w-4 h-4" />
                      AI-Powered Analysis
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-2">
                      Get Your Personalized "Vibe to A" Plan
                    </h3>
                    <p className="text-slate-400 max-w-lg mx-auto">
                      Select your industry and our AI will generate tailored recommendations to improve your website based on your scan results.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
                    {niches.map((niche) => {
                      const Icon = niche.icon;
                      const isSelected = selectedNiche === niche.id;
                      return (
                        <button
                          key={niche.id}
                          onClick={() => setSelectedNiche(isSelected ? null : niche.id)}
                          className={`p-3 rounded-xl border transition-all text-left ${
                            isSelected
                              ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-400'
                              : 'bg-white/5 border-white/10 text-slate-400 hover:border-white/20 hover:text-white'
                          }`}
                          data-testid={`niche-${niche.id}`}
                        >
                          <Icon className={`w-5 h-5 mb-2 ${isSelected ? 'text-cyan-400' : 'text-slate-500'}`} />
                          <div className="font-medium text-sm">{niche.label}</div>
                          <div className="text-xs text-slate-500 mt-0.5">{niche.examples}</div>
                        </button>
                      );
                    })}
                  </div>

                  <div className="flex flex-col items-center gap-4">
                    <Button
                      onClick={() => {
                        const nicheParam = selectedNiche ? `&niche=${selectedNiche}` : '';
                        setLocation(`/portal/signup?website=${encodeURIComponent(result.url)}&grade=${result.shareToken || ''}${nicheParam}&aiAnalysis=true`);
                      }}
                      size="lg"
                      className="bg-gradient-to-r from-purple-500 via-cyan-500 to-green-500 hover:from-purple-400 hover:via-cyan-400 hover:to-green-400 text-slate-900 font-semibold px-8"
                      data-testid="button-ai-analysis-signup"
                    >
                      <Sparkles className="w-5 h-5 mr-2" />
                      {selectedNiche ? `Get AI Recommendations for ${niches.find(n => n.id === selectedNiche)?.label}` : 'Sign Up for AI Analysis'}
                    </Button>
                    <p className="text-xs text-slate-500">
                      Free signup • 100 tokens included • Build on Replit
                    </p>
                  </div>
                </div>
              </div>
            </motion.section>
          )}
        </AnimatePresence>

        <section className="container mx-auto px-4 mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-white mb-4">{t('vibe2a.comprehensive_title')}</h2>
            <p className="text-slate-400">{t('vibe2a.comprehensive_subtitle')}</p>
          </motion.div>

          <div className="grid md:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="p-6 bg-white/5 rounded-2xl border border-white/10 hover:border-cyan-500/30 transition-colors"
                >
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500/20 to-cyan-500/20 flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-cyan-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                  <p className="text-sm text-slate-400">{feature.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </section>

        <section className="container mx-auto px-4 mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto bg-gradient-to-r from-green-500/20 via-cyan-500/20 to-blue-500/20 rounded-3xl border border-cyan-500/20 p-8 md:p-12 text-center"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 font-heading italic">
              {t('vibe2a.join_protocol')}
            </h2>
            <p className="text-lg text-slate-300 mb-8 max-w-xl mx-auto">
              {t('vibe2a.join_subtitle')}
            </p>
            <div className="grid md:grid-cols-2 gap-8 mb-8 max-w-3xl mx-auto text-left">
              <ul className="space-y-3">
                <li className="flex items-center gap-3 text-slate-300">
                  <CheckCircle2 className="w-5 h-5 text-cyan-400 shrink-0" />
                  <span>{t('vibe2a.benefit_vibe')}</span>
                </li>
                <li className="flex items-center gap-3 text-slate-300">
                  <CheckCircle2 className="w-5 h-5 text-cyan-400 shrink-0" />
                  <span>{t('vibe2a.benefit_dashboards')}</span>
                </li>
                <li className="flex items-center gap-3 text-slate-300">
                  <CheckCircle2 className="w-5 h-5 text-cyan-400 shrink-0" />
                  <span>{t('vibe2a.benefit_health')}</span>
                </li>
                <li className="flex items-center gap-3 text-slate-300">
                  <CheckCircle2 className="w-5 h-5 text-cyan-400 shrink-0" />
                  <span>{t('vibe2a.benefit_monitoring')}</span>
                </li>
              </ul>
              <ul className="space-y-3">
                <li className="flex items-center gap-3 text-slate-300">
                  <CheckCircle2 className="w-5 h-5 text-cyan-400 shrink-0" />
                  <span>{t('vibe2a.benefit_api')}</span>
                </li>
                <li className="flex items-center gap-3 text-slate-300">
                  <CheckCircle2 className="w-5 h-5 text-cyan-400 shrink-0" />
                  <span>{t('vibe2a.benefit_portal')}</span>
                </li>
                <li className="flex items-center gap-3 text-slate-300">
                  <CheckCircle2 className="w-5 h-5 text-cyan-400 shrink-0" />
                  <span>{t('vibe2a.benefit_support')}</span>
                </li>
                <li className="flex items-center gap-3 text-slate-300">
                  <CheckCircle2 className="w-5 h-5 text-cyan-400 shrink-0" />
                  <span>{t('vibe2a.benefit_insights')}</span>
                </li>
              </ul>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                onClick={() => setLocation('/portal/signup')}
                className="bg-gradient-to-r from-green-500 to-cyan-500 hover:from-green-400 hover:to-cyan-400 text-slate-900 font-semibold px-8"
                data-testid="button-signup-cta"
              >
                <ArrowRight className="w-5 h-5 mr-2" />
                {t('vibe2a.create_account')}
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => setLocation('/portal/login')}
                className="border-white/20 text-white hover:bg-white/10"
                data-testid="button-login-cta"
              >
                <Lock className="w-5 h-5 mr-2" />
                {t('vibe2a.sign_in')}
              </Button>
            </div>
            <p className="text-sm text-slate-500 mt-4">{t('vibe2a.signup_hint')}</p>
          </motion.div>
        </section>

        <section className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto grid md:grid-cols-3 gap-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <div className="text-4xl font-bold text-cyan-400 mb-2">17+</div>
              <p className="text-slate-400">{t('vibe2a.metrics_analyzed')}</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
            >
              <div className="text-4xl font-bold text-green-400 mb-2">100</div>
              <p className="text-slate-400">{t('vibe2a.free_tokens')}</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              <div className="text-4xl font-bold text-blue-400 mb-2">AI</div>
              <p className="text-slate-400">{t('vibe2a.ai_scoring')}</p>
            </motion.div>
          </div>
        </section>
      </main>

      <footer className="border-t border-white/5 py-8">
        <div className="container mx-auto px-4 text-center text-slate-500 text-sm">
          <p>&copy; {new Date().getFullYear()} Vibe2A. Powered by <a href="https://trifused.com" className="hover:text-white transition-colors underline">TriFused Technology</a>.</p>
          <div className="mt-4 flex justify-center gap-6">
            <a 
              href="/terms" 
              className="hover:text-white transition-colors"
              data-testid="link-terms"
            >
              Terms & Conditions
            </a>
            <a 
              href="/privacy" 
              className="hover:text-white transition-colors"
              data-testid="link-privacy"
            >
              Privacy Policy
            </a>
          </div>
        </div>
      </footer>
      
      <CookieConsent />
    </div>
  );
}
