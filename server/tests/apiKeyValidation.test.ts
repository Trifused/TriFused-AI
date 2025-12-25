import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { apiService } from '../apiService';
import { db } from '../../db';
import { users, apiKeys } from '../../shared/schema';
import { eq } from 'drizzle-orm';

describe('API Key Validation with Impersonation', () => {
  let superUserId: string;
  let regularUserId: string;
  let superUserApiKeyId: string;
  let regularUserApiKeyId: string;

  beforeAll(async () => {
    superUserId = 'test-super-user-' + Date.now();
    regularUserId = 'test-regular-user-' + Date.now();

    await db.insert(users).values([
      { id: superUserId, email: 'super@test.com', role: 'superuser' },
      { id: regularUserId, email: 'regular@test.com', role: 'validated' },
    ]);

    const superKey = await apiService.createApiKey(superUserId, 'Super User Key');
    superUserApiKeyId = superKey.id;

    const regularKey = await apiService.createApiKey(regularUserId, 'Regular User Key');
    regularUserApiKeyId = regularKey.id;
  });

  afterAll(async () => {
    await db.delete(apiKeys).where(eq(apiKeys.userId, superUserId));
    await db.delete(apiKeys).where(eq(apiKeys.userId, regularUserId));
    await db.delete(users).where(eq(users.id, superUserId));
    await db.delete(users).where(eq(users.id, regularUserId));
  });

  describe('getApiKeyById', () => {
    it('should return API key by ID', async () => {
      const key = await apiService.getApiKeyById(superUserApiKeyId);
      expect(key).toBeDefined();
      expect(key?.userId).toBe(superUserId);
      expect(key?.name).toBe('Super User Key');
    });

    it('should return undefined for non-existent key', async () => {
      const key = await apiService.getApiKeyById('non-existent-key-id');
      expect(key).toBeUndefined();
    });
  });

  describe('API Key Ownership Validation', () => {
    it('should validate key belongs to user', async () => {
      const key = await apiService.getApiKeyById(superUserApiKeyId);
      expect(key?.userId).toBe(superUserId);
      expect(key?.userId).not.toBe(regularUserId);
    });

    it('should allow superuser to access their own key while impersonating', async () => {
      const key = await apiService.getApiKeyById(superUserApiKeyId);
      
      const impersonatedUserId = regularUserId;
      const originalUserId = superUserId;
      
      const validOwner = key && (
        key.userId === impersonatedUserId || 
        key.userId === originalUserId
      );
      
      expect(validOwner).toBe(true);
    });

    it('should reject key that belongs to neither impersonated nor original user', async () => {
      const key = await apiService.getApiKeyById(regularUserApiKeyId);
      
      const impersonatedUserId = 'some-other-user';
      const originalUserId = 'another-user';
      
      const validOwner = key && (
        key.userId === impersonatedUserId || 
        key.userId === originalUserId
      );
      
      expect(validOwner).toBe(false);
    });
  });

  describe('getApiKeysByUser', () => {
    it('should return all keys for a user', async () => {
      const keys = await apiService.getApiKeysByUser(superUserId);
      expect(keys.length).toBeGreaterThanOrEqual(1);
      expect(keys.some(k => k.id === superUserApiKeyId)).toBe(true);
    });

    it('should not return keys from other users', async () => {
      const superKeys = await apiService.getApiKeysByUser(superUserId);
      const regularKeys = await apiService.getApiKeysByUser(regularUserId);
      
      const superKeyIds = superKeys.map(k => k.id);
      const regularKeyIds = regularKeys.map(k => k.id);
      
      expect(superKeyIds).not.toContain(regularUserApiKeyId);
      expect(regularKeyIds).not.toContain(superUserApiKeyId);
    });
  });
});

describe('Call Pack Management', () => {
  let testUserId: string;

  beforeAll(async () => {
    testUserId = 'test-callpack-user-' + Date.now();
    await db.insert(users).values({
      id: testUserId,
      email: 'callpack@test.com',
      role: 'validated',
    });
  });

  afterAll(async () => {
    await db.delete(users).where(eq(users.id, testUserId));
  });

  it('should add a call pack for user', async () => {
    const pack = await apiService.addCallPack(testUserId, 1000, 'test-session-123');
    
    expect(pack).toBeDefined();
    expect(pack.userId).toBe(testUserId);
    expect(pack.packSize).toBe(1000);
    expect(pack.callsRemaining).toBe(1000);
    expect(pack.stripeSessionId).toBe('test-session-123');
  });

  it('should retrieve call packs for user', async () => {
    const packs = await apiService.getCallPacks(testUserId);
    
    expect(packs.length).toBeGreaterThanOrEqual(1);
    expect(packs.some(p => p.stripeSessionId === 'test-session-123')).toBe(true);
  });

  it('should not return call packs from other users', async () => {
    const otherUserPacks = await apiService.getCallPacks('non-existent-user');
    expect(otherUserPacks.length).toBe(0);
  });
});
