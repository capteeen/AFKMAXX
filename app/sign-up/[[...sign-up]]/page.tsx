import { SignUp } from '@clerk/nextjs';
import { SiteHeader } from '@/components/site-header';
import { clerkConfigured } from '@/lib/clerk-env';
import { safeRedirectPath } from '@/lib/safe-redirect';

export default async function SignUpPage({
  searchParams
}: {
  searchParams: Promise<{ redirect_url?: string }>;
}) {
  const params = await searchParams;
  const redirect = safeRedirectPath(params.redirect_url);
  return (
    <>
      <SiteHeader current="login" />
      <main id="main" className="wrap desktop-page clerk-auth-page">
        <div className="section-heading">
          <span className="micro eyebrow">ACCOUNT</span>
          <h2>CREATE ONE.<br />THEN <em>SIGN IN.</em></h2>
          {clerkConfigured() ? (
            <p>This is your first AFKMAXX user. Clerk is the same account the desktop app uses.</p>
          ) : (
            <p>
              Sign-up is not live on this deploy yet. Add <code>NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY</code> and{' '}
              <code>CLERK_SECRET_KEY</code> in Vercel, then redeploy.
            </p>
          )}
        </div>
        {clerkConfigured() ? (
          <SignUp forceRedirectUrl={redirect} fallbackRedirectUrl={redirect} signInForceRedirectUrl={redirect} />
        ) : null}
      </main>
    </>
  );
}
