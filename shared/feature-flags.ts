export type FeatureStatus = 'free' | 'paid' | 'coming_soon' | 'disabled';

export type FeatureCategory = 'grader' | 'api' | 'payments' | 'portal' | 'reports';

export interface FeatureFlag {
  id: string;
  name: string;
  description: string;
  status: FeatureStatus;
  category: FeatureCategory;
  tier?: 'basic' | 'pro' | 'enterprise' | 'api';
  price?: string;
}

export const FEATURE_FLAGS: Record<string, FeatureFlag> = {
  // ===== GRADER FEATURES =====
  GRADER_BASIC_SCAN: {
    id: 'grader_basic_scan',
    name: 'Basic Website Scan',
    description: 'SEO, security, performance, accessibility checks',
    status: 'free',
    category: 'grader',
  },
  GRADER_COMPLIANCE_FDIC: {
    id: 'grader_compliance_fdic',
    name: 'FDIC Compliance Check',
    description: 'Check for FDIC member badges and disclosures',
    status: 'free',
    category: 'grader',
  },
  GRADER_COMPLIANCE_SEC: {
    id: 'grader_compliance_sec',
    name: 'SEC Compliance Check',
    description: 'Investment advisor regulatory compliance',
    status: 'free',
    category: 'grader',
  },
  GRADER_COMPLIANCE_ADA: {
    id: 'grader_compliance_ada',
    name: 'ADA Accessibility Check',
    description: 'Web accessibility compliance scanning',
    status: 'free',
    category: 'grader',
  },
  GRADER_COMPLIANCE_PCI: {
    id: 'grader_compliance_pci',
    name: 'PCI-DSS Check',
    description: 'Payment card security compliance',
    status: 'free',
    category: 'grader',
  },
  GRADER_COMPLIANCE_FCA: {
    id: 'grader_compliance_fca',
    name: 'FCA Compliance Check',
    description: 'UK financial conduct authority compliance',
    status: 'free',
    category: 'grader',
  },
  GRADER_COMPLIANCE_GDPR: {
    id: 'grader_compliance_gdpr',
    name: 'GDPR Privacy Check',
    description: 'EU data privacy regulation compliance',
    status: 'free',
    category: 'grader',
  },
  GRADER_LIGHTHOUSE: {
    id: 'grader_lighthouse',
    name: 'Google Lighthouse Integration',
    description: 'Core Web Vitals and performance scoring powered by Google Lighthouse',
    status: 'coming_soon',
    category: 'grader',
    tier: 'pro',
  },
  GRADER_GTMETRIX: {
    id: 'grader_gtmetrix',
    name: 'GTmetrix Premium Scans',
    description: 'Advanced performance testing with multi-location support via GTmetrix API',
    status: 'coming_soon',
    category: 'grader',
    tier: 'pro',
  },
  GRADER_VISION_DETECTION: {
    id: 'grader_vision_detection',
    name: 'AI Vision Detection',
    description: 'Use AI vision to detect compliance badges in images',
    status: 'coming_soon',
    category: 'grader',
    tier: 'pro',
  },
  GRADER_SCHEDULED_SCANS: {
    id: 'grader_scheduled_scans',
    name: 'Scheduled Scans',
    description: 'Automatically scan websites on a schedule',
    status: 'coming_soon',
    category: 'grader',
    tier: 'pro',
  },
  GRADER_MULTI_SITE: {
    id: 'grader_multi_site',
    name: 'Multi-Site Monitoring',
    description: 'Monitor multiple websites from a single dashboard',
    status: 'coming_soon',
    category: 'grader',
    tier: 'pro',
  },
  GRADER_BULK_SCANS: {
    id: 'grader_bulk_scans',
    name: 'Bulk Website Scans',
    description: 'Scan multiple websites at once',
    status: 'coming_soon',
    category: 'grader',
    tier: 'enterprise',
  },

  // ===== REPORT FEATURES =====
  REPORT_BASIC: {
    id: 'report_basic',
    name: 'Basic Report',
    description: 'Standard scan results with shareable link',
    status: 'free',
    category: 'reports',
  },
  REPORT_AI_ADVANCED: {
    id: 'report_ai_advanced',
    name: 'Advanced AI Compliance Report',
    description: 'One-time purchase for AI-powered visual compliance analysis',
    status: 'coming_soon',
    category: 'reports',
    tier: 'basic',
    price: '$9.99',
  },
  REPORT_WHITE_LABEL: {
    id: 'report_white_label',
    name: 'White Label Reports',
    description: 'Custom branded PDF reports for agencies',
    status: 'coming_soon',
    category: 'reports',
    tier: 'enterprise',
  },
  REPORT_PDF_EXPORT: {
    id: 'report_pdf_export',
    name: 'PDF Export',
    description: 'Download reports as professional PDF documents',
    status: 'coming_soon',
    category: 'reports',
    tier: 'pro',
  },

  // ===== API FEATURES =====
  API_ACCESS: {
    id: 'api_access',
    name: 'TrifusedAI API',
    description: 'Programmatic access to website scoring via REST API',
    status: 'coming_soon',
    category: 'api',
    tier: 'api',
    price: '$25.67/year',
  },
  API_REPORT_CARD_SUBSCRIPTION: {
    id: 'api_report_card_subscription',
    name: 'Website Report Card API - 1K Calls',
    description: 'Monthly subscription for automated website health scoring with 1000 API calls',
    status: 'paid',
    category: 'api',
    tier: 'api',
    price: '$29.99/month',
  },
  API_CALL_PACK_1K: {
    id: 'api_call_pack_1k',
    name: '1K API Call Pack',
    description: 'Additional 1000 API calls for your subscription (no expiration)',
    status: 'paid',
    category: 'api',
    tier: 'api',
    price: '$14.99',
  },
  API_SCORE_ENDPOINT: {
    id: 'api_score_endpoint',
    name: 'POST /v1/score Endpoint',
    description: 'Machine-callable website health check with deployment gate',
    status: 'coming_soon',
    category: 'api',
    tier: 'api',
  },
  API_LIGHTHOUSE_MODE: {
    id: 'api_lighthouse_mode',
    name: 'Lighthouse Mode (API)',
    description: 'Include Google Lighthouse data in API responses',
    status: 'coming_soon',
    category: 'api',
    tier: 'api',
  },
  API_CICD_INTEGRATIONS: {
    id: 'api_cicd_integrations',
    name: 'CI/CD Integrations',
    description: 'GitHub Actions, Jenkins, GitLab CI integration support',
    status: 'coming_soon',
    category: 'api',
    tier: 'api',
  },

  // ===== PAYMENT FEATURES =====
  PAYMENTS_STRIPE: {
    id: 'payments_stripe',
    name: 'Stripe Payments',
    description: 'Accept payments via Stripe',
    status: 'free',
    category: 'payments',
  },
  PAYMENTS_ONE_TIME: {
    id: 'payments_one_time',
    name: 'One-Time Purchases',
    description: 'Pay-per-report for Advanced AI Reports',
    status: 'coming_soon',
    category: 'payments',
  },
  PAYMENTS_SUBSCRIPTIONS: {
    id: 'payments_subscriptions',
    name: 'Subscription Plans',
    description: 'Monthly subscription for multi-site and scheduled scans',
    status: 'coming_soon',
    category: 'payments',
  },
  PAYMENTS_API_TIER: {
    id: 'payments_api_tier',
    name: 'API Access Tier',
    description: '$25.67/year for 1000 API calls/month',
    status: 'coming_soon',
    category: 'payments',
    price: '$25.67/year',
  },

  // ===== PORTAL FEATURES =====
  PORTAL_USER_ACCOUNTS: {
    id: 'portal_user_accounts',
    name: 'User Accounts',
    description: 'User registration and authentication',
    status: 'free',
    category: 'portal',
  },
  PORTAL_SCAN_HISTORY: {
    id: 'portal_scan_history',
    name: 'Scan History',
    description: 'View past scans and reports in dashboard',
    status: 'free',
    category: 'portal',
  },
  PORTAL_API_KEYS: {
    id: 'portal_api_keys',
    name: 'API Key Management',
    description: 'Generate and manage API keys',
    status: 'coming_soon',
    category: 'portal',
    tier: 'api',
  },
  PORTAL_USAGE_STATS: {
    id: 'portal_usage_stats',
    name: 'Usage Statistics',
    description: 'Track API usage and quota consumption',
    status: 'coming_soon',
    category: 'portal',
    tier: 'api',
  },
  PORTAL_TEAM_SEATS: {
    id: 'portal_team_seats',
    name: 'Team Seats',
    description: 'Add team members to your account',
    status: 'coming_soon',
    category: 'portal',
    tier: 'enterprise',
  },
};

