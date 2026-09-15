import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { userFromDeviceToken, rateLimit, clientKey, hostnameOf } from '@/lib/guard';
import { potentialPoints } from '@/lib/earnings';

export async function POST(req: Request) {
  const user = await userFromDeviceToken(req.headers.get('authorization'));
  if (!user) return NextResponse.json({ error: 'Device token required' }, { status: 401 });
  if (!rateLimit(`res:${clientKey(req, user.id)}`, 60, 60_000)) {
    return NextResponse.json({ error: 'Slow down' }, { status: 429 });
  }
  const body = await req.json().catch(() => ({}));
  const jobId = String(body.jobId || '');
  const job = await prisma.job.findUnique({
    where: { id: jobId },
    include: { destination: true, result: true }
  });
  if (!job || job.assignedToId !== user.id) {
    return NextResponse.json({ error: 'Unknown job' }, { status: 404 });
  }
  if (job.result) return NextResponse.json({ error: 'Already submitted' }, { status: 409 });
  const host = hostnameOf(String(body.hostname || job.destination.hostname));
  if (host !== job.destination.hostname) {
    await prisma.job.update({ where: { id: job.id }, data: { status: 'failed' } });
    return NextResponse.json({ error: 'Host left the allowlist' }, { status: 400 });
  }
  const statusCode = Number(body.statusCode);
  const bytes = Math.max(0, Math.min(Number(body.bytes) || 0, 256 * 1024));
  const ms = Math.max(0, Math.min(Number(body.ms) || 0, 60_000));
  if (!Number.isFinite(statusCode) || statusCode < 0 || statusCode > 599) {
    return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
  }
  const failed = body.failed === true || statusCode === 0;
  const code = failed ? 0 : statusCode;
  const result = await prisma.checkResult.create({
    data: {
      jobId: job.id,
      participantId: user.id,
      statusCode: code,
      bytes,
      ms,
      review: 'unaudited',
      potentialPoints: potentialPoints(code, bytes)
    }
  });
  await prisma.job.update({
    where: { id: job.id },
    data: { status: failed ? 'failed' : 'done' }
  });
  return NextResponse.json({ result });
}
