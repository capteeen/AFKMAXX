import { currentUser } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

const adminEmail = (process.env.ADMIN_EMAIL || '').toLowerCase();

export async function getCurrentUser() {
  let clerkUser;
  try {
    clerkUser = await currentUser();
  } catch {
    return null;
  }
  if (!clerkUser) return null;
  const email = (
    clerkUser.primaryEmailAddress?.emailAddress ||
    clerkUser.emailAddresses[0]?.emailAddress ||
    ''
  ).toLowerCase();
  if (!email) return null;
  const verified = clerkUser.primaryEmailAddress?.verification?.status === 'verified' ? new Date() : null;
  const name = [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(' ') || clerkUser.username || null;
  try {
    const existing = await prisma.user.findFirst({
      where: { OR: [{ clerkId: clerkUser.id }, { email }] }
    });
    if (existing) {
      return prisma.user.update({
        where: { id: existing.id },
        data: {
          clerkId: clerkUser.id,
          email,
          name: name || existing.name,
          image: clerkUser.imageUrl || existing.image,
          emailVerified: verified || existing.emailVerified,
          ...(adminEmail && email === adminEmail ? { role: 'admin' } : {})
        }
      });
    }
    return prisma.user.create({
      data: {
        clerkId: clerkUser.id,
        email,
        name,
        image: clerkUser.imageUrl,
        emailVerified: verified,
        role: adminEmail && email === adminEmail ? 'admin' : 'participant'
      }
    });
  } catch (error) {
    console.error('getCurrentUser prisma', error);
    return null;
  }
}
