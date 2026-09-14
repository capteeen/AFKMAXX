import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/session';
import { AppConsole } from '@/components/app-console';

export default async function AppPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');
  return <AppConsole />;
}
