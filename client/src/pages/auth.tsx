import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLocation, useSearch } from "wouter";
import { 
  Mail, Lock, User, ArrowRight, Loader2, Eye, EyeOff, 
  Sparkles, CheckCircle2, AlertCircle, KeyRound
} from "lucide-react";
import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

type AuthMode = 'login' | 'register' | 'forgot-password' | 'reset-password' | 'verify-email' | 'magic-link';

export default function Auth() {
  const [, setLocation] = useLocation();
  const searchString = useSearch();
  const { toast } = useToast();
  
  const params = new URLSearchParams(searchString);
  const modeParam = params.get('mode') as AuthMode || 'login';
  const token = params.get('token');
  
  const [mode, setMode] = useState<AuthMode>(modeParam);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);
  const [verificationSuccess, setVerificationSuccess] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);

  useEffect(() => {
    setMode(modeParam);
    if (modeParam === 'verify-email' && token) {
      verifyEmailMutation.mutate(token);
    }
    if (modeParam === 'magic-link' && token) {
      verifyMagicLinkMutation.mutate(token);
    }
  }, [modeParam, token]);

  const registerMutation = useMutation({
    mutationFn: async (data: { email: string; password: string; firstName?: string; lastName?: string }) => {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error);
      return result;
    },
    onSuccess: () => {
      setVerificationSent(true);
      toast({ title: "Account created!", description: "Please check your email to verify your account." });
    },
    onError: (error: Error) => {
      toast({ title: "Registration failed", description: error.message, variant: "destructive" });
    }
  });

  const loginMutation = useMutation({
    mutationFn: async (data: { email: string; password: string }) => {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error);
      return result;
    },
    onSuccess: () => {
      toast({ title: "Welcome back!", description: "You've been logged in successfully." });
      setLocation('/portal/dashboard');
    },
    onError: (error: Error) => {
      toast({ title: "Login failed", description: error.message, variant: "destructive" });
    }
  });

  const forgotPasswordMutation = useMutation({
    mutationFn: async (email: string) => {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error);
      return result;
    },
    onSuccess: () => {
      toast({ title: "Check your email", description: "If an account exists, you'll receive a password reset link." });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  });

  const resetPasswordMutation = useMutation({
    mutationFn: async (data: { token: string; password: string }) => {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error);
      return result;
    },
    onSuccess: () => {
      setResetSuccess(true);
      toast({ title: "Password reset!", description: "You can now log in with your new password." });
    },
    onError: (error: Error) => {
      toast({ title: "Reset failed", description: error.message, variant: "destructive" });
    }
  });

  const verifyEmailMutation = useMutation({
    mutationFn: async (token: string) => {
      const res = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error);
      return result;
    },
    onSuccess: () => {
      setVerificationSuccess(true);
      toast({ title: "Email verified!", description: "You can now log in to your account." });
    },
    onError: (error: Error) => {
      toast({ title: "Verification failed", description: error.message, variant: "destructive" });
    }
  });

  const verifyMagicLinkMutation = useMutation({
    mutationFn: async (token: string) => {
      const res = await fetch('/api/auth/verify-magic-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error);
      return result;
    },
    onSuccess: () => {
      toast({ title: "Welcome!", description: "You've been logged in successfully." });
      setLocation('/portal/dashboard');
    },
    onError: (error: Error) => {
      toast({ title: "Login failed", description: error.message, variant: "destructive" });
    }
  });

  const sendMagicLinkMutation = useMutation({
    mutationFn: async (email: string) => {
      const res = await fetch('/api/auth/magic-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error);
      return result;
    },
    onSuccess: () => {
      toast({ title: "Check your email", description: "We've sent you a magic link to sign in." });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (mode === 'register') {
      if (password !== confirmPassword) {
        toast({ title: "Error", description: "Passwords don't match", variant: "destructive" });
        return;
      }
      if (password.length < 8) {
        toast({ title: "Error", description: "Password must be at least 8 characters", variant: "destructive" });
        return;
      }
      registerMutation.mutate({ email, password, firstName, lastName });
    } else if (mode === 'login') {
      loginMutation.mutate({ email, password });
    } else if (mode === 'forgot-password') {
      forgotPasswordMutation.mutate(email);
    } else if (mode === 'reset-password' && token) {
      if (password !== confirmPassword) {
        toast({ title: "Error", description: "Passwords don't match", variant: "destructive" });
        return;
      }
      resetPasswordMutation.mutate({ token, password });
    } else if (mode === 'magic-link') {
      sendMagicLinkMutation.mutate(email);
    }
  };

  const isLoading = registerMutation.isPending || loginMutation.isPending || 
    forgotPasswordMutation.isPending || resetPasswordMutation.isPending ||
    verifyEmailMutation.isPending || verifyMagicLinkMutation.isPending ||
    sendMagicLinkMutation.isPending;

  if (mode === 'verify-email') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div className="glass-panel rounded-2xl p-8 text-center">
            {verifyEmailMutation.isPending ? (
              <>
                <Loader2 className="w-12 h-12 mx-auto text-primary animate-spin mb-4" />
                <h1 className="text-xl font-bold text-white mb-2">Verifying your email...</h1>
              </>
            ) : verificationSuccess ? (
              <>
                <CheckCircle2 className="w-12 h-12 mx-auto text-green-400 mb-4" />
                <h1 className="text-xl font-bold text-white mb-2">Email Verified!</h1>
                <p className="text-muted-foreground mb-6">Your email has been verified. You can now log in.</p>
                <Button onClick={() => setLocation('/auth?mode=login')} className="w-full" data-testid="button-go-to-login">
                  Go to Login
                </Button>
              </>
            ) : (
              <>
                <AlertCircle className="w-12 h-12 mx-auto text-red-400 mb-4" />
                <h1 className="text-xl font-bold text-white mb-2">Verification Failed</h1>
                <p className="text-muted-foreground mb-6">This link may be expired or invalid.</p>
                <Button onClick={() => setLocation('/auth?mode=login')} variant="outline" className="w-full" data-testid="button-back-to-login">
                  Back to Login
                </Button>
              </>
            )}
          </div>
        </motion.div>
      </div>
    );
  }

  if (verificationSent) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div className="glass-panel rounded-2xl p-8 text-center">
            <Mail className="w-12 h-12 mx-auto text-primary mb-4" />
            <h1 className="text-xl font-bold text-white mb-2">Check Your Email</h1>
            <p className="text-muted-foreground mb-6">
              We've sent a verification link to <span className="text-white font-medium">{email}</span>. 
              Click the link to verify your account.
            </p>
            <Button onClick={() => { setVerificationSent(false); setMode('login'); }} variant="outline" className="w-full" data-testid="button-back-to-login">
              Back to Login
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  if (resetSuccess) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div className="glass-panel rounded-2xl p-8 text-center">
            <CheckCircle2 className="w-12 h-12 mx-auto text-green-400 mb-4" />
            <h1 className="text-xl font-bold text-white mb-2">Password Reset!</h1>
            <p className="text-muted-foreground mb-6">Your password has been changed. You can now log in.</p>
            <Button onClick={() => setLocation('/auth?mode=login')} className="w-full" data-testid="button-go-to-login">
              Go to Login
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  const titles: Record<AuthMode, { title: string; subtitle: string }> = {
    'login': { title: 'Welcome Back', subtitle: 'Sign in to your account' },
    'register': { title: 'Create Account', subtitle: 'Join TriFused today' },
    'forgot-password': { title: 'Reset Password', subtitle: 'Enter your email to receive a reset link' },
    'reset-password': { title: 'New Password', subtitle: 'Choose a new password for your account' },
    'verify-email': { title: 'Verify Email', subtitle: 'Confirming your email address' },
    'magic-link': { title: 'Magic Link', subtitle: 'Sign in without a password' },
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/20 bg-primary/5 text-primary text-xs font-mono uppercase tracking-widest mb-4">
            <Sparkles className="w-3 h-3" />
            Secure Access
          </div>
          <h1 className="text-2xl md:text-3xl font-bold font-heading text-white mb-2">
            {titles[mode].title}
          </h1>
          <p className="text-muted-foreground">{titles[mode].subtitle}</p>
        </div>

        <div className="glass-panel rounded-2xl p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="text-sm text-muted-foreground">First Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="firstName"
                      type="text"
                      placeholder="John"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="pl-10 bg-white/5 border-white/20"
                      data-testid="input-first-name"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName" className="text-sm text-muted-foreground">Last Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="lastName"
                      type="text"
                      placeholder="Doe"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="pl-10 bg-white/5 border-white/20"
                      data-testid="input-last-name"
                    />
                  </div>
                </div>
              </div>
            )}

            {(mode === 'login' || mode === 'register' || mode === 'forgot-password' || mode === 'magic-link') && (
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm text-muted-foreground">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 bg-white/5 border-white/20"
                    required
                    data-testid="input-email"
                  />
                </div>
              </div>
            )}

            {(mode === 'login' || mode === 'register' || mode === 'reset-password') && (
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm text-muted-foreground">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="********"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10 bg-white/5 border-white/20"
                    required
                    minLength={8}
                    data-testid="input-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-white"
                    data-testid="button-toggle-password"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            )}

            {(mode === 'register' || mode === 'reset-password') && (
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-sm text-muted-foreground">Confirm Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    type={showPassword ? "text" : "password"}
                    placeholder="********"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pl-10 bg-white/5 border-white/20"
                    required
                    minLength={8}
                    data-testid="input-confirm-password"
                  />
                </div>
              </div>
            )}

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 bg-primary hover:bg-primary/90 text-black font-bold rounded-xl"
              data-testid="button-submit"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  {mode === 'login' && 'Sign In'}
                  {mode === 'register' && 'Create Account'}
                  {mode === 'forgot-password' && 'Send Reset Link'}
                  {mode === 'reset-password' && 'Reset Password'}
                  {mode === 'magic-link' && 'Send Magic Link'}
                  <ArrowRight className="ml-2 w-4 h-4" />
                </>
              )}
            </Button>
          </form>

          {mode === 'login' && (
            <>
              <div className="mt-4 text-center">
                <button
                  onClick={() => setMode('forgot-password')}
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  data-testid="link-forgot-password"
                >
                  Forgot your password?
                </button>
              </div>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-white/10" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
                </div>
              </div>

              <div className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full h-12 border-white/20 hover:bg-white/5"
                  onClick={() => window.location.href = '/api/login'}
                  data-testid="button-social-login"
                >
                  <Sparkles className="mr-2 w-4 h-4" />
                  Sign in with Google, GitHub, or more
                </Button>

                <Button
                  variant="ghost"
                  className="w-full text-muted-foreground hover:text-primary"
                  onClick={() => setMode('magic-link')}
                  data-testid="button-magic-link"
                >
                  <KeyRound className="mr-2 w-4 h-4" />
                  Sign in with Magic Link
                </Button>
              </div>
            </>
          )}

          {mode === 'register' && (
            <>
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-white/10" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">Or</span>
                </div>
              </div>

              <Button
                variant="outline"
                className="w-full h-12 border-white/20 hover:bg-white/5"
                onClick={() => window.location.href = '/api/login'}
                data-testid="button-social-signup"
              >
                <Sparkles className="mr-2 w-4 h-4" />
                Sign up with Google, GitHub, or more
              </Button>
            </>
          )}

          {(mode === 'forgot-password' || mode === 'magic-link') && (
            <div className="mt-4 text-center">
              <button
                onClick={() => setMode('login')}
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
                data-testid="link-back-to-login"
              >
                Back to login
              </button>
            </div>
          )}

          <div className="mt-6 text-center">
            {mode === 'login' ? (
              <p className="text-sm text-muted-foreground">
                Don't have an account?{' '}
                <button
                  onClick={() => setMode('register')}
                  className="text-primary hover:underline font-medium"
                  data-testid="link-register"
                >
                  Sign up
                </button>
              </p>
            ) : mode === 'register' ? (
              <p className="text-sm text-muted-foreground">
                Already have an account?{' '}
                <button
                  onClick={() => setMode('login')}
                  className="text-primary hover:underline font-medium"
                  data-testid="link-login"
                >
                  Sign in
                </button>
              </p>
            ) : null}
          </div>
        </div>

        <div className="mt-6 text-center">
          <button
            onClick={() => setLocation('/')}
            className="text-sm text-muted-foreground hover:text-primary transition-colors"
            data-testid="link-back-home"
          >
            Back to Homepage
          </button>
        </div>
      </motion.div>
    </div>
  );
}
