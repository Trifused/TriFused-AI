import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { 
  LogOut, 
  Users,
  Shield,
  Crown,
  UserCheck,
  UserX,
  ChevronLeft,
  HardDrive,
  MessageSquare,
  AlertTriangle,
  Mail,
  Phone,
  Search,
  Eye,
  X,
  ChevronDown,
  ChevronRight,
  Video,
  Music,
  Clock,
  CheckCircle2,
  XCircle,
  Play,
  BarChart3,
  Globe,
  Monitor,
  Smartphone,
  Tablet,
  ExternalLink,
  Settings,
  Sparkles,
  Zap,
  Plus,
  Check,
  Trash2,
  CreditCard,
  DollarSign,
  RefreshCw,
  Receipt
} from "lucide-react";
import { FEATURE_FLAGS, type FeatureFlag, type FeatureStatus, type FeatureCategory } from "@shared/feature-flags";
import { FeatureBadge } from "@/components/ui/feature-badge";
import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";

interface User {
  id: string;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  profileImageUrl: string | null;
  role: string;
  ftpAccess: number;
  createdAt: string;
  updatedAt: string;
}

interface ChatLead {
  id: string;
  sessionId: string;
  name: string;
  contactMethod: string;
  contactValue: string;
  inquiry: string;
  createdAt: string;
  messageCount: number;
  isSpam: boolean;
  reasons: string[];
}

interface ChatSession {
  sessionId: string;
  messageCount: number;
  firstMessageAt: string;
  lastMessageAt: string;
  hasLead: boolean;
  isSpam: boolean;
  reasons: string[];
}

interface ChatMessage {
  id: string;
  sessionId: string;
  role: string;
  content: string;
  createdAt: string;
}

interface PendingMedia {
  id: string;
  title: string;
  description: string | null;
  type: "video" | "audio";
  url: string;
  thumbnailUrl: string | null;
  duration: number | null;
  fileSize: number | null;
  status: "private" | "pending" | "public";
  uploadedBy: string;
  createdAt: string;
  updatedAt: string;
}

interface AnalyticsOverview {
  activeUsers: number;
  sessions: number;
  pageViews: number;
  avgSessionDuration: number;
  bounceRate: number;
}

interface AnalyticsData {
  overview: AnalyticsOverview;
  byCountry: Array<{ country: string; users: number }>;
  byDevice: Array<{ device: string; users: number }>;
  byPage: Array<{ page: string; views: number }>;
  bySource: Array<{ source: string; users: number }>;
}

interface AnalyticsResponse {
  connected: boolean;
  data: AnalyticsData | null;
}

interface WebsiteGrade {
  id: string;
  url: string;
  email: string | null;
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
  userAgent: string | null;
  createdAt: string;
}

interface Order {
  session_id: string;
  customer: string | null;
  customer_email: string | null;
  payment_status: string | null;
  session_status: string | null;
  amount_total: number | null;
  currency: string | null;
  mode: string | null;
  metadata: any;
  created: number | null;
  customer_name: string | null;
  payment_intent_id: string | null;
  charge_id: string | null;
  receipt_url: string | null;
  refunded: boolean | null;
}

interface Subscription {
  subscription_id: string;
  customer: string | null;
  status: string | null;
  current_period_start: number | null;
  current_period_end: number | null;
  cancel_at_period_end: boolean | null;
  canceled_at: number | null;
  created: number | null;
  customer_email: string | null;
  customer_name: string | null;
  product_name: string | null;
  unit_amount: number | null;
  currency: string | null;
  recurring: any;
}

interface CSStats {
  active_subscriptions: number;
  total_orders: number;
  total_customers: number;
  total_revenue: number;
}

