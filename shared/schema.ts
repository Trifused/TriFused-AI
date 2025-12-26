import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer, index, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User roles enum
export const userRoles = ["guest", "validated", "superuser"] as const;
export type UserRole = typeof userRoles[number];

// User status enum
export const userStatuses = ["active", "suspended", "banned", "pending", "deleted"] as const;
export type UserStatus = typeof userStatuses[number];

// User storage table for Replit Auth
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  role: varchar("role").default("guest").notNull(),
  status: varchar("status").default("active").notNull(),
  ftpAccess: integer("ftp_access").default(0).notNull(),
  stripeCustomerId: varchar("stripe_customer_id"),
  stripeSubscriptionId: varchar("stripe_subscription_id"),
  termsAcceptedAt: timestamp("terms_accepted_at"),
  termsVersion: varchar("terms_version"),
  lastLoginAt: timestamp("last_login_at"),
  suspendedAt: timestamp("suspended_at"),
  suspendedReason: text("suspended_reason"),
  deletedAt: timestamp("deleted_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

// User activity logs for audit trail
export const userActivityLogs = pgTable("user_activity_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  action: varchar("action").notNull(),
  details: jsonb("details"),
  ipAddress: varchar("ip_address"),
  userAgent: text("user_agent"),
  performedBy: varchar("performed_by"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertUserActivityLogSchema = createInsertSchema(userActivityLogs).omit({
  id: true,
  createdAt: true,
});

export type InsertUserActivityLog = z.infer<typeof insertUserActivityLogSchema>;
export type UserActivityLog = typeof userActivityLogs.$inferSelect;

// Contact form submissions
export const contactSubmissions = pgTable("contact_submissions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  email: text("email").notNull(),
  company: text("company"),
  message: text("message").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertContactSubmissionSchema = createInsertSchema(contactSubmissions).omit({
  id: true,
  createdAt: true,
});

export type InsertContactSubmission = z.infer<typeof insertContactSubmissionSchema>;
export type ContactSubmission = typeof contactSubmissions.$inferSelect;

// Diagnostic scan analytics (anonymized)
export const diagnosticScans = pgTable("diagnostic_scans", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  platform: text("platform"),
  userAgent: text("user_agent"),
  screenResolution: text("screen_resolution"),
  isSecure: integer("is_secure"), // 1 for true, 0 for false
  browserCores: integer("browser_cores"),
  scannedAt: timestamp("scanned_at").defaultNow().notNull(),
});

export const insertDiagnosticScanSchema = createInsertSchema(diagnosticScans).omit({
  id: true,
  scannedAt: true,
});

export type InsertDiagnosticScan = z.infer<typeof insertDiagnosticScanSchema>;
export type DiagnosticScan = typeof diagnosticScans.$inferSelect;

// Cached blog posts from Blogger
export const blogPosts = pgTable("blog_posts", {
  id: varchar("id").primaryKey(),
  title: text("title").notNull(),
  excerpt: text("excerpt").notNull(),
  content: text("content"),
  author: text("author"),
  publishedAt: timestamp("published_at").notNull(),
  url: text("url").notNull(),
  tags: text("tags").array(),
  readTime: text("read_time"),
  cachedAt: timestamp("cached_at").defaultNow().notNull(),
});

export const insertBlogPostSchema = createInsertSchema(blogPosts).omit({
  cachedAt: true,
});

export type InsertBlogPost = z.infer<typeof insertBlogPostSchema>;
export type BlogPost = typeof blogPosts.$inferSelect;

// File transfers log for MFT service
export const fileTransfers = pgTable("file_transfers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  fileName: text("file_name").notNull(),
  fileSize: integer("file_size"),
  operation: text("operation").notNull(),
  status: text("status").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertFileTransferSchema = createInsertSchema(fileTransfers).omit({
  id: true,
  createdAt: true,
});

export type InsertFileTransfer = z.infer<typeof insertFileTransferSchema>;
export type FileTransfer = typeof fileTransfers.$inferSelect;

// Storage connections for MFT (S3-compatible storage configs)
export const storageConnections = pgTable("storage_connections", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  type: text("type").notNull(),
  config: jsonb("config"),
  isDefault: integer("is_default").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertStorageConnectionSchema = createInsertSchema(storageConnections).omit({
  id: true,
  createdAt: true,
});

export type InsertStorageConnection = z.infer<typeof insertStorageConnectionSchema>;
export type StorageConnection = typeof storageConnections.$inferSelect;

// Email subscribers for newsletter/early access
export const emailSubscribers = pgTable("email_subscribers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull().unique(),
  subscribedAt: timestamp("subscribed_at").defaultNow().notNull(),
});

export const insertEmailSubscriberSchema = createInsertSchema(emailSubscribers).omit({
  id: true,
  subscribedAt: true,
});

export type InsertEmailSubscriber = z.infer<typeof insertEmailSubscriberSchema>;
export type EmailSubscriber = typeof emailSubscribers.$inferSelect;

// Service leads - enriched lead capture from signup page
export const serviceLeads = pgTable("service_leads", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull(),
  serviceInterests: text("service_interests").array(),
  businessName: text("business_name"),
  phoneNumber: text("phone_number"),
  message: text("message"),
  needHelpAsap: integer("need_help_asap").default(0),
  ipAddress: text("ip_address"),
  geoCity: text("geo_city"),
  geoRegion: text("geo_region"),
  geoCountry: text("geo_country"),
  geoTimezone: text("geo_timezone"),
  userAgent: text("user_agent"),
  referrer: text("referrer"),
  clickPath: jsonb("click_path"),
  pageViews: text("page_views").array(),
  sessionDuration: integer("session_duration"),
  utmParams: jsonb("utm_params"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertServiceLeadSchema = createInsertSchema(serviceLeads).omit({
  id: true,
  createdAt: true,
});

export type InsertServiceLead = z.infer<typeof insertServiceLeadSchema>;
export type ServiceLead = typeof serviceLeads.$inferSelect;

// Chat conversations for AI assistant
export const chatMessages = pgTable("chat_messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sessionId: varchar("session_id").notNull(),
  role: varchar("role").notNull(), // "user" or "assistant"
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertChatMessageSchema = createInsertSchema(chatMessages).omit({
  id: true,
  createdAt: true,
});

export type InsertChatMessage = z.infer<typeof insertChatMessageSchema>;
export type ChatMessage = typeof chatMessages.$inferSelect;

// Chat leads captured from AI conversations
export const chatLeads = pgTable("chat_leads", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sessionId: varchar("session_id").notNull(),
  name: text("name").notNull(),
  contactMethod: text("contact_method").notNull(), // "email", "phone", "linkedin", etc.
  contactValue: text("contact_value").notNull(),
  inquiry: text("inquiry").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertChatLeadSchema = createInsertSchema(chatLeads).omit({
  id: true,
  createdAt: true,
});

export type InsertChatLead = z.infer<typeof insertChatLeadSchema>;
export type ChatLead = typeof chatLeads.$inferSelect;

// Media status enum
export const mediaStatuses = ["private", "pending", "public"] as const;
export type MediaStatus = typeof mediaStatuses[number];

// Media types enum
export const mediaTypes = ["video", "audio"] as const;
export type MediaType = typeof mediaTypes[number];

// Media items (videos and audio)
export const mediaItems = pgTable("media_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description"),
  type: varchar("type").notNull(), // "video" or "audio"
  url: text("url").notNull(), // Storage URL
  thumbnailUrl: text("thumbnail_url"),
  duration: integer("duration"), // Duration in seconds
  fileSize: integer("file_size"), // Size in bytes
  status: varchar("status").default("private").notNull(), // "private", "pending", "public"
  uploadedBy: varchar("uploaded_by").notNull(), // User ID
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertMediaItemSchema = createInsertSchema(mediaItems).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertMediaItem = z.infer<typeof insertMediaItemSchema>;
export type MediaItem = typeof mediaItems.$inferSelect;

// Media shares - tracks who media is shared with
export const mediaShares = pgTable("media_shares", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  mediaId: varchar("media_id").notNull(),
  sharedWithUserId: varchar("shared_with_user_id"), // Null if shared via invite email
  sharedWithEmail: text("shared_with_email"), // For inviting new users
  sharedByUserId: varchar("shared_by_user_id").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertMediaShareSchema = createInsertSchema(mediaShares).omit({
  id: true,
  createdAt: true,
});

export type InsertMediaShare = z.infer<typeof insertMediaShareSchema>;
export type MediaShare = typeof mediaShares.$inferSelect;

// Website grades from the Website Grader tool (also serves as lead data)
export const websiteGrades = pgTable("website_grades", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  url: text("url").notNull(),
  email: text("email"),
  overallScore: integer("overall_score").notNull(),
  seoScore: integer("seo_score").notNull(),
  securityScore: integer("security_score").notNull(),
  performanceScore: integer("performance_score").notNull(),
  keywordsScore: integer("keywords_score").notNull(),
  accessibilityScore: integer("accessibility_score").notNull().default(100),
  emailSecurityScore: integer("email_security_score").default(0),
  mobileScore: integer("mobile_score").default(0),
  // Compliance scores (null if not checked)
  fdicScore: integer("fdic_score"),
  secScore: integer("sec_score"),
  adaScore: integer("ada_score"),
  pciScore: integer("pci_score"),
  fcaScore: integer("fca_score"),
  gdprScore: integer("gdpr_score"),
  complianceFlags: jsonb("compliance_flags"),
  findings: jsonb("findings").notNull(),
  companyName: text("company_name"),
  companyDescription: text("company_description"),
  domain: text("domain"),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  hostIp: text("host_ip"),
  hostCountry: text("host_country"),
  hostCity: text("host_city"),
  hostRegion: text("host_region"),
  hostAsn: text("host_asn"),
  hostProvider: text("host_provider"),
  mxRecords: jsonb("mx_records"),
  spfRecord: text("spf_record"),
  dkimSelector: text("dkim_selector"),
  dmarcRecord: text("dmarc_record"),
  blacklistStatus: text("blacklist_status"),
  blacklistDetails: jsonb("blacklist_details"),
  domainAge: text("domain_age"),
  contentLastModified: text("content_last_modified"),
  shareToken: varchar("share_token").unique(),
  objectStorageKey: text("object_storage_key"),
  qrCodeData: text("qr_code_data"),
  viewCount: integer("view_count").default(0),
  downloadCount: integer("download_count").default(0),
  lastViewedAt: timestamp("last_viewed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertWebsiteGradeSchema = createInsertSchema(websiteGrades).omit({
  id: true,
  createdAt: true,
});

export type InsertWebsiteGrade = z.infer<typeof insertWebsiteGradeSchema>;
export type WebsiteGrade = typeof websiteGrades.$inferSelect;

// Report event types
export const reportEventTypes = ["view", "pdf_download"] as const;
export type ReportEventType = typeof reportEventTypes[number];

// Report events for tracking views and downloads
export const reportEvents = pgTable("report_events", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  websiteGradeId: varchar("website_grade_id").notNull(),
  shareToken: varchar("share_token").notNull(),
  eventType: varchar("event_type").notNull(), // "view" or "pdf_download"
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  referrer: text("referrer"),
  metadata: jsonb("metadata"),
  triggeredAt: timestamp("triggered_at").defaultNow().notNull(),
});

export const insertReportEventSchema = createInsertSchema(reportEvents).omit({
  id: true,
  triggeredAt: true,
});

export type InsertReportEvent = z.infer<typeof insertReportEventSchema>;
export type ReportEvent = typeof reportEvents.$inferSelect;

// API Keys for users
export const apiKeys = pgTable("api_keys", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  name: text("name").notNull(),
  keyHash: text("key_hash").notNull(),
  keyPrefix: varchar("key_prefix", { length: 12 }).notNull(),
  lastUsedAt: timestamp("last_used_at"),
  expiresAt: timestamp("expires_at"),
  isActive: integer("is_active").default(1).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertApiKeySchema = createInsertSchema(apiKeys).omit({
  id: true,
  createdAt: true,
  lastUsedAt: true,
});

export type InsertApiKey = z.infer<typeof insertApiKeySchema>;
export type ApiKey = typeof apiKeys.$inferSelect;

// API Tiers - defines subscription tier levels with quotas and features
export const apiTierNames = ["free", "starter", "pro", "enterprise"] as const;
export type ApiTierName = typeof apiTierNames[number];

export const apiTiers = pgTable("api_tiers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull().unique(),
  displayName: varchar("display_name").notNull(),
  monthlyLimit: integer("monthly_limit").notNull(),
  dailyLimit: integer("daily_limit").notNull(),
  gtmetrixEnabled: integer("gtmetrix_enabled").default(0).notNull(),
  gtmetrixCost: integer("gtmetrix_cost").default(3).notNull(),
  basicScanCost: integer("basic_scan_cost").default(1).notNull(),
  bulkScansEnabled: integer("bulk_scans_enabled").default(0).notNull(),
  whitelabelEnabled: integer("whitelabel_enabled").default(0).notNull(),
  prioritySupport: integer("priority_support").default(0).notNull(),
  priceMonthly: integer("price_monthly").default(0).notNull(),
  priceYearly: integer("price_yearly").default(0).notNull(),
  stripePriceIdMonthly: varchar("stripe_price_id_monthly"),
  stripePriceIdYearly: varchar("stripe_price_id_yearly"),
  sortOrder: integer("sort_order").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertApiTierSchema = createInsertSchema(apiTiers).omit({
  id: true,
  createdAt: true,
});

export type InsertApiTier = z.infer<typeof insertApiTierSchema>;
export type ApiTier = typeof apiTiers.$inferSelect;

// API Quotas - tracks available calls per user
export const apiQuotas = pgTable("api_quotas", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().unique(),
  tierId: varchar("tier_id"),
  totalCalls: integer("total_calls").default(0).notNull(),
  usedCalls: integer("used_calls").default(0).notNull(),
  subscriptionCalls: integer("subscription_calls").default(0).notNull(),
  packCalls: integer("pack_calls").default(0).notNull(),
  dailyUsed: integer("daily_used").default(0).notNull(),
  monthlyUsed: integer("monthly_used").default(0).notNull(),
  lastDailyReset: timestamp("last_daily_reset").defaultNow(),
  lastMonthlyReset: timestamp("last_monthly_reset").defaultNow(),
  resetAt: timestamp("reset_at"),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertApiQuotaSchema = createInsertSchema(apiQuotas).omit({
  id: true,
  updatedAt: true,
});

export type InsertApiQuota = z.infer<typeof insertApiQuotaSchema>;
export type ApiQuota = typeof apiQuotas.$inferSelect;

// API Usage logs - detailed call history
export const apiUsageLogs = pgTable("api_usage_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  apiKeyId: varchar("api_key_id").notNull(),
  endpoint: text("endpoint").notNull(),
  method: text("method").notNull(),
  statusCode: integer("status_code"),
  responseTimeMs: integer("response_time_ms"),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  metadata: jsonb("metadata"),
  calledAt: timestamp("called_at").defaultNow().notNull(),
});

export const insertApiUsageLogSchema = createInsertSchema(apiUsageLogs).omit({
  id: true,
  calledAt: true,
});

export type InsertApiUsageLog = z.infer<typeof insertApiUsageLogSchema>;
export type ApiUsageLog = typeof apiUsageLogs.$inferSelect;

// API Call Pack purchases - tracks one-time pack purchases
export const apiCallPacks = pgTable("api_call_packs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  packSize: integer("pack_size").notNull(),
  callsRemaining: integer("calls_remaining").notNull(),
  stripeSessionId: varchar("stripe_session_id"),
  purchasedAt: timestamp("purchased_at").defaultNow().notNull(),
  expiresAt: timestamp("expires_at"),
});

export const insertApiCallPackSchema = createInsertSchema(apiCallPacks).omit({
  id: true,
  purchasedAt: true,
});

export type InsertApiCallPack = z.infer<typeof insertApiCallPackSchema>;
export type ApiCallPack = typeof apiCallPacks.$inferSelect;

// Report subscription visibility types
export const reportVisibilities = ["public", "private"] as const;
export type ReportVisibility = typeof reportVisibilities[number];

// Report subscription statuses
export const reportSubscriptionStatuses = ["active", "pending", "expired", "cancelled"] as const;
export type ReportSubscriptionStatus = typeof reportSubscriptionStatuses[number];

// Report subscriptions - tracks companies who purchased the Website Grade Report product
export const reportSubscriptions = pgTable("report_subscriptions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  slug: varchar("slug").notNull().unique(),
  targetUrl: text("target_url"),
  companyName: text("company_name"),
  brandColor: varchar("brand_color", { length: 7 }).default("#00d4ff"),
  logoUrl: text("logo_url"),
  visibility: varchar("visibility").default("public").notNull(),
  status: varchar("status").default("pending").notNull(),
  stripeSubscriptionId: varchar("stripe_subscription_id"),
  lastScannedAt: timestamp("last_scanned_at"),
  cachedGradeId: varchar("cached_grade_id"),
  embedEnabled: integer("embed_enabled").default(1).notNull(),
  apiEnabled: integer("api_enabled").default(1).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  expiresAt: timestamp("expires_at"),
});

export const insertReportSubscriptionSchema = createInsertSchema(reportSubscriptions).omit({
  id: true,
  createdAt: true,
});

export type InsertReportSubscription = z.infer<typeof insertReportSubscriptionSchema>;
export type ReportSubscription = typeof reportSubscriptions.$inferSelect;

// User websites - tracks websites users have added for scanning
export const userWebsites = pgTable("user_websites", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  url: text("url").notNull(),
  name: text("name"),
  lastScannedAt: timestamp("last_scanned_at"),
  lastGradeId: varchar("last_grade_id"),
  lastShareToken: varchar("last_share_token"),
  lastScore: integer("last_score"),
  scanCount: integer("scan_count").default(0).notNull(),
  isActive: integer("is_active").default(1).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertUserWebsiteSchema = createInsertSchema(userWebsites).omit({
  id: true,
  createdAt: true,
  lastScannedAt: true,
  lastGradeId: true,
  lastShareToken: true,
  lastScore: true,
  scanCount: true,
});

export type InsertUserWebsite = z.infer<typeof insertUserWebsiteSchema>;
export type UserWebsite = typeof userWebsites.$inferSelect;

// User website scans - links user websites to their scan results (ownership tracking)
export const userWebsiteScans = pgTable("user_website_scans", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userWebsiteId: varchar("user_website_id").notNull(),
  gradeId: varchar("grade_id").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertUserWebsiteScanSchema = createInsertSchema(userWebsiteScans).omit({
  id: true,
  createdAt: true,
});

export type InsertUserWebsiteScan = z.infer<typeof insertUserWebsiteScanSchema>;
export type UserWebsiteScan = typeof userWebsiteScans.$inferSelect;

// Backlink tracking for superuser management
export const backlinkStatuses = ["pending", "verified", "broken", "removed"] as const;
export type BacklinkStatus = typeof backlinkStatuses[number];

export const backlinks = pgTable("backlinks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  url: text("url").notNull(),
  targetUrl: text("target_url").default("https://trifused.com").notNull(),
  status: varchar("status").default("pending").notNull(),
  siteName: text("site_name"),
  notes: text("notes"),
  lastCheckedAt: timestamp("last_checked_at"),
  verifiedAt: timestamp("verified_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertBacklinkSchema = createInsertSchema(backlinks).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  lastCheckedAt: true,
  verifiedAt: true,
});

export type InsertBacklink = z.infer<typeof insertBacklinkSchema>;
export type Backlink = typeof backlinks.$inferSelect;
