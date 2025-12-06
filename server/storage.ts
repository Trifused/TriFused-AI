import { db } from "../db";
import { contactSubmissions, diagnosticScans, InsertContactSubmission, InsertDiagnosticScan, ContactSubmission, DiagnosticScan } from "@shared/schema";

export interface IStorage {
  // Contact form operations
  createContactSubmission(data: InsertContactSubmission): Promise<ContactSubmission>;
  
  // Diagnostic scan operations
  createDiagnosticScan(data: InsertDiagnosticScan): Promise<DiagnosticScan>;
}

class Storage implements IStorage {
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
