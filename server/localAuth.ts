import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { db } from '../db';
import { users, emailVerificationTokens, passwordResetTokens, magicLinkTokens } from '@shared/schema';
import { eq, and, gt } from 'drizzle-orm';
import { Resend } from 'resend';

const SALT_ROUNDS = 12;
const TOKEN_EXPIRY_HOURS = 24;
const MAGIC_LINK_EXPIRY_MINUTES = 15;

async function getResendClient() {
  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME;
  const xReplitToken = process.env.REPL_IDENTITY 
    ? 'repl ' + process.env.REPL_IDENTITY 
    : process.env.WEB_REPL_RENEWAL 
    ? 'depl ' + process.env.WEB_REPL_RENEWAL 
    : null;

  if (!xReplitToken) {
    throw new Error('Resend token not available');
  }

  const connectionSettings = await fetch(
    'https://' + hostname + '/api/v2/connection?include_secrets=true&connector_names=resend',
    {
      headers: {
        'Accept': 'application/json',
        'X_REPLIT_TOKEN': xReplitToken
      }
    }
  ).then(res => res.json()).then(data => data.items?.[0]);

  if (!connectionSettings?.settings?.api_key) {
    throw new Error('Resend not connected');
  }

  return new Resend(connectionSettings.settings.api_key);
}

function generateSecureToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function registerUser(email: string, password: string, firstName?: string, lastName?: string): Promise<{ success: boolean; userId?: string; error?: string }> {
  try {
    const existing = await db.select().from(users).where(eq(users.email, email.toLowerCase()));
    if (existing.length > 0) {
      return { success: false, error: 'An account with this email already exists' };
    }

    const passwordHash = await hashPassword(password);
    const result = await db.insert(users).values({
      email: email.toLowerCase(),
      firstName,
      lastName,
      passwordHash,
      authProvider: 'local',
      emailVerified: 0,
      role: 'guest',
      status: 'pending',
    }).returning();

    const userId = result[0].id;
    await sendVerificationEmail(userId, email);

    return { success: true, userId };
  } catch (error: any) {
    console.error('Registration error:', error);
    return { success: false, error: error.message || 'Registration failed' };
  }
}

export async function loginUser(email: string, password: string): Promise<{ success: boolean; user?: any; error?: string }> {
  try {
    const userResults = await db.select().from(users).where(eq(users.email, email.toLowerCase()));
    if (userResults.length === 0) {
      return { success: false, error: 'Invalid email or password' };
    }

    const user = userResults[0];
    
    if (user.status === 'suspended' || user.status === 'banned') {
      return { success: false, error: 'Your account has been suspended' };
    }

    if (!user.passwordHash) {
      return { success: false, error: 'Please use social login for this account' };
    }

    const isValid = await verifyPassword(password, user.passwordHash);
    if (!isValid) {
      return { success: false, error: 'Invalid email or password' };
    }

    if (!user.emailVerified) {
      return { success: false, error: 'Please verify your email address first' };
    }

    await db.update(users).set({ lastLoginAt: new Date(), updatedAt: new Date() }).where(eq(users.id, user.id));

    return { 
      success: true, 
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        profileImageUrl: user.profileImageUrl,
      }
    };
  } catch (error: any) {
    console.error('Login error:', error);
    return { success: false, error: 'Login failed' };
  }
}

export async function sendVerificationEmail(userId: string, email: string): Promise<{ success: boolean; error?: string }> {
  try {
    const token = generateSecureToken();
    const expiresAt = new Date(Date.now() + TOKEN_EXPIRY_HOURS * 60 * 60 * 1000);

    await db.insert(emailVerificationTokens).values({
      userId,
      token,
      expiresAt,
    });

    const verifyUrl = `https://trifused.com/auth/verify-email?token=${token}`;
    const resend = await getResendClient();

    await resend.emails.send({
      from: 'TriFused <noreply@mailout1.trifused.com>',
      to: email,
      subject: 'Verify your email address - TriFused',
      html: generateVerificationEmailHtml(verifyUrl),
    });

    return { success: true };
  } catch (error: any) {
    console.error('Send verification email error:', error);
    return { success: false, error: error.message };
  }
}

