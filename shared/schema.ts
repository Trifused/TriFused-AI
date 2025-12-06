import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

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
