import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/session';
import { claimDesktopLink } from '@/lib/desktop-link';
import { DesktopReturn } from '@/components/desktop-return';

export default async function DesktopConnectPage({
  searchParams
}: {
  searchParams: Promise<{ ticket?: string }>;
}) {
  const { ticket } = await searchParams;
  if (!ticket) {
    return (
      <main id="main" className="wrap desktop-page clerk-auth-page">
        <span className="micro eyebrow">DESKTOP</span>
        <h2>MISSING <em>TICKET.</em></h2>
        <p>Open AFKMAXX on your computer and press Sign in again.</p>
      </main>
    );
  }
  const user = await getCurrentUser();
  if (!user) {
    redirect(`/sign-in?redirect_url=${encodeURIComponent(`/desktop/connect?ticket=${ticket}`)}`);
  }
  const claimed = await claimDesktopLink(ticket, user.id);
  if ('error' in claimed) {
    return (
      <main id="main" className="wrap desktop-page clerk-auth-page">
        <span className="micro eyebrow">DESKTOP</span>
        <h2>COULD NOT <em>LINK.</em></h2>
        <p>{claimed.error}</p>
      </main>
    );
  }
  return (
    <main id="main" className="wrap desktop-page clerk-auth-page">
      <span className="micro eyebrow">DESKTOP / CLERK</span>
      <h2>YOU ARE IN.<br />GO BACK TO <em>THE APP.</em></h2>
      <p>Signed in as {user.email}. The desktop app uses this same Clerk account.</p>
      <DesktopReturn />
    </main>
  );
}
