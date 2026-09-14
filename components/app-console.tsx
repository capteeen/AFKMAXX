'use client';

import { useEffect, useState } from 'react';

type Me = {
  user: { email: string; role: string; status: string; dailyCapMb: number; consentAt: string | null };
  destinations: { id: string; hostname: string; status: string }[];
  results: { id: string; statusCode: number; bytes: number; ms: number; review: string; job: { destination: { hostname: string } } }[];
  jobs: { id: string; status: string; regionLabel: string; destination: { hostname: string } }[];
  bag: number;
  usedBytes: number;
};

const SOURCE = 'afkmaxx-page';
const REPLY = 'afkmaxx-extension';

export function AppConsole() {
  const [me, setMe] = useState<Me | null>(null);
  const [screen, setScreen] = useState('status');
  const [banner, setBanner] = useState('Looking for the extension…');
  const [ext, setExt] = useState(false);
  const [running, setRunning] = useState(false);
  const [consent, setConsent] = useState(false);
  const [cap, setCap] = useState(100);
  const [url, setUrl] = useState('https://example.com');
  const [region, setRegion] = useState('Sample region A');
  const [feedback, setFeedback] = useState('');
  const [tokenNote, setTokenNote] = useState('');
  const [error, setError] = useState('');

  function send(payload: object, wait = 800) {
    return new Promise<Record<string, unknown>>(resolve => {
      const id = Math.random().toString(36).slice(2);
      const timer = setTimeout(() => resolve({ ok: false }), wait);
      const onMsg = (event: MessageEvent) => {
        if (event.source !== window || event.data?.source !== REPLY || event.data?.id !== id) return;
        clearTimeout(timer);
        window.removeEventListener('message', onMsg);
        resolve(event.data);
      };
      window.addEventListener('message', onMsg);
      window.postMessage({ source: SOURCE, id, payload }, '*');
    });
  }

  async function load() {
    const res = await fetch('/api/me');
    if (!res.ok) { setError('Sign in required'); return; }
    const data = await res.json();
    setMe(data);
    setConsent(Boolean(data.user.consentAt));
    setCap(data.user.dailyCapMb);
  }

  useEffect(() => {
    load();
    const onHello = (event: MessageEvent) => {
      if (event.data?.source === REPLY && (event.data.type === 'HELLO' || event.data.type === 'STATE')) {
        setExt(true);
        if (event.data.state?.running) setRunning(true);
      }
    };
    window.addEventListener('message', onHello);
    send({ type: 'PING' }).then(res => {
      if (res.ok) {
        setExt(true);
        setBanner('Extension connected.');
        const state = res.state as { running?: boolean } | undefined;
        if (state?.running) setRunning(true);
      } else setBanner('Extension not found. Open the Extension screen.');
    });
    return () => window.removeEventListener('message', onHello);
  }, []);

  async function saveConsent() {
    await fetch('/api/consent', { method: 'POST' });
    setConsent(true);
    await load();
  }

  async function saveCap(value: number) {
    setCap(value);
    await fetch('/api/me', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ dailyCapMb: value }) });
  }

  async function issueToken() {
    const res = await fetch('/api/device-token', { method: 'POST' });
    const data = await res.json();
    if (!data.token) { setTokenNote(data.error || 'Could not issue token'); return; }
    setTokenNote('Token issued and sent to the extension. It is not shown again.');
    const origin = window.location.origin;
    await send({ type: 'CONFIG', apiBase: origin, deviceToken: data.token, capMB: cap }, 2000);
  }

  async function toggle() {
    if (running) {
      await send({ type: 'PAUSE' }, 2000);
      setRunning(false);
      return;
    }
    if (!consent) await saveConsent();
    await send({ type: 'START', capMB: cap }, 2000);
    setRunning(true);
  }

  async function createJob(event: React.FormEvent) {
    event.preventDefault();
    const res = await fetch('/api/jobs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url, regionLabel: region })
    });
    const data = await res.json();
    setFeedback(data.error || `Queued ${data.job?.destination?.hostname}. Ownership is declared, not proven.`);
    await load();
  }

  if (!me) return <p className="muted">{error || 'Loading…'}</p>;
  const usedMb = (me.usedBytes / (1024 * 1024)).toFixed(2);
  const screens = ['status', 'destinations', 'history', 'request', 'payouts', 'token', 'install'];

  return (
    <>
      <div className={`ext-banner ${ext ? 'ok' : 'warn'}`} role="status">{banner}</div>
      <div className={`desk-shell ${running ? 'checking' : ''}`}>
        <div className="desk-chrome">
          <span className="desk-dots" aria-hidden="true"><i /><i /><i /></span>
          <span className="brand"><img src="/assets/mark.svg" alt="" width={20} height={18} />AFKMAXX</span>
          <span className="micro">{me.user.email}</span>
        </div>
        <div className="desk-body">
          <nav className="desk-nav" aria-label="App screens">
            {screens.map(name => (
              <button key={name} type="button" className={screen === name ? 'is-active' : ''} onClick={() => setScreen(name)}>{name}</button>
            ))}
          </nav>
          <div className="desk-stage">
            {screen === 'status' && (
              <div className="dashboard desk-dash">
                <div className="status-area">
                  <span className="micro">{running ? 'YOUR CONNECTION / YOUR LIMITS' : 'YOUR CONNECTION IS TAKING A BREATHER'}</span>
                  <h3 aria-live="polite">{running ? 'CHECKING' : 'PAUSED'}<span className="status-symbol">Ⅱ</span></h3>
                  <p>{me.user.status === 'banned' ? 'This account is banned.' : !ext ? 'Install the extension to fetch.' : !consent ? 'Confirm consent to start.' : running ? 'The extension polls jobs and GETs allowlisted hosts.' : 'Start after consent and an extension token.'}</p>
                  <button className="button lime" type="button" disabled={!ext || me.user.status === 'banned'} aria-pressed={running} onClick={toggle}>
                    {running ? 'Pause checks' : 'Start checks'} <span>{running ? 'Ⅱ' : '↗'}</span>
                  </button>
                </div>
                <div className="controls">
                  <label className="check-label">
                    <input type="checkbox" checked={consent} onChange={e => { if (e.target.checked) saveConsent(); }} />
                    <span>I understand checks use my connection, only hit approved HTTPS hosts, and stay unaudited until review. Work and $AFK are not guaranteed.</span>
                  </label>
                  <label className="micro">DAILY DATA CAP <output>{cap} MB</output></label>
                  <input type="range" min={25} max={250} step={25} value={cap} onChange={e => saveCap(Number(e.target.value))} />
                  <p className="control-note">Usage today: {usedMb} / {me.user.dailyCapMb} MB. Account status: {me.user.status}.</p>
                </div>
              </div>
            )}
            {screen === 'destinations' && (
              <>
                <span className="micro">DESTINATIONS</span>
                <h3 className="desk-title">A LIST. NOT A BLANK CHECK.</h3>
                {me.destinations.map(d => (
                  <div className="screen-row" key={d.id}><span>{d.hostname}</span><b>{d.status}</b></div>
                ))}
                {!me.destinations.length && <p className="muted">None yet. Queue a request.</p>}
              </>
            )}
            {screen === 'history' && (
              <>
                <span className="micro">CHECK HISTORY</span>
                <h3 className="desk-title">RECEIPTS FROM THIS ACCOUNT.</h3>
                <div className="table-scroll">
                  <table>
                    <thead><tr><th>HOST</th><th>RESULT</th><th>DATA</th><th>REVIEW</th></tr></thead>
                    <tbody>
                      {me.results.map(r => (
                        <tr key={r.id}>
                          <td>{r.job.destination.hostname}</td>
                          <td>{r.statusCode}</td>
                          <td>{(r.bytes / 1024).toFixed(1)} KB / {r.ms} ms</td>
                          <td>{r.review}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
            {screen === 'request' && (
              <>
                <span className="micro">CUSTOMER REQUEST</span>
                <h3 className="desk-title">YOUR SITE. ANOTHER PERSPECTIVE.</h3>
                <p className="muted">Ownership is declared, not proven. example.com and example.org auto-approve. Others wait for admin.</p>
                <form onSubmit={createJob}>
                  <label>PUBLIC HTTPS URL<input value={url} onChange={e => setUrl(e.target.value)} type="url" required /></label>
                  <label>REGION LABEL<input value={region} onChange={e => setRegion(e.target.value)} required /></label>
                  <button className="button lime" type="submit">Queue check ↗</button>
                  <p className="feedback" role="status">{feedback}</p>
                </form>
                <ul className="request-log">
                  {me.jobs.map(j => <li key={j.id}>{j.destination.hostname} · {j.regionLabel} · {j.status}</li>)}
                </ul>
              </>
            )}
            {screen === 'payouts' && (
              <>
                <span className="micro">PAYOUTS</span>
                <h3 className="desk-title">NO LIVE WITHDRAWALS.</h3>
                <div className="empty">NOT AVAILABLE.</div>
                <p>Accepted work may later settle in $AFK on Robinhood Chain. That integration is not live.</p>
              </>
            )}
            {screen === 'token' && (
              <>
                <span className="micro">$AFK BAG / NOT LIVE</span>
                <h3 className="desk-title">MEMECOIN WITH A DAY JOB.</h3>
                <div className="token-stat">
                  <span className="micro">PLACEHOLDER BAG</span>
                  <strong>{me.bag} $AFK</strong>
                  <span className="micro">NOT WITHDRAWABLE / NOT A ROBINHOOD LISTING</span>
                </div>
              </>
            )}
            {screen === 'install' && (
              <>
                <span className="micro">EXTENSION</span>
                <h3 className="desk-title">INSTALL. CONNECT. ISSUE A TOKEN.</h3>
                <ol className="install-steps">
                  <li>Install AFKMAXX from the Chrome Web Store, or load <code>extension/</code> unpacked while testing.</li>
                  <li>Open the extension popup, paste this site’s origin, and click Connect this site. Local http://127.0.0.1 is already allowed.</li>
                  <li>Click issue token so the extension can poll jobs.</li>
                </ol>
                <button className="button lime" type="button" onClick={issueToken}>Issue device token ↗</button>
                <p className="control-note">{tokenNote}</p>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