export async function verifyEmail(token: string): Promise<{ success: boolean; error?: string }> {
  try {
    const tokens = await db.select()
      .from(emailVerificationTokens)
      .where(and(
        eq(emailVerificationTokens.token, token),
        gt(emailVerificationTokens.expiresAt, new Date())
      ));

    if (tokens.length === 0) {
      return { success: false, error: 'Invalid or expired verification link' };
    }

    const verificationToken = tokens[0];
    if (verificationToken.usedAt) {
      return { success: false, error: 'This link has already been used' };
    }

    await db.update(emailVerificationTokens)
      .set({ usedAt: new Date() })
      .where(eq(emailVerificationTokens.id, verificationToken.id));

    await db.update(users)
      .set({ 
        emailVerified: 1, 
        emailVerifiedAt: new Date(),
        status: 'active',
        role: 'validated',
        updatedAt: new Date() 
      })
      .where(eq(users.id, verificationToken.userId));

    return { success: true };
  } catch (error: any) {
    console.error('Verify email error:', error);
    return { success: false, error: 'Verification failed' };
  }
}

export async function sendPasswordResetEmail(email: string): Promise<{ success: boolean; error?: string }> {
  try {
    const userResults = await db.select().from(users).where(eq(users.email, email.toLowerCase()));
    if (userResults.length === 0) {
      return { success: true };
    }

    const user = userResults[0];
    const token = generateSecureToken();
    const expiresAt = new Date(Date.now() + TOKEN_EXPIRY_HOURS * 60 * 60 * 1000);

    await db.insert(passwordResetTokens).values({
      userId: user.id,
      token,
      expiresAt,
    });

    const resetUrl = `https://trifused.com/auth/reset-password?token=${token}`;
    const resend = await getResendClient();

    await resend.emails.send({
      from: 'TriFused <noreply@mailout1.trifused.com>',
      to: email,
      subject: 'Reset your password - TriFused',
      html: generatePasswordResetEmailHtml(resetUrl),
    });

    return { success: true };
  } catch (error: any) {
    console.error('Send password reset email error:', error);
    return { success: false, error: error.message };
  }
}

export async function resetPassword(token: string, newPassword: string): Promise<{ success: boolean; error?: string }> {
  try {
    const tokens = await db.select()
      .from(passwordResetTokens)
      .where(and(
        eq(passwordResetTokens.token, token),
        gt(passwordResetTokens.expiresAt, new Date())
      ));

    if (tokens.length === 0) {
      return { success: false, error: 'Invalid or expired reset link' };
    }

    const resetToken = tokens[0];
    if (resetToken.usedAt) {
      return { success: false, error: 'This link has already been used' };
    }

    const passwordHash = await hashPassword(newPassword);

    await db.update(passwordResetTokens)
      .set({ usedAt: new Date() })
      .where(eq(passwordResetTokens.id, resetToken.id));

    await db.update(users)
      .set({ passwordHash, updatedAt: new Date() })
      .where(eq(users.id, resetToken.userId));

    return { success: true };
  } catch (error: any) {
    console.error('Reset password error:', error);
    return { success: false, error: 'Password reset failed' };
  }
}

export async function sendMagicLink(email: string): Promise<{ success: boolean; error?: string }> {
  try {
    const token = generateSecureToken();
    const expiresAt = new Date(Date.now() + MAGIC_LINK_EXPIRY_MINUTES * 60 * 1000);

    await db.insert(magicLinkTokens).values({
      email: email.toLowerCase(),
      token,
      expiresAt,
    });

    const magicUrl = `https://trifused.com/auth/magic-link?token=${token}`;
    const resend = await getResendClient();

    await resend.emails.send({
      from: 'TriFused <noreply@mailout1.trifused.com>',
      to: email,
      subject: 'Your login link - TriFused',
      html: generateMagicLinkEmailHtml(magicUrl),
    });

    return { success: true };
  } catch (error: any) {
    console.error('Send magic link error:', error);
    return { success: false, error: error.message };
  }
}

export async function verifyMagicLink(token: string): Promise<{ success: boolean; user?: any; error?: string }> {
  try {
    const tokens = await db.select()
      .from(magicLinkTokens)
      .where(and(
        eq(magicLinkTokens.token, token),
        gt(magicLinkTokens.expiresAt, new Date())
      ));

    if (tokens.length === 0) {
      return { success: false, error: 'Invalid or expired link' };
    }

    const magicToken = tokens[0];
    if (magicToken.usedAt) {
      return { success: false, error: 'This link has already been used' };
    }

    await db.update(magicLinkTokens)
      .set({ usedAt: new Date() })
      .where(eq(magicLinkTokens.id, magicToken.id));

    let userResults = await db.select().from(users).where(eq(users.email, magicToken.email));
    
    if (userResults.length === 0) {
      const result = await db.insert(users).values({
        email: magicToken.email,
        authProvider: 'magic_link',
        emailVerified: 1,
        emailVerifiedAt: new Date(),
        role: 'validated',
        status: 'active',
      }).returning();
      userResults = result;
    } else {
      await db.update(users)
        .set({ 
          lastLoginAt: new Date(), 
          emailVerified: 1,
          emailVerifiedAt: userResults[0].emailVerifiedAt || new Date(),
          updatedAt: new Date() 
        })
        .where(eq(users.id, userResults[0].id));
    }

    const user = userResults[0];
    return { 
      success: true, 
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        profileImageUrl: user.profileImageUrl,
      }
    };
  } catch (error: any) {
    console.error('Verify magic link error:', error);
    return { success: false, error: 'Login failed' };
  }
}

