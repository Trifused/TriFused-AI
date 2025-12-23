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

// User storage table for Replit Auth
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  role: varchar("role").default("guest").notNull(),
  ftpAccess: integer("ftp_access").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

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
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertWebsiteGradeSchema = createInsertSchema(websiteGrades).omit({
  id: true,
  createdAt: true,
});

export type InsertWebsiteGrade = z.infer<typeof insertWebsiteGradeSchema>;
export type WebsiteGrade = typeof websiteGrades.$inferSelect;
