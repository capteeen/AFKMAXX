import { SignIn } from '@clerk/nextjs';
import { SiteHeader } from '@/components/site-header';
import { safeRedirectPath } from '@/lib/desktop-link';

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
          <p>Clerk handles the account. Same console after you land. The desktop app uses this login too.</p>
        </div>
        <SignIn forceRedirectUrl={redirect} fallbackRedirectUrl={redirect} signUpForceRedirectUrl={redirect} />
      </main>
    </>
  );
}
