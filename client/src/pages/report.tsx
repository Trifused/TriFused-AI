import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
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
  MapPin
} from "lucide-react";
import { trackPageView } from "@/lib/analytics";

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

export default function Report() {
  const params = useParams<{ shareToken: string }>();
  const [activeCategory, setActiveCategory] = useState<string>("all");

  useEffect(() => {
    trackPageView('/report');
  }, []);

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
      console.error("Failed to download PDF:", error);
    }
  };

  const filteredFindings = result?.findings?.filter(f => 
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
      
      <main className="container mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto"
        >
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Website Grade Report</h1>
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

          <div className="flex justify-center gap-4">
            <Button onClick={handleDownloadPDF} className="gap-2" data-testid="button-download-pdf">
              <Download className="w-4 h-4" />
              Download PDF Report
            </Button>
            <Button variant="outline" onClick={() => window.location.href = "/grader"} data-testid="button-analyze-own">
              Analyze Your Website
            </Button>
          </div>

          {result.qrCodeData && (
            <div className="mt-8 text-center">
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
