import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireUser, hostnameOf, rateLimit, clientKey } from '@/lib/guard';

export async function GET() {
  const { error, user } = await requireUser();
  if (error) return error;
  const destinations = await prisma.destination.findMany({
    where: { ownerUserId: user.id },
    orderBy: { createdAt: 'desc' }
  });
  return NextResponse.json({ destinations });
}

export async function POST(req: Request) {
  const { error, user } = await requireUser();
  if (error) return error;
  if (!rateLimit(`dest:${clientKey(req, user.id)}`, 20, 60_000)) {
    return NextResponse.json({ error: 'Slow down' }, { status: 429 });
  }
  const body = await req.json().catch(() => ({}));
  const hostname = hostnameOf(String(body.hostname || body.url || ''));
  if (!hostname) return NextResponse.json({ error: 'Use an HTTPS hostname' }, { status: 400 });
  const existing = await prisma.destination.findUnique({
    where: { ownerUserId_hostname: { ownerUserId: user.id, hostname } }
  });
  if (existing) return NextResponse.json({ destination: existing });
  const auto = hostname === 'example.com' || hostname === 'example.org' ? 'approved' : 'pending';
  const destination = await prisma.destination.create({
    data: { hostname, ownerUserId: user.id, status: auto }
  });
  return NextResponse.json({ destination });
}
