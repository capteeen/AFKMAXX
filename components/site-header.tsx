import Link from 'next/link';
import { getCurrentUser } from '@/lib/session';
import { signOutUser } from '@/app/login/actions';

export async function SiteHeader({ current }: { current?: 'home' | 'app' | 'admin' | 'login' }) {
  let user = null;
  try {
    user = await getCurrentUser();
  } catch {
    user = null;
  }
  return (
    <header className="nav wrap">
      <Link className="brand" href="/" aria-label="AFKMAXX home">
        <img src="/assets/mark.svg" alt="" width={32} height={29} />AFKMAXX
      </Link>
      <nav aria-label="Main navigation">
        <Link href="/#how">How it works</Link>
        <Link href="/#token">$AFK</Link>
        <Link href="/app">App</Link>
        {user?.role === 'admin' ? <Link href="/admin">Admin</Link> : null}
        <Link href="/privacy">Privacy</Link>
      </nav>
      <details className="nav-more">
        <summary>Menu</summary>
        <Link href="/#how">How it works</Link>
        <Link href="/#token">$AFK</Link>
        <Link href="/app">App</Link>
        <Link href="/privacy">Privacy</Link>
        <Link href="/specimens">Specimens</Link>
        {user ? <Link href="/app">Console</Link> : <Link href="/login">Sign in</Link>}
      </details>
      {user ? (
        <form action={signOutUser}>
          <button className="nav-cta" type="submit">Sign out <span>↗</span></button>
        </form>
      ) : (
        <Link className="nav-cta" href={current === 'login' ? '/app' : '/login'}>
          {current === 'login' ? 'App' : 'Sign in'} <span>↗</span>
        </Link>
      )}
    </header>
  );
}
