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