export function isFeatureAvailable(featureId: keyof typeof FEATURE_FLAGS): boolean {
  const flag = FEATURE_FLAGS[featureId];
  return flag?.status === 'free' || flag?.status === 'paid';
}

export function isFeaturePaid(featureId: keyof typeof FEATURE_FLAGS): boolean {
  const flag = FEATURE_FLAGS[featureId];
  return flag?.status === 'paid';
}

export function isFeatureComingSoon(featureId: keyof typeof FEATURE_FLAGS): boolean {
  const flag = FEATURE_FLAGS[featureId];
  return flag?.status === 'coming_soon';
}

export function isFeatureDisabled(featureId: keyof typeof FEATURE_FLAGS): boolean {
  const flag = FEATURE_FLAGS[featureId];
  return flag?.status === 'disabled';
}

export function getFeaturesByStatus(status: FeatureStatus): FeatureFlag[] {
  return Object.values(FEATURE_FLAGS).filter(f => f.status === status);
}

export function getFeaturesByCategory(category: FeatureCategory): FeatureFlag[] {
  return Object.values(FEATURE_FLAGS).filter(f => f.category === category);
}

export function getFeaturesByTier(tier: 'basic' | 'pro' | 'enterprise' | 'api'): FeatureFlag[] {
  return Object.values(FEATURE_FLAGS).filter(f => f.tier === tier);
}

export function getComingSoonFeatures(): FeatureFlag[] {
  return Object.values(FEATURE_FLAGS).filter(f => f.status === 'coming_soon');
}

export function getPaidFeatures(): FeatureFlag[] {
  return Object.values(FEATURE_FLAGS).filter(f => f.status === 'paid' || f.tier);
}
