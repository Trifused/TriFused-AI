import { useAuth } from "@/hooks/useAuth";
import { AlertTriangle, X } from "lucide-react";
import { Button } from "./button";

export function ImpersonationBanner() {
  const { isImpersonating, originalUser, user, stopImpersonating } = useAuth();

  if (!isImpersonating) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-orange-500 text-black px-4 py-2" data-testid="impersonation-banner">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <AlertTriangle className="w-5 h-5" />
          <span className="font-medium">
            Viewing as: <strong>{user?.email || user?.id}</strong>
            {user?.role && <span className="ml-2 text-orange-900">({user.role})</span>}
          </span>
          <span className="text-orange-800 text-sm">
            — Logged in as {originalUser?.email}
          </span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => stopImpersonating()}
          className="text-black hover:bg-orange-600"
          data-testid="btn-stop-impersonating"
        >
          <X className="w-4 h-4 mr-1" />
          Stop Impersonating
        </Button>
      </div>
    </div>
  );
}
