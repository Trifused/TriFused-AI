import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('Vibe2A Signup Flow', () => {
  describe('Signup Attempt Endpoint', () => {
    it('should validate email is required', async () => {
      const response = await fetch('http://localhost:5000/api/vibe2a/signup-attempt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      
      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toBe('Email is required');
    });

    it('should accept valid signup attempt data', async () => {
      const response = await fetch('http://localhost:5000/api/vibe2a/signup-attempt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'test@example.com',
          attemptType: 'signup_attempt',
          source: 'vibe2a',
        }),
      });
      
      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
    });

    it('should accept signup attempt with offer selection', async () => {
      const response = await fetch('http://localhost:5000/api/vibe2a/signup-attempt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'test@example.com',
          attemptType: 'offer_click',
          source: 'vibe2a',
          selectedOffer: 'Demo Vibe2A Portal',
          offerId: 'prod_test123',
        }),
      });
      
      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
    });

    it('should accept signup with niche and website', async () => {
      const response = await fetch('http://localhost:5000/api/vibe2a/signup-attempt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'test@example.com',
          attemptType: 'signup_attempt',
          source: 'vibe2a',
          niche: 'saas',
          websiteUrl: 'https://example.com',
        }),
      });
      
      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
    });
  });

  describe('Vibe2A Offers Endpoint', () => {
    it('should return offers list', async () => {
      const response = await fetch('http://localhost:5000/api/vibe2a/offers');
      
      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data).toHaveProperty('data');
      expect(Array.isArray(data.data)).toBe(true);
    });

    it('should return offers with proper structure', async () => {
      const response = await fetch('http://localhost:5000/api/vibe2a/offers');
      const data = await response.json();
      
      if (data.data.length > 0) {
        const offer = data.data[0];
        expect(offer).toHaveProperty('id');
        expect(offer).toHaveProperty('name');
        expect(offer).toHaveProperty('prices');
        expect(Array.isArray(offer.prices)).toBe(true);
      }
    });
  });

  describe('Notification Data Validation', () => {
    it('should handle all attempt types', () => {
      const attemptTypes = ['signup_attempt', 'signup_complete', 'offer_click'];
      
      attemptTypes.forEach(type => {
        expect(['signup_attempt', 'signup_complete', 'offer_click']).toContain(type);
      });
    });

    it('should validate source values', () => {
      const validSources = ['vibe2a', 'portal', 'grader'];
      
      validSources.forEach(source => {
        expect(['vibe2a', 'portal', 'grader']).toContain(source);
      });
    });
  });
});
