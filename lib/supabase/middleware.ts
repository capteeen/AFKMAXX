import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { supabasePublicEnv } from '@/lib/supabase/env';

export async function updateSession(request: NextRequest) {
  const { url, key } = supabasePublicEnv();
  let response = NextResponse.next({ request });
  if (!url || !key) return response;

  const hasAuthCookie = request.cookies.getAll().some((cookie) => cookie.name.includes('-auth-token'));
  if (!hasAuthCookie) return response;

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      }
    }
  });

  try {
    await supabase.auth.getUser();
  } catch {
    return response;
  }
  return response;
}
