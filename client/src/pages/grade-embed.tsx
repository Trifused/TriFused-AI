import { useQuery } from "@tanstack/react-query";
import { useParams } from "wouter";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle, Search, ExternalLink, Loader2 } from "lucide-react";

interface ReportConfig {
  slug: string;
  targetUrl: string | null;
  companyName: string | null;
  brandColor: string;
  logoUrl: string | null;
  visibility: string;
  embedEnabled: number;
  apiEnabled: number;
}

interface ReportData {
  data: ReportConfig;
}

export default function GradeEmbed() {
  const { slug } = useParams<{ slug: string }>();
  const [url, setUrl] = useState("");
  const [gradeResult, setGradeResult] = useState<any>(null);
  const [isGrading, setIsGrading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { data: reportData, isLoading, error: fetchError } = useQuery<ReportData>({
    queryKey: [`/api/reports/${slug}`],
    enabled: !!slug,
  });

  const config = reportData?.data;

  const handleGrade = async () => {
    const targetUrl = url || config?.targetUrl;
    if (!targetUrl) {
      setError("Please enter a URL to grade");
      return;
    }

    setIsGrading(true);
    setError(null);
    setGradeResult(null);

    try {
      const res = await fetch("/api/grade", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: targetUrl }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to grade website");
      }

      const result = await res.json();
      setGradeResult(result);
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setIsGrading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (fetchError || !config) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-8 text-center">
            <AlertCircle className="w-12 h-12 mx-auto text-destructive mb-4" />
            <h2 className="text-xl font-semibold mb-2">Report Not Found</h2>
            <p className="text-muted-foreground">
              This grader page is not available or has been deactivated.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!config.embedEnabled) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-8 text-center">
            <AlertCircle className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">Embed Disabled</h2>
            <p className="text-muted-foreground">
              This grader page has embedding disabled by the owner.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const brandColor = config.brandColor || "#00d4ff";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="text-center mb-8">
          {config.logoUrl ? (
            <img 
              src={config.logoUrl} 
              alt={config.companyName || "Logo"} 
              className="h-12 mx-auto mb-4 object-contain"
            />
          ) : (
            <div 
              className="w-16 h-16 rounded-xl mx-auto mb-4 flex items-center justify-center"
              style={{ backgroundColor: brandColor }}
            >
              <Search className="w-8 h-8 text-white" />
            </div>
          )}
          <h1 className="text-3xl font-bold text-white mb-2">
            {config.companyName ? `${config.companyName} Website Grader` : "Website Grader"}
          </h1>
          <p className="text-muted-foreground">
            Get a comprehensive analysis of your website's performance and compliance
          </p>
        </div>

        <Card className="bg-card/50 backdrop-blur-sm border-border/50">
          <CardContent className="p-6">
            <div className="flex gap-3">
              <Input
                placeholder={config.targetUrl ? `Grade ${config.targetUrl}` : "Enter website URL..."}
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="flex-1"
                disabled={isGrading}
                data-testid="input-grade-url"
              />
              <Button
                onClick={handleGrade}
                disabled={isGrading}
                style={{ backgroundColor: brandColor }}
                className="text-white hover:opacity-90"
                data-testid="btn-grade"
              >
                {isGrading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Grading...
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4 mr-2" />
                    Grade
                  </>
                )}
              </Button>
            </div>

            {config.targetUrl && !url && (
              <p className="text-sm text-muted-foreground mt-2">
                Default: <code className="bg-muted px-1 rounded">{config.targetUrl}</code>
              </p>
            )}

            {error && (
              <div className="mt-4 p-4 bg-destructive/10 border border-destructive/30 rounded-lg text-destructive">
                {error}
              </div>
            )}
          </CardContent>
        </Card>

        {gradeResult && (
          <Card className="mt-6 bg-card/50 backdrop-blur-sm border-border/50">
            <CardContent className="p-6">
              <div className="text-center mb-6">
                <div 
                  className="text-6xl font-bold mb-2"
                  style={{ color: brandColor }}
                  data-testid="text-grade-score"
                >
                  {gradeResult.overallScore || gradeResult.score || "N/A"}
                </div>
                <p className="text-muted-foreground">Overall Score</p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {gradeResult.performance !== undefined && (
                  <ScoreCard label="Performance" score={gradeResult.performance} brandColor={brandColor} />
                )}
                {gradeResult.seo !== undefined && (
                  <ScoreCard label="SEO" score={gradeResult.seo} brandColor={brandColor} />
                )}
                {gradeResult.security !== undefined && (
                  <ScoreCard label="Security" score={gradeResult.security} brandColor={brandColor} />
                )}
                {gradeResult.mobile !== undefined && (
                  <ScoreCard label="Mobile" score={gradeResult.mobile} brandColor={brandColor} />
                )}
              </div>

              {gradeResult.shareToken && (
                <div className="mt-6 pt-6 border-t border-border/50 text-center">
                  <Button
                    variant="outline"
                    asChild
                    className="border-primary/50 text-primary hover:bg-primary/10"
                  >
                    <a 
                      href={`/report/${gradeResult.shareToken}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      View Full Report
                    </a>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        <div className="mt-8 text-center text-xs text-muted-foreground">
          Powered by <a href="/" className="text-primary hover:underline">TriFused</a>
        </div>
      </div>
    </div>
  );
}

function ScoreCard({ label, score, brandColor }: { label: string; score: number; brandColor: string }) {
  const getScoreColor = (s: number) => {
    if (s >= 80) return "text-green-400";
    if (s >= 60) return "text-yellow-400";
    return "text-red-400";
  };

  return (
    <div className="text-center p-4 bg-muted/30 rounded-lg">
      <div className={`text-2xl font-bold ${getScoreColor(score)}`}>
        {score}
      </div>
      <div className="text-sm text-muted-foreground">{label}</div>
    </div>
  );
}
