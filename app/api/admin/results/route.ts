import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/guard';

export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;
  const results = await prisma.checkResult.findMany({
    include: {
      job: { include: { destination: true } },
      participant: { select: { email: true } }
    },
    orderBy: { fetchedAt: 'desc' },
    take: 100
  });
  return NextResponse.json({ results });
}

export async function PATCH(req: Request) {
  const { error } = await requireAdmin();
  if (error) return error;
  const body = await req.json().catch(() => ({}));
  const id = String(body.id || '');
  const review = body.review === 'accepted' || body.review === 'rejected' || body.review === 'unaudited' ? body.review : null;
  if (!id || !review) return NextResponse.json({ error: 'id and review required' }, { status: 400 });
  const existing = await prisma.checkResult.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  const result = await prisma.checkResult.update({ where: { id }, data: { review } });
  if (review === 'accepted' && existing.review !== 'accepted') {
    await prisma.ledgerEntry.create({
      data: {
        userId: existing.participantId,
        delta: 0,
        reason: 'placeholder_only'
      }
    });
    await prisma.job.update({ where: { id: existing.jobId }, data: { status: 'done' } });
  }
  if (review === 'rejected') {
    await prisma.job.update({ where: { id: existing.jobId }, data: { status: 'rejected' } });
  }
  return NextResponse.json({ result });
}
