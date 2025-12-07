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
  Contact
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";

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

  const quickActions = isSuperuser ? [
    { 
      icon: MessageSquare, 
      label: "Chat Leads", 
      description: `${stats?.leads || 0} leads captured`, 
      status: (stats?.leads || 0) > 0 ? "green" : "gray",
      count: stats?.leads || 0
    },
    { 
      icon: Mail, 
      label: "Email Signups", 
      description: `${stats?.subscribers || 0} subscribers`, 
      status: (stats?.subscribers || 0) > 0 ? "blue" : "gray",
      count: stats?.subscribers || 0
    },
    { 
      icon: BarChart3, 
      label: "Diagnostic Scans", 
      description: `${stats?.diagnostics || 0} scans run`, 
      status: (stats?.diagnostics || 0) > 0 ? "purple" : "gray",
      count: stats?.diagnostics || 0
    },
    { 
      icon: Contact, 
      label: "Contact Submissions", 
      description: `${stats?.contacts || 0} messages`, 
      status: (stats?.contacts || 0) > 0 ? "cyan" : "gray",
      count: stats?.contacts || 0
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
            
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="w-5 h-5" />
                {isSuperuser && (stats?.leads || 0) > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full" />
                )}
              </Button>
              <Button variant="ghost" size="icon">
                <Settings className="w-5 h-5" />
              </Button>
              <div className="flex items-center gap-3 pl-4 border-l border-white/10">
                {(user?.ftpAccess === 1 || user?.role === 'superuser') && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setLocation("/portal/mft")}
                    className="border-cyan-500/30 text-cyan-500 hover:bg-cyan-500/10"
                    data-testid="button-mft"
                  >
                    <HardDrive className="w-4 h-4 mr-2" />
                    MFT
                  </Button>
                )}
                {user?.role === 'superuser' && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setLocation("/portal/admin")}
                    className="border-yellow-500/30 text-yellow-500 hover:bg-yellow-500/10"
                    data-testid="button-admin"
                  >
                    <Users className="w-4 h-4 mr-2" />
                    Admin
                  </Button>
                )}
                {user?.profileImageUrl && (
                  <img 
                    src={user.profileImageUrl} 
                    alt="Profile" 
                    className={`w-8 h-8 rounded-full object-cover border ${user?.role === 'superuser' ? 'border-yellow-500/30' : 'border-white/10'}`}
                    data-testid="img-user-avatar"
                  />
                )}
                <div className="text-sm">
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
                >
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-12">
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
    </div>
  );
}
