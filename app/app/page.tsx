import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/session';
import { SiteHeader } from '@/components/site-header';
import { AppConsole } from '@/components/app-console';

export default async function AppPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');
  return (
    <>
      <SiteHeader current="app" />
      <main id="main" className="wrap desktop-page">
        <div className="section-heading">
          <span className="micro eyebrow">WEB RUNTIME</span>
          <h2>THE APP.<br />THE <em>EXTENSION</em><br />DOES THE FETCH.</h2>
          <p>Jobs live on the server. HTTPS GETs leave this machine only through the extension.</p>
        </div>
        <AppConsole />
      </main>
    </>
  );
}
