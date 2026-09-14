import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/session';
import { AppConsole } from '@/components/app-console';

export default async function AppPage() {
  let user = null;
  try {
    user = await getCurrentUser();
  } catch {
    redirect('/sign-in');
  }
  if (!user) redirect('/sign-in');
  return <AppConsole />;
}
