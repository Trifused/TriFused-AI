import { db } from "../db";
import { 
  tokenWallets, 
  tokenTransactions, 
  tokenPackages, 
  tokenPricing,
  type TokenWallet,
  type TokenTransaction,
  type TokenPackage,
  type TokenPricing,
  type InsertTokenTransaction
} from "@shared/schema";
import { eq, desc, and, sql } from "drizzle-orm";

export interface TokenService {
  getWallet(userId: string): Promise<TokenWallet | null>;
  getOrCreateWallet(userId: string): Promise<TokenWallet>;
  getBalance(userId: string): Promise<number>;
  creditTokens(params: CreditTokenParams): Promise<TokenTransaction>;
  debitTokens(params: DebitTokenParams): Promise<TokenTransaction | { error: string }>;
  getTransactionHistory(userId: string, limit?: number): Promise<TokenTransaction[]>;
  getPackages(): Promise<TokenPackage[]>;
  getPackageByStripePrice(stripePriceId: string): Promise<TokenPackage | null>;
  getFeaturePricing(featureCode: string): Promise<TokenPricing | null>;
  adminAdjustBalance(userId: string, amount: number, description: string, adminId: string): Promise<TokenTransaction>;
}

interface CreditTokenParams {
  userId: string;
  amount: number;
  source: string;
  description: string;
  referenceId?: string;
  referenceType?: string;
  idempotencyKey?: string;
  metadata?: Record<string, unknown>;
}

interface DebitTokenParams {
  userId: string;
  amount: number;
  featureCode: string;
  description: string;
  referenceId?: string;
  metadata?: Record<string, unknown>;
}

class TokenServiceImpl implements TokenService {
  async getWallet(userId: string): Promise<TokenWallet | null> {
    const [wallet] = await db
      .select()
      .from(tokenWallets)
      .where(eq(tokenWallets.userId, userId))
      .limit(1);
    return wallet || null;
  }

  async getOrCreateWallet(userId: string): Promise<TokenWallet> {
    let wallet = await this.getWallet(userId);
    if (!wallet) {
      const [newWallet] = await db
        .insert(tokenWallets)
        .values({ userId, balance: 0, totalEarned: 0, totalSpent: 0 })
        .onConflictDoNothing()
        .returning();
      
      if (newWallet) {
        wallet = newWallet;
      } else {
        wallet = await this.getWallet(userId);
      }
    }
    return wallet!;
  }

  async getBalance(userId: string): Promise<number> {
    const wallet = await this.getWallet(userId);
    return wallet?.balance ?? 0;
  }

  async creditTokens(params: CreditTokenParams): Promise<TokenTransaction> {
    const { userId, amount, source, description, referenceId, referenceType, idempotencyKey, metadata } = params;

    if (idempotencyKey) {
      const [existing] = await db
        .select()
        .from(tokenTransactions)
        .where(eq(tokenTransactions.idempotencyKey, idempotencyKey))
        .limit(1);
      
      if (existing) {
        console.log(`[TokenService] Duplicate transaction prevented: ${idempotencyKey}`);
        return existing;
      }
    }

    const wallet = await this.getOrCreateWallet(userId);
    const newBalance = wallet.balance + amount;

    await db
      .update(tokenWallets)
      .set({
        balance: newBalance,
        totalEarned: wallet.totalEarned + amount,
        updatedAt: new Date(),
      })
      .where(eq(tokenWallets.userId, userId));

    const [transaction] = await db
      .insert(tokenTransactions)
      .values({
        userId,
        type: "credit",
        source,
        amount,
        balanceAfter: newBalance,
        description,
        referenceId,
        referenceType,
        idempotencyKey,
        metadata: metadata || null,
      })
      .returning();

    console.log(`[TokenService] Credited ${amount} tokens to user ${userId}. New balance: ${newBalance}`);
    return transaction;
  }

