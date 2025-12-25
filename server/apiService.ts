import { db } from "../db";
import { eq, sql, desc, and } from "drizzle-orm";
import { apiKeys, apiQuotas, apiUsageLogs, apiCallPacks } from "@shared/schema";
import crypto from "crypto";

class ApiService {
  private generateApiKey(): { key: string; hash: string; prefix: string } {
    const key = `tf_${crypto.randomBytes(32).toString('hex')}`;
    const hash = crypto.createHash('sha256').update(key).digest('hex');
    const prefix = key.substring(0, 12);
    return { key, hash, prefix };
  }

  async createApiKey(userId: string, name: string, expiresAt?: Date) {
    const { key, hash, prefix } = this.generateApiKey();
    
    const [apiKey] = await db.insert(apiKeys).values({
      userId,
      name,
      keyHash: hash,
      keyPrefix: prefix,
      expiresAt,
      isActive: 1,
    }).returning();

    return { ...apiKey, fullKey: key };
  }

  async getApiKeysByUser(userId: string) {
    return await db.select({
      id: apiKeys.id,
      name: apiKeys.name,
      keyPrefix: apiKeys.keyPrefix,
      lastUsedAt: apiKeys.lastUsedAt,
      expiresAt: apiKeys.expiresAt,
      isActive: apiKeys.isActive,
      createdAt: apiKeys.createdAt,
    }).from(apiKeys)
      .where(eq(apiKeys.userId, userId))
      .orderBy(desc(apiKeys.createdAt));
  }

  async getAllApiKeys() {
    return await db.select({
      id: apiKeys.id,
      userId: apiKeys.userId,
      name: apiKeys.name,
      keyPrefix: apiKeys.keyPrefix,
      lastUsedAt: apiKeys.lastUsedAt,
      expiresAt: apiKeys.expiresAt,
      isActive: apiKeys.isActive,
      createdAt: apiKeys.createdAt,
    }).from(apiKeys)
      .orderBy(desc(apiKeys.createdAt));
  }

  async getApiKeyById(keyId: string) {
    const [apiKey] = await db.select().from(apiKeys)
      .where(eq(apiKeys.id, keyId));
    return apiKey;
  }

  async validateApiKey(key: string) {
    const hash = crypto.createHash('sha256').update(key).digest('hex');
    const [apiKey] = await db.select().from(apiKeys)
      .where(and(
        eq(apiKeys.keyHash, hash),
        eq(apiKeys.isActive, 1)
      ));
    
    if (!apiKey) return null;
    
    if (apiKey.expiresAt && new Date(apiKey.expiresAt) < new Date()) {
      return null;
    }

    await db.update(apiKeys)
      .set({ lastUsedAt: new Date() })
      .where(eq(apiKeys.id, apiKey.id));

    return apiKey;
  }

  async revokeApiKey(keyId: string, userId: string) {
    const [updated] = await db.update(apiKeys)
      .set({ isActive: 0 })
      .where(and(
        eq(apiKeys.id, keyId),
        eq(apiKeys.userId, userId)
      ))
      .returning();
    return updated;
  }

  async deleteApiKey(keyId: string, userId: string) {
    await db.delete(apiKeys)
      .where(and(
        eq(apiKeys.id, keyId),
        eq(apiKeys.userId, userId)
      ));
  }

  async getOrCreateQuota(userId: string) {
    let [quota] = await db.select().from(apiQuotas)
      .where(eq(apiQuotas.userId, userId));
    
    if (!quota) {
      [quota] = await db.insert(apiQuotas).values({
        userId,
        totalCalls: 0,
        usedCalls: 0,
        subscriptionCalls: 0,
        packCalls: 0,
      }).returning();
    }
    
    return quota;
  }

  async getUserQuota(userId: string) {
    const quota = await this.getOrCreateQuota(userId);
    const remaining = quota.totalCalls - quota.usedCalls;
    return {
      ...quota,
      remaining: Math.max(0, remaining),
    };
  }

  async addSubscriptionCalls(userId: string, calls: number, resetDate?: Date) {
    const quota = await this.getOrCreateQuota(userId);
    
    await db.update(apiQuotas)
      .set({
        subscriptionCalls: quota.subscriptionCalls + calls,
        totalCalls: quota.totalCalls + calls,
        resetAt: resetDate || null,
        updatedAt: new Date(),
      })
      .where(eq(apiQuotas.userId, userId));
  }

