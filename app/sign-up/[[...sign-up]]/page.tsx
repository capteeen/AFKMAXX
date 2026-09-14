import { SignUp } from '@clerk/nextjs';
import { SiteHeader } from '@/components/site-header';

export default function SignUpPage() {
  return (
    <>
      <SiteHeader current="login" />
      <main id="main" className="wrap desktop-page clerk-auth-page">
        <div className="section-heading">
          <span className="micro eyebrow">ACCOUNT</span>
          <h2>CREATE ONE.<br />THEN <em>SIGN IN.</em></h2>
          <p>This is your first AFKMAXX user. Use the profile icon in the nav when it appears.</p>
        </div>
        <SignUp />
      </main>
    </>
  );
}
