import * as client from "openid-client";
import { Strategy, type VerifyFunction } from "openid-client/passport";

import passport from "passport";
import session from "express-session";
import type { Express, RequestHandler } from "express";
import memoize from "memoizee";
import connectPg from "connect-pg-simple";
import { storage } from "./storage";
import { db } from "../db";
import { websiteGrades, users } from "@shared/schema";
import { eq } from "drizzle-orm";

const getOidcConfig = memoize(
  async () => {
    return await client.discovery(
      new URL(process.env.ISSUER_URL ?? "https://replit.com/oidc"),
      process.env.REPL_ID!
    );
  },
  { maxAge: 3600 * 1000 }
);

export function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: false,
    ttl: sessionTtl,
    tableName: "sessions",
  });
  return session({
    secret: process.env.SESSION_SECRET!,
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: true,
      maxAge: sessionTtl,
    },
  });
}

function updateUserSession(
  user: any,
  tokens: client.TokenEndpointResponse & client.TokenEndpointResponseHelpers
) {
  user.claims = tokens.claims();
  user.access_token = tokens.access_token;
  user.refresh_token = tokens.refresh_token;
  user.expires_at = user.claims?.exp;
}

const SUPERUSER_EMAILS = [
  "trifused@gmail.com",
];

async function upsertUser(claims: any) {
  const email = claims["email"];
  const userId = claims["sub"];
  const existingUser = await storage.getUser(userId);
  
  let role = existingUser?.role || "guest";
  if (email && SUPERUSER_EMAILS.includes(email.toLowerCase()) && role !== "superuser") {
    role = "superuser";
  }

  await storage.upsertUser({
    id: userId,
    email: email,
    firstName: claims["first_name"],
    lastName: claims["last_name"],
    profileImageUrl: claims["profile_image_url"],
    role: role,
  });
}

