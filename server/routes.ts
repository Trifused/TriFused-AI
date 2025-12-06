import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertContactSubmissionSchema, insertDiagnosticScanSchema, userRoles, UserRole } from "@shared/schema";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { z } from "zod";

const SUPERUSER_EMAIL_DOMAIN = "@trifused.com";

const isSuperuser = async (req: any, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.claims?.sub;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    const user = await storage.getUser(userId);
    if (!user || user.role !== "superuser") {
      return res.status(403).json({ message: "Forbidden: Superuser access required" });
    }
    
    next();
  } catch (error) {
    console.error("Superuser check error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  await setupAuth(app);
  
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      let user = await storage.getUser(userId);
      
      if (user && user.email?.endsWith(SUPERUSER_EMAIL_DOMAIN) && user.role !== "superuser") {
        user = await storage.updateUserRole(userId, "superuser") || user;
      }
      
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  app.get('/api/admin/users', isAuthenticated, isSuperuser, async (req: any, res) => {
    try {
      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  const updateRoleSchema = z.object({
    role: z.enum(userRoles)
  });

  app.patch('/api/admin/users/:id/role', isAuthenticated, isSuperuser, async (req: any, res) => {
    try {
      const { id } = req.params;
      const { role } = updateRoleSchema.parse(req.body);
      
      const user = await storage.updateUserRole(id, role);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.json(user);
    } catch (error: any) {
      console.error("Error updating user role:", error);
      res.status(400).json({ message: error.message || "Failed to update user role" });
    }
  });
  
  app.post("/api/contact", async (req, res) => {
    try {
      const validatedData = insertContactSubmissionSchema.parse(req.body);
      const submission = await storage.createContactSubmission(validatedData);
      res.json({ success: true, id: submission.id });
    } catch (error: any) {
      console.error("Contact submission error:", error);
      res.status(400).json({ 
        success: false, 
        error: error.message || "Failed to submit contact form" 
      });
    }
  });

  app.post("/api/diagnostics", async (req, res) => {
    try {
      const validatedData = insertDiagnosticScanSchema.parse(req.body);
      const scan = await storage.createDiagnosticScan(validatedData);
      res.json({ success: true, id: scan.id });
    } catch (error: any) {
      console.error("Diagnostic scan error:", error);
      res.status(400).json({ 
        success: false, 
        error: error.message || "Failed to save diagnostic scan" 
      });
    }
  });

  return httpServer;
}
