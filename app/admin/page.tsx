import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/session';
import { SiteHeader } from '@/components/site-header';
import { AdminBoard } from '@/components/admin-board';

export default async function AdminPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');
  if (user.role !== 'admin') redirect('/app');
  return (
    <>
      <SiteHeader current="admin" />
      <main id="main" className="wrap desktop-page">
        <div className="section-heading">
          <span className="micro eyebrow">ADMIN</span>
          <h2>REVIEW.<br />BAN. <em>APPROVE.</em></h2>
          <p>Accepting a result writes a $AFK placeholder of 0. Nothing is withdrawn.</p>
        </div>
        <AdminBoard />
      </main>
    </>
  );
}
