import Link from 'next/link';
import { SignInButton, SignUpButton, Show, UserButton } from '@clerk/nextjs';
import { getCurrentUser } from '@/lib/session';

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
        {user?.role === 'admin' ? <Link href="/admin">Admin</Link> : null}
        {current === 'login' ? <Link href="/app">Console</Link> : null}
      </details>
      <div className="nav-auth">
        <Show when="signed-out">
          <SignInButton mode="modal">
            <button className="nav-cta" type="button">
              Sign in <span>↗</span>
            </button>
          </SignInButton>
          <SignUpButton mode="modal">
            <button className="nav-cta nav-cta-primary" type="button">
              Sign up <span>↗</span>
            </button>
          </SignUpButton>
        </Show>
        <Show when="signed-in">
          <UserButton />
        </Show>
      </div>
    </header>
  );
}
