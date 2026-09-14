import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireUser } from '@/lib/guard';

export async function POST() {
  const { error, user } = await requireUser();
  if (error) return error;
  const updated = await prisma.user.update({
    where: { id: user.id },
    data: { consentAt: new Date() }
  });
  return NextResponse.json({ consentAt: updated.consentAt });
}
