import { NextResponse } from 'next/server';
import { createHash } from 'crypto';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/session';

const buckets = new Map<string, { count: number; reset: number }>();

export function rateLimit(key: string, limit: number, windowMs: number) {
  const now = Date.now();
  const hit = buckets.get(key);
  if (!hit || now > hit.reset) {
    buckets.set(key, { count: 1, reset: now + windowMs });
    return true;
  }
  if (hit.count >= limit) return false;
  hit.count += 1;
  return true;
}

export function hashToken(token: string) {
  return createHash('sha256').update(token).digest('hex');
}

export async function sessionUser() {
  return getCurrentUser();
}

export async function requireUser() {
  const user = await sessionUser();
  if (!user) return { error: NextResponse.json({ error: 'Sign in required' }, { status: 401 }), user: null };
  if (user.status === 'banned') return { error: NextResponse.json({ error: 'Account banned' }, { status: 403 }), user: null };
  return { error: null, user };
}

export async function requireUserOrDevice(req: Request) {
  const fromCookie = await sessionUser();
  if (fromCookie) {
    if (fromCookie.status === 'banned') {
      return { error: NextResponse.json({ error: 'Account banned' }, { status: 403 }), user: null };
    }
    return { error: null, user: fromCookie };
  }
  const fromToken = await userFromDeviceToken(req.headers.get('authorization'));
  if (!fromToken) return { error: NextResponse.json({ error: 'Sign in required' }, { status: 401 }), user: null };
  return { error: null, user: fromToken };
}

export async function requireAdmin() {
  const result = await requireUser();
  if (result.error) return result;
  if (result.user.role !== 'admin') {
    return { error: NextResponse.json({ error: 'Admin only' }, { status: 403 }), user: null };
  }
  return result;
}

export async function userFromDeviceToken(header?: string | null) {
  if (!header?.startsWith('Bearer ')) return null;
  const hash = hashToken(header.slice(7));
  const row = await prisma.deviceToken.findUnique({
    where: { hash },
    include: { user: true }
  });
  if (!row || row.user.status === 'banned') return null;
  await prisma.deviceToken.update({ where: { id: row.id }, data: { lastSeen: new Date() } });
  return row.user;
}

export function hostnameOf(value: string) {
  try {
    const url = new URL(value.includes('://') ? value : `https://${value}`);
    if (url.protocol !== 'https:') return '';
    return url.hostname.replace(/^www\./, '').toLowerCase();
  } catch {
    return '';
  }
}

export function clientKey(req: Request, userId?: string) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'local';
  return `${userId || 'anon'}:${ip}`;
}
