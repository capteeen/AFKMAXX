export function clerkPublishableKey() {
  return (process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || '').trim();
}

export function clerkSecretKey() {
  return (process.env.CLERK_SECRET_KEY || '').trim();
}

export function clerkConfigured() {
  return clerkPublishableKey().startsWith('pk_') && clerkSecretKey().startsWith('sk_');
}
