import { SignUp } from '@clerk/nextjs';
import { SiteHeader } from '@/components/site-header';
import { safeRedirectPath } from '@/lib/desktop-link';

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
          <p>This is your first AFKMAXX user. Clerk is the same account the desktop app uses.</p>
        </div>
        <SignUp forceRedirectUrl={redirect} fallbackRedirectUrl={redirect} signInForceRedirectUrl={redirect} />
      </main>
    </>
  );
}
