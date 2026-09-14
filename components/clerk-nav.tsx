'use client';

import { SignInButton, SignUpButton, UserButton, useAuth } from '@clerk/nextjs';
import Link from 'next/link';

export function ClerkNav({ showAppLink }: { showAppLink?: boolean }) {
  const { isLoaded, isSignedIn } = useAuth();
  if (!isLoaded) {
    return <div className="nav-auth" aria-hidden="true" />;
  }
  if (!isSignedIn) {
    return (
      <div className="nav-auth">
        <SignInButton>
          <button className="nav-cta" type="button">Sign in <span>↗</span></button>
        </SignInButton>
        <SignUpButton>
          <button className="nav-cta" type="button">Sign up <span>↗</span></button>
        </SignUpButton>
      </div>
    );
  }
  return (
    <div className="nav-auth">
      {showAppLink ? (
        <Link className="nav-cta" href="/app">
          App <span>↗</span>
        </Link>
      ) : null}
      <UserButton />
    </div>
  );
}
