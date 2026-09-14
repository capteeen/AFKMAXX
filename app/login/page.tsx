import { SiteHeader } from '@/components/site-header';
import { AuthForm } from '@/components/auth-form';
import { supabaseConfigured, supabasePublicEnv } from '@/lib/supabase/env';

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const configured = supabaseConfigured();
  const usingSecretKey = supabasePublicEnv().key.startsWith('sb_secret_');
  const params = await searchParams;
  return (
    <>
      <SiteHeader current="login" />
      <main id="main" className="wrap desktop-page">
        <div className="section-heading">
          <span className="micro eyebrow">ACCOUNT</span>
          <h2>SIGN UP.<br />THEN <em>LOG IN.</em></h2>
          <p>Supabase email and password. No magic link. No wallet.</p>
        </div>
        {params.error === 'confirm' ? (
          <p className="feedback" role="alert">Email confirmation failed. Request a new link from Supabase or sign in after confirming.</p>
        ) : null}
        {usingSecretKey ? (
          <p className="feedback" role="alert">
            <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code> is a secret key (<code>sb_secret_</code>), which cannot be used in the browser. In Supabase: Project Settings → API, copy the <strong>publishable</strong> or legacy <strong>anon</strong> key (not the secret/service_role key). Set that on Vercel under Environment Variables, then <strong>redeploy</strong>. Locally, put it in <code>.env</code> and restart the dev server. Rotate the leaked secret in Supabase after changing it.
          </p>
        ) : null}
        {configured ? (
          <AuthForm />
        ) : (
          <p className="muted">Add <code>NEXT_PUBLIC_SUPABASE_URL</code> and <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code> to <code>.env</code>, then restart the server. Create a project at supabase.com, enable Email auth, and turn off “Confirm email” while you develop locally.</p>
        )}
      </main>
    </>
  );
}
