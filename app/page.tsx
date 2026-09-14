import { SiteHeader } from '@/components/site-header';
import { Landing } from '@/components/landing';

export default function Page() {
  return (
    <>
      <SiteHeader current="home" />
      <Landing />
    </>
  );
}
