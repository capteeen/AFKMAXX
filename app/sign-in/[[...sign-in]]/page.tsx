import { SignIn } from '@clerk/nextjs';
import { SiteHeader } from '@/components/site-header';
import { clerkConfigured } from '@/lib/clerk-env';
import { safeRedirectPath } from '@/lib/safe-redirect';

export default async function SignInPage({
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
          <h2>SIGN IN.<br />THEN <em>GO AFK.</em></h2>
          {clerkConfigured() ? (
            <p>Clerk handles the account. Same console after you land. The desktop app uses this login too.</p>
          ) : (
            <p>
              Sign-in is not live on this deploy yet. Add <code>NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY</code> and{' '}
              <code>CLERK_SECRET_KEY</code> in Vercel, then redeploy.
            </p>
          )}
        </div>
        {clerkConfigured() ? (
          <SignIn forceRedirectUrl={redirect} fallbackRedirectUrl={redirect} signUpForceRedirectUrl={redirect} />
        ) : null}
      </main>
    </>
  );
}
