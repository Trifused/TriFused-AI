export type FeatureStatus = 'free' | 'paid' | 'coming_soon';

export interface FeatureFlag {
  id: string;
  name: string;
  description: string;
  status: FeatureStatus;
  tier?: 'basic' | 'pro' | 'enterprise';
}

export const FEATURE_FLAGS: Record<string, FeatureFlag> = {
  // Website Grader Features
  GRADER_BASIC_SCAN: {
    id: 'grader_basic_scan',
    name: 'Basic Website Scan',
    description: 'SEO, security, performance, accessibility checks',
    status: 'free',
  },
  GRADER_COMPLIANCE_FDIC: {
    id: 'grader_compliance_fdic',
    name: 'FDIC Compliance Check',
    description: 'Check for FDIC member badges and disclosures',
    status: 'free',
  },
  GRADER_COMPLIANCE_SEC: {
    id: 'grader_compliance_sec',
    name: 'SEC Compliance Check',
    description: 'Investment advisor regulatory compliance',
    status: 'free',
  },
  GRADER_COMPLIANCE_ADA: {
    id: 'grader_compliance_ada',
    name: 'ADA Accessibility Check',
    description: 'Web accessibility compliance scanning',
    status: 'free',
  },
  GRADER_COMPLIANCE_PCI: {
    id: 'grader_compliance_pci',
    name: 'PCI-DSS Check',
    description: 'Payment card security compliance',
    status: 'free',
  },
  GRADER_COMPLIANCE_FCA: {
    id: 'grader_compliance_fca',
    name: 'FCA Compliance Check',
    description: 'UK financial conduct authority compliance',
    status: 'free',
  },
  GRADER_COMPLIANCE_GDPR: {
    id: 'grader_compliance_gdpr',
    name: 'GDPR Privacy Check',
    description: 'EU data privacy regulation compliance',
    status: 'free',
  },
  GRADER_VISION_DETECTION: {
    id: 'grader_vision_detection',
    name: 'AI Vision Detection',
    description: 'Use AI vision to detect compliance badges in images',
    status: 'coming_soon',
    tier: 'pro',
  },
  GRADER_SCHEDULED_SCANS: {
    id: 'grader_scheduled_scans',
    name: 'Scheduled Scans',
    description: 'Automatically scan websites on a schedule',
    status: 'coming_soon',
    tier: 'pro',
  },
  GRADER_BULK_SCANS: {
    id: 'grader_bulk_scans',
    name: 'Bulk Website Scans',
    description: 'Scan multiple websites at once',
    status: 'coming_soon',
    tier: 'enterprise',
  },
  GRADER_WHITE_LABEL: {
    id: 'grader_white_label',
    name: 'White Label Reports',
    description: 'Custom branded PDF reports',
    status: 'coming_soon',
    tier: 'enterprise',
  },
  GRADER_API_ACCESS: {
    id: 'grader_api_access',
    name: 'API Access',
    description: 'Programmatic access to grader functionality',
    status: 'coming_soon',
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

export function getFeaturesByStatus(status: FeatureStatus): FeatureFlag[] {
  return Object.values(FEATURE_FLAGS).filter(f => f.status === status);
}

export function getFeaturesByTier(tier: 'basic' | 'pro' | 'enterprise'): FeatureFlag[] {
  return Object.values(FEATURE_FLAGS).filter(f => f.tier === tier);
}
