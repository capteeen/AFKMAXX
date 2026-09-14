'use server';

import { redirect } from 'next/navigation';
import { createServerSupabase } from '@/lib/supabase/server';

export type AuthState = { error: string } | { ok: true } | null;

function creds(formData: FormData) {
  const email = String(formData.get('email') || '').trim().toLowerCase();
  const password = String(formData.get('password') || '');
  return { email, password };
}

function fail(error: unknown): AuthState {
  if (error && typeof error === 'object' && 'message' in error && typeof error.message === 'string' && error.message) {
    const message = error.message;
    if (/load failed|failed to fetch|fetch failed/i.test(message)) {
      return { error: 'Could not reach Supabase. Check NEXT_PUBLIC_SUPABASE_URL and that you used the publishable/anon key, not sb_secret_.' };
    }
    return { error: message };
  }
  return { error: 'Authentication failed. Try again.' };
}

export async function signUpWithPassword(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const { email, password } = creds(formData);
  if (!email || password.length < 8) return { error: 'Use a real email and a password of at least 8 characters.' };
  try {
    const supabase = await createServerSupabase();
    const origin = process.env.AUTH_URL || 'http://127.0.0.1:4173';
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${origin}/auth/callback` }
    });
    if (error) return { error: error.message };
    if (!data.session) return { error: 'Account created. Confirm the email from Supabase, then sign in.' };
    return { ok: true };
  } catch (error) {
    return fail(error);
  }
}

export async function signInWithPassword(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const { email, password } = creds(formData);
  if (!email || !password) return { error: 'Email and password required.' };
  try {
    const supabase = await createServerSupabase();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { error: error.message };
    return { ok: true };
  } catch (error) {
    return fail(error);
  }
}

export async function signOutUser() {
  try {
    const supabase = await createServerSupabase();
    await supabase.auth.signOut();
  } catch {
    // Always send the user home even if Supabase is unreachable.
  }
  redirect('/');
}