export async function setupAuth(app: Express) {
  app.set("trust proxy", 1);
  app.use(getSession());
  app.use(passport.initialize());
  app.use(passport.session());

  const config = await getOidcConfig();

  const verify: VerifyFunction = async (
    tokens: client.TokenEndpointResponse & client.TokenEndpointResponseHelpers,
    verified: passport.AuthenticateCallback
  ) => {
    const user: any = {};
    updateUserSession(user, tokens);
    // Store claims on user for later processing
    user.claims = tokens.claims();
    // Just upsert user without onboarding context - that happens in callback
    await upsertUser(tokens.claims());
    verified(null, user);
  };

  const registeredStrategies = new Set<string>();

  const ensureStrategy = (domain: string) => {
    const strategyName = `replitauth:${domain}`;
    if (!registeredStrategies.has(strategyName)) {
      const strategy = new Strategy(
        {
          name: strategyName,
          config,
          scope: "openid email profile offline_access",
          callbackURL: `https://${domain}/api/callback`,
        },
        verify,
      );
      passport.use(strategy);
      registeredStrategies.add(strategyName);
    }
  };

  passport.serializeUser((user: Express.User, cb) => cb(null, user));
  passport.deserializeUser((user: Express.User, cb) => cb(null, user));

  app.get("/api/login", (req, res, next) => {
    // Store returnTo URL in session for use after OAuth callback
    const returnTo = req.query.returnTo as string;
    if (returnTo && req.session) {
      (req.session as any).returnTo = returnTo;
    }
    
    // Store onboarding context for linking after OAuth callback
    if (req.session) {
      const onboardingContext: any = {};
      
      // Capture gradeShareToken for linking website grade to user
      if (req.query.gradeShareToken) {
        onboardingContext.gradeShareToken = req.query.gradeShareToken as string;
      }
      
      // Capture offer selection from vibe2a
      if (req.query.offerId) {
        onboardingContext.offerId = req.query.offerId as string;
      }
      if (req.query.offerName) {
        onboardingContext.offerName = req.query.offerName as string;
      }
      
      // Capture website URL that was graded
      if (req.query.websiteUrl) {
        onboardingContext.websiteUrl = req.query.websiteUrl as string;
      }
      
      // Capture source page
      if (req.query.source) {
        onboardingContext.source = req.query.source as string;
      }
      
      // Capture niche selection
      if (req.query.niche) {
        onboardingContext.niche = req.query.niche as string;
      }
      
      // Capture session tracking data (clickPath, pageViews, utmParams)
      if (req.query.clickPath) {
        try {
          onboardingContext.clickPath = JSON.parse(req.query.clickPath as string);
        } catch (e) {
          console.error('[Auth] Failed to parse clickPath:', e);
        }
      }
      if (req.query.pageViews) {
        try {
          onboardingContext.pageViews = JSON.parse(req.query.pageViews as string);
        } catch (e) {
          console.error('[Auth] Failed to parse pageViews:', e);
        }
      }
      if (req.query.utmParams) {
        try {
          onboardingContext.utmParams = JSON.parse(req.query.utmParams as string);
        } catch (e) {
          console.error('[Auth] Failed to parse utmParams:', e);
        }
      }
      if (req.query.sessionDuration) {
        onboardingContext.sessionDuration = parseInt(req.query.sessionDuration as string, 10);
      }
      
      if (Object.keys(onboardingContext).length > 0) {
        (req.session as any).onboardingContext = onboardingContext;
        console.log('[Auth] Stored onboarding context:', JSON.stringify(onboardingContext));
      }
    }
    
    ensureStrategy(req.hostname);
    passport.authenticate(`replitauth:${req.hostname}`, {
      prompt: "login consent",
      scope: ["openid", "email", "profile", "offline_access"],
    })(req, res, next);
  });

  app.get("/api/callback", (req, res, next) => {
    ensureStrategy(req.hostname);
    
    // Get stored returnTo URL from session
    const returnTo = (req.session as any)?.returnTo || "/portal/dashboard";
    // Get onboarding context from session
    const onboardingContext = (req.session as any)?.onboardingContext;
    
    // Clear stored session data
    if (req.session) {
      delete (req.session as any).returnTo;
      delete (req.session as any).onboardingContext;
    }
    
    passport.authenticate(`replitauth:${req.hostname}`, async (err: any, user: any, info: any) => {
      if (err) {
        console.error('[Auth] Callback error:', err);
        return res.redirect('/api/login');
      }
      if (!user) {
        console.error('[Auth] No user returned:', info);
        return res.redirect('/api/login');
      }
      
      // Log in the user
      req.login(user, async (loginErr) => {
        if (loginErr) {
          console.error('[Auth] Login error:', loginErr);
          return res.redirect('/api/login');
        }
        
        // Process onboarding context after successful login
        if (onboardingContext && Object.keys(onboardingContext).length > 0) {
          const userId = user.claims?.sub;
          if (userId) {
            console.log(`[Auth] Processing onboarding context for user ${userId}:`, JSON.stringify(onboardingContext));
            
            // Link website grade to user if gradeShareToken was provided
            if (onboardingContext.gradeShareToken) {
              try {
                const result = await db.update(websiteGrades)
                  .set({ userId: userId })
                  .where(eq(websiteGrades.shareToken, onboardingContext.gradeShareToken))
                  .returning();
                if (result.length > 0) {
                  console.log(`[Auth] Linked grade ${onboardingContext.gradeShareToken} to user ${userId}`);
                } else {
                  console.log(`[Auth] No grade found with shareToken ${onboardingContext.gradeShareToken}`);
                }
              } catch (gradeError) {
                console.error('[Auth] Failed to link grade to user:', gradeError);
              }
            }
            
            // Store onboarding metadata on user record
            try {
              const existingUser = await storage.getUser(userId);
              if (!existingUser?.onboardingMetadata) {
                const metadata = {
                  source: onboardingContext.source || 'oauth',
                  signupTimestamp: new Date().toISOString(),
                  gradeShareToken: onboardingContext.gradeShareToken,
                  websiteUrl: onboardingContext.websiteUrl,
                  offerId: onboardingContext.offerId,
                  offerName: onboardingContext.offerName,
                  niche: onboardingContext.niche,
                  clickPath: onboardingContext.clickPath,
                  pageViews: onboardingContext.pageViews,
                  utmParams: onboardingContext.utmParams,
                  sessionDuration: onboardingContext.sessionDuration,
                };
                
                await db.update(users)
                  .set({ 
                    onboardingMetadata: metadata,
                    updatedAt: new Date()
                  })
                  .where(eq(users.id, userId));
                console.log(`[Auth] Stored onboarding metadata for user ${userId}`);
              }
            } catch (metaError) {
              console.error('[Auth] Failed to store onboarding metadata:', metaError);
            }
          }
        }
        
        // Redirect to the intended destination
        return res.redirect(returnTo);
      });
    })(req, res, next);
  });

  app.get("/api/logout", (req, res) => {
    req.logout(() => {
      res.redirect(
        client.buildEndSessionUrl(config, {
          client_id: process.env.REPL_ID!,
          post_logout_redirect_uri: `${req.protocol}://${req.hostname}`,
        }).href
      );
    });
  });
}

export const isAuthenticated: RequestHandler = async (req, res, next) => {
  const user = req.user as any;

  if (!req.isAuthenticated() || !user.expires_at) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const now = Math.floor(Date.now() / 1000);
  if (now <= user.expires_at) {
    return next();
  }

  const refreshToken = user.refresh_token;
  if (!refreshToken) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  try {
    const config = await getOidcConfig();
    const tokenResponse = await client.refreshTokenGrant(config, refreshToken);
    updateUserSession(user, tokenResponse);
    return next();
  } catch (error) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }
};
