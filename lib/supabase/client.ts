import { createBrowserClient } from '@supabase/ssr';
import { supabasePublicEnv } from '@/lib/supabase/env';

export function createBrowserSupabase() {
  const { url, key } = supabasePublicEnv();
  if (!url || !key) {
    throw new Error('Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY');
  }
  return createBrowserClient(url, key);
}
