'use client';

import { useActionState, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { signInWithPassword, signUpWithPassword, type AuthState } from '@/app/login/actions';

function actionErrorMessage(error: unknown) {
  if (error instanceof TypeError) {
    return 'Could not reach the server. Open http://127.0.0.1:4173/login (not localhost) and try again.';
  }
  if (error instanceof Error && error.message) {
    if (/load failed|failed to fetch/i.test(error.message)) {
      return 'Could not reach the server. Open http://127.0.0.1:4173/login (not localhost) and try again.';
    }
    return error.message;
  }
  return 'Request failed. Try again.';
}

export function AuthForm() {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  return (
    <>
      <div className="desk-nav" style={{ flexDirection: 'row', border: 0, padding: 0, marginBottom: 24, maxWidth: 480 }}>
        <button type="button" className={mode === 'login' ? 'is-active' : ''} onClick={() => setMode('login')}>Log in</button>
        <button type="button" className={mode === 'signup' ? 'is-active' : ''} onClick={() => setMode('signup')}>Sign up</button>
      </div>
      <PasswordForm key={mode} mode={mode} />
    </>
  );
}

function PasswordForm({ mode }: { mode: 'login' | 'signup' }) {
  const router = useRouter();
  const run = mode === 'signup' ? signUpWithPassword : signInWithPassword;
  const [state, formAction, pending] = useActionState(
    async (prev: AuthState, formData: FormData): Promise<AuthState> => {
      try {
        return await run(prev, formData);
      } catch (error) {
        if (typeof error === 'object' && error && 'digest' in error) throw error;
        return { error: actionErrorMessage(error) };
      }
    },
    null
  );

  useEffect(() => {
    if (state && 'ok' in state) router.push('/app');
  }, [state, router]);

  return (
    <form action={formAction} className="desk-shell" style={{ padding: 32, maxWidth: 480 }}>
      <label className="micro" htmlFor="email">EMAIL</label>
      <input id="email" name="email" type="email" required autoComplete="email" style={field} />
      <label className="micro" htmlFor="password">PASSWORD</label>
      <input id="password" name="password" type="password" required minLength={8} autoComplete={mode === 'signup' ? 'new-password' : 'current-password'} style={field} />
      {state && 'error' in state ? <p className="feedback" role="alert">{state.error}</p> : null}
      <button className="button lime" type="submit" disabled={pending}>
        {mode === 'signup' ? 'Create account' : 'Log in'} <span>↗</span>
      </button>
    </form>
  );
}

const field = { display: 'block', width: '100%', margin: '12px 0 24px', padding: 12, background: '#0b0d12', color: '#f4f1e8', border: '1px solid #62665e' } as const;
