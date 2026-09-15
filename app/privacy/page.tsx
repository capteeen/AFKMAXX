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
        <p>In return for some of the premium features of AFKMAXX desktop, you may choose to be a peer on the Bright Data network. By doing so you agree to have read and accepted the Terms of Service of the Bright SDK EULA: <a href="https://bright-sdk.com/eula">https://bright-sdk.com/eula</a> and Bright Data’s Privacy Policy: <a href="https://bright-sdk.com/privacy-policy">https://bright-sdk.com/privacy-policy</a>. You may opt out of the Bright Data network by turning off Web Indexing in the AFKMAXX Mac or Windows app.</p>
        <p>You get AFKMAXX desktop features in exchange for safely using some of your device’s resources, and only in a manner that will not substantially affect the device’s operation (see <a href="https://bright-sdk.com/users#learn-more-about-bright-sdk-web-indexing">how Bright SDK works</a>). You may turn this off from the desktop settings. See also the SDK Privacy Policy at <a href="https://brightdata.com/legal/sdk-privacy">https://brightdata.com/legal/sdk-privacy</a>.</p>
        <p>Check bodies are not stored on the server. Results stay unaudited until an admin reviews them. $AFK ledger rows are placeholders and are not withdrawable.</p>
        <p>You can pause in the app, the extension popup, or the desktop app. A banned account cannot receive jobs. Ownership of a destination is declared, not proven, until a later challenge exists.</p>
      </main>
    </>
  );
}
