import { SiteHeader } from '@/components/site-header';

export default function SpecimensPage() {
  return (
    <>
      <SiteHeader />
      <main id="main" className="wrap desktop-page">
        <div className="section-heading">
          <span className="micro eyebrow">NOT THE PRODUCT</span>
          <h2>OLD <em>SPECIMENS.</em></h2>
          <p>Static HTML from the concept phase. The live product is the signed-in app plus extension.</p>
        </div>
        <p><a className="text-link" href="/specimens/system.html">system.html ↗</a></p>
        <p><a className="text-link" href="/specimens/desktop.html">desktop demo ↗</a></p>
        <p><a className="text-link" href="/specimens/mobile.html">mobile demo ↗</a></p>
      </main>
    </>
  );
}
