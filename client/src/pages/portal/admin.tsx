import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { 
  LayoutDashboard, 
  LogOut, 
  Settings, 
  Users,
  Shield,
  Crown,
  UserCheck,
  UserX,
  ChevronLeft
} from "lucide-react";
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

interface User {
  id: string;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  profileImageUrl: string | null;
  role: string;
  createdAt: string;
  updatedAt: string;
}

export default function Admin() {
  const [, setLocation] = useLocation();
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: users, isLoading: usersLoading, error } = useQuery<User[]>({
    queryKey: ['/api/admin/users'],
    enabled: isAuthenticated && user?.role === 'superuser',
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
                <Users className="w-4 h-4" />
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

      <main className="container mx-auto px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold font-heading text-white mb-2 flex items-center gap-3">
            <Shield className="w-8 h-8 text-primary" />
            User Management
          </h1>
          <p className="text-muted-foreground">
            Manage user accounts and roles. Users with @trifused.com emails are automatically promoted to superuser.
          </p>
        </motion.div>

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
      </main>
    </div>
  );
}