  async debitTokens(params: DebitTokenParams): Promise<TokenTransaction | { error: string }> {
    const { userId, amount, featureCode, description, referenceId, metadata } = params;

    const wallet = await this.getOrCreateWallet(userId);
    
    if (wallet.balance < amount) {
      return { 
        error: `Insufficient tokens. Required: ${amount}, Available: ${wallet.balance}` 
      };
    }

    const newBalance = wallet.balance - amount;

    await db
      .update(tokenWallets)
      .set({
        balance: newBalance,
        totalSpent: wallet.totalSpent + amount,
        updatedAt: new Date(),
      })
      .where(eq(tokenWallets.userId, userId));

    const [transaction] = await db
      .insert(tokenTransactions)
      .values({
        userId,
        type: "debit",
        source: "spend",
        amount: -amount,
        balanceAfter: newBalance,
        description,
        referenceId,
        referenceType: featureCode,
        metadata: metadata || null,
      })
      .returning();

    console.log(`[TokenService] Debited ${amount} tokens from user ${userId}. New balance: ${newBalance}`);
    return transaction;
  }

  async getTransactionHistory(userId: string, limit: number = 50): Promise<TokenTransaction[]> {
    return db
      .select()
      .from(tokenTransactions)
      .where(eq(tokenTransactions.userId, userId))
      .orderBy(desc(tokenTransactions.createdAt))
      .limit(limit);
  }

  async getPackages(): Promise<TokenPackage[]> {
    return db
      .select()
      .from(tokenPackages)
      .where(eq(tokenPackages.status, "active"))
      .orderBy(tokenPackages.sortOrder);
  }

  async getPackageByStripePrice(stripePriceId: string): Promise<TokenPackage | null> {
    const [pkg] = await db
      .select()
      .from(tokenPackages)
      .where(eq(tokenPackages.stripePriceId, stripePriceId))
      .limit(1);
    return pkg || null;
  }

  async getFeaturePricing(featureCode: string): Promise<TokenPricing | null> {
    const [pricing] = await db
      .select()
      .from(tokenPricing)
      .where(and(
        eq(tokenPricing.featureCode, featureCode),
        eq(tokenPricing.isActive, 1)
      ))
      .limit(1);
    return pricing || null;
  }

  async adminAdjustBalance(
    userId: string, 
    amount: number, 
    description: string, 
    adminId: string
  ): Promise<TokenTransaction> {
    const wallet = await this.getOrCreateWallet(userId);
    const newBalance = wallet.balance + amount;

    if (newBalance < 0) {
      throw new Error("Cannot adjust balance below zero");
    }

    await db
      .update(tokenWallets)
      .set({
        balance: newBalance,
        totalEarned: amount > 0 ? wallet.totalEarned + amount : wallet.totalEarned,
        totalSpent: amount < 0 ? wallet.totalSpent + Math.abs(amount) : wallet.totalSpent,
        updatedAt: new Date(),
      })
      .where(eq(tokenWallets.userId, userId));

    const [transaction] = await db
      .insert(tokenTransactions)
      .values({
        userId,
        type: "adjustment",
        source: "admin",
        amount,
        balanceAfter: newBalance,
        description,
        referenceId: adminId,
        referenceType: "admin_adjustment",
        metadata: { adjustedBy: adminId },
      })
      .returning();

    console.log(`[TokenService] Admin ${adminId} adjusted user ${userId} balance by ${amount}. New balance: ${newBalance}`);
    return transaction;
  }

  async createPackage(pkg: {
    name: string;
    description?: string;
    tokens: number;
    bonusTokens?: number;
    priceUsd: number;
    stripePriceId?: string;
    stripeProductId?: string;
  }): Promise<TokenPackage> {
    const [created] = await db
      .insert(tokenPackages)
      .values({
        name: pkg.name,
        description: pkg.description || null,
        tokens: pkg.tokens,
        bonusTokens: pkg.bonusTokens || 0,
        priceUsd: pkg.priceUsd,
        stripePriceId: pkg.stripePriceId || null,
        stripeProductId: pkg.stripeProductId || null,
        status: "active",
        sortOrder: 0,
      })
      .returning();
    return created;
  }

  async setFeaturePricing(featureCode: string, featureName: string, tokensRequired: number, description?: string): Promise<TokenPricing> {
    const [pricing] = await db
      .insert(tokenPricing)
      .values({
        featureCode,
        featureName,
        tokensRequired,
        description: description || null,
        isActive: 1,
      })
      .onConflictDoUpdate({
        target: tokenPricing.featureCode,
        set: {
          featureName,
          tokensRequired,
          description: description || null,
          isActive: 1,
          updatedAt: new Date(),
        },
      })
      .returning();
    return pricing;
  }
}

export const tokenService = new TokenServiceImpl();
