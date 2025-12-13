import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { 
  LayoutDashboard, 
  LogOut, 
  Settings, 
  Bell, 
  Calendar,
  Mail,
  ChevronRight,
  Crown,
  UserCheck,
  RefreshCw,
  Check,
  X,
  ExternalLink,
  Clock
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { ScrollArea } from "@/components/ui/scroll-area";

interface IntegrationStatus {
  calendar: boolean;
  gmail: boolean;
}

interface CalendarEvent {
  id: string;
  summary: string;
  description?: string;
  start: string;
  end: string;
  isAllDay: boolean;
  htmlLink?: string;
}

interface GmailMessage {
  id: string;
  threadId: string;
  fromName: string;
  fromEmail: string;
  subject: string;
  date: string;
  snippet: string;
  isUnread: boolean;
}

export default function Integrations() {
  const [, setLocation] = useLocation();
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();

  const { data: integrationStatus, refetch: refetchStatus } = useQuery<IntegrationStatus>({
    queryKey: ['/api/integrations/status'],
    queryFn: async () => {
      const res = await fetch('/api/integrations/status', { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to fetch integration status');
      return res.json();
    },
    enabled: isAuthenticated,
  });

  const { data: calendarEvents, isLoading: loadingCalendar, refetch: refetchCalendar } = useQuery<CalendarEvent[]>({
    queryKey: ['/api/calendar/events'],
    queryFn: async () => {
      const res = await fetch('/api/calendar/events?maxResults=5', { credentials: 'include' });
      if (!res.ok) {
        if (res.status === 401) return [];
        throw new Error('Failed to fetch calendar events');
      }
      return res.json();
    },
    enabled: isAuthenticated && integrationStatus?.calendar,
  });

  const { data: gmailMessages, isLoading: loadingGmail, refetch: refetchGmail } = useQuery<GmailMessage[]>({
    queryKey: ['/api/gmail/messages'],
    queryFn: async () => {
      const res = await fetch('/api/gmail/messages?maxResults=5', { credentials: 'include' });
      if (!res.ok) {
        if (res.status === 401) return [];
        throw new Error('Failed to fetch Gmail messages');
      }
      return res.json();
    },
    enabled: isAuthenticated && integrationStatus?.gmail,
  });

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Session Required",
        description: "Please sign in to access integrations.",
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
          <p className="text-muted-foreground">Loading integrations...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const handleRefresh = async () => {
    await Promise.all([
      refetchStatus(),
      refetchCalendar(),
      refetchGmail()
    ]);
    toast({
      title: "Refreshed",
      description: "Integration data has been refreshed.",
    });
  };

  const formatEventTime = (event: CalendarEvent) => {
    if (!event.start) return 'No time set';
    try {
      const date = new Date(event.start);
      if (event.isAllDay) {
        return format(date, 'MMM d, yyyy');
      }
      return format(date, 'MMM d, h:mm a');
    } catch {
      return event.start;
    }
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
              <button
                onClick={() => setLocation("/portal/dashboard")}
                className="text-muted-foreground hover:text-white transition-colors flex items-center gap-2"
              >
                <LayoutDashboard className="w-4 h-4" />
                Dashboard
              </button>
              <span className="text-muted-foreground">/</span>
              <span className="text-white flex items-center gap-2">
                <Settings className="w-4 h-4" />
                Integrations
              </span>
            </div>
            
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" aria-label="Notifications">
                <Bell className="w-5 h-5" aria-hidden="true" />
              </Button>
              <Button variant="ghost" size="icon" onClick={handleRefresh} aria-label="Refresh integrations">
                <RefreshCw className="w-5 h-5" aria-hidden="true" />
              </Button>
              <div className="flex items-center gap-3 pl-4 border-l border-white/10">
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
            Integrations
          </h1>
          <p className="text-muted-foreground">
            Connect your Google services to view calendar events and emails.
          </p>
        </motion.div>

        {/* Integration Status Cards */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-panel rounded-xl p-6"
            data-testid="card-calendar-integration"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  integrationStatus?.calendar ? 'bg-green-500/10 text-green-500' : 'bg-white/5 text-muted-foreground'
                }`}>
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-white font-medium">Google Calendar</h3>
                  <p className="text-sm text-muted-foreground">View upcoming events</p>
                </div>
              </div>
              <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm ${
                integrationStatus?.calendar 
                  ? 'bg-green-500/10 text-green-500' 
                  : 'bg-yellow-500/10 text-yellow-500'
              }`}>
                {integrationStatus?.calendar ? (
                  <>
                    <Check className="w-4 h-4" />
                    Connected
                  </>
                ) : (
                  <>
                    <X className="w-4 h-4" />
                    Not Connected
                  </>
                )}
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-panel rounded-xl p-6"
            data-testid="card-gmail-integration"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  integrationStatus?.gmail ? 'bg-blue-500/10 text-blue-500' : 'bg-white/5 text-muted-foreground'
                }`}>
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-white font-medium">Gmail</h3>
                  <p className="text-sm text-muted-foreground">View inbox messages</p>
                </div>
              </div>
              <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm ${
                integrationStatus?.gmail 
                  ? 'bg-green-500/10 text-green-500' 
                  : 'bg-yellow-500/10 text-yellow-500'
              }`}>
                {integrationStatus?.gmail ? (
                  <>
                    <Check className="w-4 h-4" />
                    Connected
                  </>
                ) : (
                  <>
                    <X className="w-4 h-4" />
                    Not Connected
                  </>
                )}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Calendar Events */}
        {integrationStatus?.calendar && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass-panel rounded-2xl p-8 mb-8"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold font-heading text-white flex items-center gap-2">
                <Calendar className="w-5 h-5 text-green-500" />
                Upcoming Events
              </h2>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => refetchCalendar()}
                disabled={loadingCalendar}
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${loadingCalendar ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
            
            {loadingCalendar ? (
              <div className="text-center py-8">
                <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                <p className="text-muted-foreground">Loading events...</p>
              </div>
            ) : calendarEvents && calendarEvents.length > 0 ? (
              <ScrollArea className="h-[300px]">
                <div className="space-y-3">
                  {calendarEvents.map((event) => (
                    <div 
                      key={event.id}
                      className="flex items-center justify-between p-4 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                      data-testid={`event-${event.id}`}
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                          <Calendar className="w-5 h-5 text-green-500" />
                        </div>
                        <div>
                          <p className="text-white font-medium">{event.summary || 'No title'}</p>
                          <p className="text-sm text-muted-foreground flex items-center gap-2">
                            <Clock className="w-3 h-3" />
                            {formatEventTime(event)}
                          </p>
                        </div>
                      </div>
                      {event.htmlLink && (
                        <a 
                          href={event.htmlLink} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-muted-foreground hover:text-white transition-colors"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No upcoming events</p>
              </div>
            )}
          </motion.div>
        )}

        {/* Gmail Messages */}
        {integrationStatus?.gmail && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="glass-panel rounded-2xl p-8"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold font-heading text-white flex items-center gap-2">
                <Mail className="w-5 h-5 text-blue-500" />
                Recent Emails
              </h2>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => refetchGmail()}
                disabled={loadingGmail}
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${loadingGmail ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
            
            {loadingGmail ? (
              <div className="text-center py-8">
                <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                <p className="text-muted-foreground">Loading messages...</p>
              </div>
            ) : gmailMessages && gmailMessages.length > 0 ? (
              <ScrollArea className="h-[400px]">
                <div className="space-y-3">
                  {gmailMessages.map((message) => (
                    <div 
                      key={message.id}
                      className={`p-4 rounded-lg transition-colors ${
                        message.isUnread 
                          ? 'bg-blue-500/10 hover:bg-blue-500/15 border-l-2 border-blue-500' 
                          : 'bg-white/5 hover:bg-white/10'
                      }`}
                      data-testid={`email-${message.id}`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-medium ${
                            message.isUnread ? 'bg-blue-500' : 'bg-white/20'
                          }`}>
                            {message.fromName.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className={`font-medium ${message.isUnread ? 'text-white' : 'text-white/80'}`}>
                              {message.fromName}
                            </p>
                            <p className="text-xs text-muted-foreground">{message.fromEmail}</p>
                          </div>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {message.date ? format(new Date(message.date), 'MMM d, h:mm a') : ''}
                        </span>
                      </div>
                      <p className={`mb-1 ${message.isUnread ? 'text-white font-medium' : 'text-white/80'}`}>
                        {message.subject}
                      </p>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {message.snippet}
                      </p>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Mail className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No messages in inbox</p>
              </div>
            )}
          </motion.div>
        )}

        {/* No integrations message */}
        {!integrationStatus?.calendar && !integrationStatus?.gmail && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass-panel rounded-2xl p-12 text-center"
          >
            <Settings className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
            <h3 className="text-xl font-bold text-white mb-2">No Integrations Connected</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Connect your Google Calendar and Gmail to see your events and messages here.
              Contact your administrator to set up integrations.
            </p>
          </motion.div>
        )}
      </main>
    </div>
  );
}
