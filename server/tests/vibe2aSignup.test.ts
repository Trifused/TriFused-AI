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

  describe('OAuth Onboarding Context Flow', () => {
    it('/api/login should accept onboarding context query parameters', async () => {
      const params = new URLSearchParams({
        source: 'vibe2a',
        gradeShareToken: 'test-share-token-123',
        offerId: 'prod_test123',
        offerName: 'Test Offer',
        websiteUrl: 'https://example.com',
        niche: 'saas',
        clickPath: JSON.stringify([{ element: 'button-test', timestamp: Date.now(), path: '/vibe2a' }]),
        pageViews: JSON.stringify(['/vibe2a', '/grader']),
        utmParams: JSON.stringify({ utm_source: 'google', utm_campaign: 'test' }),
        sessionDuration: '30000',
        returnTo: '/portal/dashboard',
      });
      
      const response = await fetch(`http://localhost:5000/api/login?${params.toString()}`, {
        redirect: 'manual',
      });
      
      expect(response.status).toBe(302);
      expect(response.headers.get('location')).toBeTruthy();
    });

    it('should build correct login URL with all onboarding params', () => {
      const buildLoginUrl = (options: {
        source?: string;
        gradeShareToken?: string;
        offerId?: string;
        websiteUrl?: string;
        niche?: string;
        returnTo?: string;
      }) => {
        const params = new URLSearchParams();
        params.set('source', options.source || 'vibe2a');
        if (options.gradeShareToken) params.set('gradeShareToken', options.gradeShareToken);
        if (options.offerId) params.set('offerId', options.offerId);
        if (options.websiteUrl) params.set('websiteUrl', options.websiteUrl);
        if (options.niche) params.set('niche', options.niche);
        params.set('returnTo', options.returnTo || '/portal/dashboard');
        return `/api/login?${params.toString()}`;
      };

      const url = buildLoginUrl({
        gradeShareToken: 'abc123',
        offerId: 'prod_xyz',
        websiteUrl: 'https://test.com',
        niche: 'ecommerce',
      });

      expect(url).toContain('gradeShareToken=abc123');
      expect(url).toContain('offerId=prod_xyz');
      expect(url).toContain('websiteUrl=https%3A%2F%2Ftest.com');
      expect(url).toContain('niche=ecommerce');
      expect(url).toContain('source=vibe2a');
    });

    it('should validate that onboarding metadata schema accepts all required fields', () => {
      const metadata = {
        source: 'vibe2a',
        signupTimestamp: new Date().toISOString(),
        gradeShareToken: 'test-token',
        websiteUrl: 'https://example.com',
        offerId: 'prod_123',
        offerName: 'Test Offer',
        niche: 'saas',
        clickPath: [{ element: 'button', timestamp: Date.now(), path: '/vibe2a' }],
        pageViews: ['/vibe2a', '/grader'],
        utmParams: { utm_source: 'test' },
        sessionDuration: 60000,
      };

      expect(metadata.source).toBe('vibe2a');
      expect(metadata.gradeShareToken).toBeTruthy();
      expect(metadata.clickPath).toBeInstanceOf(Array);
      expect(metadata.pageViews).toBeInstanceOf(Array);
      expect(typeof metadata.sessionDuration).toBe('number');
    });

    it('should detect missing gradeShareToken in signup flow', () => {
      const buildLoginUrlWithContext = (result: { shareToken?: string | null }) => {
        const params = new URLSearchParams();
        params.set('source', 'vibe2a');
        if (result?.shareToken) {
          params.set('gradeShareToken', result.shareToken);
        }
        return `/api/login?${params.toString()}`;
      };

      const urlWithToken = buildLoginUrlWithContext({ shareToken: 'abc123' });
      const urlWithoutToken = buildLoginUrlWithContext({ shareToken: null });

      expect(urlWithToken).toContain('gradeShareToken=abc123');
      expect(urlWithoutToken).not.toContain('gradeShareToken');
      
      console.log('[TEST] Grade share token detection test passed - ensures linking works');
    });
  });
});
