import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin, rateLimit, clientKey } from '@/lib/guard';

export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;
  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    select: { id: true, email: true, role: true, status: true, dailyCapMb: true, consentAt: true, createdAt: true }
  });
  return NextResponse.json({ users });
}

export async function PATCH(req: Request) {
  const { error, user } = await requireAdmin();
  if (error) return error;
  if (!rateLimit(`adminu:${clientKey(req, user.id)}`, 40, 60_000)) {
    return NextResponse.json({ error: 'Slow down' }, { status: 429 });
  }
  const body = await req.json().catch(() => ({}));
  const id = String(body.id || '');
  const status = body.status === 'banned' || body.status === 'active' || body.status === 'paused' ? body.status : null;
  if (!id || !status) return NextResponse.json({ error: 'id and status required' }, { status: 400 });
  const updated = await prisma.user.update({ where: { id }, data: { status } });
  if (status === 'banned') {
    await prisma.job.updateMany({ where: { assignedToId: id, status: 'assigned' }, data: { status: 'queued', assignedToId: null } });
  }
  return NextResponse.json({ user: updated });
}