  async addPackCalls(userId: string, calls: number, stripeSessionId?: string) {
    const quota = await this.getOrCreateQuota(userId);
    
    await db.insert(apiCallPacks).values({
      userId,
      packSize: calls,
      callsRemaining: calls,
      stripeSessionId,
    });

    await db.update(apiQuotas)
      .set({
        packCalls: quota.packCalls + calls,
        totalCalls: quota.totalCalls + calls,
        updatedAt: new Date(),
      })
      .where(eq(apiQuotas.userId, userId));
  }

  async consumeApiCall(userId: string, apiKeyId: string, endpoint: string, method: string, statusCode: number, responseTimeMs: number, ipAddress?: string, userAgent?: string) {
    const quota = await this.getOrCreateQuota(userId);
    const remaining = quota.totalCalls - quota.usedCalls;
    
    if (remaining <= 0) {
      return { success: false, error: 'API quota exceeded' };
    }

    const subscriptionRemaining = quota.subscriptionCalls - quota.usedCalls;
    const useFromPack = subscriptionRemaining <= 0;

    if (useFromPack) {
      const packs = await db.select().from(apiCallPacks)
        .where(and(
          eq(apiCallPacks.userId, userId),
          sql`calls_remaining > 0`
        ))
        .orderBy(apiCallPacks.purchasedAt)
        .limit(1);

      if (packs.length > 0) {
        await db.update(apiCallPacks)
          .set({ callsRemaining: packs[0].callsRemaining - 1 })
          .where(eq(apiCallPacks.id, packs[0].id));

        await db.update(apiQuotas)
          .set({
            usedCalls: quota.usedCalls + 1,
            packCalls: Math.max(0, quota.packCalls - 1),
            updatedAt: new Date(),
          })
          .where(eq(apiQuotas.userId, userId));
      } else {
        return { success: false, error: 'No available call packs' };
      }
    } else {
      await db.update(apiQuotas)
        .set({
          usedCalls: quota.usedCalls + 1,
          updatedAt: new Date(),
        })
        .where(eq(apiQuotas.userId, userId));
    }

    await db.insert(apiUsageLogs).values({
      userId,
      apiKeyId,
      endpoint,
      method,
      statusCode,
      responseTimeMs,
      ipAddress,
      userAgent,
    });

    return { success: true, remaining: remaining - 1 };
  }

  async getUsageStats(userId: string, days: number = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    const result = await db.execute(sql`
      SELECT 
        DATE(called_at) as date,
        COUNT(*) as calls,
        AVG(response_time_ms) as avg_response_time
      FROM api_usage_logs
      WHERE user_id = ${userId} AND called_at >= ${startDate}
      GROUP BY DATE(called_at)
      ORDER BY date DESC
    `);
    
    return result.rows;
  }

  async getRecentUsage(userId: string, limit: number = 50) {
    return await db.select().from(apiUsageLogs)
      .where(eq(apiUsageLogs.userId, userId))
      .orderBy(desc(apiUsageLogs.calledAt))
      .limit(limit);
  }

  async getCallPacks(userId: string) {
    return await db.select().from(apiCallPacks)
      .where(eq(apiCallPacks.userId, userId))
      .orderBy(desc(apiCallPacks.purchasedAt));
  }

  async getUserDiscount(userId: string): Promise<number> {
    const result = await db.execute(sql`
      SELECT p.metadata->>'discount_percent' as discount
      FROM stripe.subscriptions s
      JOIN stripe.subscription_items si ON si.subscription = s.id
      JOIN stripe.prices pr ON si.price = pr.id
      JOIN stripe.products p ON pr.product = p.id
      JOIN users u ON u.stripe_customer_id = s.customer
      WHERE u.id = ${userId} 
        AND s.status IN ('active', 'trialing')
        AND p.metadata->>'discount_percent' IS NOT NULL
      ORDER BY (p.metadata->>'discount_percent')::int DESC
      LIMIT 1
    `);
    
    const row = result.rows[0] as any;
    return row?.discount ? parseInt(row.discount) : 0;
  }
}

export const apiService = new ApiService();
