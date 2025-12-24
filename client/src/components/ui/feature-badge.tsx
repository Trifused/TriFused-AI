import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Lock, Sparkles, Clock } from "lucide-react";
import { FeatureStatus } from "@shared/feature-flags";

interface FeatureBadgeProps {
  status: FeatureStatus;
  tier?: 'basic' | 'pro' | 'enterprise' | 'api';
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function FeatureBadge({ status, tier, className, size = 'sm' }: FeatureBadgeProps) {
  if (status === 'free' || status === 'disabled') return null;

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 gap-1',
    md: 'text-sm px-2.5 py-1 gap-1.5',
    lg: 'text-base px-3 py-1.5 gap-2',
  };

  const iconSize = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  if (status === 'coming_soon') {
    return (
      <span
        className={cn(
          "inline-flex items-center font-medium rounded-full",
          "bg-amber-500/20 text-amber-400 border border-amber-500/30",
          sizeClasses[size],
          className
        )}
        data-testid="badge-coming-soon"
      >
        <Clock className={iconSize[size]} />
        Coming Soon
      </span>
    );
  }

  if (status === 'paid') {
    const tierColors: Record<string, string> = {
      basic: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      pro: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
      enterprise: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
      api: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
    };

    const tierLabels: Record<string, string> = {
      basic: 'Basic',
      pro: 'Pro',
      enterprise: 'Enterprise',
      api: 'API',
    };

    return (
      <span
        className={cn(
          "inline-flex items-center font-medium rounded-full border",
          tierColors[tier || 'basic'],
          sizeClasses[size],
          className
        )}
        data-testid={`badge-paid-${tier || 'basic'}`}
      >
        {tier === 'enterprise' ? (
          <Sparkles className={iconSize[size]} />
        ) : (
          <Lock className={iconSize[size]} />
        )}
        {tierLabels[tier || 'basic']}
      </span>
    );
  }

  return null;
}

interface FeatureGateProps {
  featureId: string;
  status: FeatureStatus;
  tier?: 'basic' | 'pro' | 'enterprise' | 'api';
  children: ReactNode;
  fallback?: ReactNode;
  showBadge?: boolean;
}

export function FeatureGate({ 
  status, 
  tier, 
  children, 
  fallback,
  showBadge = true 
}: FeatureGateProps) {
  if (status === 'free') {
    return <>{children}</>;
  }

  if (status === 'coming_soon') {
    return (
      <div className="relative">
        <div className="opacity-50 pointer-events-none select-none">
          {children}
        </div>
        {showBadge && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/50 backdrop-blur-sm rounded-lg">
            <FeatureBadge status="coming_soon" size="lg" />
          </div>
        )}
      </div>
    );
  }

  if (status === 'paid') {
    return fallback ? <>{fallback}</> : (
      <div className="relative">
        <div className="opacity-50 pointer-events-none select-none">
          {children}
        </div>
        {showBadge && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/50 backdrop-blur-sm rounded-lg">
            <div className="text-center">
              <FeatureBadge status="paid" tier={tier} size="lg" />
              <p className="mt-2 text-sm text-muted-foreground">
                Upgrade to unlock this feature
              </p>
            </div>
          </div>
        )}
      </div>
    );
  }

  return <>{children}</>;
}
