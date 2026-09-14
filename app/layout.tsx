import { ClerkProvider } from '@clerk/nextjs';
import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { clerkAppearance } from '@/lib/clerk-appearance';
import './globals.css';

export const metadata: Metadata = {
  title: 'AFKMAXX — Away from keyboard. Not from possibility.',
  description: 'Go AFK. Let your connection run small, approved website checks within limits you control.',
  icons: { icon: '/assets/favicon.svg' }
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ClerkProvider appearance={clerkAppearance} dynamic>
          <a className="skip" href="#main">Skip to content</a>
          {children}
        </ClerkProvider>
      </body>
    </html>
  );
}