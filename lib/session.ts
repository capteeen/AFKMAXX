import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { createServerSupabase } from '@/lib/supabase/server';
import { supabaseConfigured } from '@/lib/supabase/env';

const adminEmail = (process.env.ADMIN_EMAIL || '').toLowerCase();

export async function getCurrentUser() {
  if (!supabaseConfigured()) return null;
  const cookieStore = await cookies();
  const hasAuthCookie = cookieStore.getAll().some((cookie) => cookie.name.includes('-auth-token'));
  if (!hasAuthCookie) return null;
  let user: { id: string; email?: string | null; email_confirmed_at?: string | null } | null = null;
  try {
    const supabase = await createServerSupabase();
    const { data } = await supabase.auth.getUser();
    user = data.user;
  } catch {
    return null;
  }
  if (!user?.email) return null;
  const email = user.email.toLowerCase();
  try {
    const existing = await prisma.user.findFirst({
      where: { OR: [{ supabaseId: user.id }, { email }] }
    });
    if (existing) {
      return prisma.user.update({
        where: { id: existing.id },
        data: {
          supabaseId: user.id,
          email,
          emailVerified: user.email_confirmed_at ? new Date(user.email_confirmed_at) : existing.emailVerified,
          ...(adminEmail && email === adminEmail ? { role: 'admin' } : {})
        }
      });
    }
    return prisma.user.create({
      data: {
        supabaseId: user.id,
        email,
        emailVerified: user.email_confirmed_at ? new Date(user.email_confirmed_at) : null,
        role: adminEmail && email === adminEmail ? 'admin' : 'participant'
      }
    });
  } catch (error) {
    console.error('getCurrentUser prisma', error);
    return null;
  }
}
