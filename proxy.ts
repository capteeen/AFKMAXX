import { clerkMiddleware } from '@clerk/nextjs/server';
import { type NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';

export default clerkMiddleware(async (_auth, request: NextRequest) => {
  return updateSession(request);
});

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
    '/__clerk/:path*'
  ]
};
