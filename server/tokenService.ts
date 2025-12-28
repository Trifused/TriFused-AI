import { db } from "../db";
import { Pool } from "pg";
import { 
  tokenWallets, 
  tokenTransactions, 
  tokenPackages, 
  tokenPricing,
  type TokenWallet,
  type TokenTransaction,
  type TokenPackage,
  type TokenPricing,
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

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

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

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      if (idempotencyKey) {
        const existingResult = await client.query(
          'SELECT * FROM token_transactions WHERE idempotency_key = $1 LIMIT 1',
          [idempotencyKey]
        );
        
        if (existingResult.rows.length > 0) {
          await client.query('COMMIT');
          console.log(`[TokenService] Duplicate transaction prevented: ${idempotencyKey}`);
          return this.rowToTransaction(existingResult.rows[0]);
        }
      }

      const walletResult = await client.query(
        `INSERT INTO token_wallets (user_id, balance, total_earned, total_spent, created_at, updated_at)
         VALUES ($1, 0, 0, 0, NOW(), NOW())
         ON CONFLICT (user_id) DO UPDATE SET updated_at = NOW()
         RETURNING *`,
        [userId]
      );

      const lockedWallet = await client.query(
        'SELECT * FROM token_wallets WHERE user_id = $1 FOR UPDATE',
        [userId]
      );
      
      const currentBalance = lockedWallet.rows[0].balance;
      const currentEarned = lockedWallet.rows[0].total_earned;
      const newBalance = currentBalance + amount;
      const newEarned = currentEarned + amount;

      await client.query(
        `UPDATE token_wallets 
         SET balance = $1, total_earned = $2, updated_at = NOW() 
         WHERE user_id = $3`,
        [newBalance, newEarned, userId]
      );

      const txResult = await client.query(
        `INSERT INTO token_transactions 
         (id, user_id, type, source, amount, balance_after, description, reference_id, reference_type, idempotency_key, metadata, created_at)
         VALUES (gen_random_uuid(), $1, 'credit', $2, $3, $4, $5, $6, $7, $8, $9, NOW())
         RETURNING *`,
        [userId, source, amount, newBalance, description, referenceId || null, referenceType || null, idempotencyKey || null, metadata ? JSON.stringify(metadata) : null]
      );

      await client.query('COMMIT');
      console.log(`[TokenService] Credited ${amount} tokens to user ${userId}. New balance: ${newBalance}`);
      return this.rowToTransaction(txResult.rows[0]);
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async debitTokens(params: DebitTokenParams): Promise<TokenTransaction | { error: string }> {
    const { userId, amount, featureCode, description, referenceId, metadata } = params;

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      await client.query(
        `INSERT INTO token_wallets (user_id, balance, total_earned, total_spent, created_at, updated_at)
         VALUES ($1, 0, 0, 0, NOW(), NOW())
         ON CONFLICT (user_id) DO NOTHING`,
        [userId]
      );

      const lockedWallet = await client.query(
        'SELECT * FROM token_wallets WHERE user_id = $1 FOR UPDATE',
        [userId]
      );
      
      if (lockedWallet.rows.length === 0) {
        await client.query('ROLLBACK');
        return { error: `Insufficient tokens. Required: ${amount}, Available: 0` };
      }

      const currentBalance = lockedWallet.rows[0].balance;
      const currentSpent = lockedWallet.rows[0].total_spent;

      if (currentBalance < amount) {
        await client.query('ROLLBACK');
        return { error: `Insufficient tokens. Required: ${amount}, Available: ${currentBalance}` };
      }

      const newBalance = currentBalance - amount;
      const newSpent = currentSpent + amount;

      await client.query(
        `UPDATE token_wallets 
         SET balance = $1, total_spent = $2, updated_at = NOW() 
         WHERE user_id = $3`,
        [newBalance, newSpent, userId]
      );

      const txResult = await client.query(
        `INSERT INTO token_transactions 
         (id, user_id, type, source, amount, balance_after, description, reference_id, reference_type, metadata, created_at)
         VALUES (gen_random_uuid(), $1, 'debit', 'spend', $2, $3, $4, $5, $6, $7, NOW())
         RETURNING *`,
        [userId, -amount, newBalance, description, referenceId || null, featureCode, metadata ? JSON.stringify(metadata) : null]
      );

      await client.query('COMMIT');
      console.log(`[TokenService] Debited ${amount} tokens from user ${userId}. New balance: ${newBalance}`);
      return this.rowToTransaction(txResult.rows[0]);
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
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
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      await client.query(
        `INSERT INTO token_wallets (user_id, balance, total_earned, total_spent, created_at, updated_at)
         VALUES ($1, 0, 0, 0, NOW(), NOW())
         ON CONFLICT (user_id) DO NOTHING`,
        [userId]
      );

      const lockedWallet = await client.query(
        'SELECT * FROM token_wallets WHERE user_id = $1 FOR UPDATE',
        [userId]
      );
      
      const currentBalance = lockedWallet.rows[0].balance;
      const currentEarned = lockedWallet.rows[0].total_earned;
      const currentSpent = lockedWallet.rows[0].total_spent;
      const newBalance = currentBalance + amount;

      if (newBalance < 0) {
        await client.query('ROLLBACK');
        throw new Error("Cannot adjust balance below zero");
      }

      const newEarned = amount > 0 ? currentEarned + amount : currentEarned;
      const newSpent = amount < 0 ? currentSpent + Math.abs(amount) : currentSpent;

      await client.query(
        `UPDATE token_wallets 
         SET balance = $1, total_earned = $2, total_spent = $3, updated_at = NOW() 
         WHERE user_id = $4`,
        [newBalance, newEarned, newSpent, userId]
      );

      const txResult = await client.query(
        `INSERT INTO token_transactions 
         (id, user_id, type, source, amount, balance_after, description, reference_id, reference_type, metadata, created_at)
         VALUES (gen_random_uuid(), $1, 'adjustment', 'admin', $2, $3, $4, $5, 'admin_adjustment', $6, NOW())
         RETURNING *`,
        [userId, amount, newBalance, description, adminId, JSON.stringify({ adjustedBy: adminId })]
      );

      await client.query('COMMIT');
      console.log(`[TokenService] Admin ${adminId} adjusted user ${userId} balance by ${amount}. New balance: ${newBalance}`);
      return this.rowToTransaction(txResult.rows[0]);
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
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

  private rowToTransaction(row: any): TokenTransaction {
    return {
      id: row.id,
      userId: row.user_id,
      type: row.type,
      source: row.source,
      amount: row.amount,
      balanceAfter: row.balance_after,
      description: row.description,
      referenceId: row.reference_id,
      referenceType: row.reference_type,
      idempotencyKey: row.idempotency_key,
      metadata: row.metadata,
      createdAt: row.created_at,
    };
  }
}

export const tokenService = new TokenServiceImpl();
