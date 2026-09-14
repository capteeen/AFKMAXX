import { NextResponse } from 'next/server';
import { randomBytes } from 'crypto';
import { prisma } from '@/lib/prisma';
import { requireUser, hashToken, rateLimit, clientKey } from '@/lib/guard';

export async function POST(req: Request) {
  const { error, user } = await requireUser();
  if (error) return error;
  if (!rateLimit(`tok:${clientKey(req, user.id)}`, 5, 60_000)) {
    return NextResponse.json({ error: 'Slow down' }, { status: 429 });
  }
  const token = randomBytes(32).toString('hex');
  await prisma.deviceToken.create({
    data: { userId: user.id, hash: hashToken(token) }
  });
  return NextResponse.json({
    token,
    note: 'Store this on the extension. It is shown once.'
  });
}
