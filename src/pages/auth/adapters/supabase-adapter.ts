// src/auth/adapters/supabase-adapter.ts
import { AuthModel, UserModel } from '@/auth/lib/models';
import { supabase } from '@/lib/supabase';

const isDev = import.meta.env.DEV;

/** Debug logger active in development only */
function debug(...args: unknown[]) {
  if (isDev) console.debug('[SupabaseAdapter]', ...args);
}

/**
 * Helper to build a redirect URL, preserving an optional "next" query param.
 */
function getRedirectUrl(basePath: string = '/auth/callback'): string {
  const next = new URLSearchParams(window.location.search).get('next');
  const url = new URL(window.location.origin + basePath);
  if (next) url.searchParams.set('next', next);
  return url.toString();
}

/**
 * Supabase adapter maintaining the same interface as the existing auth flow
 * but using Supabase under the hood.
 */
export const SupabaseAdapter = {
  /** Login with email and password */
  async login(email: string, password: string): Promise<AuthModel> {
    debug('login:', email);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      console.error('[SupabaseAdapter] login error:', error);
      throw new Error(error.message);
    }
    debug('login successful:', {
      tokenLength: data.session?.access_token?.length,
    });
    return {
      access_token: data.session!.access_token!,
      refresh_token: data.session!.refresh_token!,
    };
  },

  /** Login with OAuth provider (Google, GitHub, Facebook...) */
  async signInWithOAuth(
    provider: 'google' | 'github' | 'facebook' | 'twitter' | 'discord' | 'slack',
  ): Promise<void> {
    debug('signInWithOAuth:', provider);
    const redirectTo = getRedirectUrl('/auth/callback');
    const { error } = await supabase.auth.signInWithOAuth({ provider, redirectTo });
    if (error) {
      console.error('[SupabaseAdapter] OAuth error:', error);
      throw new Error(error.message);
    }
    debug('OAuth flow initiated for', provider);
  },

  /** Register a new user */
  async register(
    email: string,
    password: string,
    _passwordConfirmation: string, // validation is done in Zod schema
    firstName?: string,
    lastName?: string,
  ): Promise<AuthModel> {
    debug('register:', email);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username: email.split('@')[0],
          first_name: firstName ?? '',
          last_name: lastName ?? '',
          fullname: [firstName, lastName].filter(Boolean).join(' '),
        },
      },
    });
    if (error) {
      console.error('[SupabaseAdapter] register error:', error);
      throw new Error(error.message);
    }
    // If no session (email confirmation required), return empty tokens
    if (!data.session) {
      return { access_token: '', refresh_token: '' };
    }
    return {
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token,
    };
  },

  /** Request a password reset email */
  async requestPasswordReset(email: string): Promise<void> {
    debug('requestPasswordReset:', email);
    const redirectTo = getRedirectUrl('/auth/reset-password/check-email');
    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });
    if (error) {
      console.error('[SupabaseAdapter] requestPasswordReset error:', error);
      throw new Error(error.message);
    }
  },

  /** Reset password with current session (token handled by Supabase) */
  async resetPassword(password: string, _passwordConfirmation: string): Promise<void> {
    debug('resetPassword');
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      console.error('[SupabaseAdapter] resetPassword error:', error);
      throw new Error(error.message);
    }
  },

  /** Resend email verification */
  async resendVerificationEmail(email: string): Promise<void> {
    debug('resendVerificationEmail:', email);
    const redirectTo = getRedirectUrl('/auth/verify-email');
    // Supabase v2 method
    const { error } = await supabase.auth.resendVerificationEmail({ email, options: { redirectTo } });
    if (error) {
      console.error('[SupabaseAdapter] resendVerificationEmail error:', error);
      throw new Error(error.message);
    }
  },

  /** Get current user model */
  async getCurrentUser(): Promise<UserModel | null> {
    debug('getCurrentUser');
    const { data } = await supabase.auth.getUser();
    if (!data.user) return null;
    return this.getUserProfile();
  },

  /** Fetch user profile from metadata */
  async getUserProfile(): Promise<UserModel> {
    debug('getUserProfile');
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) throw new Error(error?.message ?? 'User not found');
    const m = user.user_metadata ?? {};
    return {
      id: user.id,
      email: user.email ?? '',
      email_verified: user.email_confirmed_at !== null,
      username: m.username ?? '',
      first_name: m.first_name ?? '',
      last_name: m.last_name ?? '',
      fullname: m.fullname ?? [m.first_name, m.last_name].filter(Boolean).join(' '),
      occupation: m.occupation ?? '',
      company_name: m.company_name ?? '',
      companyName: m.company_name ?? '',
      phone: m.phone ?? '',
      roles: m.roles ?? [],
      pic: m.pic ?? '',
      language: m.language ?? 'en',
      is_admin: m.is_admin ?? false,
    };
  },

  /** Update user profile metadata */
  async updateUserProfile(userData: Partial<UserModel>): Promise<UserModel> {
    debug('updateUserProfile:', userData);
    const metadata: Record<string, unknown> = {
      username: userData.username,
      first_name: userData.first_name,
      last_name: userData.last_name,
      fullname: userData.fullname,
      occupation: userData.occupation,
      company_name: userData.company_name ?? userData.companyName,
      phone: userData.phone,
      roles: userData.roles,
      pic: userData.pic,
      language: userData.language,
      is_admin: userData.is_admin,
    };
    Object.keys(metadata).forEach((k) => metadata[k] === undefined && delete metadata[k]);
    const { error } = await supabase.auth.updateUser({ data: metadata });
    if (error) {
      console.error('[SupabaseAdapter] updateUserProfile error:', error);
      throw new Error(error.message);
    }
    return this.getCurrentUser() as Promise<UserModel>;
  },

  /** Logout current user */
  async logout(): Promise<void> {
    debug('logout');
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('[SupabaseAdapter] logout error:', error);
      throw new Error(error.message);
    }
  },

  /** TODO: implement MFA setup and verification when backend ready */
  async setupMfa(): Promise<{ qrUrl: string; secret: string }> {
    throw new Error('setupMfa not implemented');
  },

  async verifyMfa(code: string): Promise<boolean> {
    throw new Error('verifyMfa not implemented');
  },
};
