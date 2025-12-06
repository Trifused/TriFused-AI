import { db } from "../db";
import { eq } from "drizzle-orm";
import { 
  contactSubmissions, 
  diagnosticScans, 
  users,
  InsertContactSubmission, 
  InsertDiagnosticScan, 
  ContactSubmission, 
  DiagnosticScan,
  User,
  UpsertUser
} from "@shared/schema";

export interface IStorage {
  // User operations (required for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Contact form operations
  createContactSubmission(data: InsertContactSubmission): Promise<ContactSubmission>;
  
  // Diagnostic scan operations
  createDiagnosticScan(data: InsertDiagnosticScan): Promise<DiagnosticScan>;
}

class Storage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async createContactSubmission(data: InsertContactSubmission): Promise<ContactSubmission> {
    const [submission] = await db.insert(contactSubmissions).values(data).returning();
    return submission;
  }

  async createDiagnosticScan(data: InsertDiagnosticScan): Promise<DiagnosticScan> {
    const [scan] = await db.insert(diagnosticScans).values(data).returning();
    return scan;
  }
}

export const storage = new Storage();
