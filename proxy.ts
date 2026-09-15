import { clerkMiddleware } from '@clerk/nextjs/server';
import { type NextRequest } from 'next/server';
import { clerkConfigured } from '@/lib/clerk-env';
import { updateSession } from '@/lib/supabase/middleware';

const withClerk = clerkMiddleware(
  async (_auth, request: NextRequest) => updateSession(request),
  {
    // pk_live keys auto-enable a Frontend API proxy on *.vercel.app, which
    // 500s this Next.js 16 app. Keep Clerk's FAPI on Clerk's domain.
    frontendApiProxy: { enabled: false }
  }
);

export default async function proxy(...args: Parameters<typeof withClerk>) {
  const request = args[0] as NextRequest;
  if (!clerkConfigured()) return updateSession(request);
  try {
    return await withClerk(...args);
  } catch (error) {
    console.error('clerk middleware', error);
    return updateSession(request);
  }
}

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
    '/__clerk/:path*'
  ]
};
