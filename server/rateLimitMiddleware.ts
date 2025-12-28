import rateLimit from 'express-rate-limit';
import { Request, Response, NextFunction } from 'express';
import { apiService } from './apiService';
import { db } from '../db';
import { rateLimitEvents, rateLimitOverrides } from '@shared/schema';
import { eq, and, or, gt, isNull } from 'drizzle-orm';

const TIER_LIMITS: Record<string, { windowMs: number; max: number; dailyMax: number }> = {
  free: { windowMs: 60 * 1000, max: 10, dailyMax: 100 },
  anonymous: { windowMs: 60 * 1000, max: 10, dailyMax: 100 },
  starter: { windowMs: 60 * 1000, max: 30, dailyMax: 1000 },
  pro: { windowMs: 60 * 1000, max: 60, dailyMax: 5000 },
  enterprise: { windowMs: 60 * 1000, max: 300, dailyMax: 100000 },
};

export function getTierLimits() {
  return TIER_LIMITS;
}

const overrideCache = new Map<string, { maxPerMinute: number; maxPerDay: number; expiresAt: number }>();
const OVERRIDE_CACHE_TTL = 60 * 1000;

async function getOverride(targetType: string, targetId: string): Promise<{ maxPerMinute: number; maxPerDay: number } | null> {
  const cacheKey = `${targetType}:${targetId}`;
  const cached = overrideCache.get(cacheKey);
  
  if (cached && cached.expiresAt > Date.now()) {
    return { maxPerMinute: cached.maxPerMinute, maxPerDay: cached.maxPerDay };
  }

  try {
    const [override] = await db
      .select()
      .from(rateLimitOverrides)
      .where(and(
        eq(rateLimitOverrides.targetType, targetType),
        eq(rateLimitOverrides.targetId, targetId),
        eq(rateLimitOverrides.isActive, 1),
        or(
          isNull(rateLimitOverrides.expiresAt),
          gt(rateLimitOverrides.expiresAt, new Date())
        )
      ))
      .limit(1);

    if (override) {
      overrideCache.set(cacheKey, {
        maxPerMinute: override.maxPerMinute,
        maxPerDay: override.maxPerDay,
        expiresAt: Date.now() + OVERRIDE_CACHE_TTL,
      });
      return { maxPerMinute: override.maxPerMinute, maxPerDay: override.maxPerDay };
    }
  } catch (error) {
    console.error('Error fetching rate limit override:', error);
  }

  return null;
}

async function logRateLimitEvent(event: {
  identifier: string;
  identifierType: string;
  userId?: string;
  tier: string;
  endpoint: string;
  method: string;
  wasBlocked: boolean;
  requestCount: number;
  limitMax: number;
  windowMs: number;
  ipAddress?: string;
  userAgent?: string;
  responseTimeMs?: number;
}): Promise<void> {
  try {
    await db.insert(rateLimitEvents).values({
      identifier: event.identifier,
      identifierType: event.identifierType,
      userId: event.userId || null,
      tier: event.tier,
      endpoint: event.endpoint,
      method: event.method,
      wasBlocked: event.wasBlocked ? 1 : 0,
      requestCount: event.requestCount,
      limitMax: event.limitMax,
      windowMs: event.windowMs,
      ipAddress: event.ipAddress || null,
      userAgent: event.userAgent || null,
      responseTimeMs: event.responseTimeMs || null,
    });
  } catch (error) {
    console.error('Error logging rate limit event:', error);
  }
}

