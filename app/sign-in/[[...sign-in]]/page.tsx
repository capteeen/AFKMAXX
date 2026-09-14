import { SignIn } from '@clerk/nextjs';
import { SiteHeader } from '@/components/site-header';

export default function SignInPage() {
  return (
    <>
      <SiteHeader current="login" />
      <main id="main" className="wrap desktop-page clerk-auth-page">
        <div className="section-heading">
          <span className="micro eyebrow">ACCOUNT</span>
          <h2>SIGN IN.<br />THEN <em>GO AFK.</em></h2>
          <p>Clerk handles the account. Same console after you land.</p>
        </div>
        <SignIn />
      </main>
    </>
  );
}
