import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  Link2,
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
  Receipt,
  Edit,
  Save,
  Upload,
  Download,
  UserCog,
  FileText
} from "lucide-react";
import { FEATURE_FLAGS, type FeatureFlag, type FeatureStatus, type FeatureCategory } from "@shared/feature-flags";
import { FeatureBadge } from "@/components/ui/feature-badge";
import { TermsModal } from "@/components/terms-modal";
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
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from "recharts";

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
    if (tab && ["users", "chat", "media", "analytics", "grader", "features", "commerce", "customers", "reports", "backlinks"].includes(tab)) {
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

  const { data: productionAnalytics, isLoading: productionAnalyticsLoading } = useQuery<{
    httpStatusesByHour: Array<{ hour: string; status_code: number; count: string }>;
    durationDistribution: Array<{ bucket: string; count: string }>;
    topEndpoints: Array<{ endpoint: string; requests: string; avg_duration: string; errors: string }>;
    summary: { total_requests: string; avg_duration: string; success_count: string; error_count: string };
  }>({
    queryKey: ['/api/admin/production-analytics'],
    queryFn: async () => {
      const res = await fetch('/api/admin/production-analytics', {
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to fetch production analytics');
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

  const [customerSearch, setCustomerSearch] = useState("");
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [importData, setImportData] = useState("");
  const [showAddCustomer, setShowAddCustomer] = useState(false);
  const [newCustomer, setNewCustomer] = useState({ email: '', name: '' });

  const { data: customersData, isLoading: customersLoading, refetch: refetchCustomers } = useQuery<{ data: any[] }>({
    queryKey: ['/api/admin/cs/customers', customerSearch],
    queryFn: async () => {
      const url = customerSearch ? `/api/admin/cs/customers?search=${encodeURIComponent(customerSearch)}` : '/api/admin/cs/customers';
      const res = await fetch(url, { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to fetch customers');
      return res.json();
    },
    enabled: isAuthenticated && user?.role === 'superuser' && activeTab === 'customers',
  });

  interface ReportSubscription {
    id: string;
    userId: string;
    slug: string;
    targetUrl: string | null;
    companyName: string | null;
    brandColor: string;
    status: string;
    visibility: string;
    embedEnabled: number;
    apiEnabled: number;
    createdAt: string;
  }

  const { data: reportSubsData, isLoading: reportSubsLoading } = useQuery<{ data: ReportSubscription[] }>({
    queryKey: ['/api/admin/report-subscriptions'],
    queryFn: async () => {
      const res = await fetch('/api/admin/report-subscriptions', { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to fetch report subscriptions');
      return res.json();
    },
    enabled: isAuthenticated && user?.role === 'superuser' && activeTab === 'reports',
  });

  const reportSubscriptions = reportSubsData?.data || [];

  const createCustomerMutation = useMutation({
    mutationFn: async (data: { email: string; name: string }) => {
      const res = await fetch('/api/admin/cs/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to create customer');
      return res.json();
    },
    onSuccess: () => {
      toast({ title: 'Customer created' });
      refetchCustomers();
      setShowAddCustomer(false);
      setNewCustomer({ email: '', name: '' });
    },
    onError: () => {
      toast({ title: 'Failed to create customer', variant: 'destructive' });
    },
  });

  const importCustomersMutation = useMutation({
    mutationFn: async (customers: { email: string; name?: string }[]) => {
      const res = await fetch('/api/admin/cs/customers/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ customers }),
      });
      if (!res.ok) throw new Error('Failed to import customers');
      return res.json();
    },
    onSuccess: (data) => {
      toast({ title: `Import complete`, description: `${data.created} customers created${data.errors?.length ? `, ${data.errors.length} errors` : ''}` });
      refetchCustomers();
      setShowImportDialog(false);
      setImportData("");
    },
    onError: () => {
      toast({ title: 'Import failed', variant: 'destructive' });
    },
  });

  const handleExportCustomers = async () => {
    try {
      const res = await fetch('/api/admin/cs/customers/export', { credentials: 'include' });
      if (!res.ok) throw new Error('Export failed');
      const data = await res.json();
      
      const csv = [
        ['ID', 'Email', 'Name', 'Phone', 'Created', 'Active Subs', 'Orders', 'Total Spent'].join(','),
        ...data.data.map((c: any) => [
          c.id,
          c.email || '',
          c.name || '',
          c.phone || '',
          c.created ? new Date(c.created * 1000).toISOString() : '',
          c.active_subscriptions || 0,
          c.total_orders || 0,
          ((c.total_spent || 0) / 100).toFixed(2)
        ].join(','))
      ].join('\n');
      
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `customers-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      toast({ title: 'Export complete' });
    } catch (error) {
      toast({ title: 'Export failed', variant: 'destructive' });
    }
  };

  const handleImportCSV = () => {
    const lines = importData.trim().split('\n').slice(1);
    const customers = lines.map(line => {
      const [email, name] = line.split(',').map(s => s.trim());
      return { email, name };
    }).filter(c => c.email);
    
    if (customers.length === 0) {
      toast({ title: 'No valid customers found', variant: 'destructive' });
      return;
    }
    
    importCustomersMutation.mutate(customers);
  };

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

  const impersonateMutation = useMutation({
    mutationFn: async (userId: string) => {
      const res = await fetch(`/api/admin/impersonate/${userId}`, {
        method: 'POST',
        credentials: 'include',
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Failed to impersonate user');
      }
      return res.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Impersonating User",
        description: data.message,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
      setLocation("/portal/dashboard");
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

  const needsTermsAcceptance = !user?.termsAcceptedAt;

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
                <Shield className="w-4 h-4" />
                Admin
              </span>
            </div>
            
            <div className="flex items-center gap-2 md:gap-4">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setLocation("/portal/dashboard")}
                className="text-muted-foreground hover:text-white px-2 md:px-3"
              >
                <ChevronLeft className="w-4 h-4 md:mr-2" />
                <span className="hidden md:inline">Dashboard</span>
              </Button>
              <div className="flex items-center gap-2 md:gap-3 pl-2 md:pl-4 border-l border-white/10">
                {user?.profileImageUrl && (
                  <img 
                    src={user.profileImageUrl} 
                    alt="Profile" 
                    className="w-8 h-8 rounded-full object-cover border border-yellow-500/30"
                  />
                )}
                <div className="text-sm hidden md:block">
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
                  className="shrink-0 text-red-400 hover:text-red-300 hover:bg-red-500/10"
                >
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main id="main-content" className="container mx-auto px-3 md:px-6 py-6 md:py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 md:mb-8"
        >
          <h1 className="text-2xl md:text-3xl font-bold font-heading text-white mb-2 flex items-center gap-2 md:gap-3">
            <Shield className="w-6 h-6 md:w-8 md:h-8 text-primary" />
            Admin Panel
          </h1>
          <p className="text-sm md:text-base text-muted-foreground">
            Manage users, chat leads, and view conversation analytics.
          </p>
        </motion.div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4 md:space-y-6">
          <div className="overflow-x-auto -mx-3 px-3 md:mx-0 md:px-0">
            <TabsList className="bg-white/5 border border-white/10 w-max md:w-auto">
              <TabsTrigger value="users" className="data-[state=active]:bg-primary text-xs md:text-sm" data-testid="tab-users">
                <Users className="w-4 h-4 md:mr-2" />
                <span className="hidden md:inline">Users</span>
              </TabsTrigger>
              <TabsTrigger value="chat" className="data-[state=active]:bg-primary text-xs md:text-sm" data-testid="tab-chat">
                <MessageSquare className="w-4 h-4 md:mr-2" />
                <span className="hidden md:inline">Chat</span>
              </TabsTrigger>
              <TabsTrigger value="media" className="data-[state=active]:bg-primary text-xs md:text-sm" data-testid="tab-media">
                <Video className="w-4 h-4 md:mr-2" />
                <span className="hidden md:inline">Media ({pendingMedia.length})</span>
              </TabsTrigger>
              <TabsTrigger value="analytics" className="data-[state=active]:bg-primary text-xs md:text-sm" data-testid="tab-analytics">
                <BarChart3 className="w-4 h-4 md:mr-2" />
                <span className="hidden md:inline">Analytics</span>
              </TabsTrigger>
              <TabsTrigger value="grader" className="data-[state=active]:bg-primary text-xs md:text-sm" data-testid="tab-grader">
                <Globe className="w-4 h-4 md:mr-2" />
                <span className="hidden md:inline">Grader Leads</span>
              </TabsTrigger>
              <TabsTrigger value="features" className="data-[state=active]:bg-primary text-xs md:text-sm" data-testid="tab-features">
                <Settings className="w-4 h-4 md:mr-2" />
                <span className="hidden md:inline">Features</span>
              </TabsTrigger>
              <TabsTrigger value="commerce" className="data-[state=active]:bg-primary text-xs md:text-sm" data-testid="tab-commerce">
                <CreditCard className="w-4 h-4 md:mr-2" />
                <span className="hidden md:inline">Commerce</span>
              </TabsTrigger>
              <TabsTrigger value="backlinks" className="data-[state=active]:bg-primary text-xs md:text-sm" data-testid="tab-backlinks">
                <Link2 className="w-4 h-4 md:mr-2" />
                <span className="hidden md:inline">Backlinks</span>
              </TabsTrigger>
            </TabsList>
          </div>

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

                          {u.id !== user?.id && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => impersonateMutation.mutate(u.id)}
                              disabled={impersonateMutation.isPending}
                              className="ml-2"
                              data-testid={`btn-impersonate-${u.id}`}
                            >
                              <UserCog className="w-4 h-4 mr-1" />
                              Run As
                            </Button>
                          )}
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

                  {/* Production Analytics - API Usage */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="mt-8"
                  >
                    <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                      <Zap className="w-5 h-5 text-orange-400" />
                      Production Analytics (24h)
                    </h2>
                    
                    {productionAnalyticsLoading ? (
                      <div className="p-8 text-center glass-panel rounded-2xl">
                        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                        <p className="text-muted-foreground">Loading production analytics...</p>
                      </div>
                    ) : productionAnalytics ? (
                      <>
                        {/* Summary Cards */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                          <div className="glass-panel rounded-xl p-4">
                            <div className="flex items-center gap-2 text-muted-foreground text-sm mb-2">
                              <Globe className="w-4 h-4" />
                              Total Requests
                            </div>
                            <div className="text-2xl font-bold text-white">
                              {parseInt(productionAnalytics.summary.total_requests || '0').toLocaleString()}
                            </div>
                          </div>
                          <div className="glass-panel rounded-xl p-4">
                            <div className="flex items-center gap-2 text-muted-foreground text-sm mb-2">
                              <Clock className="w-4 h-4" />
                              Avg Response
                            </div>
                            <div className="text-2xl font-bold text-white">
                              {Math.round(parseFloat(productionAnalytics.summary.avg_duration || '0'))}ms
                            </div>
                          </div>
                          <div className="glass-panel rounded-xl p-4">
                            <div className="flex items-center gap-2 text-muted-foreground text-sm mb-2">
                              <CheckCircle2 className="w-4 h-4 text-green-400" />
                              Success (2xx)
                            </div>
                            <div className="text-2xl font-bold text-green-400">
                              {parseInt(productionAnalytics.summary.success_count || '0').toLocaleString()}
                            </div>
                          </div>
                          <div className="glass-panel rounded-xl p-4">
                            <div className="flex items-center gap-2 text-muted-foreground text-sm mb-2">
                              <XCircle className="w-4 h-4 text-red-400" />
                              Errors (4xx/5xx)
                            </div>
                            <div className="text-2xl font-bold text-red-400">
                              {parseInt(productionAnalytics.summary.error_count || '0').toLocaleString()}
                            </div>
                          </div>
                        </div>

                        {/* HTTP Statuses Line Chart */}
                        {productionAnalytics.httpStatusesByHour.length > 0 && (
                          <div className="glass-panel rounded-2xl overflow-hidden mb-6">
                            <div className="p-4 border-b border-white/5 bg-white/5">
                              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                                <BarChart3 className="w-5 h-5 text-green-400" />
                                HTTP Statuses (24h)
                              </h3>
                            </div>
                            <div className="p-4">
                              <ResponsiveContainer width="100%" height={250}>
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
                                  margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
                                >
                                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                                  <XAxis dataKey="hour" stroke="#888" fontSize={12} />
                                  <YAxis stroke="#888" fontSize={12} />
                                  <Tooltip 
                                    contentStyle={{ 
                                      backgroundColor: 'rgba(0,0,0,0.8)', 
                                      border: '1px solid rgba(255,255,255,0.1)',
                                      borderRadius: '8px'
                                    }} 
                                  />
                                  <Legend />
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
                          <div className="glass-panel rounded-2xl overflow-hidden mb-6">
                            <div className="p-4 border-b border-white/5 bg-white/5">
                              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                                <Clock className="w-5 h-5 text-cyan-400" />
                                Request Durations (ms)
                              </h3>
                            </div>
                            <div className="p-4">
                              <ResponsiveContainer width="100%" height={200}>
                                <BarChart
                                  data={productionAnalytics.durationDistribution.map(item => ({
                                    bucket: item.bucket.replace('< ', '<'),
                                    count: parseInt(item.count)
                                  }))}
                                  margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
                                >
                                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                                  <XAxis dataKey="bucket" stroke="#888" fontSize={11} />
                                  <YAxis stroke="#888" fontSize={12} />
                                  <Tooltip 
                                    contentStyle={{ 
                                      backgroundColor: 'rgba(0,0,0,0.8)', 
                                      border: '1px solid rgba(255,255,255,0.1)',
                                      borderRadius: '8px'
                                    }}
                                    formatter={(value: number) => [value.toLocaleString(), 'Requests']}
                                  />
                                  <Bar dataKey="count" fill="#22d3ee" radius={[4, 4, 0, 0]} />
                                </BarChart>
                              </ResponsiveContainer>
                            </div>
                          </div>
                        )}

                        <div className="grid md:grid-cols-2 gap-6">
                          {/* Top Endpoints */}
                          <div className="glass-panel rounded-2xl overflow-hidden">
                            <div className="p-4 border-b border-white/5 bg-white/5">
                              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                                <Link2 className="w-5 h-5 text-primary" />
                                Top Endpoints
                              </h3>
                            </div>
                            <div className="divide-y divide-white/5 max-h-64 overflow-y-auto">
                              {productionAnalytics.topEndpoints.length === 0 ? (
                                <div className="p-8 text-center text-muted-foreground">No data yet</div>
                              ) : (
                                productionAnalytics.topEndpoints.map((ep) => (
                                  <div key={ep.endpoint} className="p-3 hover:bg-white/5">
                                    <div className="flex items-center justify-between mb-1">
                                      <span className="text-white font-mono text-sm truncate flex-1 mr-2">{ep.endpoint}</span>
                                      <span className="text-cyan-400 font-bold">{parseInt(ep.requests).toLocaleString()}</span>
                                    </div>
                                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                      <span>Avg: {Math.round(parseFloat(ep.avg_duration || '0'))}ms</span>
                                      {parseInt(ep.errors) > 0 && (
                                        <span className="text-red-400">{ep.errors} errors</span>
                                      )}
                                    </div>
                                  </div>
                                ))
                              )}
                            </div>
                          </div>

                          {/* Response Time List */}
                          <div className="glass-panel rounded-2xl overflow-hidden">
                            <div className="p-4 border-b border-white/5 bg-white/5">
                              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                                <Clock className="w-5 h-5 text-primary" />
                                Response Time Breakdown
                              </h3>
                            </div>
                            <div className="p-4">
                              {productionAnalytics.durationDistribution.length === 0 ? (
                                <div className="p-8 text-center text-muted-foreground">No data yet</div>
                              ) : (
                                <div className="space-y-3">
                                  {productionAnalytics.durationDistribution.map((item) => {
                                    const count = parseInt(item.count);
                                    const total = productionAnalytics.durationDistribution.reduce((sum, d) => sum + parseInt(d.count), 0);
                                    const percentage = total > 0 ? (count / total) * 100 : 0;
                                    return (
                                      <div key={item.bucket} className="space-y-1">
                                        <div className="flex justify-between text-sm">
                                          <span className="text-white font-mono">{item.bucket}</span>
                                          <span className="text-muted-foreground">{count.toLocaleString()} ({percentage.toFixed(1)}%)</span>
                                        </div>
                                        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                                          <div 
                                            className="h-full bg-gradient-to-r from-cyan-500 to-primary rounded-full transition-all"
                                            style={{ width: `${percentage}%` }}
                                          />
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="p-6 text-center glass-panel rounded-2xl border border-white/10">
                        <p className="text-muted-foreground text-sm">
                          No production analytics data available.
                        </p>
                      </div>
                    )}
                  </motion.div>
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
                  <TabsTrigger value="customers" className="data-[state=active]:bg-primary" data-testid="subtab-customers">
                    Customers
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
                              <a
                                href={`https://dashboard.stripe.com/payments/${order.session_id}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
                              >
                                <ExternalLink className="w-3 h-3" />
                                Stripe
                              </a>
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

                <TabsContent value="customers">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3 flex-1">
                      <input
                        type="text"
                        placeholder="Search by email or name..."
                        className="flex-1 max-w-md bg-white/5 border border-white/10 rounded px-3 py-2 text-white"
                        value={customerSearch}
                        onChange={(e) => setCustomerSearch(e.target.value)}
                        data-testid="input-customer-search"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" onClick={() => setShowAddCustomer(true)} data-testid="btn-add-customer">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Customer
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => setShowImportDialog(true)} data-testid="btn-import-customers">
                        <Upload className="w-4 h-4 mr-2" />
                        Import
                      </Button>
                      <Button variant="outline" size="sm" onClick={handleExportCustomers} data-testid="btn-export-customers">
                        <Download className="w-4 h-4 mr-2" />
                        Export
                      </Button>
                    </div>
                  </div>

                  {customersLoading ? (
                    <div className="py-12 text-center">
                      <Clock className="w-8 h-8 animate-spin mx-auto text-primary mb-4" />
                      <p className="text-muted-foreground">Loading customers...</p>
                    </div>
                  ) : !customersData?.data?.length ? (
                    <div className="py-12 text-center">
                      <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                      <p className="text-white text-lg">No customers yet</p>
                      <p className="text-muted-foreground text-sm mt-2">
                        Customers will appear here after checkout or import
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {customersData.data.map((customer: any) => (
                        <div
                          key={customer.id}
                          className="p-4 bg-white/5 rounded-lg border border-white/10"
                          data-testid={`customer-row-${customer.id}`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3">
                                <span className="font-medium text-white">{customer.email}</span>
                                {customer.name && (
                                  <span className="text-muted-foreground">({customer.name})</span>
                                )}
                                {Number(customer.active_subscriptions) > 0 && (
                                  <span className="text-xs px-2 py-0.5 rounded bg-green-500/20 text-green-400">
                                    {customer.active_subscriptions} active sub{Number(customer.active_subscriptions) > 1 ? 's' : ''}
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                                <span>{customer.total_orders || 0} orders</span>
                                <span>Created: {customer.created ? format(new Date(customer.created * 1000), 'MMM d, yyyy') : '-'}</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <a
                                href={`https://dashboard.stripe.com/customers/${customer.id}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
                              >
                                <ExternalLink className="w-3 h-3" />
                                Stripe
                              </a>
                              <span className="text-xs text-muted-foreground font-mono hidden lg:block">
                                {customer.id.slice(0, 15)}...
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Add Customer Dialog */}
                  {showAddCustomer && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                      <div className="bg-slate-900 border border-white/10 rounded-xl p-6 max-w-md w-full">
                        <h3 className="text-lg font-semibold text-white mb-4">Add Customer</h3>
                        <div className="space-y-4">
                          <div>
                            <label className="text-sm text-muted-foreground block mb-1">Email *</label>
                            <input
                              type="email"
                              className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-white"
                              value={newCustomer.email}
                              onChange={(e) => setNewCustomer({ ...newCustomer, email: e.target.value })}
                              placeholder="customer@example.com"
                              data-testid="input-new-customer-email"
                            />
                          </div>
                          <div>
                            <label className="text-sm text-muted-foreground block mb-1">Name</label>
                            <input
                              type="text"
                              className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-white"
                              value={newCustomer.name}
                              onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
                              placeholder="John Doe"
                              data-testid="input-new-customer-name"
                            />
                          </div>
                        </div>
                        <div className="flex gap-3 mt-6">
                          <Button
                            onClick={() => createCustomerMutation.mutate(newCustomer)}
                            disabled={!newCustomer.email || createCustomerMutation.isPending}
                            data-testid="btn-confirm-add-customer"
                          >
                            {createCustomerMutation.isPending ? 'Creating...' : 'Add Customer'}
                          </Button>
                          <Button variant="ghost" onClick={() => setShowAddCustomer(false)}>Cancel</Button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Import Dialog */}
                  {showImportDialog && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                      <div className="bg-slate-900 border border-white/10 rounded-xl p-6 max-w-lg w-full">
                        <h3 className="text-lg font-semibold text-white mb-4">Import Customers</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                          Paste CSV data with headers: email,name (one customer per line)
                        </p>
                        <textarea
                          className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-white font-mono text-sm"
                          rows={8}
                          value={importData}
                          onChange={(e) => setImportData(e.target.value)}
                          placeholder="email,name&#10;john@example.com,John Doe&#10;jane@example.com,Jane Smith"
                          data-testid="textarea-import-csv"
                        />
                        <div className="flex gap-3 mt-4">
                          <Button
                            onClick={handleImportCSV}
                            disabled={!importData.trim() || importCustomersMutation.isPending}
                            data-testid="btn-confirm-import"
                          >
                            {importCustomersMutation.isPending ? 'Importing...' : 'Import'}
                          </Button>
                          <Button variant="ghost" onClick={() => setShowImportDialog(false)}>Cancel</Button>
                        </div>
                      </div>
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

          {/* Reports Tab - White Label Report Subscriptions */}
          <TabsContent value="reports">
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-white">Website Grade Report Subscriptions</h2>
                  <p className="text-sm text-muted-foreground">
                    Manage white-label grader subscriptions ($495.67/year product)
                  </p>
                </div>
                <Badge variant="secondary" className="bg-purple-500/20 text-purple-400">
                  {reportSubscriptions.length} Active
                </Badge>
              </div>

              {reportSubsLoading ? (
                <div className="flex items-center justify-center py-12">
                  <RefreshCw className="w-6 h-6 animate-spin text-cyan-400" />
                </div>
              ) : reportSubscriptions.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No report subscriptions yet</p>
                  <p className="text-sm mt-2">Subscriptions are created when customers purchase the Website Grade Report product</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {reportSubscriptions.map((sub: ReportSubscription) => (
                    <div 
                      key={sub.id}
                      className="p-4 bg-white/5 border border-white/10 rounded-lg hover:border-purple-500/30 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center gap-3">
                            <span 
                              className="w-3 h-3 rounded-full" 
                              style={{ backgroundColor: sub.brandColor }}
                            />
                            <h3 className="font-medium text-white">
                              {sub.companyName || 'Unnamed Company'}
                            </h3>
                            <Badge 
                              variant={sub.status === 'active' ? 'default' : 'secondary'}
                              className={sub.status === 'active' ? 'bg-emerald-500/20 text-emerald-400' : ''}
                            >
                              {sub.status}
                            </Badge>
                          </div>
                          
                          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Globe className="w-4 h-4" />
                              Slug: <code className="text-cyan-400">{sub.slug}</code>
                            </span>
                            {sub.targetUrl && (
                              <span className="flex items-center gap-1">
                                <Link2 className="w-4 h-4" />
                                {sub.targetUrl}
                              </span>
                            )}
                            <span>
                              User: <code className="text-yellow-400">{sub.userId.slice(0, 8)}...</code>
                            </span>
                          </div>

                          <div className="flex gap-2 mt-2">
                            {sub.embedEnabled === 1 && (
                              <Badge variant="outline" className="text-xs">
                                Embed Enabled
                              </Badge>
                            )}
                            {sub.apiEnabled === 1 && (
                              <Badge variant="outline" className="text-xs">
                                API Enabled
                              </Badge>
                            )}
                            <Badge 
                              variant="outline" 
                              className={`text-xs ${sub.visibility === 'public' ? 'text-emerald-400' : 'text-yellow-400'}`}
                            >
                              {sub.visibility}
                            </Badge>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => window.open(`/grade/${sub.slug}`, '_blank')}
                            data-testid={`btn-view-embed-${sub.id}`}
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            View
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="p-4 bg-purple-500/10 border border-purple-500/30 rounded-lg">
                <p className="text-sm text-purple-400">
                  <FileText className="w-4 h-4 inline mr-2" />
                  Report subscriptions are automatically created via Stripe webhook when customers purchase the Website Grade Report product. Customers can configure their branding and settings in the Portal → Reports section.
                </p>
              </div>
            </motion.div>
          </TabsContent>

          <TabsContent value="backlinks">
            <BacklinksTab />
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
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [editForm, setEditForm] = useState({
    name: '',
    description: '',
    features: '',
    product_type: '',
    tier: '',
    calls_included: '',
    discount_percent: '',
    parent_product: '',
  });
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

  const updateMutation = useMutation({
    mutationFn: async ({ productId, updates }: { productId: string; updates: any }) => {
      const response = await fetch(`/api/admin/stripe/products/${productId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(updates),
      });
      if (!response.ok) throw new Error("Failed to update product");
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Product updated" });
      queryClient.invalidateQueries({ queryKey: ["admin-stripe-products"] });
      setEditingProduct(null);
    },
    onError: () => {
      toast({ title: "Failed to update product", variant: "destructive" });
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

  const openEditDialog = (product: any) => {
    const meta = product.metadata || {};
    setEditForm({
      name: product.name || '',
      description: product.description || '',
      features: meta.features || '',
      product_type: meta.product_type || '',
      tier: meta.tier || '',
      calls_included: meta.calls_included || '',
      discount_percent: meta.discount_percent || '',
      parent_product: meta.parent_product || '',
    });
    setEditingProduct(product);
  };

  const handleSaveEdit = () => {
    if (!editingProduct) return;
    
    const metadata: Record<string, string> = {};
    if (editForm.features) metadata.features = editForm.features;
    if (editForm.product_type) metadata.product_type = editForm.product_type;
    if (editForm.tier) metadata.tier = editForm.tier;
    if (editForm.calls_included) metadata.calls_included = editForm.calls_included;
    if (editForm.discount_percent) metadata.discount_percent = editForm.discount_percent;
    if (editForm.parent_product) metadata.parent_product = editForm.parent_product;

    updateMutation.mutate({
      productId: editingProduct.id,
      updates: {
        name: editForm.name,
        description: editForm.description,
        metadata,
      },
    });
  };

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
                  className="w-full bg-slate-800 border border-white/10 rounded px-3 py-2 text-white"
                  value={newProduct.type}
                  onChange={(e) => setNewProduct({ ...newProduct, type: e.target.value as 'one_time' | 'subscription' })}
                  data-testid="select-product-type"
                >
                  <option value="one_time" className="bg-slate-800 text-white">One-time Purchase</option>
                  <option value="subscription" className="bg-slate-800 text-white">Subscription</option>
                </select>
              </div>
              {newProduct.type === 'subscription' && (
                <div>
                  <label className="text-sm text-muted-foreground block mb-1">Billing Interval</label>
                  <select
                    className="w-full bg-slate-800 border border-white/10 rounded px-3 py-2 text-white"
                    value={newProduct.interval}
                    onChange={(e) => setNewProduct({ ...newProduct, interval: e.target.value as 'month' | 'year' })}
                    data-testid="select-product-interval"
                  >
                    <option value="month" className="bg-slate-800 text-white">Monthly</option>
                    <option value="year" className="bg-slate-800 text-white">Yearly</option>
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
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openEditDialog(product)}
                      className="text-cyan-400 hover:text-cyan-300"
                      data-testid={`btn-edit-${product.id}`}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
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

      {/* Edit Product Dialog */}
      {editingProduct && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-slate-900 border border-white/10 rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
              <Edit className="w-5 h-5 text-primary" />
              Edit Product
            </h3>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="text-sm text-muted-foreground block mb-1">Name</label>
                <input
                  type="text"
                  className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-white"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  data-testid="input-edit-name"
                />
              </div>
              <div className="md:col-span-2">
                <label className="text-sm text-muted-foreground block mb-1">Description</label>
                <textarea
                  className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-white"
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  rows={2}
                  data-testid="input-edit-description"
                />
              </div>
              <div className="md:col-span-2">
                <label className="text-sm text-muted-foreground block mb-1">Features (comma-separated)</label>
                <input
                  type="text"
                  className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-white"
                  value={editForm.features}
                  onChange={(e) => setEditForm({ ...editForm, features: e.target.value })}
                  data-testid="input-edit-features"
                />
              </div>
              
              <div className="md:col-span-2 border-t border-white/10 pt-4 mt-2">
                <p className="text-sm font-medium text-white mb-3">Product Metadata (Advanced)</p>
              </div>
              
              <div>
                <label className="text-sm text-muted-foreground block mb-1">Product Type</label>
                <select
                  className="w-full bg-slate-800 border border-white/10 rounded px-3 py-2 text-white"
                  value={editForm.product_type}
                  onChange={(e) => setEditForm({ ...editForm, product_type: e.target.value })}
                  data-testid="select-edit-product-type"
                >
                  <option value="">None</option>
                  <option value="one_time">One-time</option>
                  <option value="subscription">Subscription</option>
                  <option value="call_pack">Call Pack</option>
                </select>
              </div>
              <div>
                <label className="text-sm text-muted-foreground block mb-1">Tier</label>
                <select
                  className="w-full bg-slate-800 border border-white/10 rounded px-3 py-2 text-white"
                  value={editForm.tier}
                  onChange={(e) => setEditForm({ ...editForm, tier: e.target.value })}
                  data-testid="select-edit-tier"
                >
                  <option value="">None</option>
                  <option value="starter">Starter</option>
                  <option value="professional">Professional</option>
                  <option value="master">Master</option>
                  <option value="enterprise">Enterprise</option>
                </select>
              </div>
              <div>
                <label className="text-sm text-muted-foreground block mb-1">Calls Included</label>
                <input
                  type="number"
                  className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-white"
                  value={editForm.calls_included}
                  onChange={(e) => setEditForm({ ...editForm, calls_included: e.target.value })}
                  placeholder="e.g., 1000"
                  data-testid="input-edit-calls"
                />
              </div>
              <div>
                <label className="text-sm text-muted-foreground block mb-1">Pack Discount %</label>
                <input
                  type="number"
                  className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-white"
                  value={editForm.discount_percent}
                  onChange={(e) => setEditForm({ ...editForm, discount_percent: e.target.value })}
                  placeholder="e.g., 25"
                  data-testid="input-edit-discount"
                />
              </div>
              <div className="md:col-span-2">
                <label className="text-sm text-muted-foreground block mb-1">Parent Product ID (for call packs)</label>
                <select
                  className="w-full bg-slate-800 border border-white/10 rounded px-3 py-2 text-white"
                  value={editForm.parent_product}
                  onChange={(e) => setEditForm({ ...editForm, parent_product: e.target.value })}
                  data-testid="select-edit-parent"
                >
                  <option value="">No parent (standalone product)</option>
                  {products.filter((p: any) => p.id !== editingProduct.id && p.metadata?.product_type === 'subscription').map((p: any) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
                <p className="text-xs text-muted-foreground mt-1">
                  Link call packs to a subscription product to show them as add-ons
                </p>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <Button
                onClick={handleSaveEdit}
                disabled={updateMutation.isPending}
                data-testid="btn-save-edit"
              >
                {updateMutation.isPending ? (
                  <Clock className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                Save Changes
              </Button>
              <Button variant="ghost" onClick={() => setEditingProduct(null)}>
                Cancel
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}

interface Backlink {
  id: string;
  url: string;
  targetUrl: string;
  status: string;
  siteName: string | null;
  notes: string | null;
  lastCheckedAt: string | null;
  verifiedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

function BacklinksTab() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingBacklink, setEditingBacklink] = useState<Backlink | null>(null);
  const [newBacklink, setNewBacklink] = useState({
    url: '',
    targetUrl: 'https://trifused.com',
    siteName: '',
    notes: '',
  });

  const { data: backlinks = [], isLoading } = useQuery<Backlink[]>({
    queryKey: ['admin-backlinks'],
    queryFn: async () => {
      const res = await fetch('/api/admin/backlinks', { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to fetch backlinks');
      return res.json();
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof newBacklink) => {
      const res = await fetch('/api/admin/backlinks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to create backlink');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-backlinks'] });
      setShowAddForm(false);
      setNewBacklink({ url: '', targetUrl: 'https://trifused.com', siteName: '', notes: '' });
      toast({ title: 'Backlink added successfully' });
    },
    onError: () => {
      toast({ title: 'Failed to add backlink', variant: 'destructive' });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Backlink> }) => {
      const res = await fetch(`/api/admin/backlinks/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to update backlink');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-backlinks'] });
      setEditingBacklink(null);
      toast({ title: 'Backlink updated successfully' });
    },
    onError: () => {
      toast({ title: 'Failed to update backlink', variant: 'destructive' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/admin/backlinks/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to delete backlink');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-backlinks'] });
      toast({ title: 'Backlink deleted successfully' });
    },
    onError: () => {
      toast({ title: 'Failed to delete backlink', variant: 'destructive' });
    },
  });

  const verifyMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/admin/backlinks/${id}/verify`, {
        method: 'POST',
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to verify backlink');
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['admin-backlinks'] });
      toast({
        title: data.verified ? 'Backlink verified!' : 'Backlink not found',
        description: data.verified ? 'Link to TriFused was found on the page' : 'No link to TriFused found on the page',
        variant: data.verified ? 'default' : 'destructive',
      });
    },
    onError: () => {
      toast({ title: 'Failed to verify backlink', variant: 'destructive' });
    },
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'verified': return 'text-green-400 bg-green-500/10';
      case 'pending': return 'text-yellow-400 bg-yellow-500/10';
      case 'broken': return 'text-red-400 bg-red-500/10';
      case 'removed': return 'text-gray-400 bg-gray-500/10';
      default: return 'text-muted-foreground bg-white/5';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-panel rounded-2xl overflow-hidden"
    >
      <div className="p-4 border-b border-white/5 bg-white/5 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <Link2 className="w-5 h-5 text-cyan-400" />
            Backlink Manager
          </h2>
          <p className="text-sm text-muted-foreground">Track and verify backlinks to TriFused</p>
        </div>
        <Button
          onClick={() => setShowAddForm(true)}
          className="bg-cyan-500 hover:bg-cyan-600 text-black"
          data-testid="btn-add-backlink"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Backlink
        </Button>
      </div>

      {showAddForm && (
        <div className="p-4 border-b border-white/5 bg-cyan-500/5">
          <h3 className="font-medium text-white mb-4">Add New Backlink</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-muted-foreground block mb-1">Page URL *</label>
              <Input
                placeholder="https://example.com/blog/post"
                value={newBacklink.url}
                onChange={(e) => setNewBacklink({ ...newBacklink, url: e.target.value })}
                data-testid="input-backlink-url"
              />
            </div>
            <div>
              <label className="text-sm text-muted-foreground block mb-1">Site Name</label>
              <Input
                placeholder="Example Blog"
                value={newBacklink.siteName}
                onChange={(e) => setNewBacklink({ ...newBacklink, siteName: e.target.value })}
                data-testid="input-backlink-sitename"
              />
            </div>
            <div>
              <label className="text-sm text-muted-foreground block mb-1">Target URL</label>
              <Input
                placeholder="https://trifused.com"
                value={newBacklink.targetUrl}
                onChange={(e) => setNewBacklink({ ...newBacklink, targetUrl: e.target.value })}
                data-testid="input-backlink-target"
              />
            </div>
            <div>
              <label className="text-sm text-muted-foreground block mb-1">Notes</label>
              <Input
                placeholder="Optional notes..."
                value={newBacklink.notes}
                onChange={(e) => setNewBacklink({ ...newBacklink, notes: e.target.value })}
                data-testid="input-backlink-notes"
              />
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <Button
              onClick={() => createMutation.mutate(newBacklink)}
              disabled={!newBacklink.url || createMutation.isPending}
              className="bg-cyan-500 hover:bg-cyan-600 text-black"
              data-testid="btn-save-backlink"
            >
              {createMutation.isPending ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Check className="w-4 h-4 mr-2" />}
              Save
            </Button>
            <Button variant="ghost" onClick={() => setShowAddForm(false)}>Cancel</Button>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="p-12 text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading backlinks...</p>
        </div>
      ) : backlinks.length === 0 ? (
        <div className="p-12 text-center">
          <Link2 className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
          <p className="text-muted-foreground">No backlinks tracked yet</p>
          <p className="text-sm text-muted-foreground">Add your first backlink to start tracking</p>
        </div>
      ) : (
        <div className="divide-y divide-white/5">
          {backlinks.map((backlink) => (
            <div
              key={backlink.id}
              className="p-4 hover:bg-white/5 transition-colors"
              data-testid={`backlink-${backlink.id}`}
            >
              {editingBacklink?.id === backlink.id ? (
                <div className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <Input
                      value={editingBacklink.url}
                      onChange={(e) => setEditingBacklink({ ...editingBacklink, url: e.target.value })}
                      placeholder="Page URL"
                    />
                    <Input
                      value={editingBacklink.siteName || ''}
                      onChange={(e) => setEditingBacklink({ ...editingBacklink, siteName: e.target.value })}
                      placeholder="Site Name"
                    />
                    <Input
                      value={editingBacklink.notes || ''}
                      onChange={(e) => setEditingBacklink({ ...editingBacklink, notes: e.target.value })}
                      placeholder="Notes"
                    />
                    <select
                      className="bg-slate-800 border border-white/10 rounded px-3 py-2 text-white"
                      value={editingBacklink.status}
                      onChange={(e) => setEditingBacklink({ ...editingBacklink, status: e.target.value })}
                    >
                      <option value="pending">Pending</option>
                      <option value="verified">Verified</option>
                      <option value="broken">Broken</option>
                      <option value="removed">Removed</option>
                    </select>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => updateMutation.mutate({ id: backlink.id, data: editingBacklink })}
                      disabled={updateMutation.isPending}
                    >
                      <Save className="w-4 h-4 mr-1" /> Save
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => setEditingBacklink(null)}>Cancel</Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${getStatusColor(backlink.status)}`}>
                        {backlink.status}
                      </span>
                      {backlink.siteName && (
                        <span className="text-sm font-medium text-white">{backlink.siteName}</span>
                      )}
                    </div>
                    <a
                      href={backlink.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-cyan-400 hover:underline truncate block"
                    >
                      {backlink.url}
                    </a>
                    {backlink.notes && (
                      <p className="text-xs text-muted-foreground mt-1">{backlink.notes}</p>
                    )}
                    <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                      <span>Added: {format(new Date(backlink.createdAt), 'MMM d, yyyy')}</span>
                      {backlink.lastCheckedAt && (
                        <span>Last checked: {format(new Date(backlink.lastCheckedAt), 'MMM d, yyyy')}</span>
                      )}
                      {backlink.verifiedAt && (
                        <span className="text-green-400">Verified: {format(new Date(backlink.verifiedAt), 'MMM d, yyyy')}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => verifyMutation.mutate(backlink.id)}
                      disabled={verifyMutation.isPending}
                      data-testid={`btn-verify-${backlink.id}`}
                    >
                      {verifyMutation.isPending ? (
                        <RefreshCw className="w-4 h-4 animate-spin" />
                      ) : (
                        <CheckCircle2 className="w-4 h-4" />
                      )}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setEditingBacklink(backlink)}
                      data-testid={`btn-edit-${backlink.id}`}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-red-400 hover:text-red-300"
                      onClick={() => {
                        if (confirm('Delete this backlink?')) {
                          deleteMutation.mutate(backlink.id);
                        }
                      }}
                      data-testid={`btn-delete-${backlink.id}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="p-4 bg-cyan-500/10 border-t border-cyan-500/20">
        <p className="text-sm text-cyan-400">
          <Link2 className="w-4 h-4 inline mr-2" />
          The verify button checks if the page contains a link to TriFused. Broken links indicate the backlink may have been removed.
        </p>
      </div>
    </motion.div>
  );
}