export const apiKeyAuth = async (req: Request, res: Response, next: NextFunction) => {
  const apiKey = req.headers['x-api-key'] as string;
  
  if (!apiKey) {
    return res.status(401).json({ 
      error: 'API key required',
      message: 'Please provide an API key via x-api-key header'
    });
  }

  try {
    const validatedKey = await apiService.validateApiKey(apiKey);
    
    if (!validatedKey) {
      return res.status(401).json({ 
        error: 'Invalid or expired API key',
        message: 'The provided API key is invalid, revoked, or expired'
      });
    }

    const quota = await apiService.getUserQuota(validatedKey.userId);
    const tier = await apiService.getUserTier(validatedKey.userId);
    const tierName = tier?.name || 'free';

    res.locals.apiKey = validatedKey;
    res.locals.userId = validatedKey.userId;
    res.locals.apiTier = tierName;
    res.locals.apiQuota = quota;
    res.locals.tierLimits = TIER_LIMITS[tierName] || TIER_LIMITS.free;

    next();
  } catch (error) {
    console.error('API key validation error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const optionalApiKeyAuth = async (req: Request, res: Response, next: NextFunction) => {
  const apiKey = req.headers['x-api-key'] as string;
  
  if (!apiKey) {
    res.locals.apiTier = 'anonymous';
    res.locals.tierLimits = TIER_LIMITS.free;
    return next();
  }

  try {
    const validatedKey = await apiService.validateApiKey(apiKey);
    
    if (!validatedKey) {
      return res.status(401).json({ 
        error: 'Invalid or expired API key',
        message: 'The provided API key is invalid, revoked, or expired'
      });
    }

    const quota = await apiService.getUserQuota(validatedKey.userId);
    const tier = await apiService.getUserTier(validatedKey.userId);
    const tierName = tier?.name || 'free';

    res.locals.apiKey = validatedKey;
    res.locals.userId = validatedKey.userId;
    res.locals.apiTier = tierName;
    res.locals.apiQuota = quota;
    res.locals.tierLimits = TIER_LIMITS[tierName] || TIER_LIMITS.free;

    next();
  } catch (error) {
    console.error('API key validation error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

export const apiRateLimit = async (req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now();
  const apiKeyId = res.locals.apiKey?.id;
  const userId = res.locals.userId;
  const tierName = res.locals.apiTier || 'anonymous';
  
  let limits = TIER_LIMITS[tierName] || TIER_LIMITS.free;
  const now = Date.now();
  
  const identifier = apiKeyId || req.ip || 'unknown';
  const identifierType = apiKeyId ? 'api_key' : 'ip';

  const override = await getOverride(identifierType, identifier);
  if (override) {
    limits = { windowMs: 60 * 1000, max: override.maxPerMinute, dailyMax: override.maxPerDay };
  }

  const windowKey = `${identifier}:${Math.floor(now / limits.windowMs)}`;
  
  let record = rateLimitStore.get(windowKey);
  
  if (!record || record.resetAt < now) {
    record = { count: 0, resetAt: now + limits.windowMs };
    rateLimitStore.set(windowKey, record);
  }
  
  record.count++;
  
  const remaining = Math.max(0, limits.max - record.count);
  const resetTime = Math.ceil((record.resetAt - now) / 1000);
  const wasBlocked = record.count > limits.max;
  
  res.setHeader('X-RateLimit-Limit', limits.max.toString());
  res.setHeader('X-RateLimit-Remaining', remaining.toString());
  res.setHeader('X-RateLimit-Reset', resetTime.toString());
  res.setHeader('X-RateLimit-Tier', tierName);

  logRateLimitEvent({
    identifier,
    identifierType,
    userId,
    tier: tierName,
    endpoint: req.path,
    method: req.method,
    wasBlocked,
    requestCount: record.count,
    limitMax: limits.max,
    windowMs: limits.windowMs,
    ipAddress: req.ip,
    userAgent: req.headers['user-agent'],
    responseTimeMs: Date.now() - startTime,
  }).catch(() => {});
  
  if (wasBlocked) {
    return res.status(429).json({
      error: 'Rate limit exceeded',
      message: `You have exceeded ${limits.max} requests per minute. Please wait ${resetTime} seconds.`,
      retryAfter: resetTime,
      tier: tierName,
      limit: limits.max,
    });
  }
  
  next();
};

export const generalApiRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Too many requests',
    message: 'Please try again in 15 minutes'
  }
});

export const strictRateLimit = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Rate limit exceeded',
    message: 'Too many requests. Please wait a minute.'
  }
});

setInterval(() => {
  const now = Date.now();
  const keysToDelete: string[] = [];
  rateLimitStore.forEach((record, key) => {
    if (record.resetAt < now) {
      keysToDelete.push(key);
    }
  });
  keysToDelete.forEach(key => rateLimitStore.delete(key));
}, 60000);
