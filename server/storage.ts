import { db } from "../db";
import { eq, desc } from "drizzle-orm";
import { 
  contactSubmissions, 
  diagnosticScans, 
  users,
  blogPosts,
  fileTransfers,
  storageConnections,
  emailSubscribers,
  chatMessages,
  chatLeads,
  InsertContactSubmission, 
  InsertDiagnosticScan, 
  ContactSubmission, 
  DiagnosticScan,
  User,
  UpsertUser,
  UserRole,
  BlogPost,
  InsertBlogPost,
  FileTransfer,
  InsertFileTransfer,
  StorageConnection,
  InsertStorageConnection,
  EmailSubscriber,
  InsertEmailSubscriber,
  ChatMessage,
  InsertChatMessage,
  ChatLead,
  InsertChatLead
} from "@shared/schema";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  getAllUsers(): Promise<User[]>;
  updateUserRole(id: string, role: UserRole): Promise<User | undefined>;
  updateUserFtpAccess(id: string, ftpAccess: number): Promise<User | undefined>;
  
  createContactSubmission(data: InsertContactSubmission): Promise<ContactSubmission>;
  createDiagnosticScan(data: InsertDiagnosticScan): Promise<DiagnosticScan>;
  
  getBlogPosts(): Promise<BlogPost[]>;
  upsertBlogPost(data: InsertBlogPost): Promise<BlogPost>;
  clearBlogCache(): Promise<void>;
  
  createFileTransfer(data: InsertFileTransfer): Promise<FileTransfer>;
  getFileTransfers(userId: string): Promise<FileTransfer[]>;
  
  getStorageConnections(): Promise<StorageConnection[]>;
  createStorageConnection(data: InsertStorageConnection): Promise<StorageConnection>;
  
  createEmailSubscriber(data: InsertEmailSubscriber): Promise<EmailSubscriber>;
  getEmailSubscriberByEmail(email: string): Promise<EmailSubscriber | undefined>;
  
  getChatMessages(sessionId: string): Promise<ChatMessage[]>;
  createChatMessage(data: InsertChatMessage): Promise<ChatMessage>;
  
  createChatLead(data: InsertChatLead): Promise<ChatLead>;
  getChatLeads(): Promise<ChatLead[]>;
}

class Storage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
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

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users).orderBy(desc(users.createdAt));
  }

  async updateUserRole(id: string, role: UserRole): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set({ role, updatedAt: new Date() })
      .where(eq(users.id, id))
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

  async getBlogPosts(): Promise<BlogPost[]> {
    return await db.select().from(blogPosts).orderBy(desc(blogPosts.publishedAt));
  }

  async upsertBlogPost(data: InsertBlogPost): Promise<BlogPost> {
    const [post] = await db
      .insert(blogPosts)
      .values({
        ...data,
        cachedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: blogPosts.id,
        set: {
          title: data.title,
          excerpt: data.excerpt,
          content: data.content,
          author: data.author,
          publishedAt: data.publishedAt,
          url: data.url,
          tags: data.tags,
          readTime: data.readTime,
          cachedAt: new Date(),
        },
      })
      .returning();
    return post;
  }

  async clearBlogCache(): Promise<void> {
    await db.delete(blogPosts);
  }

  async updateUserFtpAccess(id: string, ftpAccess: number): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set({ ftpAccess, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async createFileTransfer(data: InsertFileTransfer): Promise<FileTransfer> {
    const [transfer] = await db.insert(fileTransfers).values(data).returning();
    return transfer;
  }

  async getFileTransfers(userId: string): Promise<FileTransfer[]> {
    return await db.select().from(fileTransfers)
      .where(eq(fileTransfers.userId, userId))
      .orderBy(desc(fileTransfers.createdAt));
  }

  async getStorageConnections(): Promise<StorageConnection[]> {
    return await db.select().from(storageConnections).orderBy(desc(storageConnections.createdAt));
  }

  async createStorageConnection(data: InsertStorageConnection): Promise<StorageConnection> {
    const [connection] = await db.insert(storageConnections).values(data).returning();
    return connection;
  }

  async createEmailSubscriber(data: InsertEmailSubscriber): Promise<EmailSubscriber> {
    const [subscriber] = await db.insert(emailSubscribers).values(data).returning();
    return subscriber;
  }

  async getEmailSubscriberByEmail(email: string): Promise<EmailSubscriber | undefined> {
    const [subscriber] = await db.select().from(emailSubscribers).where(eq(emailSubscribers.email, email));
    return subscriber;
  }

  async getChatMessages(sessionId: string): Promise<ChatMessage[]> {
    return await db.select().from(chatMessages)
      .where(eq(chatMessages.sessionId, sessionId))
      .orderBy(chatMessages.createdAt);
  }

  async createChatMessage(data: InsertChatMessage): Promise<ChatMessage> {
    const [message] = await db.insert(chatMessages).values(data).returning();
    return message;
  }

  async createChatLead(data: InsertChatLead): Promise<ChatLead> {
    const [lead] = await db.insert(chatLeads).values(data).returning();
    return lead;
  }

  async getChatLeads(): Promise<ChatLead[]> {
    return await db.select().from(chatLeads).orderBy(desc(chatLeads.createdAt));
  }
}

export const storage = new Storage();
