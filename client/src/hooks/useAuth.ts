import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import type { User } from "@shared/schema";

interface AuthUser extends User {
  isImpersonating?: boolean;
  originalUser?: {
    id: string;
    email: string | null;
    firstName: string | null;
    lastName: string | null;
    role: string;
  };
}

export function useAuth() {
  const queryClient = useQueryClient();
  const { data: user, isLoading } = useQuery<AuthUser>({
    queryKey: ["/api/auth/user"],
    retry: false,
  });

  const stopImpersonating = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/stop-impersonate", {
        method: "POST",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to stop impersonating");
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
    } catch (error) {
      console.error("Failed to stop impersonating:", error);
    }
  }, [queryClient]);

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    isImpersonating: user?.isImpersonating || false,
    originalUser: user?.originalUser,
    stopImpersonating,
  };
}
