import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { motion } from "framer-motion";
import { useState, useMemo } from "react";
import { useMutation } from "@tanstack/react-query";
import { 
  Shield, 
  HardDrive, 
  DollarSign, 
  TrendingUp,
  CheckCircle2,
  AlertTriangle,
  Download,
  FileSpreadsheet,
  Share2,
  Mail,
  Phone,
  Building2,
  MessageSquare,
  Loader2,
  Cloud,
  Server,
  Lock,
  Zap
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const PROVIDER_PRICING = {
  wasabi: { name: "Wasabi", pricePerTB: 6.99, role: "Primary" },
  backblaze: { name: "Backblaze B2", pricePerTB: 6.00, role: "Secondary" },
  idrive: { name: "IDrive e2", pricePerTB: 5.50, role: "Tertiary" }
};

const SERVICE_OPTIONS = [
  { id: "secure-workstations", label: "Secure Workstations", icon: Server },
  { id: "your-data", label: "Your Data Your Services", icon: HardDrive },
  { id: "accounts-security", label: "Accounts & Security", icon: Lock },
  { id: "cloud-systems", label: "Cloud Systems", icon: Cloud },
  { id: "advanced-security", label: "Advanced Security", icon: Shield },
  { id: "pen-testing", label: "Advanced Pen-Testing", icon: Zap },
  { id: "mdr-hunting", label: "MDR & Threat Hunting", icon: Shield },
  { id: "mobile-mgmt", label: "Mobile Device Mgmt", icon: Server },
  { id: "cloud-database", label: "Cloud & Database", icon: HardDrive },
  { id: "ai-development", label: "AI-Native Development", icon: Zap },
  { id: "generative-growth", label: "Generative Growth", icon: TrendingUp },
  { id: "other", label: "Other", icon: MessageSquare }
];

export default function BackupCalculator() {
  const { toast } = useToast();
  const [logicalDataTB, setLogicalDataTB] = useState(140);
  const [selectedServices, setSelectedServices] = useState<string[]>(["cloud-systems"]);
  const [needHelpAsap, setNeedHelpAsap] = useState(false);
  const [email, setEmail] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");

  const calculations = useMemo(() => {
    const physicalStorage = logicalDataTB * 3;
    const wasabiCost = logicalDataTB * PROVIDER_PRICING.wasabi.pricePerTB;
    const backblazeCost = logicalDataTB * PROVIDER_PRICING.backblaze.pricePerTB;
    const idriveCost = logicalDataTB * PROVIDER_PRICING.idrive.pricePerTB;
    const monthlyCost = wasabiCost + backblazeCost + idriveCost;
    const annualCost = monthlyCost * 12;
    const singleProviderCost = logicalDataTB * 4.00;
    const riskReductionInvestment = monthlyCost - singleProviderCost;
    const riskReductionPercent = ((monthlyCost - singleProviderCost) / singleProviderCost) * 100;

    return {
      physicalStorage,
      wasabiCost,
      backblazeCost,
      idriveCost,
      monthlyCost,
      annualCost,
      singleProviderCost,
      riskReductionInvestment,
      riskReductionPercent
    };
  }, [logicalDataTB]);

  const contactMutation = useMutation({
    mutationFn: async (data: { name: string; email: string; company: string; message: string }) => {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error("Failed to submit");
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Message sent!",
        description: "We'll get back to you soon."
      });
      setEmail("");
      setBusinessName("");
      setPhone("");
      setMessage("");
      setSelectedServices([]);
      setNeedHelpAsap(false);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive"
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast({
        title: "Email required",
        description: "Please enter your email address.",
        variant: "destructive"
      });
      return;
    }

    const servicesText = selectedServices.map(id => 
      SERVICE_OPTIONS.find(s => s.id === id)?.label
    ).filter(Boolean).join(", ");

    const fullMessage = `
Storage Calculator Inquiry
--------------------------
Logical Data Size: ${logicalDataTB} TB
Physical Storage: ${calculations.physicalStorage} TB
Monthly Cost: $${calculations.monthlyCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
Annual Cost: $${calculations.annualCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}

Services Interested: ${servicesText || "None selected"}
Urgency: ${needHelpAsap ? "ASAP" : "Standard"}
Phone: ${phone || "Not provided"}

Message:
${message || "No additional message"}
    `.trim();

    contactMutation.mutate({
      name: businessName || "Backup Calculator Lead",
      email,
      company: businessName,
      message: fullMessage
    });
  };

  const toggleService = (serviceId: string) => {
    setSelectedServices(prev => 
      prev.includes(serviceId) 
        ? prev.filter(id => id !== serviceId)
        : [...prev, serviceId]
    );
  };

  const handleExportPDF = () => {
    toast({
      title: "Export PDF",
      description: "PDF export coming soon!"
    });
  };

  const handleExportCSV = () => {
    const csvContent = `Metric,Value
Logical Data (TB),${logicalDataTB}
Physical Storage (TB),${calculations.physicalStorage}
Monthly Cost,$${calculations.monthlyCost.toFixed(2)}
Annual Cost,$${calculations.annualCost.toFixed(2)}
Wasabi (Primary),$${calculations.wasabiCost.toFixed(2)}/mo
Backblaze B2 (Secondary),$${calculations.backblazeCost.toFixed(2)}/mo
IDrive e2 (Tertiary),$${calculations.idriveCost.toFixed(2)}/mo
Single Provider Cost,$${calculations.singleProviderCost.toFixed(2)}/mo
Risk Reduction Investment,$${calculations.riskReductionInvestment.toFixed(2)}/mo`;

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `backup-calculator-${logicalDataTB}TB.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    toast({
      title: "CSV Exported",
      description: "Your calculation has been downloaded."
    });
  };

  const handleShareLink = () => {
    const url = `${window.location.origin}/backup-calculator?tb=${logicalDataTB}`;
    navigator.clipboard.writeText(url);
    toast({
      title: "Link copied!",
      description: "Share link copied to clipboard."
    });
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <span className="inline-block px-4 py-2 bg-cyan-500/10 border border-cyan-500/30 rounded-full text-cyan-400 text-sm font-medium mb-6">
              <Shield className="w-4 h-4 inline mr-2" />
              Security Agnostic Risk Reduction Vault
            </span>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Cloud Backup
              <br />
              <span className="text-cyan-400">Cost Calculator</span>
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Calculate your multi-provider, triple-redundant immutable storage costs with full transparency.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
          >
            <div className="bg-card/50 border border-border rounded-xl p-4">
              <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                <HardDrive className="w-4 h-4" />
                LOGICAL DATA
              </div>
              <div className="text-2xl md:text-3xl font-bold text-cyan-400">
                {logicalDataTB} <span className="text-lg">TB</span>
              </div>
            </div>
            <div className="bg-card/50 border border-border rounded-xl p-4">
              <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                <Server className="w-4 h-4" />
                PHYSICAL STORAGE
              </div>
              <div className="text-2xl md:text-3xl font-bold text-emerald-400">
                {calculations.physicalStorage} <span className="text-lg">TB</span>
              </div>
            </div>
            <div className="bg-card/50 border border-border rounded-xl p-4">
              <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                <DollarSign className="w-4 h-4" />
                MONTHLY COST
              </div>
              <div className="text-2xl md:text-3xl font-bold text-cyan-400">
                ${calculations.monthlyCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            </div>
            <div className="bg-card/50 border border-border rounded-xl p-4">
              <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                <TrendingUp className="w-4 h-4" />
                ANNUAL COST
              </div>
              <div className="text-2xl md:text-3xl font-bold text-emerald-400">
                ${calculations.annualCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-card/50 border border-border rounded-xl p-6 mb-8"
          >
            <div className="flex items-center gap-2 mb-4">
              <HardDrive className="w-5 h-5 text-cyan-400" />
              <h2 className="text-lg font-semibold">Configuration</h2>
            </div>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <Label className="flex items-center gap-2">
                    <HardDrive className="w-4 h-4" />
                    Logical Data Size
                  </Label>
                  <span className="text-cyan-400 font-bold">{logicalDataTB} TB</span>
                </div>
                <Slider
                  value={[logicalDataTB]}
                  onValueChange={(value) => setLogicalDataTB(value[0])}
                  min={10}
                  max={1000}
                  step={10}
                  className="w-full"
                  data-testid="slider-data-size"
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>10 TB</span>
                  <span>1000 TB</span>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="bg-card/50 border border-border rounded-xl p-6 mb-8"
          >
            <div className="flex items-center gap-2 mb-4">
              <Server className="w-5 h-5 text-cyan-400" />
              <h2 className="text-lg font-semibold">Provider Breakdown</h2>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-background/50 rounded-lg border border-cyan-500/20">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-cyan-400 rounded-full"></div>
                  <div>
                    <div className="font-medium">{PROVIDER_PRICING.wasabi.name}</div>
                    <div className="text-sm text-muted-foreground">Primary</div>
                  </div>
                </div>
                <div className="text-cyan-400 font-bold">
                  ${calculations.wasabiCost.toFixed(2)}<span className="text-sm text-muted-foreground">/mo</span>
                </div>
              </div>
              <div className="flex items-center justify-between p-4 bg-background/50 rounded-lg border border-emerald-500/20">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-emerald-400 rounded-full"></div>
                  <div>
                    <div className="font-medium">{PROVIDER_PRICING.backblaze.name}</div>
                    <div className="text-sm text-muted-foreground">Secondary</div>
                  </div>
                </div>
                <div className="text-emerald-400 font-bold">
                  ${calculations.backblazeCost.toFixed(2)}<span className="text-sm text-muted-foreground">/mo</span>
                </div>
              </div>
              <div className="flex items-center justify-between p-4 bg-background/50 rounded-lg border border-orange-500/20">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-orange-400 rounded-full"></div>
                  <div>
                    <div className="font-medium">{PROVIDER_PRICING.idrive.name}</div>
                    <div className="text-sm text-muted-foreground">Tertiary</div>
                  </div>
                </div>
                <div className="text-orange-400 font-bold">
                  ${calculations.idriveCost.toFixed(2)}<span className="text-sm text-muted-foreground">/mo</span>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="bg-card/50 border border-border rounded-xl p-6 mb-8"
          >
            <div className="flex items-center gap-2 mb-4">
              <Shield className="w-5 h-5 text-emerald-400" />
              <h2 className="text-lg font-semibold">Risk Reduction Analysis</h2>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-background/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="w-5 h-5 text-orange-400" />
                  <div>
                    <div className="font-medium">Single Provider (Risk Exposed)</div>
                    <span className="inline-block px-2 py-0.5 bg-red-500/20 text-red-400 text-xs rounded mt-1">
                      Single Point of Failure
                    </span>
                  </div>
                </div>
                <div className="text-xl font-bold">
                  ${calculations.singleProviderCost.toFixed(2)}
                </div>
              </div>
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 rounded-lg border border-emerald-500/20">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  <div>
                    <div className="font-medium">Triple-Redundant Vault (Protected)</div>
                    <span className="inline-block px-3 py-1 bg-cyan-500/20 text-cyan-400 text-xs rounded-full mt-1 border border-cyan-500/30">
                      Multi-Provider Protection
                    </span>
                  </div>
                </div>
                <div className="text-xl font-bold text-emerald-400">
                  ${calculations.monthlyCost.toFixed(2)}
                </div>
              </div>
              <div className="pt-4 border-t border-border">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-muted-foreground">Risk Reduction Investment</span>
                  <span className="text-xl font-bold text-cyan-400">
                    +${calculations.riskReductionInvestment.toFixed(2)}
                    <span className="text-sm ml-2 text-emerald-400">
                      (+{calculations.riskReductionPercent.toFixed(1)}%)
                    </span>
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-4">
                  <span className="text-sm text-muted-foreground">PROTECTION LEVEL</span>
                  <div className="flex gap-1 ml-auto">
                    <div className="w-8 h-2 bg-emerald-400 rounded-full"></div>
                    <div className="w-8 h-2 bg-cyan-400 rounded-full"></div>
                    <div className="w-8 h-2 bg-orange-400 rounded-full"></div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="flex flex-wrap gap-3 mb-8"
          >
            <Button 
              variant="outline" 
              onClick={handleExportPDF}
              data-testid="button-export-pdf"
            >
              <Download className="w-4 h-4 mr-2" />
              Export PDF
            </Button>
            <Button 
              variant="outline" 
              onClick={handleExportCSV}
              data-testid="button-export-csv"
            >
              <FileSpreadsheet className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
            <Button 
              variant="outline" 
              onClick={handleShareLink}
              data-testid="button-share-link"
            >
              <Share2 className="w-4 h-4 mr-2" />
              Share Link
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="text-center text-sm text-muted-foreground mb-12"
          >
            Triple-redundant storage ensures your data survives provider outages, ransomware, and regional disasters.
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="bg-card/50 border border-border rounded-xl overflow-hidden"
          >
            <div className="bg-gradient-to-r from-cyan-500/20 to-blue-500/20 p-6 flex justify-center">
              <div className="w-12 h-12 bg-cyan-500/20 rounded-xl flex items-center justify-center">
                <Mail className="w-6 h-6 text-cyan-400" />
              </div>
            </div>
            <div className="p-6">
              <h2 className="text-xl font-bold mb-2">Get In Touch</h2>
              <p className="text-muted-foreground text-sm mb-6">
                Not ready to sign up? Tell us what you need and we'll reach out.
              </p>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <Label className="text-sm text-muted-foreground mb-3 block">
                    WHAT SERVICES INTEREST YOU?
                  </Label>
                  <div className="flex flex-wrap gap-2">
                    {SERVICE_OPTIONS.map((service) => (
                      <button
                        key={service.id}
                        type="button"
                        onClick={() => toggleService(service.id)}
                        className={`inline-flex items-center gap-2 px-3 py-2 rounded-full text-sm border transition-all ${
                          selectedServices.includes(service.id)
                            ? "bg-cyan-500/20 border-cyan-500/50 text-cyan-400"
                            : "bg-background/50 border-border text-muted-foreground hover:border-cyan-500/30"
                        }`}
                        data-testid={`chip-service-${service.id}`}
                      >
                        <service.icon className="w-4 h-4" />
                        {service.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-background/50 rounded-lg border border-border">
                  <div className="flex items-center gap-3">
                    <Zap className="w-5 h-5 text-orange-400" />
                    <span className="font-medium">Need Help ASAP</span>
                  </div>
                  <Switch
                    checked={needHelpAsap}
                    onCheckedChange={setNeedHelpAsap}
                    data-testid="switch-asap"
                  />
                </div>

                <div className="space-y-4">
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      type="email"
                      placeholder="Email address *"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10"
                      required
                      data-testid="input-email"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="relative">
                      <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <Input
                        type="text"
                        placeholder="Business name"
                        value={businessName}
                        onChange={(e) => setBusinessName(e.target.value)}
                        className="pl-10"
                        data-testid="input-business"
                      />
                    </div>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <Input
                        type="tel"
                        placeholder="Phone number"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="pl-10"
                        data-testid="input-phone"
                      />
                    </div>
                  </div>
                  <div className="relative">
                    <MessageSquare className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
                    <textarea
                      placeholder="Tell us about your needs..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      className="w-full min-h-[100px] pl-10 pr-4 py-3 bg-background border border-input rounded-md text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                      data-testid="textarea-message"
                    />
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-cyan-500 hover:bg-cyan-600 text-black"
                  disabled={contactMutation.isPending}
                  data-testid="button-submit-contact"
                >
                  {contactMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    "Send Message"
                  )}
                </Button>
              </form>
            </div>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
