import { ClerkProvider } from '@clerk/nextjs';
import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { clerkAppearance } from '@/lib/clerk-appearance';
import { clerkPublishableKey } from '@/lib/clerk-env';
import './globals.css';

export const metadata: Metadata = {
  title: 'AFKMAXX — Away from keyboard. Not from possibility.',
  description: 'Go AFK. Let your connection run small, approved website checks within limits you control.',
  icons: { icon: '/assets/favicon.svg' }
};

export default function RootLayout({ children }: { children: ReactNode }) {
  const publishableKey = clerkPublishableKey();
  const inner = (
    <>
      <a className="skip" href="#main">Skip to content</a>
      {children}
    </>
  );
  return (
    <html lang="en">
      <body>
        {publishableKey ? (
          <ClerkProvider appearance={clerkAppearance} dynamic publishableKey={publishableKey}>
            {inner}
          </ClerkProvider>
        ) : (
          inner
        )}
      </body>
    </html>
  );
}
