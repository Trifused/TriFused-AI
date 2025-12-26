import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Shield, Globe, Cpu, MapPin, Wifi, Lock, AlertTriangle, CheckCircle, RefreshCw, ExternalLink, Search } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";

interface SystemData {
  ip: string;
  userAgent: string;
  platform: string;
  language: string;
  screen: string;
  cores: number;
  memory: number | string;
  connection: string;
  location: {
    lat: number | null;
    lng: number | null;
    accuracy: number | null;
    error?: string;
  };
  secure: boolean;
}

interface GraderResult {
  overallScore: number;
  letterGrade: string;
  findings: Array<{ category: string; issue: string; priority: string; passed: boolean }>;
}

type FlowState = 'idle' | 'prompt' | 'dismissed' | 'urlInput' | 'fetching' | 'reportPrompt';

function getGradeLetter(score: number): string {
  if (score >= 90) return 'A';
  if (score >= 80) return 'B';
  if (score >= 70) return 'C';
  if (score >= 60) return 'D';
  return 'F';
}

export function DiagnosticsOverlay({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const [logs, setLogs] = useState<string[]>([]);
  const [data, setData] = useState<Partial<SystemData>>({});
  const [status, setStatus] = useState<'idle' | 'scanning' | 'complete'>('idle');
  const [scanProgress, setScanProgress] = useState(0);
  const [flowState, setFlowState] = useState<FlowState>('idle');
  const [urlInput, setUrlInput] = useState('');
  const [graderResult, setGraderResult] = useState<GraderResult | null>(null);
  const [submittedUrl, setSubmittedUrl] = useState('');
  const [, setLocation] = useLocation();
  const terminalRef = useRef<HTMLDivElement>(null);

  const addLog = (msg: string) => {
    setLogs(prev => [...prev, `> ${msg}`]);
  };

  const scrollToBottom = () => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [logs, flowState]);

  const runDiagnostics = async () => {
    setStatus('scanning');
    setLogs([]);
    setData({});
    setScanProgress(0);
    setFlowState('idle');
    setGraderResult(null);
    setUrlInput('');
    setSubmittedUrl('');

    // Step 1: System Info
    addLog("Initializing heuristic scan...");
    await new Promise(r => setTimeout(r, 800));
    setScanProgress(10);
    
    const nav = window.navigator as any;
    const systemInfo = {
      userAgent: nav.userAgent,
      platform: nav.platform,
      language: nav.language,
      cores: nav.hardwareConcurrency || 4,
      memory: nav.deviceMemory ? `${nav.deviceMemory} GB` : "Unknown",
      screen: `${window.screen.width}x${window.screen.height}`,
      secure: window.location.protocol === 'https:',
    };
    
    setData(prev => ({ ...prev, ...systemInfo }));
    addLog(`System Core: ${systemInfo.platform} (${systemInfo.cores} Cores)`);
    addLog(`Display Matrix: ${systemInfo.screen}`);
    setScanProgress(30);

    // Step 2: Network
    await new Promise(r => setTimeout(r, 600));
    addLog("Triangulating network nodes...");
    
    try {
      const res = await fetch('https://api.ipify.org?format=json');
      const ipData = await res.json();
      setData(prev => ({ ...prev, ip: ipData.ip }));
      addLog(`Public Endpoint Identified: ${ipData.ip}`);
      
      if (nav.connection) {
         const conn = nav.connection;
         const connData = `${conn.effectiveType.toUpperCase()} (${conn.downlink} Mbps)`;
         setData(prev => ({ ...prev, connection: connData }));
         addLog(`Link Velocity: ${connData}`);
      }
    } catch (e) {
      addLog("Network triangulation failed: Proxy detected or request blocked.");
    }
    setScanProgress(60);

    // Step 3: Geolocation
    await new Promise(r => setTimeout(r, 600));
    addLog("Requesting orbital positioning lock...");
    
    try {
      const pos = await Promise.race([
        new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 0
          });
        }),
        new Promise<GeolocationPosition>((_, reject) => 
          setTimeout(() => reject(new Error("Timeout")), 5000)
        )
      ]);
      
      setData(prev => ({
        ...prev,
        location: {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: pos.coords.accuracy
        }
      }));
      addLog(`Coordinates Locked: ${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}`);
      addLog(`Accuracy: ${pos.coords.accuracy.toFixed(1)}m`);
    } catch (err: any) {
      console.error("Geolocation error:", err);
      setData(prev => ({
        ...prev,
        location: { lat: null, lng: null, accuracy: null, error: err.message || "Timeout" }
      }));
      addLog(`GPS Lock Failed: ${err.message === "Timeout" ? "Signal Timed Out" : (err.message || "Signal Jammed")}`);
      addLog("Continuing with estimated coordinates...");
    }
    setScanProgress(100);

    // Finalize
    await new Promise(r => setTimeout(r, 500));
    addLog("Diagnostic complete. Security perimeter established.");
    setStatus('complete');

    // Send diagnostic data to server
    try {
      const diagnosticPayload = {
        platform: systemInfo.platform,
        userAgent: systemInfo.userAgent,
        screenResolution: systemInfo.screen,
        isSecure: systemInfo.secure ? 1 : 0,
        browserCores: systemInfo.cores,
      };

      await fetch("/api/diagnostics", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(diagnosticPayload),
      });
      
      addLog("Analytics synchronized.");
    } catch (error) {
      console.error("Failed to save diagnostic data:", error);
    }
    
    await new Promise(r => setTimeout(r, 800));
    setFlowState('prompt');
  };

  const handleYes = () => {
    setFlowState('urlInput');
  };

  const handleNo = () => {
    addLog("OK, enjoy your day.");
    setFlowState('dismissed');
  };

  const handleUrlSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlInput.trim()) return;

    let url = urlInput.trim();
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
    }

    setSubmittedUrl(url);
    setFlowState('fetching');
    addLog(`Initiating website scan: ${url}`);
    addLog("Connecting to target server...");

    try {
      await new Promise(r => setTimeout(r, 500));
      addLog("Analyzing page structure...");
      
      const response = await fetch('/api/grade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });

      if (!response.ok) {
        throw new Error('Scan failed');
      }

      const result = await response.json();
      const letterGrade = getGradeLetter(result.overallScore);
      
      addLog("Scan complete.");
      addLog("─".repeat(30));
      addLog(`SCORE: ${result.overallScore}/100 (Grade: ${letterGrade})`);
      addLog("─".repeat(30));
      
      // Show top findings (issues that didn't pass)
      const issues = result.findings?.filter((f: any) => !f.passed && (f.priority === 'critical' || f.priority === 'important')) || [];
      if (issues.length > 0) {
        addLog(`ISSUES FOUND: ${issues.length}`);
        issues.slice(0, 3).forEach((issue: any) => {
          addLog(`  • [${issue.category.toUpperCase()}] ${issue.issue}`);
        });
        if (issues.length > 3) {
          addLog(`  ... and ${issues.length - 3} more`);
        }
      } else {
        addLog("No critical issues detected.");
      }
      
      addLog("─".repeat(30));
      
      setGraderResult({
        overallScore: result.overallScore,
        letterGrade,
        findings: result.findings || [],
      });
      
      setFlowState('reportPrompt');
    } catch (error) {
      addLog("ERROR: Failed to complete scan.");
      addLog("Check URL and try again.");
      setFlowState('urlInput');
    }
  };

  const handleViewReport = () => {
    onOpenChange(false);
    setLocation(`/grader?url=${encodeURIComponent(submittedUrl)}`);
  };

  const handleSkipReport = () => {
    addLog("Report skipped. Enjoy your day.");
    setFlowState('dismissed');
  };

  useEffect(() => {
    if (open && status === 'idle') {
      runDiagnostics();
    } else if (!open) {
      setStatus('idle');
      setLogs([]);
      setFlowState('idle');
      setGraderResult(null);
      setUrlInput('');
      setSubmittedUrl('');
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-black/90 border-primary/20 text-white max-w-2xl backdrop-blur-xl p-0 overflow-hidden sm:rounded-xl shadow-[0_0_50px_rgba(6,182,212,0.15)]">
        <DialogTitle className="sr-only">System Diagnostics</DialogTitle>
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-white/5">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <span className="font-mono text-sm tracking-widest uppercase text-muted-foreground">
              TriFused Diagnostic Protocol v9.2
            </span>
          </div>
          <div className="font-mono text-xs text-primary">
            {status === 'scanning' ? 'SCANNING...' : flowState === 'fetching' ? 'GRADING...' : 'COMPLETE'}
          </div>
        </div>

        <div className="flex flex-col md:grid md:grid-cols-2 h-[80vh] md:h-[500px]">
          {/* Terminal Output */}
          <div className="bg-black p-4 md:p-6 font-mono text-xs md:text-sm overflow-y-auto border-b md:border-b-0 md:border-r border-white/10 relative h-[35%] md:h-full flex flex-col" ref={terminalRef}>
             <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20 pointer-events-none" />
             <div className="relative z-10 space-y-1 md:space-y-2 flex-1">
               {logs.map((log, i) => (
                 <motion.div 
                   key={i}
                   initial={{ opacity: 0, x: -10 }}
                   animate={{ opacity: 1, x: 0 }}
                   className="text-white/80 break-words"
                 >
                   <span className="text-primary mr-2">➜</span>
                   {log}
                 </motion.div>
               ))}
               {status === 'scanning' && (
                 <motion.div 
                   animate={{ opacity: [0, 1, 0] }}
                   transition={{ repeat: Infinity, duration: 0.8 }}
                   className="w-2 h-4 bg-primary"
                 />
               )}
               
               {/* Test Website Prompt */}
               {flowState === 'prompt' && (
                 <motion.div 
                   initial={{ opacity: 0, x: -10 }}
                   animate={{ opacity: 1, x: 0 }}
                   className="text-white/80 break-words mt-2"
                 >
                   <span className="text-primary mr-2">➜</span>
                   {'>'} Test your website? [
                   <button 
                     onClick={handleYes}
                     className="text-green-400 hover:text-green-300 underline cursor-pointer font-bold"
                     data-testid="button-test-website-yes"
                   >
                     Y
                   </button>
                   /
                   <button 
                     onClick={handleNo}
                     className="text-red-400 hover:text-red-300 underline cursor-pointer font-bold"
                     data-testid="button-test-website-no"
                   >
                     N
                   </button>
                   ]
                 </motion.div>
               )}

               {/* View Full Report Prompt */}
               {flowState === 'reportPrompt' && (
                 <motion.div 
                   initial={{ opacity: 0, x: -10 }}
                   animate={{ opacity: 1, x: 0 }}
                   className="text-white/80 break-words mt-2"
                 >
                   <span className="text-primary mr-2">➜</span>
                   {'>'} View full report? [
                   <button 
                     onClick={handleViewReport}
                     className="text-green-400 hover:text-green-300 underline cursor-pointer font-bold"
                     data-testid="button-view-report-yes"
                   >
                     Y
                   </button>
                   /
                   <button 
                     onClick={handleSkipReport}
                     className="text-red-400 hover:text-red-300 underline cursor-pointer font-bold"
                     data-testid="button-view-report-no"
                   >
                     N
                   </button>
                   ]
                 </motion.div>
               )}

               {/* Fetching indicator */}
               {flowState === 'fetching' && (
                 <motion.div 
                   animate={{ opacity: [0, 1, 0] }}
                   transition={{ repeat: Infinity, duration: 0.8 }}
                   className="w-2 h-4 bg-primary mt-2"
                 />
               )}
             </div>

             {/* URL Input Box - Unfolds from bottom */}
             <AnimatePresence>
               {flowState === 'urlInput' && (
                 <motion.div
                   initial={{ height: 0, opacity: 0 }}
                   animate={{ height: 'auto', opacity: 1 }}
                   exit={{ height: 0, opacity: 0 }}
                   transition={{ duration: 0.3, ease: 'easeOut' }}
                   className="relative z-10 mt-3 overflow-hidden"
                 >
                   <form onSubmit={handleUrlSubmit} className="bg-white/5 border border-primary/30 rounded-lg p-3">
                     <div className="text-[10px] text-primary mb-2 uppercase tracking-wider">Enter Website URL</div>
                     <div className="flex gap-2">
                       <input
                         type="text"
                         value={urlInput}
                         onChange={(e) => setUrlInput(e.target.value)}
                         placeholder="example.com"
                         className="flex-1 bg-black/50 border border-white/20 rounded px-3 py-2 text-white text-sm font-mono focus:outline-none focus:border-primary"
                         autoFocus
                         data-testid="input-website-url"
                       />
                       <button
                         type="submit"
                         className="bg-primary/20 hover:bg-primary/30 border border-primary/50 text-primary px-3 py-2 rounded text-sm font-mono flex items-center gap-1"
                         data-testid="button-scan-url"
                       >
                         <Search className="w-3 h-3" />
                         Scan
                       </button>
                     </div>
                   </form>
                 </motion.div>
               )}
             </AnimatePresence>
          </div>

          {/* Visual Data Visualization */}
          <div className="p-4 md:p-6 bg-gradient-to-b from-slate-900 to-black relative overflow-hidden flex-1 flex flex-col">
             {/* Scanning Grid Background */}
             <div className="absolute inset-0 bg-[linear-gradient(rgba(6,182,212,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(6,182,212,0.05)_1px,transparent_1px)] bg-[size:20px_20px]" />
             
             <div className="relative z-10 h-full flex flex-col justify-between overflow-y-auto">
                
                {/* Center Visualization */}
                <div className="flex-1 flex items-center justify-center min-h-[160px]">
                   {status === 'scanning' || flowState === 'fetching' ? (
                     <div className="relative scale-75 md:scale-100">
                       <motion.div 
                         animate={{ rotate: 360 }}
                         transition={{ duration: 4, ease: "linear", repeat: Infinity }}
                         className="w-24 h-24 md:w-32 md:h-32 border-2 border-primary/30 rounded-full border-t-primary"
                       />
                       <motion.div 
                         animate={{ rotate: -360 }}
                         transition={{ duration: 6, ease: "linear", repeat: Infinity }}
                         className="absolute inset-2 border-2 border-purple-500/30 rounded-full border-b-purple-500"
                       />
                       <div className="absolute inset-0 flex items-center justify-center font-mono text-xl md:text-2xl font-bold text-white">
                         {flowState === 'fetching' ? (
                           <Search className="w-8 h-8 text-primary" />
                         ) : (
                           `${scanProgress}%`
                         )}
                       </div>
                     </div>
                   ) : graderResult ? (
                     <motion.div 
                       initial={{ scale: 0.8, opacity: 0 }}
                       animate={{ scale: 1, opacity: 1 }}
                       className="text-center scale-90 md:scale-100"
                     >
                        <div className="w-20 h-20 md:w-24 md:h-24 mx-auto mb-2 md:mb-4 rounded-full border-4 border-primary flex items-center justify-center">
                          <span className="text-2xl md:text-3xl font-bold text-white">{graderResult.letterGrade}</span>
                        </div>
                        <h3 className="text-lg md:text-xl font-bold text-white">{graderResult.overallScore}/100</h3>
                        <p className="text-xs md:text-sm text-muted-foreground mt-1 md:mt-2">{submittedUrl}</p>
                     </motion.div>
                   ) : (
                     <motion.div 
                       initial={{ scale: 0.8, opacity: 0 }}
                       animate={{ scale: 1, opacity: 1 }}
                       className="text-center scale-90 md:scale-100"
                     >
                        <Shield className="w-16 h-16 md:w-20 md:h-20 text-primary mx-auto mb-2 md:mb-4" />
                        <h3 className="text-lg md:text-xl font-bold text-white">System Secure</h3>
                        <p className="text-xs md:text-sm text-muted-foreground mt-1 md:mt-2">No active threats detected.</p>
                        <Button
                          onClick={() => {
                            setStatus('idle');
                            setTimeout(() => runDiagnostics(), 100);
                          }}
                          variant="outline"
                          size="sm"
                          className="mt-4 border-primary/30 text-primary hover:bg-primary/10 font-mono text-xs"
                          data-testid="button-rescan"
                        >
                          <RefreshCw className="w-3 h-3 mr-2" />
                          Re-Scan System
                        </Button>
                     </motion.div>
                   )}
                </div>

                {/* Geo Location Display */}
                {status === 'complete' && data.location && !graderResult && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gradient-to-r from-primary/10 to-purple-500/10 p-3 rounded-lg border border-primary/20 mb-3"
                    data-testid="geo-location-display"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2 text-xs text-primary font-mono uppercase tracking-wider">
                        <MapPin className="w-4 h-4" />
                        Geo Location
                      </div>
                      {data.location.lat && (
                        <a
                          href={`https://www.google.com/maps?q=${data.location.lat},${data.location.lng}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-primary hover:text-white flex items-center gap-1 transition-colors"
                          data-testid="link-open-map"
                        >
                          Open Map <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div>
                        <div className="text-[10px] text-muted-foreground mb-1">Latitude</div>
                        <div className="font-mono text-sm text-white">
                          {data.location.lat?.toFixed(4) || "N/A"}
                        </div>
                      </div>
                      <div>
                        <div className="text-[10px] text-muted-foreground mb-1">Longitude</div>
                        <div className="font-mono text-sm text-white">
                          {data.location.lng?.toFixed(4) || "N/A"}
                        </div>
                      </div>
                      <div>
                        <div className="text-[10px] text-muted-foreground mb-1">Accuracy</div>
                        <div className="font-mono text-sm text-white">
                          {data.location.accuracy ? `${data.location.accuracy.toFixed(0)}m` : "N/A"}
                        </div>
                      </div>
                    </div>
                    {data.location.error && (
                      <div className="mt-2 text-xs text-yellow-400 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        {data.location.error === "Timeout" ? "GPS signal timed out" : "Location access denied"}
                      </div>
                    )}
                  </motion.div>
                )}

                {/* Data Grid */}
                {!graderResult && (
                  <div className="grid grid-cols-2 gap-2 md:gap-3">
                    <div className="bg-white/5 p-2 md:p-3 rounded-lg border border-white/10">
                      <div className="flex items-center gap-1.5 md:gap-2 text-[10px] md:text-xs text-muted-foreground mb-1">
                        <Globe className="w-3 h-3" /> Public IP
                      </div>
                      <div className="font-mono text-xs md:text-sm text-white truncate">
                        {data.ip || "---.---.---.---"}
                      </div>
                    </div>

                    <div className="bg-white/5 p-2 md:p-3 rounded-lg border border-white/10">
                      <div className="flex items-center gap-1.5 md:gap-2 text-[10px] md:text-xs text-muted-foreground mb-1">
                        <Cpu className="w-3 h-3" /> System
                      </div>
                      <div className="font-mono text-xs md:text-sm text-white truncate">
                        {data.platform || "Unknown"}
                      </div>
                    </div>

                    <div className="bg-white/5 p-2 md:p-3 rounded-lg border border-white/10">
                      <div className="flex items-center gap-1.5 md:gap-2 text-[10px] md:text-xs text-muted-foreground mb-1">
                        <Wifi className="w-3 h-3" /> Network
                      </div>
                      <div className="font-mono text-xs md:text-sm text-white truncate">
                        {data.connection || "Detecting..."}
                      </div>
                    </div>

                    <div className="bg-white/5 p-2 md:p-3 rounded-lg border border-white/10">
                      <div className="flex items-center gap-1.5 md:gap-2 text-[10px] md:text-xs text-muted-foreground mb-1">
                        <Lock className="w-3 h-3" /> Connection
                      </div>
                      <div className="font-mono text-xs md:text-sm text-green-400 truncate">
                        {data.secure ? "Encrypted (SSL)" : "Unsecured"}
                      </div>
                    </div>
                  </div>
                )}

                {/* Close Button */}
                <Button
                  onClick={() => onOpenChange(false)}
                  className="w-full mt-4 bg-primary/20 hover:bg-primary/30 text-primary border border-primary/30 font-mono text-sm"
                  data-testid="button-close-diagnostic"
                >
                  <X className="w-4 h-4 mr-2" />
                  Close Diagnostic
                </Button>
             </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
