import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertContactSubmissionSchema, insertDiagnosticScanSchema, userRoles, UserRole, InsertBlogPost, insertFileTransferSchema } from "@shared/schema";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { ObjectStorageService, ObjectNotFoundError } from "./objectStorage";
import { ObjectPermission } from "./objectAcl";
import { z } from "zod";
import { format } from "date-fns";

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

const hasFtpAccess = async (req: any, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.claims?.sub;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    const user = await storage.getUser(userId);
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }
    
    if (user.role === "superuser" || user.ftpAccess === 1) {
      next();
    } else {
      return res.status(403).json({ message: "Forbidden: MFT access required" });
    }
  } catch (error) {
    console.error("FTP access check error:", error);
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

  app.get("/api/blog", async (req, res) => {
    try {
      const posts = await storage.getBlogPosts();
      res.json(posts);
    } catch (error: any) {
      console.error("Blog fetch error:", error);
      res.status(500).json({ error: "Failed to fetch blog posts" });
    }
  });

  app.post("/api/blog/refresh", isAuthenticated, isSuperuser, async (req, res) => {
    try {
      const response = await fetch('https://blog.trifused.com/feeds/posts/default?alt=json&max-results=20');
      
      if (!response.ok) {
        throw new Error('Failed to fetch from Blogger');
      }

      const data = await response.json();
      const entries = data.feed.entry || [];

      await storage.clearBlogCache();

      const upsertedPosts = [];
      for (const entry of entries) {
        const link = entry.link.find((l: any) => l.rel === 'alternate')?.href || '#';
        const tags = entry.category?.map((c: any) => c.term) || [];
        const content = entry.content?.$t || entry.summary?.$t || "";
        const wordCount = content.split(/\s+/).length;
        const readTime = Math.ceil(wordCount / 200) + " min read";
        const rawExcerpt = content.replace(/<[^>]*>?/gm, "").substring(0, 200) + "...";
        const publishedDate = new Date(entry.published.$t);

        const blogPost: InsertBlogPost = {
          id: entry.id.$t,
          title: entry.title.$t,
          excerpt: rawExcerpt,
          content: content,
          author: entry.author?.[0]?.name?.$t || "TriFused",
          publishedAt: publishedDate,
          url: link,
          tags: tags.slice(0, 5),
          readTime: readTime,
        };

        const upserted = await storage.upsertBlogPost(blogPost);
        upsertedPosts.push(upserted);
      }

      res.json({ success: true, count: upsertedPosts.length });
    } catch (error: any) {
      console.error("Blog refresh error:", error);
      res.status(500).json({ error: "Failed to refresh blog cache" });
    }
  });

  app.get("/api/mft/files", isAuthenticated, hasFtpAccess, async (req: any, res) => {
    try {
      const prefix = req.query.prefix as string | undefined;
      const objectStorageService = new ObjectStorageService();
      const files = await objectStorageService.listObjects(prefix);
      res.json(files);
    } catch (error: any) {
      console.error("MFT list files error:", error);
      res.status(500).json({ error: "Failed to list files" });
    }
  });

  app.post("/api/mft/upload-url", isAuthenticated, hasFtpAccess, async (req: any, res) => {
    try {
      const objectStorageService = new ObjectStorageService();
      const uploadURL = await objectStorageService.getObjectEntityUploadURL();
      res.json({ uploadURL });
    } catch (error: any) {
      console.error("MFT upload URL error:", error);
      res.status(500).json({ error: "Failed to get upload URL" });
    }
  });

  app.post("/api/mft/upload-complete", isAuthenticated, hasFtpAccess, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { uploadURL, fileName, fileSize } = req.body;
      
      if (!uploadURL || !fileName) {
        return res.status(400).json({ error: "uploadURL and fileName are required" });
      }

      const objectStorageService = new ObjectStorageService();
      const objectPath = await objectStorageService.trySetObjectEntityAclPolicy(
        uploadURL,
        {
          owner: userId,
          visibility: "private",
        }
      );

      await storage.createFileTransfer({
        userId,
        fileName,
        fileSize: fileSize || 0,
        operation: "upload",
        status: "success",
      });

      res.json({ success: true, objectPath });
    } catch (error: any) {
      console.error("MFT upload complete error:", error);
      res.status(500).json({ error: "Failed to complete upload" });
    }
  });

  app.get("/api/mft/download/:path(*)", isAuthenticated, hasFtpAccess, async (req: any, res) => {
    try {
      const objectPath = req.params.path;
      const userId = req.user.claims.sub;
      const objectStorageService = new ObjectStorageService();
      
      const downloadURL = await objectStorageService.getDownloadURL(objectPath);
      
      await storage.createFileTransfer({
        userId,
        fileName: objectPath.split('/').pop() || objectPath,
        fileSize: 0,
        operation: "download",
        status: "success",
      });

      res.json({ downloadURL });
    } catch (error: any) {
      console.error("MFT download error:", error);
      if (error instanceof ObjectNotFoundError) {
        return res.status(404).json({ error: "File not found" });
      }
      res.status(500).json({ error: "Failed to get download URL" });
    }
  });

  app.delete("/api/mft/files/:path(*)", isAuthenticated, hasFtpAccess, async (req: any, res) => {
    try {
      const objectPath = req.params.path;
      const userId = req.user.claims.sub;
      const objectStorageService = new ObjectStorageService();
      
      await objectStorageService.deleteObject(objectPath);
      
      await storage.createFileTransfer({
        userId,
        fileName: objectPath.split('/').pop() || objectPath,
        fileSize: 0,
        operation: "delete",
        status: "success",
      });

      res.json({ success: true });
    } catch (error: any) {
      console.error("MFT delete error:", error);
      res.status(500).json({ error: "Failed to delete file" });
    }
  });

  app.get("/api/mft/transfers", isAuthenticated, hasFtpAccess, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const transfers = await storage.getFileTransfers(userId);
      res.json(transfers);
    } catch (error: any) {
      console.error("MFT transfers error:", error);
      res.status(500).json({ error: "Failed to get transfer history" });
    }
  });

  app.patch('/api/admin/users/:id/ftp-access', isAuthenticated, isSuperuser, async (req: any, res) => {
    try {
      const { id } = req.params;
      const { ftpAccess } = req.body;
      
      if (ftpAccess !== 0 && ftpAccess !== 1) {
        return res.status(400).json({ message: "ftpAccess must be 0 or 1" });
      }
      
      const user = await storage.updateUserFtpAccess(id, ftpAccess);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.json(user);
    } catch (error: any) {
      console.error("Error updating user FTP access:", error);
      res.status(400).json({ message: error.message || "Failed to update FTP access" });
    }
  });

  app.get("/public-objects/:filePath(*)", async (req, res) => {
    const filePath = req.params.filePath;
    const objectStorageService = new ObjectStorageService();
    try {
      const file = await objectStorageService.searchPublicObject(filePath);
      if (!file) {
        return res.status(404).json({ error: "File not found" });
      }
      objectStorageService.downloadObject(file, res);
    } catch (error) {
      console.error("Error searching for public object:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  return httpServer;
}
