import { db } from "../db";
import { eq, desc, sql, count, inArray } from "drizzle-orm";
import { 
  contactSubmissions, 
  diagnosticScans, 
  users,
  blogPosts,
  fileTransfers,
  storageConnections,
  emailSubscribers,
  serviceLeads,
  chatMessages,
  chatLeads,
  mediaItems,
  mediaShares,
  websiteGrades,
  reportEvents,
  reportSubscriptions,
  userWebsites,
  backlinks,
  userActivityLogs,
  InsertContactSubmission, 
  InsertDiagnosticScan, 
  ContactSubmission, 
  DiagnosticScan,
  User,
  UpsertUser,
  UserRole,
  UserStatus,
  BlogPost,
  InsertBlogPost,
  FileTransfer,
  InsertFileTransfer,
  StorageConnection,
  InsertStorageConnection,
  EmailSubscriber,
  InsertEmailSubscriber,
  ServiceLead,
  InsertServiceLead,
  ChatMessage,
  InsertChatMessage,
  ChatLead,
  InsertChatLead,
  MediaItem,
  InsertMediaItem,
  MediaShare,
  InsertMediaShare,
  MediaStatus,
  WebsiteGrade,
  InsertWebsiteGrade,
  ReportEvent,
  InsertReportEvent,
  ReportEventType,
  ReportSubscription,
  InsertReportSubscription,
  UserWebsite,
  InsertUserWebsite,
  userWebsiteScans,
  InsertUserWebsiteScan,
  UserWebsiteScan,
  Backlink,
  InsertBacklink,
  UserActivityLog,
  InsertUserActivityLog,
  emailLogs,
  EmailLog,
  InsertEmailLog,
  reportSettings,
  ReportSettings,
  websiteReportSchedules,
  WebsiteReportSchedule,
  InsertWebsiteReportSchedule
} from "@shared/schema";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  getAllUsers(): Promise<User[]>;
  getUsersPaginated(page: number, limit: number, status?: string, search?: string): Promise<{ users: User[]; total: number }>;
  updateUserRole(id: string, role: UserRole): Promise<User | undefined>;
  updateUserFtpAccess(id: string, ftpAccess: number): Promise<User | undefined>;
  updateUserTermsAcceptance(id: string, version: string): Promise<User | undefined>;
  updateUserStatus(id: string, status: UserStatus, reason?: string): Promise<User | undefined>;
  updateUser(id: string, data: Partial<UpsertUser>): Promise<User | undefined>;
  deleteUser(id: string): Promise<void>;
  purgeUser(id: string): Promise<void>;
  updateLastLogin(id: string): Promise<void>;
  createUserActivityLog(data: InsertUserActivityLog): Promise<UserActivityLog>;
  getUserActivityLogs(userId: string, limit?: number): Promise<UserActivityLog[]>;
  getAllActivityLogs(limit?: number): Promise<UserActivityLog[]>;
  
  // Email log methods
  createEmailLog(data: InsertEmailLog): Promise<EmailLog>;
  getEmailLogs(limit?: number, offset?: number): Promise<{ logs: EmailLog[]; total: number }>;
  updateEmailLogStatus(id: string, status: string, deliveredAt?: Date): Promise<EmailLog | undefined>;
  
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
  
  createServiceLead(data: InsertServiceLead): Promise<ServiceLead>;
  getAllServiceLeads(): Promise<ServiceLead[]>;
  getServiceLeadsCount(): Promise<number>;
  
  getChatMessages(sessionId: string): Promise<ChatMessage[]>;
  createChatMessage(data: InsertChatMessage): Promise<ChatMessage>;
  
  createChatLead(data: InsertChatLead): Promise<ChatLead>;
  getChatLeads(): Promise<ChatLead[]>;
  
  getChatSessions(): Promise<{
    sessionId: string;
    messageCount: number;
    firstMessageAt: Date | null;
    lastMessageAt: Date | null;
    hasLead: boolean;
  }[]>;
  getChatLeadsWithSessionInfo(): Promise<(ChatLead & {
    messageCount: number;
  })[]>;
  
  // Admin stats methods
  getAllEmailSubscribers(): Promise<EmailSubscriber[]>;
  getEmailSubscribersCount(): Promise<number>;
  getAllDiagnosticScans(): Promise<DiagnosticScan[]>;
  getDiagnosticScansCount(): Promise<number>;
  getAllContactSubmissions(): Promise<ContactSubmission[]>;
  getContactSubmissionsCount(): Promise<number>;
  getChatLeadsCount(): Promise<number>;
  getChatSessionsCount(): Promise<number>;
  
  // Media methods
  createMediaItem(data: InsertMediaItem): Promise<MediaItem>;
  getMediaItem(id: string): Promise<MediaItem | undefined>;
  getMediaItemsByUser(userId: string): Promise<MediaItem[]>;
  getPublicMediaItems(): Promise<MediaItem[]>;
  getPendingMediaItems(): Promise<MediaItem[]>;
  updateMediaStatus(id: string, status: MediaStatus): Promise<MediaItem | undefined>;
  deleteMediaItem(id: string): Promise<void>;
  
  // Media sharing methods
  createMediaShare(data: InsertMediaShare): Promise<MediaShare>;
  getMediaSharesForMedia(mediaId: string): Promise<MediaShare[]>;
  getMediaSharedWithUser(userId: string): Promise<MediaItem[]>;
  getMediaSharedWithEmail(email: string): Promise<MediaItem[]>;
  deleteMediaShare(id: string): Promise<void>;
  
  // Website grader methods
  createWebsiteGrade(data: InsertWebsiteGrade): Promise<WebsiteGrade>;
  getWebsiteGrade(id: string): Promise<WebsiteGrade | undefined>;
  getWebsiteGradeByShareToken(shareToken: string): Promise<WebsiteGrade | undefined>;
  getRecentGradeForUrl(url: string): Promise<WebsiteGrade | undefined>;
  getWebsiteGradesByUrl(url: string, limit?: number): Promise<WebsiteGrade[]>;
  getAllWebsiteGrades(): Promise<WebsiteGrade[]>;
  getWebsiteGradesCount(): Promise<number>;
  updateWebsiteGradeShareInfo(id: string, shareToken: string, qrCodeData: string): Promise<WebsiteGrade | undefined>;
  
  // Report event tracking methods
  logReportEvent(data: InsertReportEvent): Promise<ReportEvent>;
  incrementReportViewCount(shareToken: string): Promise<void>;
  incrementReportDownloadCount(shareToken: string): Promise<void>;
  getReportEvents(shareToken: string): Promise<ReportEvent[]>;
  
  // Report subscription methods
  getUserByStripeCustomerId(customerId: string): Promise<User | undefined>;
  createReportSubscription(data: InsertReportSubscription): Promise<ReportSubscription>;
  getReportSubscription(id: string): Promise<ReportSubscription | undefined>;
  getReportSubscriptionBySlug(slug: string): Promise<ReportSubscription | undefined>;
  getReportSubscriptionByStripeSubscriptionId(subscriptionId: string): Promise<ReportSubscription | undefined>;
  getReportSubscriptionsByUser(userId: string): Promise<ReportSubscription[]>;
  getAllReportSubscriptions(): Promise<ReportSubscription[]>;
  updateReportSubscription(id: string, data: Partial<InsertReportSubscription>): Promise<ReportSubscription | undefined>;
  
  // User websites methods
  createUserWebsite(data: InsertUserWebsite): Promise<UserWebsite>;
  getUserWebsites(userId: string): Promise<UserWebsite[]>;
  getUserWebsite(id: string): Promise<UserWebsite | undefined>;
  updateUserWebsite(id: string, data: Partial<UserWebsite>): Promise<UserWebsite | undefined>;
  deleteUserWebsite(id: string): Promise<void>;
  updateUserWebsiteScan(id: string, gradeId: string, shareToken: string, score: number): Promise<UserWebsite | undefined>;
  
  // User website scans methods (ownership tracking)
  createUserWebsiteScan(data: InsertUserWebsiteScan): Promise<UserWebsiteScan>;
  getUserWebsiteScans(userWebsiteId: string, limit?: number): Promise<WebsiteGrade[]>;
  getUserScansForWebsites(userWebsiteIds: string[], limit?: number): Promise<WebsiteGrade[]>;
  
  // Backlink management methods (superuser only)
  createBacklink(data: InsertBacklink): Promise<Backlink>;
  getBacklink(id: string): Promise<Backlink | undefined>;
  getAllBacklinks(): Promise<Backlink[]>;
  updateBacklink(id: string, data: Partial<Backlink>): Promise<Backlink | undefined>;
  deleteBacklink(id: string): Promise<void>;
  getBacklinksCount(): Promise<number>;
  
  // Report settings methods
  getReportSettings(settingKey: string): Promise<ReportSettings | undefined>;
  upsertReportSettings(settingKey: string, data: { recipients: string; intervalMinutes: number; isActive?: number; updatedBy?: string }): Promise<ReportSettings>;
  updateReportSettingsLastSent(settingKey: string): Promise<void>;
  
  // Website report schedule methods
  createWebsiteReportSchedule(data: InsertWebsiteReportSchedule): Promise<WebsiteReportSchedule>;
  getWebsiteReportSchedule(id: string): Promise<WebsiteReportSchedule | undefined>;
  getWebsiteReportScheduleByWebsite(userWebsiteId: string): Promise<WebsiteReportSchedule | undefined>;
  getUserWebsiteReportSchedules(userId: string): Promise<WebsiteReportSchedule[]>;
  getDueWebsiteReportSchedules(): Promise<WebsiteReportSchedule[]>;
  updateWebsiteReportSchedule(id: string, data: Partial<WebsiteReportSchedule>): Promise<WebsiteReportSchedule | undefined>;
  deleteWebsiteReportSchedule(id: string): Promise<void>;
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
    // First check if a user with this email already exists
    if (userData.email) {
      const existingUserByEmail = await this.getUserByEmail(userData.email);
      if (existingUserByEmail && existingUserByEmail.id !== userData.id) {
        // User exists with different ID - update the existing user with new auth info
        // This handles the case where user was created via admin and now logs in via Replit
        const [updated] = await db
          .update(users)
          .set({
            ...userData,
            id: existingUserByEmail.id, // Keep the existing ID
            updatedAt: new Date(),
          })
          .where(eq(users.id, existingUserByEmail.id))
          .returning();
        return updated;
      }
    }
    
    // Standard upsert by ID
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

  async updateUserTermsAcceptance(id: string, version: string): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set({ 
        termsAcceptedAt: new Date(), 
        termsVersion: version,
        updatedAt: new Date() 
      })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async getUsersPaginated(page: number, limit: number, status?: string, search?: string): Promise<{ users: User[]; total: number }> {
    let query = db.select().from(users);
    let countQuery = db.select({ count: count() }).from(users);
    
    const conditions: any[] = [];
    if (status && status !== 'all') {
      conditions.push(eq(users.status, status));
    }
    
    if (search) {
      const searchLower = `%${search.toLowerCase()}%`;
      conditions.push(
        sql`(LOWER(${users.email}) LIKE ${searchLower} OR LOWER(${users.firstName}) LIKE ${searchLower} OR LOWER(${users.lastName}) LIKE ${searchLower})`
      );
    }

    if (conditions.length > 0) {
      const whereClause = conditions.length === 1 ? conditions[0] : sql`${conditions[0]} AND ${conditions[1]}`;
      query = query.where(whereClause) as any;
      countQuery = countQuery.where(whereClause) as any;
    }

    const [totalResult] = await countQuery;
    const userResults = await query
      .orderBy(desc(users.createdAt))
      .limit(limit)
      .offset((page - 1) * limit);

    return { users: userResults, total: totalResult?.count || 0 };
  }

  async updateUserStatus(id: string, status: string, reason?: string): Promise<User | undefined> {
    const updateData: any = { 
      status, 
      updatedAt: new Date() 
    };
    
    if (status === 'suspended' || status === 'banned') {
      updateData.suspendedAt = new Date();
      updateData.suspendedReason = reason || null;
    } else if (status === 'active') {
      updateData.suspendedAt = null;
      updateData.suspendedReason = null;
    }
    
    const [user] = await db
      .update(users)
      .set(updateData)
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async updateUser(id: string, data: Partial<UpsertUser>): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async deleteUser(id: string): Promise<void> {
    await db
      .update(users)
      .set({ 
        status: 'deleted',
        deletedAt: new Date(),
        updatedAt: new Date() 
      })
      .where(eq(users.id, id));
  }

  async purgeUser(id: string): Promise<void> {
    await db.delete(users).where(eq(users.id, id));
  }

  async updateLastLogin(id: string): Promise<void> {
    await db
      .update(users)
      .set({ lastLoginAt: new Date(), updatedAt: new Date() })
      .where(eq(users.id, id));
  }

  async createUserActivityLog(data: InsertUserActivityLog): Promise<UserActivityLog> {
    const [log] = await db.insert(userActivityLogs).values(data).returning();
    return log;
  }

  async getUserActivityLogs(userId: string, limit: number = 50): Promise<UserActivityLog[]> {
    return await db
      .select()
      .from(userActivityLogs)
      .where(eq(userActivityLogs.userId, userId))
      .orderBy(desc(userActivityLogs.createdAt))
      .limit(limit);
  }

  async getAllActivityLogs(limit: number = 100): Promise<UserActivityLog[]> {
    return await db
      .select()
      .from(userActivityLogs)
      .orderBy(desc(userActivityLogs.createdAt))
      .limit(limit);
  }

  async createEmailLog(data: InsertEmailLog): Promise<EmailLog> {
    const [log] = await db.insert(emailLogs).values(data).returning();
    return log;
  }

  async getEmailLogs(limit: number = 50, offset: number = 0): Promise<{ logs: EmailLog[]; total: number }> {
    const [countResult] = await db.select({ count: count() }).from(emailLogs);
    const logs = await db
      .select()
      .from(emailLogs)
      .orderBy(desc(emailLogs.sentAt))
      .limit(limit)
      .offset(offset);
    return { logs, total: countResult?.count || 0 };
  }

  async updateEmailLogStatus(id: string, status: string, deliveredAt?: Date): Promise<EmailLog | undefined> {
    const updateData: any = { status };
    if (deliveredAt) {
      updateData.deliveredAt = deliveredAt;
    }
    const [log] = await db
      .update(emailLogs)
      .set(updateData)
      .where(eq(emailLogs.id, id))
      .returning();
    return log;
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

  async createServiceLead(data: InsertServiceLead): Promise<ServiceLead> {
    const [lead] = await db.insert(serviceLeads).values(data).returning();
    return lead;
  }

  async getAllServiceLeads(): Promise<ServiceLead[]> {
    return await db.select().from(serviceLeads).orderBy(desc(serviceLeads.createdAt));
  }

  async getServiceLeadsCount(): Promise<number> {
    const [result] = await db.select({ count: count() }).from(serviceLeads);
    return result?.count || 0;
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

  async getChatSessions(): Promise<{
    sessionId: string;
    messageCount: number;
    firstMessageAt: Date | null;
    lastMessageAt: Date | null;
    hasLead: boolean;
  }[]> {
    const sessions = await db
      .select({
        sessionId: chatMessages.sessionId,
        messageCount: count(chatMessages.id),
        firstMessageAt: sql<Date>`MIN(${chatMessages.createdAt})`,
        lastMessageAt: sql<Date>`MAX(${chatMessages.createdAt})`,
      })
      .from(chatMessages)
      .groupBy(chatMessages.sessionId)
      .orderBy(desc(sql`MAX(${chatMessages.createdAt})`));

    const leads = await db.select({ sessionId: chatLeads.sessionId }).from(chatLeads);
    const leadSessionIds = new Set(leads.map(l => l.sessionId));

    return sessions.map(s => ({
      ...s,
      hasLead: leadSessionIds.has(s.sessionId),
    }));
  }

  async getChatLeadsWithSessionInfo(): Promise<(ChatLead & { messageCount: number })[]> {
    const leads = await this.getChatLeads();
    const result: (ChatLead & { messageCount: number })[] = [];

    for (const lead of leads) {
      const messages = await db
        .select({ count: count() })
        .from(chatMessages)
        .where(eq(chatMessages.sessionId, lead.sessionId));
      
      result.push({
        ...lead,
        messageCount: messages[0]?.count || 0,
      });
    }

    return result;
  }

  async getAllEmailSubscribers(): Promise<EmailSubscriber[]> {
    return await db.select().from(emailSubscribers).orderBy(desc(emailSubscribers.subscribedAt));
  }

  async getEmailSubscribersCount(): Promise<number> {
    const [result] = await db.select({ count: count() }).from(emailSubscribers);
    return result?.count || 0;
  }

  async getAllDiagnosticScans(): Promise<DiagnosticScan[]> {
    return await db.select().from(diagnosticScans).orderBy(desc(diagnosticScans.scannedAt));
  }

  async getDiagnosticScansCount(): Promise<number> {
    const [result] = await db.select({ count: count() }).from(diagnosticScans);
    return result?.count || 0;
  }

  async getAllContactSubmissions(): Promise<ContactSubmission[]> {
    return await db.select().from(contactSubmissions).orderBy(desc(contactSubmissions.createdAt));
  }

  async getContactSubmissionsCount(): Promise<number> {
    const [result] = await db.select({ count: count() }).from(contactSubmissions);
    return result?.count || 0;
  }

  async getChatLeadsCount(): Promise<number> {
    const [result] = await db.select({ count: count() }).from(chatLeads);
    return result?.count || 0;
  }

  async getChatSessionsCount(): Promise<number> {
    const result = await db
      .selectDistinct({ sessionId: chatMessages.sessionId })
      .from(chatMessages);
    return result.length;
  }

  // Media methods
  async createMediaItem(data: InsertMediaItem): Promise<MediaItem> {
    const [item] = await db.insert(mediaItems).values(data).returning();
    return item;
  }

  async getMediaItem(id: string): Promise<MediaItem | undefined> {
    const [item] = await db.select().from(mediaItems).where(eq(mediaItems.id, id));
    return item;
  }

  async getMediaItemsByUser(userId: string): Promise<MediaItem[]> {
    return await db.select().from(mediaItems)
      .where(eq(mediaItems.uploadedBy, userId))
      .orderBy(desc(mediaItems.createdAt));
  }

  async getPublicMediaItems(): Promise<MediaItem[]> {
    return await db.select().from(mediaItems)
      .where(eq(mediaItems.status, "public"))
      .orderBy(desc(mediaItems.createdAt));
  }

  async getPendingMediaItems(): Promise<MediaItem[]> {
    return await db.select().from(mediaItems)
      .where(eq(mediaItems.status, "pending"))
      .orderBy(desc(mediaItems.createdAt));
  }

  async updateMediaStatus(id: string, status: MediaStatus): Promise<MediaItem | undefined> {
    const [item] = await db
      .update(mediaItems)
      .set({ status, updatedAt: new Date() })
      .where(eq(mediaItems.id, id))
      .returning();
    return item;
  }

  async deleteMediaItem(id: string): Promise<void> {
    await db.delete(mediaShares).where(eq(mediaShares.mediaId, id));
    await db.delete(mediaItems).where(eq(mediaItems.id, id));
  }

  // Media sharing methods
  async createMediaShare(data: InsertMediaShare): Promise<MediaShare> {
    const [share] = await db.insert(mediaShares).values(data).returning();
    return share;
  }

  async getMediaSharesForMedia(mediaId: string): Promise<MediaShare[]> {
    return await db.select().from(mediaShares)
      .where(eq(mediaShares.mediaId, mediaId))
      .orderBy(desc(mediaShares.createdAt));
  }

  async getMediaSharedWithUser(userId: string): Promise<MediaItem[]> {
    const shares = await db.select().from(mediaShares)
      .where(eq(mediaShares.sharedWithUserId, userId));
    
    if (shares.length === 0) return [];
    
    const mediaIds = shares.map(s => s.mediaId);
    const items: MediaItem[] = [];
    for (const mediaId of mediaIds) {
      const [item] = await db.select().from(mediaItems).where(eq(mediaItems.id, mediaId));
      if (item) items.push(item);
    }
    return items;
  }

  async getMediaSharedWithEmail(email: string): Promise<MediaItem[]> {
    const shares = await db.select().from(mediaShares)
      .where(eq(mediaShares.sharedWithEmail, email));
    
    if (shares.length === 0) return [];
    
    const mediaIds = shares.map(s => s.mediaId);
    const items: MediaItem[] = [];
    for (const mediaId of mediaIds) {
      const [item] = await db.select().from(mediaItems).where(eq(mediaItems.id, mediaId));
      if (item) items.push(item);
    }
    return items;
  }

  async deleteMediaShare(id: string): Promise<void> {
    await db.delete(mediaShares).where(eq(mediaShares.id, id));
  }

  // Website grader methods
  async createWebsiteGrade(data: InsertWebsiteGrade): Promise<WebsiteGrade> {
    const [grade] = await db.insert(websiteGrades).values(data).returning();
    return grade;
  }

  async getWebsiteGrade(id: string): Promise<WebsiteGrade | undefined> {
    const [grade] = await db.select().from(websiteGrades).where(eq(websiteGrades.id, id));
    return grade;
  }

  async getRecentGradeForUrl(url: string): Promise<WebsiteGrade | undefined> {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const [grade] = await db
      .select()
      .from(websiteGrades)
      .where(eq(websiteGrades.url, url))
      .orderBy(desc(websiteGrades.createdAt))
      .limit(1);
    
    // Only return cached grades that have mobileScore computed (not legacy grades without mobile checks)
    // Legacy grades have mobileScore = 0 (default) or null. Fresh scans start at 100 and decrement.
    // A real scan with all mobile checks failing would be extremely rare, so we check for > 0.
    // This forces rescans for legacy grades without mobile analysis.
    if (grade && new Date(grade.createdAt) > oneDayAgo && grade.mobileScore !== null && grade.mobileScore > 0) {
      return grade;
    }
    return undefined;
  }

  async getWebsiteGradesByUrl(url: string, limit: number = 10): Promise<WebsiteGrade[]> {
    return await db
      .select()
      .from(websiteGrades)
      .where(eq(websiteGrades.url, url))
      .orderBy(desc(websiteGrades.createdAt))
      .limit(limit);
  }

  async getAllWebsiteGrades(): Promise<WebsiteGrade[]> {
    return await db.select().from(websiteGrades).orderBy(desc(websiteGrades.createdAt));
  }

  async getWebsiteGradesCount(): Promise<number> {
    const [result] = await db.select({ count: count() }).from(websiteGrades);
    return result?.count || 0;
  }

  async getWebsiteGradeByShareToken(shareToken: string): Promise<WebsiteGrade | undefined> {
    const [grade] = await db.select().from(websiteGrades).where(eq(websiteGrades.shareToken, shareToken));
    return grade;
  }

  async updateWebsiteGradeShareInfo(id: string, shareToken: string, qrCodeData: string): Promise<WebsiteGrade | undefined> {
    const [grade] = await db
      .update(websiteGrades)
      .set({ shareToken, qrCodeData })
      .where(eq(websiteGrades.id, id))
      .returning();
    return grade;
  }

  // Report event tracking methods
  async logReportEvent(data: InsertReportEvent): Promise<ReportEvent> {
    const [event] = await db.insert(reportEvents).values(data).returning();
    return event;
  }

  async incrementReportViewCount(shareToken: string): Promise<void> {
    await db
      .update(websiteGrades)
      .set({ 
        viewCount: sql`COALESCE(${websiteGrades.viewCount}, 0) + 1`,
        lastViewedAt: new Date()
      })
      .where(eq(websiteGrades.shareToken, shareToken));
  }

  async incrementReportDownloadCount(shareToken: string): Promise<void> {
    await db
      .update(websiteGrades)
      .set({ 
        downloadCount: sql`COALESCE(${websiteGrades.downloadCount}, 0) + 1`
      })
      .where(eq(websiteGrades.shareToken, shareToken));
  }

  async getReportEvents(shareToken: string): Promise<ReportEvent[]> {
    return await db.select().from(reportEvents)
      .where(eq(reportEvents.shareToken, shareToken))
      .orderBy(desc(reportEvents.triggeredAt));
  }

  async updateUserStripeInfo(userId: string, stripeInfo: {
    stripeCustomerId?: string;
    stripeSubscriptionId?: string;
  }): Promise<User | undefined> {
    const [user] = await db.update(users).set(stripeInfo).where(eq(users.id, userId)).returning();
    return user;
  }

  async updateUserTermsAccepted(userId: string, acceptedAt: Date, version: string): Promise<User | undefined> {
    const [user] = await db.update(users).set({
      termsAcceptedAt: acceptedAt,
      termsVersion: version,
    }).where(eq(users.id, userId)).returning();
    return user;
  }

  // Report subscription methods
  async getUserByStripeCustomerId(customerId: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.stripeCustomerId, customerId));
    return user;
  }

  async createReportSubscription(data: InsertReportSubscription): Promise<ReportSubscription> {
    const [subscription] = await db.insert(reportSubscriptions).values(data).returning();
    return subscription;
  }

  async getReportSubscription(id: string): Promise<ReportSubscription | undefined> {
    const [subscription] = await db.select().from(reportSubscriptions).where(eq(reportSubscriptions.id, id));
    return subscription;
  }

  async getReportSubscriptionBySlug(slug: string): Promise<ReportSubscription | undefined> {
    const [subscription] = await db.select().from(reportSubscriptions).where(eq(reportSubscriptions.slug, slug));
    return subscription;
  }

  async getReportSubscriptionByStripeSubscriptionId(subscriptionId: string): Promise<ReportSubscription | undefined> {
    const [subscription] = await db.select().from(reportSubscriptions).where(eq(reportSubscriptions.stripeSubscriptionId, subscriptionId));
    return subscription;
  }

  async getReportSubscriptionsByUser(userId: string): Promise<ReportSubscription[]> {
    return await db.select().from(reportSubscriptions).where(eq(reportSubscriptions.userId, userId)).orderBy(desc(reportSubscriptions.createdAt));
  }

  async getAllReportSubscriptions(): Promise<ReportSubscription[]> {
    return await db.select().from(reportSubscriptions).orderBy(desc(reportSubscriptions.createdAt));
  }

  async updateReportSubscription(id: string, data: Partial<InsertReportSubscription>): Promise<ReportSubscription | undefined> {
    const [subscription] = await db
      .update(reportSubscriptions)
      .set(data)
      .where(eq(reportSubscriptions.id, id))
      .returning();
    return subscription;
  }

  // User websites methods
  async createUserWebsite(data: InsertUserWebsite): Promise<UserWebsite> {
    const [website] = await db.insert(userWebsites).values(data).returning();
    return website;
  }

  async getUserWebsites(userId: string): Promise<UserWebsite[]> {
    return await db.select().from(userWebsites).where(eq(userWebsites.userId, userId)).orderBy(desc(userWebsites.createdAt));
  }

  async getUserWebsite(id: string): Promise<UserWebsite | undefined> {
    const [website] = await db.select().from(userWebsites).where(eq(userWebsites.id, id));
    return website;
  }

  async updateUserWebsite(id: string, data: Partial<UserWebsite>): Promise<UserWebsite | undefined> {
    const [website] = await db.update(userWebsites).set(data).where(eq(userWebsites.id, id)).returning();
    return website;
  }

  async deleteUserWebsite(id: string): Promise<void> {
    await db.delete(userWebsites).where(eq(userWebsites.id, id));
  }

  async updateUserWebsiteScan(id: string, gradeId: string, shareToken: string, score: number): Promise<UserWebsite | undefined> {
    const [website] = await db
      .update(userWebsites)
      .set({
        lastScannedAt: new Date(),
        lastGradeId: gradeId,
        lastShareToken: shareToken,
        lastScore: score,
        scanCount: sql`${userWebsites.scanCount} + 1`
      })
      .where(eq(userWebsites.id, id))
      .returning();
    return website;
  }

  // User website scans methods (ownership tracking)
  async createUserWebsiteScan(data: InsertUserWebsiteScan): Promise<UserWebsiteScan> {
    const [scan] = await db.insert(userWebsiteScans).values(data).returning();
    return scan;
  }

  async getUserWebsiteScans(userWebsiteId: string, limit: number = 10): Promise<WebsiteGrade[]> {
    const scans = await db
      .select({ gradeId: userWebsiteScans.gradeId })
      .from(userWebsiteScans)
      .where(eq(userWebsiteScans.userWebsiteId, userWebsiteId))
      .orderBy(desc(userWebsiteScans.createdAt))
      .limit(limit);
    
    if (scans.length === 0) return [];
    
    const gradeIds = scans.map(s => s.gradeId);
    return await db
      .select()
      .from(websiteGrades)
      .where(inArray(websiteGrades.id, gradeIds))
      .orderBy(desc(websiteGrades.createdAt));
  }

  async getUserScansForWebsites(userWebsiteIds: string[], limit: number = 50): Promise<WebsiteGrade[]> {
    if (userWebsiteIds.length === 0) return [];
    
    const scans = await db
      .select({ gradeId: userWebsiteScans.gradeId })
      .from(userWebsiteScans)
      .where(inArray(userWebsiteScans.userWebsiteId, userWebsiteIds))
      .orderBy(desc(userWebsiteScans.createdAt))
      .limit(limit);
    
    if (scans.length === 0) return [];
    
    const gradeIds = scans.map(s => s.gradeId);
    return await db
      .select()
      .from(websiteGrades)
      .where(inArray(websiteGrades.id, gradeIds))
      .orderBy(desc(websiteGrades.createdAt));
  }

  // Backlink management methods
  async createBacklink(data: InsertBacklink): Promise<Backlink> {
    const [backlink] = await db.insert(backlinks).values(data).returning();
    return backlink;
  }

  async getBacklink(id: string): Promise<Backlink | undefined> {
    const [backlink] = await db.select().from(backlinks).where(eq(backlinks.id, id));
    return backlink;
  }

  async getAllBacklinks(): Promise<Backlink[]> {
    return await db.select().from(backlinks).orderBy(desc(backlinks.createdAt));
  }

  async updateBacklink(id: string, data: Partial<Backlink>): Promise<Backlink | undefined> {
    const [backlink] = await db
      .update(backlinks)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(backlinks.id, id))
      .returning();
    return backlink;
  }

  async deleteBacklink(id: string): Promise<void> {
    await db.delete(backlinks).where(eq(backlinks.id, id));
  }

  async getBacklinksCount(): Promise<number> {
    const [result] = await db.select({ count: count() }).from(backlinks);
    return result?.count || 0;
  }

  // Report settings methods
  async getReportSettings(settingKey: string): Promise<ReportSettings | undefined> {
    const [settings] = await db.select().from(reportSettings).where(eq(reportSettings.settingKey, settingKey));
    return settings;
  }

  async upsertReportSettings(settingKey: string, data: { recipients: string; intervalMinutes: number; isActive?: number; updatedBy?: string }): Promise<ReportSettings> {
    const [settings] = await db
      .insert(reportSettings)
      .values({
        settingKey,
        recipients: data.recipients,
        intervalMinutes: data.intervalMinutes,
        isActive: data.isActive ?? 1,
        updatedBy: data.updatedBy,
      })
      .onConflictDoUpdate({
        target: reportSettings.settingKey,
        set: {
          recipients: data.recipients,
          intervalMinutes: data.intervalMinutes,
          isActive: data.isActive ?? 1,
          updatedBy: data.updatedBy,
          updatedAt: new Date(),
        },
      })
      .returning();
    return settings;
  }

  async updateReportSettingsLastSent(settingKey: string): Promise<void> {
    await db
      .update(reportSettings)
      .set({ lastSentAt: new Date() })
      .where(eq(reportSettings.settingKey, settingKey));
  }

  // Website report schedule methods
  async createWebsiteReportSchedule(data: InsertWebsiteReportSchedule): Promise<WebsiteReportSchedule> {
    const nextScheduledAt = this.calculateNextScheduledDate(data.frequency || 'monthly');
    const [schedule] = await db
      .insert(websiteReportSchedules)
      .values({ ...data, nextScheduledAt })
      .returning();
    return schedule;
  }

  async getWebsiteReportSchedule(id: string): Promise<WebsiteReportSchedule | undefined> {
    const [schedule] = await db
      .select()
      .from(websiteReportSchedules)
      .where(eq(websiteReportSchedules.id, id));
    return schedule;
  }

  async getWebsiteReportScheduleByWebsite(userWebsiteId: string): Promise<WebsiteReportSchedule | undefined> {
    const [schedule] = await db
      .select()
      .from(websiteReportSchedules)
      .where(eq(websiteReportSchedules.userWebsiteId, userWebsiteId));
    return schedule;
  }

  async getUserWebsiteReportSchedules(userId: string): Promise<WebsiteReportSchedule[]> {
    return await db
      .select()
      .from(websiteReportSchedules)
      .where(eq(websiteReportSchedules.userId, userId))
      .orderBy(desc(websiteReportSchedules.createdAt));
  }

  async getDueWebsiteReportSchedules(): Promise<WebsiteReportSchedule[]> {
    const now = new Date();
    return await db
      .select()
      .from(websiteReportSchedules)
      .where(
        sql`${websiteReportSchedules.isActive} = 1 
            AND ${websiteReportSchedules.frequency} != 'disabled' 
            AND (${websiteReportSchedules.nextScheduledAt} IS NULL OR ${websiteReportSchedules.nextScheduledAt} <= ${now})`
      );
  }

  async updateWebsiteReportSchedule(id: string, data: Partial<WebsiteReportSchedule>): Promise<WebsiteReportSchedule | undefined> {
    const updateData: any = { ...data, updatedAt: new Date() };
    if (data.frequency && data.frequency !== 'disabled') {
      updateData.nextScheduledAt = this.calculateNextScheduledDate(data.frequency);
    }
    const [schedule] = await db
      .update(websiteReportSchedules)
      .set(updateData)
      .where(eq(websiteReportSchedules.id, id))
      .returning();
    return schedule;
  }

  async deleteWebsiteReportSchedule(id: string): Promise<void> {
    await db.delete(websiteReportSchedules).where(eq(websiteReportSchedules.id, id));
  }

  private calculateNextScheduledDate(frequency: string): Date {
    const now = new Date();
    switch (frequency) {
      case 'daily':
        return new Date(now.getTime() + 24 * 60 * 60 * 1000);
      case 'weekly':
        return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      case 'monthly':
        const next = new Date(now);
        next.setMonth(next.getMonth() + 1);
        return next;
      default:
        return new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    }
  }
}

export const storage = new Storage();
