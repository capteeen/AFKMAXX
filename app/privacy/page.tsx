import { SiteHeader } from '@/components/site-header';

export default function PrivacyPage() {
  return (
    <>
      <SiteHeader />
      <main id="main" className="wrap desktop-page">
        <div className="section-heading">
          <span className="micro eyebrow">DATA</span>
          <h2>WHAT WE <em>KEEP.</em></h2>
        </div>
        <p>Email and password via Supabase Auth. Consent timestamp. Destinations you declare. Jobs and check metadata (status code, bytes, duration). Device token hashes on the server, not the raw token after issue. No browsing history. No cookies from third-party sites. The extension fetches with credentials omitted.</p>
        <p>The AFKMAXX Chrome extension stores on the device: whether checks are running, today’s byte usage, the web app origin you connected, a device token used to poll jobs, and a short local history of host plus status code. It does not read browsing history, does not inject into arbitrary sites except the connected AFKMAXX app origin and user-granted HTTPS check hosts, and does not sell data. Check response bodies are read only to count bytes, then discarded.</p>
        <p>Check bodies are not stored on the server. Results stay unaudited until an admin reviews them. $AFK ledger rows are placeholders and are not withdrawable.</p>
        <p>You can pause in the app or the extension popup. A banned account cannot receive jobs. Ownership of a destination is declared, not proven, until a later challenge exists.</p>
      </main>
    </>
  );
}
