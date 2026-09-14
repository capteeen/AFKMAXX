export function supabasePublicEnv() {
  const env = process.env;
  return {
    url: (env['NEXT_PUBLIC_SUPABASE_URL'] || '').trim(),
    key: (env['NEXT_PUBLIC_SUPABASE_ANON_KEY'] || '').trim()
  };
}

export function supabaseConfigured() {
  const { url, key } = supabasePublicEnv();
  return url.startsWith('https://') && key.length > 10;
}
