import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireUser } from '@/lib/guard';

export async function GET() {
  const { error, user } = await requireUser();
  if (error) return error;
  const sum = await prisma.ledgerEntry.aggregate({ where: { userId: user.id }, _sum: { delta: true } });
  const entries = await prisma.ledgerEntry.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' },
    take: 20
  });
  return NextResponse.json({
    bag: sum._sum.delta || 0,
    live: false,
    withdrawable: false,
    listing: 'not live',
    entries
  });
}
