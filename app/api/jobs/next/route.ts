import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { userFromDeviceToken, rateLimit, clientKey } from '@/lib/guard';

export async function GET(req: Request) {
  const user = await userFromDeviceToken(req.headers.get('authorization'));
  if (!user) return NextResponse.json({ error: 'Device token required' }, { status: 401 });
  if (user.status !== 'active') return NextResponse.json({ job: null, reason: 'paused_or_banned' });
  if (!user.consentAt) return NextResponse.json({ job: null, reason: 'consent_required' });
  if (!rateLimit(`next:${clientKey(req, user.id)}`, 60, 60_000)) {
    return NextResponse.json({ error: 'Slow down' }, { status: 429 });
  }
  const since = new Date();
  since.setUTCHours(0, 0, 0, 0);
  const used = await prisma.checkResult.aggregate({
    where: { participantId: user.id, fetchedAt: { gte: since } },
    _sum: { bytes: true }
  });
  const usedBytes = used._sum.bytes || 0;
  if (usedBytes >= user.dailyCapMb * 1024 * 1024) {
    return NextResponse.json({ job: null, reason: 'cap', usedBytes, capMb: user.dailyCapMb });
  }
  const candidate = await prisma.job.findFirst({
    where: { status: 'queued', destination: { status: 'approved' } },
    include: { destination: true },
    orderBy: { createdAt: 'asc' }
  });
  if (!candidate) return NextResponse.json({ job: null, usedBytes, capMb: user.dailyCapMb });
  const claimed = await prisma.job.updateMany({
    where: { id: candidate.id, status: 'queued' },
    data: { status: 'assigned', assignedToId: user.id }
  });
  if (!claimed.count) return NextResponse.json({ job: null, usedBytes, capMb: user.dailyCapMb });
  return NextResponse.json({
    job: {
      id: candidate.id,
      hostname: candidate.destination.hostname,
      url: `https://${candidate.destination.hostname}/`,
      regionLabel: candidate.regionLabel
    },
    usedBytes,
    capMb: user.dailyCapMb
  });
}
