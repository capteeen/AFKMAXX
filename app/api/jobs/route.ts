import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireUser, hostnameOf, rateLimit, clientKey } from '@/lib/guard';

export async function GET() {
  const { error, user } = await requireUser();
  if (error) return error;
  const jobs = await prisma.job.findMany({
    where: { createdById: user.id },
    include: { destination: true, result: true },
    orderBy: { createdAt: 'desc' },
    take: 50
  });
  return NextResponse.json({ jobs });
}

export async function POST(req: Request) {
  const { error, user } = await requireUser();
  if (error) return error;
  if (!rateLimit(`job:${clientKey(req, user.id)}`, 10, 60_000)) {
    return NextResponse.json({ error: 'Slow down' }, { status: 429 });
  }
  const body = await req.json().catch(() => ({}));
  const hostname = hostnameOf(String(body.url || body.hostname || ''));
  const regionLabel = String(body.regionLabel || 'unspecified').slice(0, 80);
  if (!hostname) return NextResponse.json({ error: 'HTTPS URL required' }, { status: 400 });
  let destination = await prisma.destination.findUnique({
    where: { ownerUserId_hostname: { ownerUserId: user.id, hostname } }
  });
  if (!destination) {
    destination = await prisma.destination.create({
      data: {
        hostname,
        ownerUserId: user.id,
        status: hostname === 'example.com' || hostname === 'example.org' ? 'approved' : 'pending'
      }
    });
  }
  if (destination.status !== 'approved') {
    return NextResponse.json({ error: 'Destination is not approved yet. An admin must approve it. Ownership is declared, not proven.' }, { status: 403 });
  }
  const job = await prisma.job.create({
    data: {
      destinationId: destination.id,
      regionLabel,
      createdById: user.id,
      status: 'queued'
    },
    include: { destination: true }
  });
  return NextResponse.json({ job });
}
