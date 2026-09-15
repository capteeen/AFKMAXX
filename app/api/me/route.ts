import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireUser, requireUserOrDevice, rateLimit, clientKey } from '@/lib/guard';
import { pointsToAfk, summarizeEarnings } from '@/lib/earnings';

export async function GET(req: Request) {
  const { error, user } = await requireUserOrDevice(req);
  if (error) return error;
  const [destinations, results, jobs, ledger, entries] = await Promise.all([
    prisma.destination.findMany({ where: { ownerUserId: user.id }, orderBy: { createdAt: 'desc' } }),
    prisma.checkResult.findMany({
      where: { participantId: user.id },
      include: { job: { include: { destination: true } } },
      orderBy: { fetchedAt: 'desc' },
      take: 200
    }),
    prisma.job.findMany({
      where: { createdById: user.id },
      include: { destination: true, result: true },
      orderBy: { createdAt: 'desc' },
      take: 40
    }),
    prisma.ledgerEntry.aggregate({ where: { userId: user.id }, _sum: { delta: true } }),
    prisma.ledgerEntry.findMany({ where: { userId: user.id }, orderBy: { createdAt: 'desc' }, take: 80 })
  ]);
  const since = new Date();
  since.setUTCHours(0, 0, 0, 0);
  const used = await prisma.checkResult.aggregate({
    where: { participantId: user.id, fetchedAt: { gte: since } },
    _sum: { bytes: true }
  });
  return NextResponse.json({
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
      status: user.status,
      dailyCapMb: user.dailyCapMb,
      consentAt: user.consentAt,
      createdAt: user.createdAt
    },
    destinations,
    results,
    jobs,
    entries,
    bag: pointsToAfk(ledger._sum.delta || 0),
    usedBytes: used._sum.bytes || 0,
    earnings: summarizeEarnings(results)
  });
}

export async function PATCH(req: Request) {
  const { error, user } = await requireUser();
  if (error) return error;
  if (!rateLimit(`me:${clientKey(req, user.id)}`, 30, 60_000)) {
    return NextResponse.json({ error: 'Slow down' }, { status: 429 });
  }
  const body = await req.json().catch(() => ({}));
  const dailyCapMb = Number(body.dailyCapMb);
  if (![25, 50, 75, 100, 125, 150, 175, 200, 225, 250].includes(dailyCapMb) && dailyCapMb) {
    return NextResponse.json({ error: 'Invalid cap' }, { status: 400 });
  }
  const updated = await prisma.user.update({
    where: { id: user.id },
    data: {
      ...(dailyCapMb ? { dailyCapMb } : {}),
      ...(body.status === 'paused' || body.status === 'active' ? { status: body.status } : {})
    }
  });
  return NextResponse.json({ user: updated });
}
