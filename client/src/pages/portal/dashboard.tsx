import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { GuidedTour, HelpButton } from "@/components/ui/help-tooltip";
import { useHelp } from "@/context/help-context";
import { TermsModal } from "@/components/terms-modal";
import { 
  LayoutDashboard, 
  LogOut, 
  Settings, 
  Bell, 
  Shield, 
  Activity,
  FileText,
  MessageSquare,
  ChevronRight,
  Crown,
  UserCheck,
  Users,
  HardDrive,
  Mail,
  BarChart3,
  Contact,
  X,
  Monitor,
  Cpu,
  Lock,
  Unlock,
  Video,
  Plug,
  Globe,
  ExternalLink,
  Copy,
  Check,
  QrCode,
  Eye,
  Download,
  CreditCard,
  Coins
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Zap, Clock, CheckCircle2, XCircle, TrendingUp, Search, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";

interface AdminStats {
  subscribers: number;
  diagnostics: number;
  contacts: number;
  leads: number;
  chatSessions: number;
  users: number;
}

interface CSStats {
  active_subscriptions: number;
  total_orders: number;
  total_customers: number;
  total_revenue: number;
}

interface ChatLead {
  id: string;
  sessionId: string;
  name: string;
  contactMethod: string;
  contactValue: string;
  inquiry: string;
  createdAt: string;
}

interface EmailSubscriber {
  id: string;
  email: string;
  subscribedAt: string;
}

interface ContactSubmission {
  id: string;
  name: string;
  email: string;
  company?: string;
  message: string;
  createdAt: string;
}

interface DiagnosticScan {
  id: string;
  platform: string | null;
  userAgent: string | null;
  screenResolution: string | null;
  isSecure: number | null;
  browserCores: number | null;
  scannedAt: string;
}

interface WebsiteGrade {
  id: string;
  url: string;
  overallScore: number;
  seoScore: number;
  securityScore: number;
  performanceScore: number;
  keywordsScore: number;
  accessibilityScore: number;
  companyName: string | null;
  companyDescription: string | null;
  domain: string | null;
  ipAddress: string | null;
  createdAt: string;
  shareToken: string | null;
  qrCodeData: string | null;
  viewCount: number | null;
  downloadCount: number | null;
  lastViewedAt: string | null;
}

interface ChatMessage {
  id: string;
  sessionId: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
}

interface ActivityItem {
  icon: React.ComponentType<{ className?: string }>;
  iconColor: string;
  bgColor: string;
  title: string;
  subtitle: string;
  time: string;
  rawTime: Date;
  type: string;
}

interface ApiTier {
  id: string;
  name: string;
  displayName: string;
  monthlyLimit: number;
  dailyLimit: number;
  gtmetrixEnabled: number;
  priceMonthly: number;
  priceYearly: number;
}

interface UserQuotaInfo {
  quota: {
    dailyUsed: number;
    monthlyUsed: number;
  };
  tier: ApiTier | null;
  dailyRemaining: number;
  monthlyRemaining: number;
  canUseGtmetrix: boolean;
}

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const isSuperuser = user?.role === 'superuser';
  const [showDiagnosticsModal, setShowDiagnosticsModal] = useState(false);
  const [showLeadsModal, setShowLeadsModal] = useState(false);
  const [showSubscribersModal, setShowSubscribersModal] = useState(false);
  const [showContactsModal, setShowContactsModal] = useState(false);
  const [showGraderModal, setShowGraderModal] = useState(false);
  const [expandedLeadId, setExpandedLeadId] = useState<string | null>(null);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [loadingLeadId, setLoadingLeadId] = useState<string | null>(null);
  const [quickGradeUrl, setQuickGradeUrl] = useState("");
  const [quickGradeLoading, setQuickGradeLoading] = useState(false);
  const [quickGradeResult, setQuickGradeResult] = useState<any>(null);
  const [quickGradeLighthouse, setQuickGradeLighthouse] = useState(false);
  const [quickGradeSecurityScan, setQuickGradeSecurityScan] = useState(false);

  const { data: stats } = useQuery<AdminStats>({
    queryKey: ['/api/admin/stats'],
    queryFn: async () => {
      const res = await fetch('/api/admin/stats', { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to fetch stats');
      return res.json();
    },
    enabled: isAuthenticated && isSuperuser,
  });

  const { data: recentLeads } = useQuery<ChatLead[]>({
    queryKey: ['/api/admin/chat/leads'],
    queryFn: async () => {
      const res = await fetch('/api/admin/chat/leads', { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to fetch leads');
      return res.json();
    },
    enabled: isAuthenticated && isSuperuser,
  });

  const { data: recentSubscribers } = useQuery<EmailSubscriber[]>({
    queryKey: ['/api/admin/subscribers'],
    queryFn: async () => {
      const res = await fetch('/api/admin/subscribers', { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to fetch subscribers');
      return res.json();
    },
    enabled: isAuthenticated && isSuperuser,
  });

  const { data: recentContacts } = useQuery<ContactSubmission[]>({
    queryKey: ['/api/admin/contacts'],
    queryFn: async () => {
      const res = await fetch('/api/admin/contacts', { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to fetch contacts');
      return res.json();
    },
    enabled: isAuthenticated && isSuperuser,
  });

  const { data: diagnosticScans } = useQuery<DiagnosticScan[]>({
    queryKey: ['/api/admin/diagnostics'],
    queryFn: async () => {
      const res = await fetch('/api/admin/diagnostics', { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to fetch diagnostics');
      return res.json();
    },
    enabled: isAuthenticated && isSuperuser,
  });

  const { data: graderLeads } = useQuery<WebsiteGrade[]>({
    queryKey: ['/api/admin/grades'],
    queryFn: async () => {
      const res = await fetch('/api/admin/grades', { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to fetch grader leads');
      return res.json();
    },
    enabled: isAuthenticated && isSuperuser,
  });

  const { data: csStats } = useQuery<CSStats>({
    queryKey: ['/api/admin/cs/stats'],
    queryFn: async () => {
      const res = await fetch('/api/admin/cs/stats', { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to fetch CS stats');
      return res.json();
    },
    enabled: isAuthenticated && isSuperuser,
  });

  const { data: quotaInfo } = useQuery<UserQuotaInfo>({
    queryKey: ['/api/user/quota'],
    queryFn: async () => {
      const res = await fetch('/api/user/quota', { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to fetch quota');
      return res.json();
    },
    enabled: isAuthenticated,
  });

  const { data: allTiers } = useQuery<ApiTier[]>({
    queryKey: ['/api/tiers'],
    queryFn: async () => {
      const res = await fetch('/api/tiers', { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to fetch tiers');
      return res.json();
    },
    enabled: isAuthenticated,
  });

  const { data: productionAnalytics, isLoading: productionAnalyticsLoading } = useQuery<{
    summary: { total_requests: string; avg_duration: string; success_count: string; error_count: string };
    httpStatusesByHour: { hour: string; status_code: number; count: string }[];
    durationDistribution: { bucket: string; count: string }[];
  }>({
    queryKey: ['/api/admin/production-analytics'],
    queryFn: async () => {
      const res = await fetch('/api/admin/production-analytics', { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to fetch production analytics');
      return res.json();
    },
    enabled: isAuthenticated && isSuperuser,
  });

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Session Required",
        description: "Please sign in to access the dashboard.",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
    }
  }, [isAuthenticated, isLoading, toast]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const needsTermsAcceptance = !user?.termsAcceptedAt;

  const parseBrowser = (userAgent: string | null): string => {
    if (!userAgent) return "Unknown";
    if (userAgent.includes("Chrome") && !userAgent.includes("Edg")) return "Chrome";
    if (userAgent.includes("Firefox")) return "Firefox";
    if (userAgent.includes("Safari") && !userAgent.includes("Chrome")) return "Safari";
    if (userAgent.includes("Edg")) return "Edge";
    if (userAgent.includes("Opera") || userAgent.includes("OPR")) return "Opera";
    return "Other";
  };

  const internalStats = diagnosticScans ? {
    totalVisitors: diagnosticScans.length,
    byPlatform: diagnosticScans.reduce((acc, d) => {
      const platform = (d.platform || '').includes('Win') ? 'Windows' : 
                       (d.platform || '').includes('iPhone') ? 'iOS' :
                       (d.platform || '').includes('Mac') ? 'macOS' :
                       (d.platform || '').includes('Android') ? 'Android' :
                       (d.platform || '').includes('Linux') ? 'Linux' : 'Other';
      acc[platform] = (acc[platform] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
    byResolution: diagnosticScans.reduce((acc, d) => {
      const res = d.screenResolution || 'Unknown';
      acc[res] = (acc[res] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
    byBrowser: diagnosticScans.reduce((acc, d) => {
      const browser = parseBrowser(d.userAgent);
      acc[browser] = (acc[browser] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
    secureConnections: diagnosticScans.filter(d => d.isSecure === 1).length,
  } : null;

  const handleQuickGrade = async () => {
    if (!quickGradeUrl.trim()) return;
    
    let urlToGrade = quickGradeUrl.trim();
    if (!urlToGrade.startsWith('http://') && !urlToGrade.startsWith('https://')) {
      urlToGrade = 'https://' + urlToGrade;
    }
    
    setQuickGradeLoading(true);
    setQuickGradeResult(null);
    
    try {
      const res = await fetch('/api/grade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ url: urlToGrade, blind: true, useLighthouse: quickGradeLighthouse, useSecurityScan: quickGradeSecurityScan }),
      });
      
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to grade website');
      }
      
      const result = await res.json();
      setQuickGradeResult(result);
    } catch (error: any) {
      toast({
        title: "Grade Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setQuickGradeLoading(false);
    }
  };

  // Calculate grader stats
  const graderAvgScore = graderLeads && graderLeads.length > 0 
    ? Math.round(graderLeads.reduce((sum, g) => sum + g.overallScore, 0) / graderLeads.length) 
    : 0;
  const graderRecentCount = graderLeads?.filter(g => {
    const date = new Date(g.createdAt);
    const now = new Date();
    return (now.getTime() - date.getTime()) < 24 * 60 * 60 * 1000; // last 24h
  }).length || 0;
  const graderWithEmail = graderLeads?.filter(g => g.companyName || g.domain).length || 0;

  const quickActions = isSuperuser ? [
    { icon: Globe, label: "My Websites", description: "View your saved websites", status: "cyan", onClick: () => setLocation("/portal/websites"), featured: true },
    { 
      icon: Globe, 
      label: "Website Grader", 
      description: `${graderLeads?.length || 0} sites • Avg ${graderAvgScore}/100 • ${graderRecentCount} today`, 
      status: (graderLeads?.length || 0) > 0 ? "cyan" : "gray",
      count: graderLeads?.length || 0,
      onClick: () => setShowGraderModal(true)
    },
    { 
      icon: CreditCard, 
      label: "Customer Service", 
      description: `${csStats?.total_orders || 0} orders, ${csStats?.active_subscriptions || 0} subs`, 
      status: (csStats?.total_orders || 0) > 0 ? "emerald" : "gray",
      count: csStats?.total_orders || 0,
      onClick: () => setLocation("/portal/admin?tab=customers")
    },
    { 
      icon: MessageSquare, 
      label: "Chat Leads", 
      description: `${stats?.leads || 0} leads captured`, 
      status: (stats?.leads || 0) > 0 ? "green" : "gray",
      count: stats?.leads || 0,
      onClick: () => setShowLeadsModal(true)
    },
    { 
      icon: Mail, 
      label: "Email Signups", 
      description: `${stats?.subscribers || 0} subscribers`, 
      status: (stats?.subscribers || 0) > 0 ? "blue" : "gray",
      count: stats?.subscribers || 0,
      onClick: () => setShowSubscribersModal(true)
    },
    { 
      icon: Contact, 
      label: "Contact Submissions", 
      description: `${stats?.contacts || 0} messages`, 
      status: (stats?.contacts || 0) > 0 ? "cyan" : "gray",
      count: stats?.contacts || 0,
      onClick: () => setShowContactsModal(true)
    },
    { 
      icon: BarChart3, 
      label: "Diagnostic Scans", 
      description: `${stats?.diagnostics || 0} scans run`, 
      status: (stats?.diagnostics || 0) > 0 ? "purple" : "gray",
      count: stats?.diagnostics || 0,
      onClick: () => setShowDiagnosticsModal(true)
    },
  ] : [
    { icon: Globe, label: "My Websites", description: "View your saved websites", status: "cyan", onClick: () => setLocation("/portal/websites"), featured: true },
    { icon: CreditCard, label: "Billing & Purchases", description: "View orders and subscriptions", status: "emerald", onClick: () => setLocation("/portal/billing") },
    { icon: Coins, label: "Token Wallet", description: "Buy and spend tokens", status: "yellow", onClick: () => setLocation("/portal/tokens") },
    { icon: HardDrive, label: "Media Library", description: "Manage your files", status: "purple", onClick: () => setLocation("/portal/media") },
    { icon: Plug, label: "Integrations", description: "Connect your services", status: "blue", onClick: () => setLocation("/portal/integrations") },
  ];

  const recentActivity: ActivityItem[] = [];
  
  if (isSuperuser) {
    if (recentLeads && recentLeads.length > 0) {
      recentLeads.slice(0, 3).forEach(lead => {
        const date = new Date(lead.createdAt);
        recentActivity.push({
          icon: MessageSquare,
          iconColor: "text-green-500",
          bgColor: "bg-green-500/10",
          title: `New lead: ${lead.name}`,
          subtitle: lead.inquiry.slice(0, 50) + (lead.inquiry.length > 50 ? '...' : ''),
          time: format(date, 'MMM d, h:mm a'),
          rawTime: date,
          type: 'lead'
        });
      });
    }
    
    if (recentSubscribers && recentSubscribers.length > 0) {
      recentSubscribers.slice(0, 3).forEach(sub => {
        const date = new Date(sub.subscribedAt);
        recentActivity.push({
          icon: Mail,
          iconColor: "text-blue-500",
          bgColor: "bg-blue-500/10",
          title: "New email signup",
          subtitle: sub.email,
          time: format(date, 'MMM d, h:mm a'),
          rawTime: date,
          type: 'subscriber'
        });
      });
    }
    
    if (recentContacts && recentContacts.length > 0) {
      recentContacts.slice(0, 3).forEach(contact => {
        const date = new Date(contact.createdAt);
        recentActivity.push({
          icon: Contact,
          iconColor: "text-cyan-500",
          bgColor: "bg-cyan-500/10",
          title: `Contact from ${contact.name}`,
          subtitle: contact.message.slice(0, 50) + (contact.message.length > 50 ? '...' : ''),
          time: format(date, 'MMM d, h:mm a'),
          rawTime: date,
          type: 'contact'
        });
      });
    }
    
    recentActivity.sort((a, b) => b.rawTime.getTime() - a.rawTime.getTime());
  }

  return (
    <div className="min-h-screen bg-background">
      <TermsModal isOpen={needsTermsAcceptance} userTermsVersion={user?.termsVersion} />
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-background/80 border-b border-white/5">
        <div className="container mx-auto px-3 md:px-6">
          <div className="flex items-center justify-between h-14 md:h-16">
            <div className="flex items-center gap-2 md:gap-4 shrink-0">
              <button 
                onClick={() => setLocation("/")}
                className="text-lg md:text-xl font-bold font-heading text-white"
              >
                TriFused
              </button>
              <span className="text-muted-foreground hidden md:inline">/</span>
              <span className="text-muted-foreground hidden md:flex items-center gap-2">
                <LayoutDashboard className="w-4 h-4" />
                Dashboard
              </span>
            </div>
            
            <div className="flex items-center gap-2 md:gap-4">
              <Button variant="ghost" size="icon" className="relative hidden md:flex" aria-label="Notifications">
                <Bell className="w-5 h-5" aria-hidden="true" />
                {isSuperuser && (stats?.leads || 0) > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full" aria-label="New notifications available" />
                )}
              </Button>
              <Button variant="ghost" size="icon" className="hidden md:flex" aria-label="Settings">
                <Settings className="w-5 h-5" aria-hidden="true" />
              </Button>
              <div className="flex items-center gap-2 md:gap-3 md:pl-4 md:border-l border-white/10 overflow-x-auto scrollbar-hide">
                {(user?.ftpAccess === 1 || user?.role === 'superuser') && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setLocation("/portal/mft")}
                    className="border-cyan-500/30 text-cyan-500 hover:bg-cyan-500/10 shrink-0"
                    data-testid="button-mft"
                  >
                    <HardDrive className="w-4 h-4 md:mr-2" />
                    <span className="hidden md:inline">MFT</span>
                  </Button>
                )}
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setLocation("/portal/media")}
                  className="border-purple-500/30 text-purple-500 hover:bg-purple-500/10 shrink-0"
                  data-testid="button-media"
                >
                  <Video className="w-4 h-4 md:mr-2" />
                  <span className="hidden md:inline">Media</span>
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setLocation("/portal/integrations")}
                  className="border-green-500/30 text-green-500 hover:bg-green-500/10 shrink-0"
                  data-testid="button-integrations"
                >
                  <Plug className="w-4 h-4 md:mr-2" />
                  <span className="hidden md:inline">Integrations</span>
                </Button>
                {user?.role === 'superuser' && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setLocation("/portal/admin")}
                    className="border-yellow-500/30 text-yellow-500 hover:bg-yellow-500/10 shrink-0"
                    data-testid="button-admin"
                  >
                    <Users className="w-4 h-4 md:mr-2" />
                    <span className="hidden md:inline">Admin</span>
                  </Button>
                )}
                {user?.profileImageUrl && (
                  <img 
                    src={user.profileImageUrl} 
                    alt="Profile" 
                    className={`w-8 h-8 rounded-full object-cover border shrink-0 ${user?.role === 'superuser' ? 'border-yellow-500/30' : 'border-white/10'}`}
                    data-testid="img-user-avatar"
                  />
                )}
                <div className="text-sm hidden md:block">
                  <div className="text-white font-medium flex items-center gap-2" data-testid="text-user-name">
                    {user?.firstName || user?.email?.split('@')[0] || 'User'}
                    {user?.role === 'superuser' && <Crown className="w-3 h-3 text-yellow-500" />}
                    {user?.role === 'validated' && <UserCheck className="w-3 h-3 text-green-500" />}
                  </div>
                  <div className={`text-xs ${user?.role === 'superuser' ? 'text-yellow-500/80' : user?.role === 'validated' ? 'text-green-500/80' : 'text-muted-foreground'}`} data-testid="text-user-role">
                    {user?.role === 'superuser' ? 'Superuser' : user?.role === 'validated' ? 'Validated' : 'Guest'}
                  </div>
                </div>
              </div>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => window.location.href = "/api/logout"}
                data-testid="button-logout"
                className="shrink-0 text-red-400 hover:text-red-300 hover:bg-red-500/10"
                aria-label="Sign out"
              >
                <LogOut className="w-4 h-4" aria-hidden="true" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main id="main-content" className="container mx-auto px-3 md:px-6 py-6 md:py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 md:mb-12"
        >
          <h1 className="text-2xl md:text-3xl font-bold font-heading text-white mb-2">
            Welcome back{user?.firstName ? `, ${user.firstName}` : ''}
          </h1>
          <p className="text-sm md:text-base text-muted-foreground">
            {isSuperuser 
              ? "Here's your admin overview with real-time stats and recent activity."
              : "Here's an overview of your account and recent activity."}
          </p>
        </motion.div>

        {/* API Usage & Tier Panel */}
        {quotaInfo && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <div className="glass-panel rounded-xl p-4 md:p-6">
              <div className="flex flex-col md:flex-row gap-4 md:gap-6">
                {/* Current Tier */}
                <div className="flex-shrink-0">
                  <div className="flex items-center gap-2 mb-2">
                    <Crown className={`w-5 h-5 ${
                      quotaInfo.tier?.name === 'enterprise' ? 'text-purple-400' :
                      quotaInfo.tier?.name === 'pro' ? 'text-cyan-400' :
                      quotaInfo.tier?.name === 'starter' ? 'text-blue-400' :
                      'text-gray-400'
                    }`} />
                    <span className="text-sm text-muted-foreground">Current Plan</span>
                  </div>
                  <div className="text-xl font-bold text-white">
                    {quotaInfo.tier?.displayName || 'Free'}
                  </div>
                  {quotaInfo.tier && quotaInfo.tier.name !== 'free' && (
                    <div className="text-xs text-muted-foreground mt-1">
                      ${(quotaInfo.tier.priceMonthly / 100).toFixed(2)}/mo
                    </div>
                  )}
                </div>

                {/* Usage Meters */}
                <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Daily Usage */}
                  {(() => {
                    const dailyUsed = quotaInfo.quota.dailyUsed ?? 0;
                    const dailyLimit = quotaInfo.tier?.dailyLimit || 5;
                    const dailyRatio = dailyUsed / dailyLimit;
                    const dailyRemaining = Math.max(0, dailyLimit - dailyUsed);
                    return (
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs text-muted-foreground">Daily Usage</span>
                          <span className="text-xs text-white">
                            {dailyUsed} / {dailyLimit}
                          </span>
                        </div>
                        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                          <div 
                            className={`h-full transition-all ${
                              dailyRatio > 0.9 ? 'bg-red-500' :
                              dailyRatio > 0.7 ? 'bg-yellow-500' :
                              'bg-cyan-500'
                            }`}
                            style={{ width: `${Math.min(100, dailyRatio * 100)}%` }}
                          />
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {dailyRemaining} scans remaining today
                        </div>
                      </div>
                    );
                  })()}

                  {/* Monthly Usage */}
                  {(() => {
                    const monthlyUsed = quotaInfo.quota.monthlyUsed ?? 0;
                    const monthlyLimit = quotaInfo.tier?.monthlyLimit || 50;
                    const monthlyRatio = monthlyUsed / monthlyLimit;
                    const monthlyRemaining = Math.max(0, monthlyLimit - monthlyUsed);
                    return (
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs text-muted-foreground">Monthly Usage</span>
                          <span className="text-xs text-white">
                            {monthlyUsed} / {monthlyLimit}
                          </span>
                        </div>
                        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                          <div 
                            className={`h-full transition-all ${
                              monthlyRatio > 0.9 ? 'bg-red-500' :
                              monthlyRatio > 0.7 ? 'bg-yellow-500' :
                              'bg-cyan-500'
                            }`}
                            style={{ width: `${Math.min(100, monthlyRatio * 100)}%` }}
                          />
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {monthlyRemaining} scans remaining this month
                        </div>
                      </div>
                    );
                  })()}
                </div>

                {/* GTmetrix Badge & Upgrade */}
                <div className="flex-shrink-0 flex flex-col items-end justify-between">
                  {quotaInfo.canUseGtmetrix ? (
                    <div className="flex items-center gap-1.5 px-2 py-1 bg-cyan-500/20 rounded text-xs text-cyan-400">
                      <Zap className="w-3 h-3" />
                      GTmetrix Enabled
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 px-2 py-1 bg-white/5 rounded text-xs text-muted-foreground">
                      <Lock className="w-3 h-3" />
                      GTmetrix (Pro+)
                    </div>
                  )}
                  
                  {quotaInfo.tier?.name !== 'enterprise' && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="mt-2 text-xs"
                      onClick={() => setLocation('/portal/billing')}
                      data-testid="btn-upgrade-tier"
                    >
                      <TrendingUp className="w-3 h-3 mr-1" />
                      Upgrade
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {isSuperuser && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <div className="glass-panel rounded-xl p-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type="url"
                    inputMode="url"
                    autoCapitalize="off"
                    autoCorrect="off"
                    placeholder="Quick grade URL (not saved to stats)..."
                    value={quickGradeUrl}
                    onChange={(e) => setQuickGradeUrl(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleQuickGrade()}
                    className="pl-10 bg-white/5 border-white/10 h-11"
                    data-testid="input-quick-grade"
                  />
                </div>
                <Button
                  variant={quickGradeLighthouse ? "default" : "outline"}
                  onClick={() => setQuickGradeLighthouse(!quickGradeLighthouse)}
                  className={`h-11 px-3 ${quickGradeLighthouse ? 'bg-purple-600 hover:bg-purple-700' : ''}`}
                  data-testid="btn-toggle-lighthouse"
                  title="Toggle Lighthouse analysis"
                >
                  <Zap className="w-4 h-4" />
                </Button>
                <Button
                  variant={quickGradeSecurityScan ? "default" : "outline"}
                  onClick={() => setQuickGradeSecurityScan(!quickGradeSecurityScan)}
                  className={`h-11 px-3 ${quickGradeSecurityScan ? 'bg-red-600 hover:bg-red-700' : ''}`}
                  data-testid="btn-toggle-security-scan"
                  title="Toggle advanced security scan (secrets & exposed files)"
                >
                  <Shield className="w-4 h-4" />
                </Button>
                <Button
                  onClick={handleQuickGrade}
                  disabled={quickGradeLoading || !quickGradeUrl.trim()}
                  className="h-11 px-6"
                  data-testid="btn-quick-grade"
                >
                  {quickGradeLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    "Grade"
                  )}
                </Button>
              </div>
              {quickGradeResult && (
                <div className="mt-4 p-3 bg-white/5 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground truncate flex-1 mr-2">{quickGradeResult.url}</span>
                    <span className={`text-2xl font-bold ${
                      quickGradeResult.overallScore >= 80 ? 'text-green-500' :
                      quickGradeResult.overallScore >= 60 ? 'text-yellow-500' :
                      'text-red-500'
                    }`}>
                      {quickGradeResult.overallScore}/100
                    </span>
                  </div>
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 text-xs">
                    <div className="text-center p-2 bg-white/5 rounded">
                      <div className="text-muted-foreground">SEO</div>
                      <div className="font-medium text-white">{quickGradeResult.seoScore}</div>
                    </div>
                    <div className="text-center p-2 bg-white/5 rounded">
                      <div className="text-muted-foreground">Security</div>
                      <div className="font-medium text-white">{quickGradeResult.securityScore}</div>
                    </div>
                    <div className="text-center p-2 bg-white/5 rounded">
                      <div className="text-muted-foreground">Perf</div>
                      <div className="font-medium text-white">{quickGradeResult.performanceScore}</div>
                    </div>
                    <div className="text-center p-2 bg-white/5 rounded">
                      <div className="text-muted-foreground">Access</div>
                      <div className="font-medium text-white">{quickGradeResult.accessibilityScore}</div>
                    </div>
                    <div className="text-center p-2 bg-white/5 rounded">
                      <div className="text-muted-foreground">Email</div>
                      <div className="font-medium text-white">{quickGradeResult.emailSecurityScore}</div>
                    </div>
                    <div className="text-center p-2 bg-white/5 rounded">
                      <div className="text-muted-foreground">Mobile</div>
                      <div className="font-medium text-white">{quickGradeResult.mobileScore}</div>
                    </div>
                  </div>
                  {quickGradeResult.advancedSecurityScan && (
                    <div className="mt-3 p-2 bg-red-500/10 border border-red-500/20 rounded">
                      <div className="text-xs font-medium text-red-400 mb-2 flex items-center gap-1">
                        <Shield className="w-3 h-3" />
                        Security Scan Results
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className={`p-2 rounded ${quickGradeResult.advancedSecurityScan.secretsFound.length > 0 ? 'bg-red-500/20' : 'bg-green-500/20'}`}>
                          <div className="text-muted-foreground">Exposed Secrets</div>
                          <div className={`font-medium ${quickGradeResult.advancedSecurityScan.secretsFound.length > 0 ? 'text-red-400' : 'text-green-400'}`}>
                            {quickGradeResult.advancedSecurityScan.secretsFound.length} found
                          </div>
                        </div>
                        <div className={`p-2 rounded ${quickGradeResult.advancedSecurityScan.exposedFiles.length > 0 ? 'bg-red-500/20' : 'bg-green-500/20'}`}>
                          <div className="text-muted-foreground">Exposed Files</div>
                          <div className={`font-medium ${quickGradeResult.advancedSecurityScan.exposedFiles.length > 0 ? 'text-red-400' : 'text-green-400'}`}>
                            {quickGradeResult.advancedSecurityScan.exposedFiles.length} found
                          </div>
                        </div>
                      </div>
                      {quickGradeResult.advancedSecurityScan.secretsFound.length > 0 && (
                        <div className="mt-2 text-xs text-red-300">
                          {quickGradeResult.advancedSecurityScan.secretsFound.slice(0, 3).map((s: any, i: number) => (
                            <div key={i} className="truncate">• {s.type}: {s.value}</div>
                          ))}
                          {quickGradeResult.advancedSecurityScan.secretsFound.length > 3 && (
                            <div className="text-muted-foreground">...and {quickGradeResult.advancedSecurityScan.secretsFound.length - 3} more</div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                  <div className="mt-3 flex items-center gap-4">
                    <button
                      onClick={() => {
                        const domain = quickGradeResult.domain || new URL(quickGradeResult.url).hostname;
                        const scores = [
                          { name: 'SEO', score: quickGradeResult.seoScore },
                          { name: 'Security', score: quickGradeResult.securityScore },
                          { name: 'Perf', score: quickGradeResult.performanceScore },
                          { name: 'Access', score: quickGradeResult.accessibilityScore },
                          { name: 'Email', score: quickGradeResult.emailSecurityScore },
                          { name: 'Mobile', score: quickGradeResult.mobileScore },
                        ].sort((a, b) => b.score - a.score);
                        const topTwo = scores.slice(0, 2);
                        const bottomTwo = scores.slice(-2);
                        const text = `Ran a quick website grade on ${domain} — ${quickGradeResult.overallScore}/100.

${topTwo[0].name} (${topTwo[0].score}) and ${topTwo[1].name} (${topTwo[1].score}) are in good shape.
Biggest upside is tightening ${bottomTwo[0].name} and ${bottomTwo[1].name}.

Good news: most fixes are fast and free with the right tools + an AI agent.

🔧 Free tools:
\t•\thttps://grader.trifused.com/
\t•\thttps://pagespeed.web.dev/
\t•\thttps://gtmetrix.com/

Crafted with vibe coding.
Small tweaks → big gains.`;
                        navigator.clipboard.writeText(text);
                        toast({ title: "Copied!", description: "Scorecard copied to clipboard" });
                      }}
                      className="text-xs text-cyan-400 hover:text-cyan-300 transition-colors flex items-center gap-1"
                      data-testid="btn-copy-scorecard"
                    >
                      <Copy className="w-3 h-3" />
                      Copy scorecard
                    </button>
                    <button
                      onClick={() => { setQuickGradeResult(null); setQuickGradeUrl(""); }}
                      className="text-xs text-muted-foreground hover:text-white transition-colors"
                    >
                      Clear result
                    </button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8 md:mb-12">
          {quickActions.map((action, index) => (
            <motion.div
              key={action.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`rounded-xl p-4 md:p-6 transition-colors cursor-pointer group ${
                'featured' in action && action.featured 
                  ? 'bg-gradient-to-br from-cyan-500/20 via-primary/10 to-purple-500/20 border-2 border-cyan-500/50 hover:border-cyan-400' 
                  : 'glass-panel hover:border-primary/30'
              }`}
              data-testid={`card-stat-${action.label.toLowerCase().replace(/\s+/g, '-')}`}
              onClick={'onClick' in action ? action.onClick : undefined}
            >
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-4 ${
                action.status === 'green' ? 'bg-green-500/10 text-green-500' :
                action.status === 'blue' ? 'bg-blue-500/10 text-blue-500' :
                action.status === 'purple' ? 'bg-purple-500/10 text-purple-500' :
                action.status === 'cyan' ? 'bg-cyan-500/10 text-cyan-500' :
                action.status === 'emerald' ? 'bg-emerald-500/10 text-emerald-500' :
                action.status === 'orange' ? 'bg-orange-500/10 text-orange-500' :
                'bg-white/5 text-muted-foreground'
              }`}>
                <action.icon className="w-5 h-5" />
              </div>
              <h3 className={`font-medium mb-1 flex items-center gap-2 ${
                'featured' in action && action.featured ? 'text-cyan-400 text-lg' : 'text-white'
              }`}>
                {action.label}
                {'featured' in action && action.featured && <Crown className="w-4 h-4 text-yellow-400" />}
                <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
              </h3>
              <p className="text-sm text-muted-foreground">{action.description}</p>
            </motion.div>
          ))}
        </div>

        {/* Production Analytics Charts - Prominent on Dashboard */}
        {isSuperuser && productionAnalytics && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-12"
          >
            <h2 className="text-xl font-bold font-heading text-white mb-6 flex items-center gap-2">
              <Zap className="w-5 h-5 text-orange-400" />
              API Analytics (24h)
            </h2>

            {/* Summary Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="glass-panel rounded-xl p-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                    <Globe className="w-4 h-4 text-blue-500" />
                  </div>
                  <span className="text-2xl font-bold text-white">
                    {parseInt(productionAnalytics.summary.total_requests || '0').toLocaleString()}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">Total Requests</p>
              </div>
              <div className="glass-panel rounded-xl p-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-cyan-500/10 flex items-center justify-center">
                    <Clock className="w-4 h-4 text-cyan-500" />
                  </div>
                  <span className="text-2xl font-bold text-white">
                    {Math.round(parseFloat(productionAnalytics.summary.avg_duration || '0'))}ms
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">Avg Response</p>
              </div>
              <div className="glass-panel rounded-xl p-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                  </div>
                  <span className="text-2xl font-bold text-green-400">
                    {parseInt(productionAnalytics.summary.success_count || '0').toLocaleString()}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">Success (2xx)</p>
              </div>
              <div className="glass-panel rounded-xl p-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center">
                    <XCircle className="w-4 h-4 text-red-500" />
                  </div>
                  <span className="text-2xl font-bold text-red-400">
                    {parseInt(productionAnalytics.summary.error_count || '0').toLocaleString()}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">Errors (4xx/5xx)</p>
              </div>
            </div>

            {/* Charts Row */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* HTTP Statuses Line Chart */}
              {productionAnalytics.httpStatusesByHour.length > 0 && (
                <div className="glass-panel rounded-xl overflow-hidden">
                  <div className="p-4 border-b border-white/5 bg-white/5">
                    <h3 className="text-white font-medium flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-green-400" />
                      HTTP Statuses
                    </h3>
                  </div>
                  <div className="p-4">
                    <ResponsiveContainer width="100%" height={200}>
                      <LineChart
                        data={(() => {
                          const hourlyData: Record<string, any> = {};
                          productionAnalytics.httpStatusesByHour.forEach((item) => {
                            const hour = format(new Date(item.hour), 'HH:mm');
                            if (!hourlyData[hour]) {
                              hourlyData[hour] = { hour, '2xx': 0, '4xx': 0, '5xx': 0 };
                            }
                            const status = item.status_code;
                            if (status >= 200 && status < 300) hourlyData[hour]['2xx'] += parseInt(item.count);
                            else if (status >= 400 && status < 500) hourlyData[hour]['4xx'] += parseInt(item.count);
                            else if (status >= 500) hourlyData[hour]['5xx'] += parseInt(item.count);
                          });
                          return Object.values(hourlyData).sort((a, b) => a.hour.localeCompare(b.hour));
                        })()}
                        margin={{ top: 5, right: 10, left: 0, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                        <XAxis dataKey="hour" stroke="#888" fontSize={10} />
                        <YAxis stroke="#888" fontSize={10} />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'rgba(0,0,0,0.8)', 
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '8px',
                            fontSize: '12px'
                          }} 
                        />
                        <Legend wrapperStyle={{ fontSize: '11px' }} />
                        <Line type="monotone" dataKey="2xx" stroke="#22c55e" strokeWidth={2} dot={false} />
                        <Line type="monotone" dataKey="4xx" stroke="#f97316" strokeWidth={2} dot={false} />
                        <Line type="monotone" dataKey="5xx" stroke="#ef4444" strokeWidth={2} dot={false} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}

              {/* Request Duration Bar Chart */}
              {productionAnalytics.durationDistribution.length > 0 && (
                <div className="glass-panel rounded-xl overflow-hidden">
                  <div className="p-4 border-b border-white/5 bg-white/5">
                    <h3 className="text-white font-medium flex items-center gap-2">
                      <Clock className="w-4 h-4 text-cyan-400" />
                      Response Times
                    </h3>
                  </div>
                  <div className="p-4">
                    <ResponsiveContainer width="100%" height={200}>
                      <BarChart
                        data={productionAnalytics.durationDistribution.map(item => ({
                          bucket: item.bucket.replace('< ', '<'),
                          count: parseInt(item.count)
                        }))}
                        margin={{ top: 5, right: 10, left: 0, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                        <XAxis dataKey="bucket" stroke="#888" fontSize={9} />
                        <YAxis stroke="#888" fontSize={10} />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'rgba(0,0,0,0.8)', 
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '8px',
                            fontSize: '12px'
                          }}
                          formatter={(value: number) => [value.toLocaleString(), 'Requests']}
                        />
                        <Bar dataKey="count" fill="#22d3ee" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {isSuperuser && internalStats && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mb-12"
          >
            <h2 className="text-xl font-bold font-heading text-white mb-6 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-purple-500" />
              Visitor Analytics
            </h2>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="glass-panel rounded-xl p-4" data-testid="stat-total-scans">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center">
                    <BarChart3 className="w-4 h-4 text-purple-500" />
                  </div>
                  <span className="text-2xl font-bold text-white">{internalStats.totalVisitors}</span>
                </div>
                <p className="text-sm text-muted-foreground">Total Scans</p>
              </div>
              <div className="glass-panel rounded-xl p-4" data-testid="stat-secure-connections">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center">
                    <Lock className="w-4 h-4 text-green-500" />
                  </div>
                  <span className="text-2xl font-bold text-white">{internalStats.secureConnections}</span>
                </div>
                <p className="text-sm text-muted-foreground">Secure Connections</p>
              </div>
              <div className="glass-panel rounded-xl p-4" data-testid="stat-platforms">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                    <Monitor className="w-4 h-4 text-blue-500" />
                  </div>
                  <span className="text-2xl font-bold text-white">{Object.keys(internalStats.byPlatform).length}</span>
                </div>
                <p className="text-sm text-muted-foreground">Platforms</p>
              </div>
              <div className="glass-panel rounded-xl p-4" data-testid="stat-resolutions">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-cyan-500/10 flex items-center justify-center">
                    <FileText className="w-4 h-4 text-cyan-500" />
                  </div>
                  <span className="text-2xl font-bold text-white">{Object.keys(internalStats.byResolution).length}</span>
                </div>
                <p className="text-sm text-muted-foreground">Screen Sizes</p>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <div className="glass-panel rounded-xl p-4" data-testid="table-platforms">
                <h3 className="text-white font-medium mb-3 flex items-center gap-2">
                  <Monitor className="w-4 h-4 text-blue-500" />
                  By Platform
                </h3>
                <div className="space-y-2">
                  {Object.entries(internalStats.byPlatform)
                    .sort(([,a], [,b]) => b - a)
                    .slice(0, 5)
                    .map(([platform, count]) => (
                      <div key={platform} className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">{platform}</span>
                        <span className="text-white font-medium">{count}</span>
                      </div>
                    ))}
                </div>
              </div>
              <div className="glass-panel rounded-xl p-4" data-testid="table-browsers">
                <h3 className="text-white font-medium mb-3 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-cyan-500" />
                  By Browser
                </h3>
                <div className="space-y-2">
                  {Object.entries(internalStats.byBrowser)
                    .sort(([,a], [,b]) => b - a)
                    .slice(0, 5)
                    .map(([browser, count]) => (
                      <div key={browser} className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">{browser}</span>
                        <span className="text-white font-medium">{count}</span>
                      </div>
                    ))}
                </div>
              </div>
              <div className="glass-panel rounded-xl p-4" data-testid="table-resolutions">
                <h3 className="text-white font-medium mb-3 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-purple-500" />
                  By Screen Size
                </h3>
                <div className="space-y-2">
                  {Object.entries(internalStats.byResolution)
                    .sort(([,a], [,b]) => b - a)
                    .slice(0, 5)
                    .map(([resolution, count]) => (
                      <div key={resolution} className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">{resolution}</span>
                        <span className="text-white font-medium">{count}</span>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass-panel rounded-2xl p-8"
        >
          <h2 className="text-xl font-bold font-heading text-white mb-6">Recent Activity</h2>
          <div className="space-y-4">
            {isSuperuser && recentActivity.length > 0 ? (
              recentActivity.slice(0, 5).map((activity, index) => (
                <div 
                  key={`${activity.type}-${index}`}
                  className={`flex items-center justify-between py-4 ${index < recentActivity.length - 1 ? 'border-b border-white/5' : ''}`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-lg ${activity.bgColor} flex items-center justify-center`}>
                      <activity.icon className={`w-5 h-5 ${activity.iconColor}`} />
                    </div>
                    <div>
                      <p className="text-white">{activity.title}</p>
                      <p className="text-sm text-muted-foreground">{activity.subtitle}</p>
                    </div>
                  </div>
                  <span className="text-sm text-muted-foreground">{activity.time}</span>
                </div>
              ))
            ) : isSuperuser ? (
              <div className="text-center py-8 text-muted-foreground">
                <Activity className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No recent activity yet</p>
                <p className="text-sm">Leads, signups, and contacts will appear here</p>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between py-4 border-b border-white/5">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Shield className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-white">Security scan completed</p>
                      <p className="text-sm text-muted-foreground">All vulnerabilities patched</p>
                    </div>
                  </div>
                  <span className="text-sm text-muted-foreground">2 hours ago</span>
                </div>
                <div className="flex items-center justify-between py-4 border-b border-white/5">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                      <Activity className="w-5 h-5 text-blue-500" />
                    </div>
                    <div>
                      <p className="text-white">Infrastructure optimization</p>
                      <p className="text-sm text-muted-foreground">Performance increased by 23%</p>
                    </div>
                  </div>
                  <span className="text-sm text-muted-foreground">1 day ago</span>
                </div>
                <div className="flex items-center justify-between py-4">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                      <FileText className="w-5 h-5 text-purple-500" />
                    </div>
                    <div>
                      <p className="text-white">Monthly report generated</p>
                      <p className="text-sm text-muted-foreground">Available in Reports section</p>
                    </div>
                  </div>
                  <span className="text-sm text-muted-foreground">3 days ago</span>
                </div>
              </>
            )}
          </div>
        </motion.div>
      </main>

      <Dialog open={showDiagnosticsModal} onOpenChange={setShowDiagnosticsModal}>
        <DialogContent className="max-w-4xl max-h-[80vh] bg-background border-white/10">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-white flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-purple-500" />
              Diagnostic Scan Logs
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="h-[60vh] pr-4">
            {diagnosticScans && diagnosticScans.length > 0 ? (
              <div className="space-y-4">
                {diagnosticScans.map((scan) => (
                  <div 
                    key={scan.id} 
                    className="glass-panel rounded-lg p-4 border border-white/5"
                    data-testid={`scan-log-${scan.id}`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm text-muted-foreground">
                        {format(new Date(scan.scannedAt), 'MMM d, yyyy h:mm a')}
                      </span>
                      <span className={`px-2 py-1 rounded text-xs ${scan.isSecure === 1 ? 'bg-green-500/10 text-green-500' : 'bg-yellow-500/10 text-yellow-500'}`}>
                        {scan.isSecure === 1 ? 'Secure' : 'Not Secure'}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="flex items-center gap-2">
                        <Monitor className="w-4 h-4 text-blue-500" />
                        <div>
                          <p className="text-xs text-muted-foreground">Platform</p>
                          <p className="text-sm text-white">{scan.platform || 'Unknown'}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Activity className="w-4 h-4 text-cyan-500" />
                        <div>
                          <p className="text-xs text-muted-foreground">Browser</p>
                          <p className="text-sm text-white">{parseBrowser(scan.userAgent)}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-purple-500" />
                        <div>
                          <p className="text-xs text-muted-foreground">Resolution</p>
                          <p className="text-sm text-white">{scan.screenResolution || 'Unknown'}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Cpu className="w-4 h-4 text-orange-500" />
                        <div>
                          <p className="text-xs text-muted-foreground">CPU Cores</p>
                          <p className="text-sm text-white">{scan.browserCores || 'Unknown'}</p>
                        </div>
                      </div>
                    </div>
                    {scan.userAgent && (
                      <div className="mt-3 pt-3 border-t border-white/5">
                        <p className="text-xs text-muted-foreground mb-1">User Agent</p>
                        <p className="text-xs text-white/60 font-mono break-all">{scan.userAgent}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No diagnostic scans yet</p>
                <p className="text-sm">Visitor scans will appear here when they run diagnostics</p>
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>

      <Dialog open={showLeadsModal} onOpenChange={(open) => {
        setShowLeadsModal(open);
        if (!open) {
          setExpandedLeadId(null);
          setChatHistory([]);
        }
      }}>
        <DialogContent className="max-w-4xl max-h-[80vh] bg-background border-white/10">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-white flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-green-500" />
              Chat Leads
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="h-[60vh] pr-4">
            {recentLeads && recentLeads.length > 0 ? (
              <div className="space-y-4">
                {recentLeads.map((lead) => (
                  <div 
                    key={lead.id} 
                    className="glass-panel rounded-lg p-4 border border-white/5"
                    data-testid={`lead-${lead.id}`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-white font-medium">{lead.name}</span>
                        <span className="text-xs px-2 py-0.5 bg-green-500/10 text-green-500 rounded">
                          {lead.contactMethod}
                        </span>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {format(new Date(lead.createdAt), 'MMM d, yyyy h:mm a')}
                      </span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-cyan-500" />
                        <span className="text-sm text-white">{lead.contactValue}</span>
                      </div>
                      <div className="pt-2 border-t border-white/5">
                        <p className="text-xs text-muted-foreground mb-1">Inquiry</p>
                        <p className="text-sm text-white/80">{lead.inquiry}</p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-2 text-xs"
                        data-testid={`button-view-chat-${lead.id}`}
                        onClick={async () => {
                          if (expandedLeadId === lead.id) {
                            setExpandedLeadId(null);
                            setChatHistory([]);
                            setLoadingLeadId(null);
                          } else {
                            const currentLeadId = lead.id;
                            setExpandedLeadId(currentLeadId);
                            setChatHistory([]);
                            setLoadingLeadId(currentLeadId);
                            try {
                              const res = await fetch(`/api/admin/chat/sessions/${lead.sessionId}/messages`, { credentials: 'include' });
                              if (res.ok) {
                                const messages = await res.json();
                                setExpandedLeadId((current) => {
                                  if (current === currentLeadId) {
                                    setChatHistory(messages);
                                    setLoadingLeadId(null);
                                  }
                                  return current;
                                });
                              } else {
                                setExpandedLeadId((current) => {
                                  if (current === currentLeadId) {
                                    setLoadingLeadId(null);
                                  }
                                  return current;
                                });
                              }
                            } catch (err) {
                              console.error('Failed to fetch chat history:', err);
                              setExpandedLeadId((current) => {
                                if (current === currentLeadId) {
                                  setLoadingLeadId(null);
                                }
                                return current;
                              });
                            }
                          }
                        }}
                      >
                        <MessageSquare className="w-3 h-3 mr-1" />
                        {expandedLeadId === lead.id ? 'Hide Chat' : 'View Chat History'}
                      </Button>
                      {expandedLeadId === lead.id && (
                        <div className="mt-3 pt-3 border-t border-white/5 space-y-2">
                          {loadingLeadId === lead.id ? (
                            <div className="text-center py-4">
                              <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
                            </div>
                          ) : chatHistory.length > 0 ? (
                            chatHistory.map((msg) => (
                              <div
                                key={msg.id}
                                className={`p-2 rounded text-sm ${
                                  msg.role === 'user'
                                    ? 'bg-blue-500/10 text-blue-100 ml-4'
                                    : 'bg-green-500/10 text-green-100 mr-4'
                                }`}
                                data-testid={`chat-message-${msg.id}`}
                              >
                                <span className="text-xs text-muted-foreground block mb-1">
                                  {msg.role === 'user' ? 'Visitor' : 'AI Assistant'}
                                </span>
                                {msg.content}
                              </div>
                            ))
                          ) : (
                            <p className="text-sm text-muted-foreground text-center py-2">No chat messages found</p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No chat leads yet</p>
                <p className="text-sm">Leads from the chat widget will appear here</p>
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>

      <Dialog open={showSubscribersModal} onOpenChange={setShowSubscribersModal}>
        <DialogContent className="max-w-2xl max-h-[80vh] bg-background border-white/10">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-white flex items-center gap-2">
              <Mail className="w-5 h-5 text-blue-500" />
              Email Subscribers
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="h-[60vh] pr-4">
            {recentSubscribers && recentSubscribers.length > 0 ? (
              <div className="space-y-2">
                {recentSubscribers.map((sub) => (
                  <div 
                    key={sub.id} 
                    className="glass-panel rounded-lg p-4 border border-white/5 flex items-center justify-between"
                    data-testid={`subscriber-${sub.id}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center">
                        <Mail className="w-4 h-4 text-blue-500" />
                      </div>
                      <span className="text-white">{sub.email}</span>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {format(new Date(sub.subscribedAt), 'MMM d, yyyy')}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <Mail className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No subscribers yet</p>
                <p className="text-sm">Email signups will appear here</p>
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>

      <Dialog open={showContactsModal} onOpenChange={setShowContactsModal}>
        <DialogContent className="max-w-4xl max-h-[80vh] bg-background border-white/10">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-white flex items-center gap-2">
              <Contact className="w-5 h-5 text-cyan-500" />
              Contact Submissions
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="h-[60vh] pr-4">
            {recentContacts && recentContacts.length > 0 ? (
              <div className="space-y-4">
                {recentContacts.map((contact) => (
                  <div 
                    key={contact.id} 
                    className="glass-panel rounded-lg p-4 border border-white/5"
                    data-testid={`contact-${contact.id}`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <span className="text-white font-medium">{contact.name}</span>
                        {contact.company && (
                          <span className="text-sm text-muted-foreground ml-2">({contact.company})</span>
                        )}
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {format(new Date(contact.createdAt), 'MMM d, yyyy h:mm a')}
                      </span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-cyan-500" />
                        <span className="text-sm text-white">{contact.email}</span>
                      </div>
                      <div className="pt-2 border-t border-white/5">
                        <p className="text-xs text-muted-foreground mb-1">Message</p>
                        <p className="text-sm text-white/80">{contact.message}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <Contact className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No contact submissions yet</p>
                <p className="text-sm">Contact form submissions will appear here</p>
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>

      <Dialog open={showGraderModal} onOpenChange={setShowGraderModal}>
        <DialogContent className="w-[95vw] max-w-4xl max-h-[85vh] bg-background border-white/10">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
              <Globe className="w-5 h-5 text-orange-500" />
              Website Grader Leads
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="h-[65vh] pr-2 sm:pr-4">
            {graderLeads && graderLeads.length > 0 ? (
              <div className="space-y-3 sm:space-y-4">
                {graderLeads.map((grade) => (
                  <div 
                    key={grade.id} 
                    className="glass-panel rounded-lg p-3 sm:p-4 border border-white/5"
                    data-testid={`grader-${grade.id}`}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div className={`text-2xl font-bold flex-shrink-0 ${
                        grade.overallScore >= 90 ? 'text-green-400' :
                        grade.overallScore >= 80 ? 'text-cyan-400' :
                        grade.overallScore >= 70 ? 'text-yellow-400' :
                        grade.overallScore >= 60 ? 'text-orange-400' :
                        'text-red-400'
                      }`}>
                        {grade.overallScore}
                      </div>
                      <div className="flex-1 min-w-0">
                        <a 
                          href={grade.shareToken ? `${window.location.origin}/report/${grade.shareToken}` : grade.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-white font-medium hover:text-primary transition-colors truncate text-sm sm:text-base flex items-center gap-1"
                        >
                          {grade.domain || grade.url}
                          <ExternalLink className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                        </a>
                        {grade.companyName && (
                          <p className="text-sm text-orange-400 truncate">{grade.companyName}</p>
                        )}
                      </div>
                    </div>
                    {grade.companyDescription && (
                      <p className="text-xs text-muted-foreground mb-2 line-clamp-2">{grade.companyDescription}</p>
                    )}
                    <div className="flex flex-wrap gap-1.5 text-xs mb-2">
                      <span className="px-1.5 py-0.5 rounded bg-white/10 text-muted-foreground">
                        SEO: {grade.seoScore}
                      </span>
                      <span className="px-1.5 py-0.5 rounded bg-white/10 text-muted-foreground">
                        Sec: {grade.securityScore}
                      </span>
                      <span className="px-1.5 py-0.5 rounded bg-white/10 text-muted-foreground">
                        Perf: {grade.performanceScore}
                      </span>
                      <span className="px-1.5 py-0.5 rounded bg-white/10 text-muted-foreground">
                        Keys: {grade.keywordsScore}
                      </span>
                      <span className="px-1.5 py-0.5 rounded bg-white/10 text-muted-foreground">
                        A11y: {grade.accessibilityScore}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs text-muted-foreground mb-2">
                      <span>{format(new Date(grade.createdAt), 'MMM d, yyyy h:mm a')}</span>
                      {grade.ipAddress && <span>IP: {grade.ipAddress}</span>}
                    </div>
                    {grade.shareToken && (
                      <div className="flex flex-wrap items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 text-xs gap-1"
                          onClick={() => {
                            const shareUrl = `${window.location.origin}/report/${grade.shareToken}`;
                            navigator.clipboard.writeText(shareUrl);
                            toast({ title: "Link copied!", description: "Share link copied to clipboard" });
                          }}
                          data-testid={`copy-link-${grade.id}`}
                        >
                          <Copy className="w-3 h-3" />
                          Copy Link
                        </Button>
                        {grade.qrCodeData && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 text-xs gap-1"
                            onClick={() => {
                              navigator.clipboard.writeText(grade.qrCodeData!);
                              toast({ title: "QR copied!", description: "QR code data copied to clipboard" });
                            }}
                            data-testid={`copy-qr-${grade.id}`}
                          >
                            <QrCode className="w-3 h-3" />
                            Copy QR
                          </Button>
                        )}
                        <div className="flex items-center gap-3 ml-2 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1" title="Views">
                            <Eye className="w-3 h-3" />
                            {grade.viewCount || 0}
                          </span>
                          <span className="flex items-center gap-1" title="Downloads">
                            <Download className="w-3 h-3" />
                            {grade.downloadCount || 0}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <Globe className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No website grader submissions yet</p>
                <p className="text-sm">Grader scans will appear here</p>
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>

      <GuidedTour
        tourId="dashboard"
        steps={[
          {
            id: "welcome",
            target: "[data-testid='text-user-name']",
            title: "Welcome to Your Dashboard",
            content: "This is your personal portal where you can access all your TriFused tools and services.",
            placement: "bottom"
          },
          {
            id: "my-websites",
            target: "[data-testid='card-stat-my-websites']",
            title: "My Websites",
            content: "Save and manage your websites here. Track scan history and run new scans anytime.",
            placement: "bottom"
          },
          {
            id: "website-grader",
            target: "[data-testid='card-stat-website-grader']",
            title: "Website Grader",
            content: "Scan any website for SEO, security, performance, and compliance issues with our AI-powered grader.",
            placement: "bottom"
          },
          {
            id: "integrations",
            target: "[data-testid='button-integrations']",
            title: "Integrations",
            content: "Connect with third-party services like Google Calendar and more to enhance your workflow.",
            placement: "bottom"
          }
        ]}
        onComplete={() => console.log("Dashboard tour completed")}
      />
      <HelpButton />
    </div>
  );
}
