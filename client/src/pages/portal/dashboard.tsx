import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
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
  Plug
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

interface AdminStats {
  subscribers: number;
  diagnostics: number;
  contacts: number;
  leads: number;
  chatSessions: number;
  users: number;
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

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const isSuperuser = user?.role === 'superuser';
  const [showDiagnosticsModal, setShowDiagnosticsModal] = useState(false);
  const [showLeadsModal, setShowLeadsModal] = useState(false);
  const [showSubscribersModal, setShowSubscribersModal] = useState(false);
  const [showContactsModal, setShowContactsModal] = useState(false);
  const [expandedLeadId, setExpandedLeadId] = useState<string | null>(null);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [loadingLeadId, setLoadingLeadId] = useState<string | null>(null);

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

  const quickActions = isSuperuser ? [
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
      icon: BarChart3, 
      label: "Diagnostic Scans", 
      description: `${stats?.diagnostics || 0} scans run`, 
      status: (stats?.diagnostics || 0) > 0 ? "purple" : "gray",
      count: stats?.diagnostics || 0,
      onClick: () => setShowDiagnosticsModal(true)
    },
    { 
      icon: Contact, 
      label: "Contact Submissions", 
      description: `${stats?.contacts || 0} messages`, 
      status: (stats?.contacts || 0) > 0 ? "cyan" : "gray",
      count: stats?.contacts || 0,
      onClick: () => setShowContactsModal(true)
    },
  ] : [
    { icon: Shield, label: "Security Status", description: "All systems operational", status: "green" },
    { icon: Activity, label: "Active Projects", description: "3 projects in progress", status: "blue" },
    { icon: FileText, label: "Reports", description: "2 new reports available", status: "purple" },
    { icon: MessageSquare, label: "Messages", description: "No unread messages", status: "gray" },
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
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => window.location.href = "/api/logout"}
                  data-testid="button-logout"
                  className="shrink-0"
                  aria-label="Sign out"
                >
                  <LogOut className="w-4 h-4" aria-hidden="true" />
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
          className="mb-12"
        >
          <h1 className="text-3xl font-bold font-heading text-white mb-2">
            Welcome back{user?.firstName ? `, ${user.firstName}` : ''}
          </h1>
          <p className="text-muted-foreground">
            {isSuperuser 
              ? "Here's your admin overview with real-time stats and recent activity."
              : "Here's an overview of your account and recent activity."}
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {quickActions.map((action, index) => (
            <motion.div
              key={action.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="glass-panel rounded-xl p-6 hover:border-primary/30 transition-colors cursor-pointer group"
              data-testid={`card-stat-${action.label.toLowerCase().replace(/\s+/g, '-')}`}
              onClick={'onClick' in action ? action.onClick : undefined}
            >
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-4 ${
                action.status === 'green' ? 'bg-green-500/10 text-green-500' :
                action.status === 'blue' ? 'bg-blue-500/10 text-blue-500' :
                action.status === 'purple' ? 'bg-purple-500/10 text-purple-500' :
                action.status === 'cyan' ? 'bg-cyan-500/10 text-cyan-500' :
                'bg-white/5 text-muted-foreground'
              }`}>
                <action.icon className="w-5 h-5" />
              </div>
              <h3 className="text-white font-medium mb-1 flex items-center gap-2">
                {action.label}
                <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
              </h3>
              <p className="text-sm text-muted-foreground">{action.description}</p>
            </motion.div>
          ))}
        </div>

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
    </div>
  );
}
