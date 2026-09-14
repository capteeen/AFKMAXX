import type { Metadata } from 'next';
import type { ReactNode } from 'react';
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
        <a className="skip" href="#main">Skip to content</a>
        {children}
      </body>
    </html>
  );
}