export async function resendVerificationEmail(email: string): Promise<{ success: boolean; error?: string }> {
  try {
    const userResults = await db.select().from(users).where(eq(users.email, email.toLowerCase()));
    if (userResults.length === 0) {
      return { success: true };
    }

    const user = userResults[0];
    if (user.emailVerified) {
      return { success: false, error: 'Email is already verified' };
    }

    return sendVerificationEmail(user.id, email);
  } catch (error: any) {
    console.error('Resend verification error:', error);
    return { success: false, error: error.message };
  }
}

function generateVerificationEmailHtml(verifyUrl: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0a0a0f; color: #fff; padding: 40px 20px; margin: 0; }
    .container { max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); border-radius: 16px; border: 1px solid rgba(34, 211, 238, 0.2); padding: 40px; }
    h1 { color: #22d3ee; margin: 0 0 16px; font-size: 24px; }
    p { color: #94a3b8; line-height: 1.6; margin: 0 0 16px; }
    .button { display: inline-block; background: linear-gradient(135deg, #22d3ee, #0891b2); color: #0a0a0f; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; margin: 16px 0; }
    .footer { color: #64748b; font-size: 12px; margin-top: 32px; padding-top: 16px; border-top: 1px solid rgba(255,255,255,0.1); }
  </style>
</head>
<body>
  <div class="container">
    <h1>Verify Your Email</h1>
    <p>Thanks for signing up for TriFused! Please verify your email address to complete your registration.</p>
    <a href="${verifyUrl}" class="button">Verify Email Address</a>
    <p>This link expires in 24 hours. If you didn't create an account, you can safely ignore this email.</p>
    <div class="footer">
      <p>&copy; ${new Date().getFullYear()} TriFused. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
  `;
}

function generatePasswordResetEmailHtml(resetUrl: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0a0a0f; color: #fff; padding: 40px 20px; margin: 0; }
    .container { max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); border-radius: 16px; border: 1px solid rgba(34, 211, 238, 0.2); padding: 40px; }
    h1 { color: #22d3ee; margin: 0 0 16px; font-size: 24px; }
    p { color: #94a3b8; line-height: 1.6; margin: 0 0 16px; }
    .button { display: inline-block; background: linear-gradient(135deg, #22d3ee, #0891b2); color: #0a0a0f; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; margin: 16px 0; }
    .footer { color: #64748b; font-size: 12px; margin-top: 32px; padding-top: 16px; border-top: 1px solid rgba(255,255,255,0.1); }
  </style>
</head>
<body>
  <div class="container">
    <h1>Reset Your Password</h1>
    <p>We received a request to reset your password. Click the button below to choose a new password.</p>
    <a href="${resetUrl}" class="button">Reset Password</a>
    <p>This link expires in 24 hours. If you didn't request a password reset, you can safely ignore this email.</p>
    <div class="footer">
      <p>&copy; ${new Date().getFullYear()} TriFused. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
  `;
}

function generateMagicLinkEmailHtml(magicUrl: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0a0a0f; color: #fff; padding: 40px 20px; margin: 0; }
    .container { max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); border-radius: 16px; border: 1px solid rgba(34, 211, 238, 0.2); padding: 40px; }
    h1 { color: #22d3ee; margin: 0 0 16px; font-size: 24px; }
    p { color: #94a3b8; line-height: 1.6; margin: 0 0 16px; }
    .button { display: inline-block; background: linear-gradient(135deg, #22d3ee, #0891b2); color: #0a0a0f; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; margin: 16px 0; }
    .footer { color: #64748b; font-size: 12px; margin-top: 32px; padding-top: 16px; border-top: 1px solid rgba(255,255,255,0.1); }
  </style>
</head>
<body>
  <div class="container">
    <h1>Your Login Link</h1>
    <p>Click the button below to sign in to your TriFused account. No password needed!</p>
    <a href="${magicUrl}" class="button">Sign In</a>
    <p>This link expires in 15 minutes. If you didn't request this link, you can safely ignore this email.</p>
    <div class="footer">
      <p>&copy; ${new Date().getFullYear()} TriFused. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
  `;
}
