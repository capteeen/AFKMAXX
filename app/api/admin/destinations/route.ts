import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/guard';

export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;
  const destinations = await prisma.destination.findMany({
    include: { owner: { select: { email: true } } },
    orderBy: { createdAt: 'desc' }
  });
  return NextResponse.json({ destinations });
}

export async function PATCH(req: Request) {
  const { error } = await requireAdmin();
  if (error) return error;
  const body = await req.json().catch(() => ({}));
  const id = String(body.id || '');
  const status = body.status === 'approved' || body.status === 'revoked' || body.status === 'pending' ? body.status : null;
  if (!id || !status) return NextResponse.json({ error: 'id and status required' }, { status: 400 });
  const destination = await prisma.destination.update({ where: { id }, data: { status } });
  return NextResponse.json({ destination });
}
