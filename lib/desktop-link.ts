import { randomBytes } from 'crypto';
import { prisma } from '@/lib/prisma';
import { hashToken } from '@/lib/guard';

export { safeRedirectPath } from '@/lib/safe-redirect';

export function newDesktopTicket() {
  return randomBytes(24).toString('hex');
}

export async function createDesktopLink() {
  const ticket = newDesktopTicket();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
  await prisma.desktopLink.create({ data: { ticket, expiresAt } });
  return { ticket, expiresAt };
}

export async function claimDesktopLink(ticket: string, userId: string) {
  const row = await prisma.desktopLink.findUnique({ where: { ticket } });
  if (!row) return { error: 'This login link is unknown. Start again from the desktop app.' };
  if (row.expiresAt < new Date()) return { error: 'This login link expired. Start again from the desktop app.' };
  if (row.claimedAt && row.userId && row.userId !== userId) {
    return { error: 'This login link was used by another account.' };
  }
  if (row.claimedAt) return { ok: true as const };
  const token = randomBytes(32).toString('hex');
  await prisma.$transaction([
    prisma.deviceToken.create({ data: { userId, hash: hashToken(token) } }),
    prisma.desktopLink.update({
      where: { id: row.id },
      data: { userId, tokenOnce: token, claimedAt: new Date() }
    })
  ]);
  return { ok: true as const };
}

export async function takeDesktopToken(ticket: string) {
  const row = await prisma.desktopLink.findUnique({
    where: { ticket },
    include: { user: true }
  });
  if (!row) return { status: 'missing' as const };
  if (row.expiresAt < new Date() && !row.tokenOnce) return { status: 'expired' as const };
  if (!row.claimedAt) return { status: 'pending' as const };
  if (!row.tokenOnce || !row.user) return { status: 'used' as const };
  const token = row.tokenOnce;
  await prisma.desktopLink.update({ where: { id: row.id }, data: { tokenOnce: null } });
  return {
    status: 'ready' as const,
    token,
    user: { id: row.user.id, email: row.user.email }
  };
}