export default function Admin() {
  const [, setLocation] = useLocation();
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("users");
  const [chatSubTab, setChatSubTab] = useState("leads");
  const [csSubTab, setCsSubTab] = useState("orders");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSession, setSelectedSession] = useState<string | null>(null);
  const [expandedSessions, setExpandedSessions] = useState<Set<string>>(new Set());

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tab = params.get("tab");
    if (tab && ["users", "chat", "media", "analytics", "grader", "features", "commerce", "customers"].includes(tab)) {
      setActiveTab(tab);
    }
  }, []);

  const { data: users, isLoading: usersLoading, error } = useQuery<User[]>({
    queryKey: ['/api/admin/users'],
    enabled: isAuthenticated && user?.role === 'superuser',
  });

  const { data: leads, isLoading: leadsLoading } = useQuery<ChatLead[]>({
    queryKey: ['/api/admin/chat/leads'],
    queryFn: async () => {
      const res = await fetch('/api/admin/chat/leads', {
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to fetch leads');
      return res.json();
    },
    enabled: isAuthenticated && user?.role === 'superuser' && activeTab === 'chat',
  });

  const { data: sessions, isLoading: sessionsLoading } = useQuery<ChatSession[]>({
    queryKey: ['/api/admin/chat/sessions'],
    queryFn: async () => {
      const res = await fetch('/api/admin/chat/sessions', {
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to fetch sessions');
      return res.json();
    },
    enabled: isAuthenticated && user?.role === 'superuser' && activeTab === 'chat',
  });

  const { data: sessionMessages } = useQuery<ChatMessage[]>({
    queryKey: ['/api/admin/chat/sessions', selectedSession, 'messages'],
    queryFn: async () => {
      const res = await fetch(`/api/admin/chat/sessions/${selectedSession}/messages`, {
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to fetch messages');
      return res.json();
    },
    enabled: !!selectedSession,
  });

  const { data: pendingMedia = [], isLoading: pendingMediaLoading } = useQuery<PendingMedia[]>({
    queryKey: ['/api/admin/media/pending'],
    queryFn: async () => {
      const res = await fetch('/api/admin/media/pending', {
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to fetch pending media');
      return res.json();
    },
    enabled: isAuthenticated && user?.role === 'superuser' && activeTab === 'media',
  });

  const { data: analyticsResponse, isLoading: analyticsLoading } = useQuery<AnalyticsResponse>({
    queryKey: ['/api/admin/analytics'],
    queryFn: async () => {
      const res = await fetch('/api/admin/analytics', {
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to fetch analytics');
      return res.json();
    },
    enabled: isAuthenticated && user?.role === 'superuser' && activeTab === 'analytics',
  });

  const analyticsData = analyticsResponse?.data;

  interface DiagnosticScan {
    id: string;
    platform: string;
    userAgent: string;
    screenResolution: string;
    isSecure: number;
    browserCores: number;
    scannedAt: string;
  }

  const { data: diagnostics = [], isLoading: diagnosticsLoading } = useQuery<DiagnosticScan[]>({
    queryKey: ['/api/admin/diagnostics'],
    queryFn: async () => {
      const res = await fetch('/api/admin/diagnostics', {
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to fetch diagnostics');
      return res.json();
    },
    enabled: isAuthenticated && user?.role === 'superuser' && activeTab === 'analytics',
  });

  const { data: graderLeads = [], isLoading: graderLoading } = useQuery<WebsiteGrade[]>({
    queryKey: ['/api/admin/grades'],
    queryFn: async () => {
      const res = await fetch('/api/admin/grades', {
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to fetch grader leads');
      return res.json();
    },
    enabled: isAuthenticated && user?.role === 'superuser' && activeTab === 'grader',
  });

  const { data: csStats } = useQuery<CSStats>({
    queryKey: ['/api/admin/cs/stats'],
    queryFn: async () => {
      const res = await fetch('/api/admin/cs/stats', { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to fetch CS stats');
      return res.json();
    },
    enabled: isAuthenticated && user?.role === 'superuser' && activeTab === 'customers',
  });

  const { data: ordersData, isLoading: ordersLoading } = useQuery<{ data: Order[] }>({
    queryKey: ['/api/admin/cs/orders'],
    queryFn: async () => {
      const res = await fetch('/api/admin/cs/orders', { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to fetch orders');
      return res.json();
    },
    enabled: isAuthenticated && user?.role === 'superuser' && activeTab === 'customers',
  });

  const { data: subscriptionsData, isLoading: subsLoading } = useQuery<{ data: Subscription[] }>({
    queryKey: ['/api/admin/cs/subscriptions'],
    queryFn: async () => {
      const res = await fetch('/api/admin/cs/subscriptions', { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to fetch subscriptions');
      return res.json();
    },
    enabled: isAuthenticated && user?.role === 'superuser' && activeTab === 'customers',
  });

  const internalStats = {
    totalVisitors: diagnostics.length,
    byPlatform: diagnostics.reduce((acc, d) => {
      const platform = d.platform.includes('Win') ? 'Windows' : 
                       d.platform.includes('iPhone') ? 'iOS' :
                       d.platform.includes('Mac') ? 'macOS' :
                       d.platform.includes('Android') ? 'Android' :
                       d.platform.includes('Linux') ? 'Linux' : 'Other';
      acc[platform] = (acc[platform] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
    byResolution: diagnostics.reduce((acc, d) => {
      acc[d.screenResolution] = (acc[d.screenResolution] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
    byBrowser: diagnostics.reduce((acc, d) => {
      const ua = d.userAgent.toLowerCase();
      const browser = ua.includes('chrome') && !ua.includes('edg') ? 'Chrome' :
                      ua.includes('safari') && !ua.includes('chrome') ? 'Safari' :
                      ua.includes('firefox') ? 'Firefox' :
                      ua.includes('edg') ? 'Edge' : 'Other';
      acc[browser] = (acc[browser] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
    secureConnections: diagnostics.filter(d => d.isSecure === 1).length,
  };

  const approveMediaMutation = useMutation({
    mutationFn: async (mediaId: string) => {
      const res = await fetch(`/api/media/${mediaId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'public' }),
        credentials: 'include',
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Failed to approve media');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/media/pending'] });
      toast({
        title: "Media Approved",
        description: "The media is now publicly visible.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const rejectMediaMutation = useMutation({
    mutationFn: async (mediaId: string) => {
      const res = await fetch(`/api/media/${mediaId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'private' }),
        credentials: 'include',
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Failed to reject media');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/media/pending'] });
      toast({
        title: "Media Rejected",
        description: "The media has been set back to private.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateRoleMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: string }) => {
      const res = await fetch(`/api/admin/users/${userId}/role`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role }),
        credentials: 'include',
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Failed to update role');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      toast({
        title: "Role Updated",
        description: "User role has been updated successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateFtpAccessMutation = useMutation({
    mutationFn: async ({ userId, ftpAccess }: { userId: string; ftpAccess: number }) => {
      const res = await fetch(`/api/admin/users/${userId}/ftp-access`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ftpAccess }),
        credentials: 'include',
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Failed to update FTP access');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      toast({
        title: "FTP Access Updated",
        description: "User MFT access has been updated successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Session Required",
        description: "Please sign in to access the admin panel.",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
    }
  }, [isAuthenticated, isLoading, toast]);

  useEffect(() => {
    if (!isLoading && isAuthenticated && user?.role !== 'superuser') {
      toast({
        title: "Access Denied",
        description: "You need superuser privileges to access this page.",
        variant: "destructive",
      });
      setLocation("/portal/dashboard");
    }
  }, [isLoading, isAuthenticated, user, toast, setLocation]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || user?.role !== 'superuser') {
    return null;
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'superuser':
        return <Crown className="w-4 h-4 text-yellow-500" />;
      case 'validated':
        return <UserCheck className="w-4 h-4 text-green-500" />;
      default:
        return <UserX className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'superuser':
        return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      case 'validated':
        return 'bg-green-500/10 text-green-500 border-green-500/20';
      default:
        return 'bg-white/5 text-muted-foreground border-white/10';
    }
  };

  const filteredLeads = leads?.filter(lead => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      lead.name.toLowerCase().includes(query) ||
      lead.contactValue.toLowerCase().includes(query) ||
      lead.inquiry.toLowerCase().includes(query)
    );
  }) || [];

  const filteredSessions = sessions?.filter(session => {
    if (!searchQuery) return true;
    return session.sessionId.toLowerCase().includes(searchQuery.toLowerCase());
  }) || [];

  const toggleSessionExpanded = (sessionId: string) => {
    const newExpanded = new Set(expandedSessions);
    if (newExpanded.has(sessionId)) {
      newExpanded.delete(sessionId);
      if (selectedSession === sessionId) {
        setSelectedSession(null);
      }
    } else {
      newExpanded.add(sessionId);
      setSelectedSession(sessionId);
    }
    setExpandedSessions(newExpanded);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-background/80 border-b border-white/5">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setLocation("/")}
                className="text-xl font-bold font-heading text-white"
              >
                TriFused
              </button>
              <span className="text-muted-foreground">/</span>
              <span className="text-muted-foreground flex items-center gap-2">
                <Shield className="w-4 h-4" />
                Admin
              </span>
            </div>
            
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setLocation("/portal/dashboard")}
                className="text-muted-foreground hover:text-white"
              >
                <ChevronLeft className="w-4 h-4 mr-2" />
                Dashboard
              </Button>
              <div className="flex items-center gap-3 pl-4 border-l border-white/10">
                {user?.profileImageUrl && (
                  <img 
                    src={user.profileImageUrl} 
                    alt="Profile" 
                    className="w-8 h-8 rounded-full object-cover border border-yellow-500/30"
                  />
                )}
                <div className="text-sm">
                  <div className="text-white font-medium flex items-center gap-2">
                    {user?.firstName || user?.email?.split('@')[0] || 'Admin'}
                    <Crown className="w-3 h-3 text-yellow-500" />
                  </div>
                  <div className="text-yellow-500/80 text-xs">Superuser</div>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => window.location.href = "/api/logout"}
                  data-testid="button-logout"
                >
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main id="main-content" className="container mx-auto px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold font-heading text-white mb-2 flex items-center gap-3">
            <Shield className="w-8 h-8 text-primary" />
            Admin Panel
          </h1>
          <p className="text-muted-foreground">
            Manage users, chat leads, and view conversation analytics.
          </p>
        </motion.div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-white/5 border border-white/10">
            <TabsTrigger value="users" className="data-[state=active]:bg-primary" data-testid="tab-users">
              <Users className="w-4 h-4 mr-2" />
              Users
            </TabsTrigger>
            <TabsTrigger value="chat" className="data-[state=active]:bg-primary" data-testid="tab-chat">
              <MessageSquare className="w-4 h-4 mr-2" />
              Chat Intelligence
            </TabsTrigger>
            <TabsTrigger value="media" className="data-[state=active]:bg-primary" data-testid="tab-media">
              <Video className="w-4 h-4 mr-2" />
              Media ({pendingMedia.length})
            </TabsTrigger>
            <TabsTrigger value="analytics" className="data-[state=active]:bg-primary" data-testid="tab-analytics">
              <BarChart3 className="w-4 h-4 mr-2" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="grader" className="data-[state=active]:bg-primary" data-testid="tab-grader">
              <Globe className="w-4 h-4 mr-2" />
              Grader Leads
            </TabsTrigger>
            <TabsTrigger value="features" className="data-[state=active]:bg-primary" data-testid="tab-features">
              <Settings className="w-4 h-4 mr-2" />
              Features
            </TabsTrigger>
            <TabsTrigger value="commerce" className="data-[state=active]:bg-primary" data-testid="tab-commerce">
              <Crown className="w-4 h-4 mr-2" />
              Commerce
            </TabsTrigger>
            <TabsTrigger value="customers" className="data-[state=active]:bg-primary" data-testid="tab-customers">
              <CreditCard className="w-4 h-4 mr-2" />
              Customers
            </TabsTrigger>
          </TabsList>

          <TabsContent value="users">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="glass-panel rounded-2xl overflow-hidden"
            >
              <div className="p-4 border-b border-white/5 bg-white/5">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-white">All Users</h2>
                  <div className="text-sm text-muted-foreground">
                    {users?.length || 0} total users
                  </div>
                </div>
              </div>

              {usersLoading ? (
                <div className="p-12 text-center">
                  <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                  <p className="text-muted-foreground">Loading users...</p>
                </div>
              ) : error ? (
                <div className="p-12 text-center">
                  <p className="text-red-400">Failed to load users</p>
                </div>
              ) : (
                <div className="divide-y divide-white/5">
                  {users?.map((u, index) => (
                    <motion.div
                      key={u.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: index * 0.05 }}
                      className="p-4 hover:bg-white/5 transition-colors"
                      data-testid={`row-user-${u.id}`}
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-4 flex-1 min-w-0">
                          {u.profileImageUrl ? (
                            <img 
                              src={u.profileImageUrl} 
                              alt="" 
                              className="w-10 h-10 rounded-full object-cover border border-white/10"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center">
                              <Users className="w-5 h-5 text-muted-foreground" />
                            </div>
                          )}
                          <div className="min-w-0 flex-1">
                            <div className="text-white font-medium truncate">
                              {u.firstName && u.lastName 
                                ? `${u.firstName} ${u.lastName}` 
                                : u.firstName || u.email?.split('@')[0] || 'Unknown'}
                            </div>
                            <div className="text-sm text-muted-foreground truncate">
                              {u.email || 'No email'}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
                          <div className={`px-3 py-1 rounded-full text-xs font-medium border flex items-center gap-2 ${getRoleBadge(u.role)}`}>
                            {getRoleIcon(u.role)}
                            {u.role.charAt(0).toUpperCase() + u.role.slice(1)}
                          </div>

                          <Select
                            value={u.role}
                            onValueChange={(value) => updateRoleMutation.mutate({ userId: u.id, role: value })}
                            disabled={u.id === user?.id || updateRoleMutation.isPending}
                          >
                            <SelectTrigger className="w-36 bg-white/5 border-white/10" data-testid={`select-role-${u.id}`}>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="guest">
                                <span className="flex items-center gap-2">
                                  <UserX className="w-4 h-4" /> Guest
                                </span>
                              </SelectItem>
                              <SelectItem value="validated">
                                <span className="flex items-center gap-2">
                                  <UserCheck className="w-4 h-4" /> Validated
                                </span>
                              </SelectItem>
                              <SelectItem value="superuser">
                                <span className="flex items-center gap-2">
                                  <Crown className="w-4 h-4" /> Superuser
                                </span>
                              </SelectItem>
                            </SelectContent>
                          </Select>

                          <div className="flex items-center gap-2 pl-4 border-l border-white/10">
                            <HardDrive className={`w-4 h-4 ${u.ftpAccess === 1 ? 'text-primary' : 'text-muted-foreground'}`} />
                            <Switch
                              checked={u.ftpAccess === 1}
                              onCheckedChange={(checked) => 
                                updateFtpAccessMutation.mutate({ userId: u.id, ftpAccess: checked ? 1 : 0 })
                              }
                              disabled={updateFtpAccessMutation.isPending}
                              data-testid={`switch-ftp-${u.id}`}
                            />
                            <span className="text-xs text-muted-foreground">MFT</span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}

                  {users?.length === 0 && (
                    <div className="p-12 text-center">
                      <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">No users found</p>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          </TabsContent>

          <TabsContent value="chat">
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search leads or sessions..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-white/5 border-white/10"
                    data-testid="input-search-chat"
                  />
                </div>
                <Tabs value={chatSubTab} onValueChange={setChatSubTab}>
                  <TabsList className="bg-white/5 border border-white/10">
                    <TabsTrigger value="leads" className="data-[state=active]:bg-primary" data-testid="subtab-leads">
                      Leads ({leads?.filter(l => !l.isSpam).length || 0})
                    </TabsTrigger>
                    <TabsTrigger value="sessions" className="data-[state=active]:bg-primary" data-testid="subtab-sessions">
                      Sessions ({sessions?.length || 0})
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>

              {chatSubTab === "leads" && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="glass-panel rounded-2xl overflow-hidden"
                >
                  <div className="p-4 border-b border-white/5 bg-white/5">
                    <div className="flex items-center justify-between">
                      <h2 className="text-lg font-semibold text-white">Chat Leads</h2>
                      <div className="text-sm text-muted-foreground">
                        {filteredLeads.length} leads found
                      </div>
                    </div>
                  </div>

                  {leadsLoading ? (
                    <div className="p-12 text-center">
                      <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                      <p className="text-muted-foreground">Loading leads...</p>
                    </div>
                  ) : filteredLeads.length === 0 ? (
                    <div className="p-12 text-center">
                      <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">No leads captured yet</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-white/5">
                      {filteredLeads.map((lead, index) => (
                        <motion.div
                          key={lead.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: index * 0.03 }}
                          className="p-4 hover:bg-white/5 transition-colors"
                          data-testid={`row-lead-${lead.id}`}
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-3 mb-2">
                                <span className="text-white font-medium">{lead.name}</span>
                                {lead.isSpam && (
                                  <span className="px-2 py-0.5 rounded-full text-xs bg-orange-500/10 text-orange-400 border border-orange-500/20 flex items-center gap-1">
                                    <AlertTriangle className="w-3 h-3" />
                                    Spam
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                                {lead.contactMethod === 'email' ? (
                                  <span className="flex items-center gap-1">
                                    <Mail className="w-4 h-4" />
                                    {lead.contactValue}
                                  </span>
                                ) : (
                                  <span className="flex items-center gap-1">
                                    <Phone className="w-4 h-4" />
                                    {lead.contactValue}
                                  </span>
                                )}
                                <span>{format(new Date(lead.createdAt), 'MMM d, yyyy h:mm a')}</span>
                              </div>
                              <p className="text-sm text-white/70">{lead.inquiry}</p>
                              {lead.isSpam && lead.reasons.length > 0 && (
                                <p className="text-xs text-orange-400/70 mt-1">
                                  Reasons: {lead.reasons.join(', ')}
                                </p>
                              )}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {lead.messageCount} messages
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}

              {chatSubTab === "sessions" && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="glass-panel rounded-2xl overflow-hidden"
                >
                  <div className="p-4 border-b border-white/5 bg-white/5">
                    <div className="flex items-center justify-between">
                      <h2 className="text-lg font-semibold text-white">Chat Sessions</h2>
                      <div className="text-sm text-muted-foreground">
                        {filteredSessions.length} sessions
                      </div>
                    </div>
                  </div>

                  {sessionsLoading ? (
                    <div className="p-12 text-center">
                      <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                      <p className="text-muted-foreground">Loading sessions...</p>
                    </div>
                  ) : filteredSessions.length === 0 ? (
                    <div className="p-12 text-center">
                      <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">No chat sessions yet</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-white/5">
                      {filteredSessions.map((session, index) => (
                        <div key={session.sessionId} data-testid={`row-session-${session.sessionId}`}>
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: index * 0.03 }}
                            className="p-4 hover:bg-white/5 transition-colors cursor-pointer"
                            onClick={() => toggleSessionExpanded(session.sessionId)}
                          >
                            <div className="flex items-center justify-between gap-4">
                              <div className="flex items-center gap-3">
                                {expandedSessions.has(session.sessionId) ? (
                                  <ChevronDown className="w-4 h-4 text-muted-foreground" />
                                ) : (
                                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                                )}
                                <div>
                                  <div className="flex items-center gap-2">
                                    <span className="text-white font-mono text-sm">
                                      {session.sessionId.slice(0, 8)}...
                                    </span>
                                    {session.hasLead && (
                                      <span className="px-2 py-0.5 rounded-full text-xs bg-green-500/10 text-green-400 border border-green-500/20">
                                        Has Lead
                                      </span>
                                    )}
                                    {session.isSpam && (
                                      <span className="px-2 py-0.5 rounded-full text-xs bg-orange-500/10 text-orange-400 border border-orange-500/20 flex items-center gap-1">
                                        <AlertTriangle className="w-3 h-3" />
                                        Spam
                                      </span>
                                    )}
                                  </div>
                                  <div className="text-xs text-muted-foreground mt-1">
                                    {format(new Date(session.firstMessageAt), 'MMM d, yyyy h:mm a')}
                                    {session.isSpam && session.reasons.length > 0 && (
                                      <span className="text-orange-400/70 ml-2">
                                        ({session.reasons.join(', ')})
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {session.messageCount} messages
                              </div>
                            </div>
                          </motion.div>

                          {expandedSessions.has(session.sessionId) && selectedSession === session.sessionId && (
                            <div className="bg-white/5 border-t border-white/5 p-4">
                              {sessionMessages ? (
                                <div className="space-y-3 max-h-96 overflow-y-auto">
                                  {sessionMessages.map((msg) => (
                                    <div
                                      key={msg.id}
                                      className={`p-3 rounded-lg ${
                                        msg.role === 'user'
                                          ? 'bg-primary/10 ml-8'
                                          : 'bg-white/5 mr-8'
                                      }`}
                                    >
                                      <div className="flex items-center justify-between mb-1">
                                        <span className={`text-xs font-medium ${
                                          msg.role === 'user' ? 'text-primary' : 'text-muted-foreground'
                                        }`}>
                                          {msg.role === 'user' ? 'User' : 'TriFused AI'}
                                        </span>
                                        <span className="text-xs text-muted-foreground">
                                          {format(new Date(msg.createdAt), 'h:mm a')}
                                        </span>
                                      </div>
                                      <p className="text-sm text-white/80 whitespace-pre-wrap">
                                        {msg.content}
                                      </p>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <div className="text-center py-4">
                                  <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="media">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-panel rounded-2xl overflow-hidden"
            >
              <div className="p-4 border-b border-white/5 bg-white/5">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                    <Clock className="w-5 h-5 text-yellow-500" />
                    Pending Media Approval
                  </h2>
                  <div className="text-sm text-muted-foreground">
                    {pendingMedia.length} items awaiting review
                  </div>
                </div>
              </div>

              {pendingMediaLoading ? (
                <div className="p-12 text-center">
                  <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                  <p className="text-muted-foreground">Loading pending media...</p>
                </div>
              ) : pendingMedia.length === 0 ? (
                <div className="p-12 text-center">
                  <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-white mb-2">All caught up!</h3>
                  <p className="text-muted-foreground">No media waiting for approval.</p>
                </div>
              ) : (
                <div className="divide-y divide-white/5">
                  {pendingMedia.map((item, index) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: index * 0.05 }}
                      className="p-4 hover:bg-white/5 transition-colors"
                      data-testid={`row-media-${item.id}`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-4 flex-1 min-w-0">
                          <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                            item.type === 'video' ? 'bg-blue-500/10' : 'bg-purple-500/10'
                          }`}>
                            {item.type === 'video' ? (
                              <Video className="w-6 h-6 text-blue-400" />
                            ) : (
                              <Music className="w-6 h-6 text-purple-400" />
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="text-white font-medium truncate">{item.title}</div>
                            {item.description && (
                              <div className="text-sm text-muted-foreground truncate mb-1">
                                {item.description}
                              </div>
                            )}
                            <div className="text-xs text-muted-foreground">
                              Uploaded {format(new Date(item.createdAt), 'MMM d, yyyy h:mm a')}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => approveMediaMutation.mutate(item.id)}
                            disabled={approveMediaMutation.isPending}
                            className="text-green-500 border-green-500/30 hover:bg-green-500/10"
                            data-testid={`button-approve-${item.id}`}
                          >
                            <CheckCircle2 className="w-4 h-4 mr-1" />
                            Approve
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => rejectMediaMutation.mutate(item.id)}
                            disabled={rejectMediaMutation.isPending}
                            className="text-red-500 border-red-500/30 hover:bg-red-500/10"
                            data-testid={`button-reject-${item.id}`}
                          >
                            <XCircle className="w-4 h-4 mr-1" />
                            Reject
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          </TabsContent>

          <TabsContent value="analytics">
            <div className="space-y-6">
              {(analyticsLoading || diagnosticsLoading) ? (
                <div className="p-12 text-center glass-panel rounded-2xl">
                  <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                  <p className="text-muted-foreground">Loading analytics data...</p>
                </div>
              ) : (
                <>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                      <BarChart3 className="w-5 h-5 text-primary" />
                      Internal Site Stats
                    </h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                      <div className="glass-panel rounded-xl p-4">
                        <div className="flex items-center gap-2 text-muted-foreground text-sm mb-2">
                          <Users className="w-4 h-4" />
                          Total Scans
                        </div>
                        <div className="text-2xl font-bold text-white">{internalStats.totalVisitors}</div>
                      </div>
                      <div className="glass-panel rounded-xl p-4">
                        <div className="flex items-center gap-2 text-muted-foreground text-sm mb-2">
                          <Shield className="w-4 h-4" />
                          Secure Connections
                        </div>
                        <div className="text-2xl font-bold text-green-400">{internalStats.secureConnections}</div>
                      </div>
                      <div className="glass-panel rounded-xl p-4">
                        <div className="flex items-center gap-2 text-muted-foreground text-sm mb-2">
                          <Monitor className="w-4 h-4" />
                          Platforms
                        </div>
                        <div className="text-2xl font-bold text-white">{Object.keys(internalStats.byPlatform).length}</div>
                      </div>
                      <div className="glass-panel rounded-xl p-4">
                        <div className="flex items-center gap-2 text-muted-foreground text-sm mb-2">
                          <Globe className="w-4 h-4" />
                          Screen Sizes
                        </div>
                        <div className="text-2xl font-bold text-white">{Object.keys(internalStats.byResolution).length}</div>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6">
                      <div className="glass-panel rounded-2xl overflow-hidden">
                        <div className="p-4 border-b border-white/5 bg-white/5">
                          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                            <Monitor className="w-5 h-5 text-primary" />
                            By Platform
                          </h3>
                        </div>
                        <div className="divide-y divide-white/5">
                          {Object.entries(internalStats.byPlatform).length === 0 ? (
                            <div className="p-8 text-center text-muted-foreground">No data yet</div>
                          ) : (
                            Object.entries(internalStats.byPlatform)
                              .sort((a, b) => b[1] - a[1])
                              .map(([platform, count]) => (
                                <div key={platform} className="p-3 flex items-center justify-between hover:bg-white/5">
                                  <span className="text-white flex items-center gap-2">
                                    {platform === 'Windows' && <Monitor className="w-4 h-4" />}
                                    {platform === 'iOS' && <Smartphone className="w-4 h-4" />}
                                    {platform === 'macOS' && <Monitor className="w-4 h-4" />}
                                    {platform === 'Android' && <Smartphone className="w-4 h-4" />}
                                    {platform === 'Linux' && <Monitor className="w-4 h-4" />}
                                    {platform}
                                  </span>
                                  <span className="text-muted-foreground">{count}</span>
                                </div>
                              ))
                          )}
                        </div>
                      </div>

                      <div className="glass-panel rounded-2xl overflow-hidden">
                        <div className="p-4 border-b border-white/5 bg-white/5">
                          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                            <Globe className="w-5 h-5 text-primary" />
                            By Browser
                          </h3>
                        </div>
                        <div className="divide-y divide-white/5">
                          {Object.entries(internalStats.byBrowser).length === 0 ? (
                            <div className="p-8 text-center text-muted-foreground">No data yet</div>
                          ) : (
                            Object.entries(internalStats.byBrowser)
                              .sort((a, b) => b[1] - a[1])
                              .map(([browser, count]) => (
                                <div key={browser} className="p-3 flex items-center justify-between hover:bg-white/5">
                                  <span className="text-white">{browser}</span>
                                  <span className="text-muted-foreground">{count}</span>
                                </div>
                              ))
                          )}
                        </div>
                      </div>

                      <div className="glass-panel rounded-2xl overflow-hidden">
                        <div className="p-4 border-b border-white/5 bg-white/5">
                          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                            <Tablet className="w-5 h-5 text-primary" />
                            By Screen Size
                          </h3>
                        </div>
                        <div className="divide-y divide-white/5 max-h-48 overflow-y-auto">
                          {Object.entries(internalStats.byResolution).length === 0 ? (
                            <div className="p-8 text-center text-muted-foreground">No data yet</div>
                          ) : (
                            Object.entries(internalStats.byResolution)
                              .sort((a, b) => b[1] - a[1])
                              .map(([resolution, count]) => (
                                <div key={resolution} className="p-3 flex items-center justify-between hover:bg-white/5">
                                  <span className="text-white font-mono text-sm">{resolution}</span>
                                  <span className="text-muted-foreground">{count}</span>
                                </div>
                              ))
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>

                  {analyticsData && analyticsData.overview && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                    >
                      <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2 mt-8">
                        <BarChart3 className="w-5 h-5 text-green-400" />
                        Google Analytics (Last 30 Days)
                      </h2>
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
                        <div className="glass-panel rounded-xl p-4">
                          <div className="flex items-center gap-2 text-muted-foreground text-sm mb-2">
                            <Users className="w-4 h-4" />
                            Active Users
                          </div>
                          <div className="text-2xl font-bold text-white">{analyticsData.overview.activeUsers.toLocaleString()}</div>
                        </div>
                        <div className="glass-panel rounded-xl p-4">
                          <div className="flex items-center gap-2 text-muted-foreground text-sm mb-2">
                            <Eye className="w-4 h-4" />
                            Sessions
                          </div>
                          <div className="text-2xl font-bold text-white">{analyticsData.overview.sessions.toLocaleString()}</div>
                        </div>
                        <div className="glass-panel rounded-xl p-4">
                          <div className="flex items-center gap-2 text-muted-foreground text-sm mb-2">
                            <BarChart3 className="w-4 h-4" />
                            Page Views
                          </div>
                          <div className="text-2xl font-bold text-white">{analyticsData.overview.pageViews.toLocaleString()}</div>
                        </div>
                        <div className="glass-panel rounded-xl p-4">
                          <div className="flex items-center gap-2 text-muted-foreground text-sm mb-2">
                            <Clock className="w-4 h-4" />
                            Avg Duration
                          </div>
                          <div className="text-2xl font-bold text-white">
                            {Math.floor(analyticsData.overview.avgSessionDuration / 60)}m {Math.floor(analyticsData.overview.avgSessionDuration % 60)}s
                          </div>
                        </div>
                        <div className="glass-panel rounded-xl p-4">
                          <div className="flex items-center gap-2 text-muted-foreground text-sm mb-2">
                            <ExternalLink className="w-4 h-4" />
                            Bounce Rate
                          </div>
                          <div className="text-2xl font-bold text-white">{(analyticsData.overview.bounceRate * 100).toFixed(1)}%</div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {(!analyticsResponse?.connected || !analyticsData) && (
                    <div className="p-6 text-center glass-panel rounded-2xl border border-white/10 mt-4">
                      <p className="text-muted-foreground text-sm">
                        Google Analytics is not configured. Set up GA4_PROPERTY_ID and credentials to see additional metrics.
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>
          </TabsContent>

          <TabsContent value="grader">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="glass-panel rounded-2xl overflow-hidden"
            >
              <div className="p-4 border-b border-white/5 bg-white/5">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-white">Website Grader Leads</h2>
                  <div className="text-sm text-muted-foreground">
                    {graderLeads.length} total scans
                  </div>
                </div>
              </div>

              {graderLoading ? (
                <div className="p-12 text-center">
                  <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                  <p className="text-muted-foreground">Loading grader leads...</p>
                </div>
              ) : graderLeads.length === 0 ? (
                <div className="p-12 text-center">
                  <Globe className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                  <p className="text-muted-foreground">No website grader submissions yet</p>
                </div>
              ) : (
                <div className="divide-y divide-white/5">
                  {graderLeads.map((grade, index) => (
                    <motion.div
                      key={grade.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="p-4 hover:bg-white/5 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <a 
                              href={grade.url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-white font-medium hover:text-primary transition-colors truncate"
                            >
                              {grade.domain || grade.url}
                            </a>
                            <ExternalLink className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                          </div>
                          {grade.companyName && (
                            <p className="text-sm text-primary mb-1">{grade.companyName}</p>
                          )}
                          {grade.companyDescription && (
                            <p className="text-xs text-muted-foreground mb-2 line-clamp-2">{grade.companyDescription}</p>
                          )}
                          <div className="flex flex-wrap gap-2 text-xs">
                            <span className="px-2 py-0.5 rounded bg-white/10 text-muted-foreground">
                              SEO: {grade.seoScore}
                            </span>
                            <span className="px-2 py-0.5 rounded bg-white/10 text-muted-foreground">
                              Security: {grade.securityScore}
                            </span>
                            <span className="px-2 py-0.5 rounded bg-white/10 text-muted-foreground">
                              Perf: {grade.performanceScore}
                            </span>
                            <span className="px-2 py-0.5 rounded bg-white/10 text-muted-foreground">
                              Keywords: {grade.keywordsScore}
                            </span>
                            <span className="px-2 py-0.5 rounded bg-white/10 text-muted-foreground">
                              A11y: {grade.accessibilityScore}
                            </span>
                          </div>
                          <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                            <span>{format(new Date(grade.createdAt), 'MMM d, yyyy h:mm a')}</span>
                            {grade.ipAddress && <span>IP: {grade.ipAddress}</span>}
                          </div>
                        </div>
                        <div className="flex flex-col items-center gap-1 flex-shrink-0">
                          <div className={`text-3xl font-bold ${
                            grade.overallScore >= 90 ? 'text-green-400' :
                            grade.overallScore >= 80 ? 'text-cyan-400' :
                            grade.overallScore >= 70 ? 'text-yellow-400' :
                            grade.overallScore >= 60 ? 'text-orange-400' :
                            'text-red-400'
                          }`}>
                            {grade.overallScore}
                          </div>
                          <div className="text-xs text-muted-foreground">Score</div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          </TabsContent>

          <TabsContent value="features">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="space-y-6"
            >
              <div className="glass-panel rounded-2xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-primary" />
                      Feature Flags
                    </h2>
                    <p className="text-sm text-muted-foreground mt-1">
                      Control which features are available to users. Toggle features between free, paid, coming soon, or disabled.
                    </p>
                  </div>
                </div>

                {(['grader', 'reports', 'api', 'payments', 'portal'] as FeatureCategory[]).map((category) => {
                  const categoryFeatures = Object.entries(FEATURE_FLAGS).filter(([_, f]) => f.category === category);
                  if (categoryFeatures.length === 0) return null;
                  
                  const categoryLabels: Record<FeatureCategory, string> = {
                    grader: 'Website Grader',
                    reports: 'Reports',
                    api: 'API',
                    payments: 'Payments',
                    portal: 'Portal',
                  };

                  return (
                    <div key={category} className="mb-8">
                      <h3 className="text-sm font-semibold text-primary uppercase tracking-wider mb-4 flex items-center gap-2">
                        {category === 'grader' && <Globe className="w-4 h-4" />}
                        {category === 'api' && <Zap className="w-4 h-4" />}
                        {category === 'payments' && <Crown className="w-4 h-4" />}
                        {category === 'reports' && <BarChart3 className="w-4 h-4" />}
                        {category === 'portal' && <Users className="w-4 h-4" />}
                        {categoryLabels[category]}
                      </h3>
                      <div className="space-y-3">
                        {categoryFeatures.map(([key, feature]) => (
                          <div 
                            key={key}
                            className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10 hover:border-white/20 transition-colors"
                            data-testid={`feature-row-${feature.id}`}
                          >
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-3">
                                <span className="font-medium text-white">{feature.name}</span>
                                <FeatureBadge status={feature.status} tier={feature.tier} />
                                {feature.price && (
                                  <span className="text-xs text-cyan-400 font-mono">{feature.price}</span>
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground mt-1">{feature.description}</p>
                            </div>
                            <div className="flex items-center gap-3 ml-4">
                              <span className={`text-xs font-mono px-2 py-1 rounded ${
                                feature.status === 'free' ? 'bg-green-500/20 text-green-400' :
                                feature.status === 'paid' ? 'bg-purple-500/20 text-purple-400' :
                                feature.status === 'coming_soon' ? 'bg-amber-500/20 text-amber-400' :
                                'bg-red-500/20 text-red-400'
                              }`}>
                                {feature.status.replace('_', ' ').toUpperCase()}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}

                <div className="mt-8 p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                  <p className="text-sm text-amber-400">
                    <AlertTriangle className="w-4 h-4 inline mr-2" />
                    Feature flag controls are read-only. To enable features, update the <code className="px-1 py-0.5 bg-black/30 rounded">shared/feature-flags.ts</code> file and redeploy.
                  </p>
                </div>
              </div>
            </motion.div>
          </TabsContent>

          <TabsContent value="commerce">
            <CommerceTab />
          </TabsContent>

          <TabsContent value="customers">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-emerald-400" />
                    Customer Service
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Manage orders, subscriptions, and customer inquiries
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                  <div className="flex items-center gap-2 mb-2">
                    <Receipt className="w-4 h-4 text-blue-400" />
                    <span className="text-sm text-muted-foreground">Total Orders</span>
                  </div>
                  <p className="text-2xl font-bold text-white">{csStats?.total_orders || 0}</p>
                </div>
                <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                  <div className="flex items-center gap-2 mb-2">
                    <RefreshCw className="w-4 h-4 text-purple-400" />
                    <span className="text-sm text-muted-foreground">Active Subscriptions</span>
                  </div>
                  <p className="text-2xl font-bold text-white">{csStats?.active_subscriptions || 0}</p>
                </div>
                <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="w-4 h-4 text-cyan-400" />
                    <span className="text-sm text-muted-foreground">Customers</span>
                  </div>
                  <p className="text-2xl font-bold text-white">{csStats?.total_customers || 0}</p>
                </div>
                <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                  <div className="flex items-center gap-2 mb-2">
                    <DollarSign className="w-4 h-4 text-emerald-400" />
                    <span className="text-sm text-muted-foreground">Total Revenue</span>
                  </div>
                  <p className="text-2xl font-bold text-white">
                    ${((csStats?.total_revenue || 0) / 100).toFixed(2)}
                  </p>
                </div>
              </div>

              <Tabs value={csSubTab} onValueChange={setCsSubTab} className="space-y-4">
                <TabsList className="bg-white/5">
                  <TabsTrigger value="orders" className="data-[state=active]:bg-primary" data-testid="subtab-orders">
                    Orders
                  </TabsTrigger>
                  <TabsTrigger value="subscriptions" className="data-[state=active]:bg-primary" data-testid="subtab-subscriptions">
                    Subscriptions
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="orders">
                  {ordersLoading ? (
                    <div className="py-12 text-center">
                      <Clock className="w-8 h-8 animate-spin mx-auto text-primary mb-4" />
                      <p className="text-muted-foreground">Loading orders...</p>
                    </div>
                  ) : !ordersData?.data?.length ? (
                    <div className="py-12 text-center">
                      <Receipt className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                      <p className="text-white text-lg">No orders yet</p>
                      <p className="text-muted-foreground text-sm mt-2">
                        Orders will appear here after customers complete checkout
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {ordersData.data.map((order: Order) => (
                        <div
                          key={order.session_id}
                          className="p-4 bg-white/5 rounded-lg border border-white/10"
                          data-testid={`order-row-${order.session_id}`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3">
                                <span className="font-medium text-white">
                                  {order.customer_email || order.customer_name || 'Unknown Customer'}
                                </span>
                                <span className={`text-xs px-2 py-0.5 rounded ${
                                  order.payment_status === 'paid' ? 'bg-green-500/20 text-green-400' :
                                  order.payment_status === 'unpaid' ? 'bg-yellow-500/20 text-yellow-400' :
                                  'bg-gray-500/20 text-gray-400'
                                }`}>
                                  {order.payment_status || 'Unknown'}
                                </span>
                                {order.refunded && (
                                  <span className="text-xs px-2 py-0.5 rounded bg-red-500/20 text-red-400">
                                    Refunded
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                                <span>
                                  {order.amount_total ? `$${(order.amount_total / 100).toFixed(2)} ${(order.currency || 'usd').toUpperCase()}` : '-'}
                                </span>
                                <span>{order.mode === 'subscription' ? 'Subscription' : 'One-time'}</span>
                                <span>{order.created ? format(new Date(order.created * 1000), 'MMM d, yyyy h:mm a') : '-'}</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {order.receipt_url && (
                                <a
                                  href={order.receipt_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
                                >
                                  <ExternalLink className="w-3 h-3" />
                                  Receipt
                                </a>
                              )}
                              <span className="text-xs text-muted-foreground font-mono hidden lg:block">
                                {order.session_id.slice(0, 15)}...
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="subscriptions">
                  {subsLoading ? (
                    <div className="py-12 text-center">
                      <Clock className="w-8 h-8 animate-spin mx-auto text-primary mb-4" />
                      <p className="text-muted-foreground">Loading subscriptions...</p>
                    </div>
                  ) : !subscriptionsData?.data?.length ? (
                    <div className="py-12 text-center">
                      <RefreshCw className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                      <p className="text-white text-lg">No subscriptions yet</p>
                      <p className="text-muted-foreground text-sm mt-2">
                        Subscriptions will appear here when customers subscribe
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {subscriptionsData.data.map((sub: Subscription) => (
                        <div
                          key={sub.subscription_id}
                          className="p-4 bg-white/5 rounded-lg border border-white/10"
                          data-testid={`subscription-row-${sub.subscription_id}`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3">
                                <span className="font-medium text-white">
                                  {sub.customer_email || sub.customer_name || 'Unknown Customer'}
                                </span>
                                <span className={`text-xs px-2 py-0.5 rounded ${
                                  sub.status === 'active' ? 'bg-green-500/20 text-green-400' :
                                  sub.status === 'canceled' ? 'bg-red-500/20 text-red-400' :
                                  sub.status === 'past_due' ? 'bg-yellow-500/20 text-yellow-400' :
                                  'bg-gray-500/20 text-gray-400'
                                }`}>
                                  {sub.status || 'Unknown'}
                                </span>
                                {sub.cancel_at_period_end && (
                                  <span className="text-xs px-2 py-0.5 rounded bg-orange-500/20 text-orange-400">
                                    Cancels at period end
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                                <span className="text-white">{sub.product_name || 'Unknown Product'}</span>
                                <span>
                                  {sub.unit_amount ? `$${(sub.unit_amount / 100).toFixed(2)}` : '-'}
                                  {sub.recurring?.interval && ` / ${sub.recurring.interval}`}
                                </span>
                                <span>Started: {sub.created ? format(new Date(sub.created * 1000), 'MMM d, yyyy') : '-'}</span>
                              </div>
                              {sub.current_period_end && (
                                <p className="text-xs text-muted-foreground mt-1">
                                  Current period ends: {format(new Date(sub.current_period_end * 1000), 'MMM d, yyyy')}
                                </p>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              <a
                                href={`https://dashboard.stripe.com/subscriptions/${sub.subscription_id}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
                              >
                                <ExternalLink className="w-3 h-3" />
                                Stripe
                              </a>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </TabsContent>
              </Tabs>

              <div className="mt-8 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-lg">
                <p className="text-sm text-emerald-400">
                  <Zap className="w-4 h-4 inline mr-2" />
                  For refunds, cancellations, and detailed customer management, use the <a href="https://dashboard.stripe.com/customers" target="_blank" rel="noopener noreferrer" className="underline">Stripe Dashboard</a>.
                </p>
              </div>
            </motion.div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

function CommerceTab() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    price: '',
    type: 'one_time' as 'one_time' | 'subscription',
    interval: 'month' as 'month' | 'year',
    features: '',
  });

  const { data: productsData, isLoading: productsLoading } = useQuery({
    queryKey: ["admin-stripe-products"],
    queryFn: async () => {
      const response = await fetch("/api/admin/stripe/products", { credentials: "include" });
      if (!response.ok) throw new Error("Failed to fetch products");
      return response.json();
    },
  });

  const syncMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/admin/stripe/sync", {
        method: "POST",
        credentials: "include",
      });
      if (!response.ok) throw new Error("Sync failed");
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Sync complete", description: "Stripe data has been synchronized" });
      queryClient.invalidateQueries({ queryKey: ["admin-stripe-products"] });
    },
    onError: () => {
      toast({ title: "Sync failed", description: "Could not sync Stripe data", variant: "destructive" });
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof newProduct) => {
      const response = await fetch("/api/admin/stripe/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to create product");
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Product created", description: "Product has been added to Stripe" });
      queryClient.invalidateQueries({ queryKey: ["admin-stripe-products"] });
      setShowCreateForm(false);
      setNewProduct({ name: '', description: '', price: '', type: 'one_time', interval: 'month', features: '' });
    },
    onError: () => {
      toast({ title: "Failed to create product", variant: "destructive" });
    },
  });

  const archiveMutation = useMutation({
    mutationFn: async (productId: string) => {
      const response = await fetch(`/api/admin/stripe/products/${productId}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to archive product");
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Product archived" });
      queryClient.invalidateQueries({ queryKey: ["admin-stripe-products"] });
    },
    onError: () => {
      toast({ title: "Failed to archive product", variant: "destructive" });
    },
  });

  const products = productsData?.data || [];

  const formatPrice = (amount: number, currency: string = "usd") => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency.toUpperCase(),
    }).format(amount / 100);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="space-y-6"
    >
      <div className="glass-panel rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <Crown className="w-5 h-5 text-primary" />
              Stripe Products
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Manage products and prices synced from Stripe
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              onClick={() => setShowCreateForm(!showCreateForm)}
              data-testid="btn-add-product"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Product
            </Button>
            <Button
              variant="outline"
              onClick={() => syncMutation.mutate()}
              disabled={syncMutation.isPending}
              data-testid="btn-sync-stripe"
            >
              {syncMutation.isPending ? (
                <Clock className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Zap className="w-4 h-4 mr-2" />
              )}
              Sync
            </Button>
            <a
              href="https://dashboard.stripe.com/products"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button variant="outline" size="icon" data-testid="btn-stripe-dashboard">
                <ExternalLink className="w-4 h-4" />
              </Button>
            </a>
          </div>
        </div>

        {showCreateForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="mb-6 p-4 bg-white/5 rounded-lg border border-white/10"
          >
            <h3 className="text-white font-medium mb-4">Create New Product</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-muted-foreground block mb-1">Name *</label>
                <input
                  type="text"
                  className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-white"
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                  placeholder="Advanced AI Report"
                  data-testid="input-product-name"
                />
              </div>
              <div>
                <label className="text-sm text-muted-foreground block mb-1">Price (USD) *</label>
                <input
                  type="number"
                  step="0.01"
                  className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-white"
                  value={newProduct.price}
                  onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                  placeholder="9.99"
                  data-testid="input-product-price"
                />
              </div>
              <div>
                <label className="text-sm text-muted-foreground block mb-1">Type *</label>
                <select
                  className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-white"
                  value={newProduct.type}
                  onChange={(e) => setNewProduct({ ...newProduct, type: e.target.value as 'one_time' | 'subscription' })}
                  data-testid="select-product-type"
                >
                  <option value="one_time">One-time Purchase</option>
                  <option value="subscription">Subscription</option>
                </select>
              </div>
              {newProduct.type === 'subscription' && (
                <div>
                  <label className="text-sm text-muted-foreground block mb-1">Billing Interval</label>
                  <select
                    className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-white"
                    value={newProduct.interval}
                    onChange={(e) => setNewProduct({ ...newProduct, interval: e.target.value as 'month' | 'year' })}
                    data-testid="select-product-interval"
                  >
                    <option value="month">Monthly</option>
                    <option value="year">Yearly</option>
                  </select>
                </div>
              )}
              <div className="md:col-span-2">
                <label className="text-sm text-muted-foreground block mb-1">Description</label>
                <textarea
                  className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-white"
                  value={newProduct.description}
                  onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                  placeholder="AI-powered visual compliance analysis report"
                  rows={2}
                  data-testid="input-product-description"
                />
              </div>
              <div className="md:col-span-2">
                <label className="text-sm text-muted-foreground block mb-1">Features (comma-separated)</label>
                <input
                  type="text"
                  className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-white"
                  value={newProduct.features}
                  onChange={(e) => setNewProduct({ ...newProduct, features: e.target.value })}
                  placeholder="AI Analysis, PDF Export, 24/7 Support"
                  data-testid="input-product-features"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-4">
              <Button
                onClick={() => createMutation.mutate(newProduct)}
                disabled={createMutation.isPending || !newProduct.name || !newProduct.price}
                data-testid="btn-create-product"
              >
                {createMutation.isPending ? (
                  <Clock className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Check className="w-4 h-4 mr-2" />
                )}
                Create Product
              </Button>
              <Button variant="ghost" onClick={() => setShowCreateForm(false)}>
                Cancel
              </Button>
            </div>
          </motion.div>
        )}

        {productsLoading ? (
          <div className="py-12 text-center">
            <Clock className="w-8 h-8 animate-spin mx-auto text-primary mb-4" />
            <p className="text-muted-foreground">Loading products...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="py-12 text-center">
            <Crown className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-white text-lg">No products found</p>
            <p className="text-muted-foreground text-sm mt-2">
              Create products in Stripe Dashboard, then sync here
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {products.map((product: any) => (
              <div
                key={product.id}
                className="p-4 bg-white/5 rounded-lg border border-white/10"
                data-testid={`product-row-${product.id}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <span className="font-medium text-white">{product.name}</span>
                      <span className={`text-xs px-2 py-0.5 rounded ${
                        product.active ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                      }`}>
                        {product.active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {product.description || 'No description'}
                    </p>
                    <div className="flex flex-wrap gap-2 mt-3">
                      {product.prices?.map((price: any) => (
                        <div
                          key={price.id}
                          className="text-xs px-2 py-1 bg-cyan-500/10 text-cyan-400 rounded border border-cyan-500/30"
                        >
                          {formatPrice(price.unit_amount, price.currency)}
                          {price.recurring && ` / ${price.recurring.interval}`}
                          {!price.active && ' (inactive)'}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground font-mono hidden lg:block">
                      {product.id.slice(0, 20)}...
                    </span>
                    {product.active && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => archiveMutation.mutate(product.id)}
                        disabled={archiveMutation.isPending}
                        className="text-red-400 hover:text-red-300"
                        data-testid={`btn-archive-${product.id}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-8 p-4 bg-cyan-500/10 border border-cyan-500/30 rounded-lg">
          <p className="text-sm text-cyan-400">
            <Zap className="w-4 h-4 inline mr-2" />
            Products are managed in the <a href="https://dashboard.stripe.com/products" target="_blank" rel="noopener noreferrer" className="underline">Stripe Dashboard</a>. Click "Sync from Stripe" to update the local cache.
          </p>
        </div>
      </div>
    </motion.div>
  );
}
