import Link from 'next/link';
import { SignInButton, SignUpButton, Show, UserButton } from '@clerk/nextjs';
import { currentUser } from '@clerk/nextjs/server';
import { clerkPublishableKey } from '@/lib/clerk-env';

export async function SiteHeader({ current }: { current?: 'home' | 'app' | 'admin' | 'login' }) {
  const clerkEnabled = Boolean(clerkPublishableKey());
  let isAdmin = false;
  if (clerkEnabled) {
    try {
      const clerkUser = await currentUser();
      const email = (
        clerkUser?.primaryEmailAddress?.emailAddress ||
        clerkUser?.emailAddresses[0]?.emailAddress ||
        ''
      ).toLowerCase();
      const adminEmail = (process.env.ADMIN_EMAIL || '').toLowerCase();
      isAdmin = Boolean(email && adminEmail && email === adminEmail);
    } catch {
      isAdmin = false;
    }
  }
  return (
    <header className="nav wrap">
      <Link className="brand" href="/" aria-label="AFKMAXX home">
        <img src="/assets/mark.svg" alt="" width={32} height={29} />AFKMAXX
      </Link>
      <nav aria-label="Main navigation">
        <Link href="/#how">How it works</Link>
        <Link href="/#token">$AFK</Link>
        <Link href="/#desktop">Desktop</Link>
        <Link href="/app">App</Link>
        {isAdmin ? <Link href="/admin">Admin</Link> : null}
        <Link href="/privacy">Privacy</Link>
      </nav>
      <details className="nav-more">
        <summary>Menu</summary>
        <Link href="/#how">How it works</Link>
        <Link href="/#token">$AFK</Link>
        <Link href="/#desktop">Desktop</Link>
        <Link href="/app">App</Link>
        <Link href="/privacy">Privacy</Link>
        <Link href="/specimens">Specimens</Link>
        {isAdmin ? <Link href="/admin">Admin</Link> : null}
        {current === 'login' ? <Link href="/app">Console</Link> : null}
      </details>
      <div className="nav-auth">
        {clerkEnabled ? (
          <>
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
          </>
        ) : (
          <Link className="nav-cta nav-cta-primary" href="/sign-in">
            Sign in <span>↗</span>
          </Link>
        )}
      </div>
    </header>
  );
}
