'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { signOutUser } from '@/app/login/actions';
import { AfkCoin } from '@/components/afk-coin';
import { DashChart } from '@/components/dash-chart';

type Result = {
  id: string;
  statusCode: number;
  bytes: number;
  ms: number;
  review: string;
  fetchedAt: string;
  job: { destination: { hostname: string } };
};

type Entry = { id: string; delta: number; reason: string; createdAt: string };

type Me = {
  user: {
    id: string;
    email: string;
    role: string;
    status: string;
    dailyCapMb: number;
    consentAt: string | null;
    createdAt: string;
  };
  destinations: { id: string; hostname: string; status: string }[];
  results: Result[];
  jobs: { id: string; status: string; regionLabel: string; createdAt: string; destination: { hostname: string } }[];
  entries: Entry[];
  bag: number;
  usedBytes: number;
};

const SOURCE = 'afkmaxx-page';
const REPLY = 'afkmaxx-extension';

type Screen =
  | 'overview'
  | 'statistics'
  | 'history'
  | 'referrals'
  | 'achievements'
  | 'limits'
  | 'work'
  | 'install';

type StatKey = 'gathering' | 'sites' | 'referrals' | 'accepted' | 'loyalty';

const NAV: { id: Screen; label: string }[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'statistics', label: 'Statistics' },
  { id: 'history', label: 'History' },
  { id: 'referrals', label: 'Referrals' },
  { id: 'achievements', label: 'Achievements' }
];

const MORE: { id: Screen; label: string }[] = [
  { id: 'limits', label: 'Limits' },
  { id: 'work', label: 'Sites' },
  { id: 'install', label: 'Extension' }
];

const STATS: { id: StatKey; label: string; hint: string }[] = [
  { id: 'gathering', label: 'Gathering', hint: 'Approved HTTPS checks from this machine.' },
  { id: 'sites', label: 'Site jobs', hint: 'Checks you queued for your own hosts.' },
  { id: 'referrals', label: 'Referrals', hint: 'Not live. The link is a placeholder.' },
  { id: 'accepted', label: 'Accepted', hint: 'Admin-accepted work. $AFK is still a placeholder.' },
  { id: 'loyalty', label: 'Streak', hint: 'Days in a row with at least one check.' }
];

function dayKey(date: Date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function lastDays(n: number) {
  const days: { key: string; label: string; date: Date }[] = [];
  const now = new Date();
  now.setHours(12, 0, 0, 0);
  for (let i = n - 1; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(now.getDate() - i);
    days.push({
      key: dayKey(date),
      label: date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }),
      date
    });
  }
  return days;
}

function formatBag(value: number) {
  return value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function kb(bytes: number) {
  return (bytes / 1024).toFixed(1);
}

function initials(email: string) {
  const part = email.split('@')[0] || 'A';
  return part.slice(0, 1).toUpperCase();
}

function previewMe(): Me {
  const now = new Date();
  const results: Result[] = [2, 3, 4, 7, 8, 9].map((day, i) => {
    const fetchedAt = new Date(now);
    fetchedAt.setDate(now.getDate() - (14 - day));
    return {
      id: `r${i}`,
      statusCode: 200,
      bytes: 12000 + i * 800,
      ms: 140 + i * 12,
      review: i % 3 === 0 ? 'accepted' : 'unaudited',
      fetchedAt: fetchedAt.toISOString(),
      job: { destination: { hostname: i % 2 ? 'example.org' : 'example.com' } }
    };
  });
  return {
    user: {
      id: 'preview01afkmaxx',
      email: 'you@afkmaxx.local',
      role: 'participant',
      status: 'active',
      dailyCapMb: 100,
      consentAt: now.toISOString(),
      createdAt: now.toISOString()
    },
    destinations: [{ id: 'd1', hostname: 'example.com', status: 'approved' }],
    results,
    jobs: [{ id: 'j1', status: 'queued', regionLabel: 'Sample region A', createdAt: now.toISOString(), destination: { hostname: 'example.com' } }],
    entries: [{ id: 'e1', delta: 0, reason: 'placeholder_only', createdAt: now.toISOString() }],
    bag: 0,
    usedBytes: 48000
  };
}

export function AppConsole({ preview = false }: { preview?: boolean } = {}) {
  const [me, setMe] = useState<Me | null>(preview ? previewMe() : null);
  const [screen, setScreen] = useState<Screen>('overview');
  const [wallet, setWallet] = useState<'checks' | 'sites'>('checks');
  const [range, setRange] = useState<7 | 30>(30);
  const [stat, setStat] = useState<StatKey>('gathering');
  const [banner, setBanner] = useState('Looking for the extension…');
  const [ext, setExt] = useState(false);
  const [running, setRunning] = useState(false);
  const [consent, setConsent] = useState(false);
  const [cap, setCap] = useState(100);
  const [url, setUrl] = useState('https://example.com');
  const [region, setRegion] = useState('Sample region A');
  const [feedback, setFeedback] = useState('');
  const [tokenNote, setTokenNote] = useState('');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');
  const [origin, setOrigin] = useState('');

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
    if (!res.ok) {
      setError('Sign in required');
      return;
    }
    const data = await res.json();
    setMe({ ...data, entries: data.entries || [] });
    setConsent(Boolean(data.user.consentAt));
    setCap(data.user.dailyCapMb);
  }

  useEffect(() => {
    setConsent(preview);
    setCap(100);
    setOrigin(window.location.origin);
    if (preview) {
      setBanner('Preview desk. Sign in on /app for a live bag.');
      return;
    }
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
      } else setBanner('Extension not found. Open Extension to connect.');
    });
    return () => window.removeEventListener('message', onHello);
  }, []);

  async function saveConsent() {
    if (preview) { setConsent(true); return; }
    await fetch('/api/consent', { method: 'POST' });
    setConsent(true);
    await load();
  }

  async function saveCap(value: number) {
    setCap(value);
    if (preview) return;
    await fetch('/api/me', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ dailyCapMb: value }) });
  }

  async function issueToken() {
    if (preview) { setTokenNote('Preview only. Sign in to issue a real token.'); return; }
    const res = await fetch('/api/device-token', { method: 'POST' });
    const data = await res.json();
    if (!data.token) {
      setTokenNote(data.error || 'Could not issue token');
      return;
    }
    setTokenNote('Token issued and sent to the extension. It is not shown again.');
    await send({ type: 'CONFIG', apiBase: window.location.origin, deviceToken: data.token, capMB: cap }, 2000);
  }

  async function toggle() {
    if (preview) { setRunning(r => !r); return; }
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
    if (preview) { setFeedback('Preview only. Sign in to queue a live job.'); return; }
    const res = await fetch('/api/jobs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url, regionLabel: region })
    });
    const data = await res.json();
    setFeedback(data.error || `Queued ${data.job?.destination?.hostname}. Ownership is declared, not proven.`);
    await load();
  }

  const stats = useMemo(() => {
    const days = lastDays(range);
    if (!me) {
      return {
        gathering: 0,
        sites: 0,
        referrals: 0,
        accepted: 0,
        loyalty: 0,
        pending: 0,
        gatheringDays: days.map(d => ({ label: d.label, value: 0 })),
        sitesDays: days.map(d => ({ label: d.label, value: 0 })),
        acceptedDays: days.map(d => ({ label: d.label, value: 0 })),
        streakDays: 0
      };
    }
    const gatheringDays = days.map(d => ({
      label: d.label,
      value: me.results.filter(r => dayKey(new Date(r.fetchedAt)) === d.key).length
    }));
    const sitesDays = days.map(d => ({
      label: d.label,
      value: me.jobs.filter(j => dayKey(new Date(j.createdAt)) === d.key).length
    }));
    const acceptedDays = days.map(d => ({
      label: d.label,
      value: me.results.filter(r => r.review === 'accepted' && dayKey(new Date(r.fetchedAt)) === d.key).length
    }));
    let streak = 0;
    const today = dayKey(new Date());
    const keys = new Set(me.results.map(r => dayKey(new Date(r.fetchedAt))));
    for (let i = 0; i < 30; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const key = dayKey(date);
      if (i === 0 && key !== today) break;
      if (keys.has(key)) streak += 1;
      else if (i > 0) break;
    }
    return {
      gathering: me.results.length,
      sites: me.jobs.length,
      referrals: 0,
      accepted: me.results.filter(r => r.review === 'accepted').length,
      loyalty: streak,
      pending: me.results.filter(r => r.review === 'unaudited').length,
      gatheringDays,
      sitesDays,
      acceptedDays,
      streakDays: streak
    };
  }, [me, range]);

  const streakLeft = Math.max(0, 7 - stats.streakDays);
  const referralCode = me ? me.user.id.slice(0, 8).toUpperCase() : 'AFKMAXX';
  const referralLink = origin ? `${origin}/login?ref=${referralCode}` : `/login?ref=${referralCode}`;

  if (!me) {
    return (
      <main id="main" className="dash-boot">
        <p className="muted">{error || 'Loading the desk…'}</p>
      </main>
    );
  }

  const usedMb = (me.usedBytes / (1024 * 1024)).toFixed(2);
  const bagValue = wallet === 'checks' ? me.bag : stats.sites;
  const pendingValue = wallet === 'checks' ? stats.pending : me.jobs.filter(j => j.status === 'queued').length;
  const chartPoints =
    stat === 'gathering' ? stats.gatheringDays
    : stat === 'sites' ? stats.sitesDays
    : stat === 'accepted' ? stats.acceptedDays
    : stats.gatheringDays.map(d => ({ label: d.label, value: 0 }));
  const chartTotal =
    stat === 'gathering' ? stats.gatheringDays.reduce((n, p) => n + p.value, 0)
    : stat === 'sites' ? stats.sitesDays.reduce((n, p) => n + p.value, 0)
    : stat === 'accepted' ? stats.acceptedDays.reduce((n, p) => n + p.value, 0)
    : stat === 'loyalty' ? stats.streakDays
    : 0;
  const overviewTotal = stats.gatheringDays.reduce((n, p) => n + p.value, 0);

  const achievements = [
    { id: 'consent', title: 'Opted in', copy: 'You confirmed checks use this connection.', done: Boolean(me.user.consentAt) },
    { id: 'ext', title: 'Extension parked', copy: 'The fetch layer is connected to this desk.', done: ext },
    { id: 'first', title: 'First check', copy: 'One approved GET left this machine.', done: me.results.length > 0 },
    { id: 'seven', title: 'Seven receipts', copy: 'Seven checks on the record.', done: me.results.length >= 7 },
    { id: 'accept', title: 'Accepted work', copy: 'An admin accepted a result. $AFK still is not live.', done: stats.accepted > 0 },
    { id: 'site', title: 'Queued a site', copy: 'You asked for another perspective on a host.', done: me.jobs.length > 0 },
    { id: 'streak', title: 'Three-day streak', copy: 'Checks three days in a row.', done: stats.streakDays >= 3 }
  ];
  const doneCount = achievements.filter(a => a.done).length;

  async function copyRef() {
    try {
      await navigator.clipboard.writeText(referralLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="dash">
      <aside className="dash-side">
        <Link className="brand dash-brand" href="/" aria-label="AFKMAXX home">
          <img src="/assets/mark.svg" alt="" width={28} height={25} />AFKMAXX
        </Link>
        <nav className="dash-nav" aria-label="App">
          {NAV.map(item => (
            <button key={item.id} type="button" className={screen === item.id ? 'is-active' : ''} onClick={() => setScreen(item.id)}>
              {item.label}
            </button>
          ))}
        </nav>
        <nav className="dash-nav dash-nav-more" aria-label="Controls">
          <span className="micro">THE DESK</span>
          {MORE.map(item => (
            <button key={item.id} type="button" className={screen === item.id ? 'is-active' : ''} onClick={() => setScreen(item.id)}>
              {item.label}
            </button>
          ))}
          {me.user.role === 'admin' ? <Link href="/admin">Admin</Link> : null}
        </nav>
        <form className="dash-signout" action={signOutUser}>
          <button className="text-link" type="submit">Sign out ↗</button>
        </form>
      </aside>

      <div className="dash-main">
        <header className="dash-top">
          <div className="dash-switch" role="group" aria-label="Wallet">
            <button type="button" className={wallet === 'checks' ? 'is-on' : ''} onClick={() => setWallet('checks')}>
              Checks <b>{formatBag(me.bag)}</b>
            </button>
            <span className={`dash-toggle ${wallet === 'sites' ? 'is-sites' : ''}`} aria-hidden="true" />
            <button type="button" className={wallet === 'sites' ? 'is-on' : ''} onClick={() => setWallet('sites')}>
              Sites <b>{stats.sites}</b>
            </button>
          </div>
          <div className="dash-top-actions">
            <a className="button lime dash-download" href="#install" onClick={event => { event.preventDefault(); setScreen('install'); }}>
              Get extension <span>↘</span>
            </a>
            <span className={`dash-pill ${running ? 'is-live' : ''}`}>{running ? 'Checking' : 'Paused'}</span>
            <span className="dash-avatar" title={me.user.email}>{initials(me.user.email)}</span>
          </div>
        </header>

        <main id="main" className="dash-body">
          <div className={`ext-banner ${ext ? 'ok' : 'warn'}`} role="status">{banner}</div>

          {screen === 'overview' && (
            <div className="dash-grid">
              <section className="dash-card dash-wallets">
                <div className={`dash-wallet ${wallet === 'checks' ? 'is-current' : ''}`}>
                  <span className="micro">CHECKS WALLET</span>
                  <div className="dash-hive" aria-hidden="true">
                    {Array.from({ length: 18 }, (_, i) => <i key={i} className={i < Math.min(stats.gathering, 18) ? 'is-lit' : ''} />)}
                    <AfkCoin size={54} className="dash-hive-coin" />
                  </div>
                </div>
                <div className={`dash-wallet dash-wallet-live ${wallet === 'sites' ? 'is-current' : ''}`}>
                  <span className="micro">{wallet === 'checks' ? 'PLACEHOLDER BAG' : 'SITES ON FILE'}</span>
                  <strong>{wallet === 'checks' ? formatBag(bagValue) : pendingValue}</strong>
                  <span className="dash-unit">{wallet === 'checks' ? '$AFK' : 'queued'}</span>
                  <p>Not withdrawable. Robinhood Chain is intended, not live. Accepted work may later settle here.</p>
                  <button className="button lime" type="button" disabled={(!ext && !preview) || me.user.status === 'banned'} aria-pressed={running} onClick={toggle}>
                    {running ? 'Pause checks' : 'Start checks'} <span>{running ? 'Ⅱ' : '↗'}</span>
                  </button>
                </div>
              </section>

              <aside className="dash-stack">
                <section className="dash-card dash-pot">
                  <span className="micro">STREAK POT</span>
                  <h3>Keep the desk warm.</h3>
                  <p>Hit an approved check {streakLeft} more {streakLeft === 1 ? 'day' : 'days'} in a row. No bonus is paid yet.</p>
                  <div className="dash-pot-meta">
                    <span>7 days</span>
                    <span>0 $AFK</span>
                  </div>
                  <div className="dash-meter" aria-label="Streak progress">
                    <i style={{ width: `${(Math.min(stats.streakDays, 7) / 7) * 100}%` }} />
                  </div>
                  <span className="micro">{stats.streakDays}/7</span>
                </section>
              </aside>

              <section className="dash-card dash-earn">
                <div className="dash-earn-head">
                  <div>
                    <span className="micro">EARNINGS</span>
                    <strong>{overviewTotal} <small>checks / last {range} days</small></strong>
                  </div>
                  <div className="dash-pills">
                    <button type="button" className="is-on">by types</button>
                    <button type="button" onClick={() => setScreen('statistics')}>by wallet</button>
                  </div>
                </div>
                <DashChart points={stats.gatheringDays} />
                <ul className="dash-legend">
                  <li><i className="is-mint" /> Gathering {stats.gatheringDays.reduce((n, p) => n + p.value, 0)}</li>
                  <li><i className="is-blue" /> Accepted {stats.accepted}</li>
                  <li><i /> Pending {stats.pending}</li>
                </ul>
              </section>

              <aside className="dash-stack">
                <section className="dash-card dash-boost">
                  <span className="micro">LOYALTY BOOSTER</span>
                  <h3>Stay opted in. The side quest stays yours.</h3>
                  <p>No percentage boost is live. Limits, pause, and allowlists still are.</p>
                </section>
                <section className="dash-card dash-ref">
                  <span className="micro">SHARE THE DESK</span>
                  <label className="dash-copy">
                    <input readOnly value={referralLink} />
                    <button type="button" onClick={copyRef}>{copied ? 'Copied' : 'Copy'}</button>
                  </label>
                  <p className="muted">My referrals: 0 · All time · Not tracked yet</p>
                </section>
              </aside>
            </div>
          )}

          {screen === 'statistics' && (
            <>
              <div className="dash-page-head">
                <h2>Statistics</h2>
                <div className="dash-pills">
                  <button type="button" className={range === 30 ? 'is-on' : ''} onClick={() => setRange(30)}>Last 30 days</button>
                  <button type="button" className={range === 7 ? 'is-on' : ''} onClick={() => setRange(7)}>Last 7 days</button>
                </div>
              </div>
              <div className="dash-stat-tabs">
                {STATS.map(item => (
                  <button key={item.id} type="button" className={stat === item.id ? 'is-on' : ''} onClick={() => setStat(item.id)}>
                    <span className="micro">{item.label}</span>
                    <b>
                      {item.id === 'gathering' ? stats.gatheringDays.reduce((n, p) => n + p.value, 0)
                        : item.id === 'sites' ? stats.sitesDays.reduce((n, p) => n + p.value, 0)
                        : item.id === 'referrals' ? 0
                        : item.id === 'accepted' ? stats.acceptedDays.reduce((n, p) => n + p.value, 0)
                        : stats.streakDays}
                    </b>
                  </button>
                ))}
              </div>
              <section className="dash-card">
                <p className="muted">{STATS.find(item => item.id === stat)?.hint}</p>
                <strong className="dash-stat-total">{chartTotal}{stat === 'loyalty' ? ' days' : ''}</strong>
                {stat === 'loyalty' ? (
                  <div className="dash-meter dash-meter-lg" aria-label="Streak"><i style={{ width: `${(Math.min(stats.streakDays, 7) / 7) * 100}%` }} /></div>
                ) : (
                  <DashChart points={chartPoints} accent={stat === 'accepted' ? 'var(--blue)' : 'var(--mint)'} height={220} />
                )}
              </section>
            </>
          )}

          {screen === 'history' && (
            <>
              <div className="dash-page-head">
                <h2>Transaction history</h2>
              </div>
              <section className="dash-card">
                <p className="muted">Checks and placeholder ledger rows. Nothing here is a withdrawal.</p>
                <div className="table-scroll">
                  <table>
                    <thead><tr><th>When</th><th>What</th><th>Detail</th><th>Review</th></tr></thead>
                    <tbody>
                      {me.results.map(r => (
                        <tr key={r.id}>
                          <td>{new Date(r.fetchedAt).toLocaleString()}</td>
                          <td>{r.job.destination.hostname}</td>
                          <td>{r.statusCode} · {kb(r.bytes)} KB · {r.ms} ms</td>
                          <td>{r.review}</td>
                        </tr>
                      ))}
                      {me.entries.map(e => (
                        <tr key={e.id}>
                          <td>{new Date(e.createdAt).toLocaleString()}</td>
                          <td>$AFK ledger</td>
                          <td>{e.delta} · {e.reason}</td>
                          <td>placeholder</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {!me.results.length && !me.entries.length ? <p className="dash-empty">NO RECEIPTS YET.</p> : null}
              </section>
            </>
          )}

          {screen === 'referrals' && (
            <>
              <div className="dash-page-head"><h2>Referrals</h2></div>
              <section className="dash-card dash-ref-page">
                <p>Invite is a link, not a program. We do not credit $AFK for signups.</p>
                <label className="dash-copy">
                  <input readOnly value={referralLink} />
                  <button type="button" onClick={copyRef}>{copied ? 'Copied' : 'Copy'}</button>
                </label>
                <dl className="dash-dl">
                  <div><dt>Code</dt><dd>{referralCode}</dd></div>
                  <div><dt>Signups</dt><dd>0</dd></div>
                  <div><dt>Payout</dt><dd>Not live</dd></div>
                </dl>
              </section>
            </>
          )}

          {screen === 'achievements' && (
            <>
              <div className="dash-page-head">
                <h2>Achievements</h2>
                <span className="micro">{doneCount}/{achievements.length} STAMPED</span>
              </div>
              <div className="dash-achieves">
                {achievements.map(item => (
                  <article key={item.id} className={`dash-card ${item.done ? 'is-done' : ''}`}>
                    <span className="micro">{item.done ? 'STAMPED' : 'OPEN'}</span>
                    <h3>{item.title}</h3>
                    <p>{item.copy}</p>
                  </article>
                ))}
              </div>
            </>
          )}

          {screen === 'limits' && (
            <>
              <div className="dash-page-head"><h2>Limits</h2></div>
              <section className={`dash-card ${running ? 'checking' : ''}`}>
                <div className="status-area">
                  <span className="micro">{running ? 'YOUR CONNECTION / YOUR LIMITS' : 'YOUR CONNECTION IS TAKING A BREATHER'}</span>
                  <h3 aria-live="polite">{running ? 'CHECKING' : 'PAUSED'}<span className="status-symbol">Ⅱ</span></h3>
                  <p>
                    {me.user.status === 'banned' ? 'This account is banned.'
                      : !ext && !preview ? 'Install the extension to fetch.'
                      : !consent ? 'Confirm consent to start.'
                      : running ? 'The extension polls jobs and GETs allowlisted hosts.'
                      : 'Start after consent and an extension token.'}
                  </p>
                  <button className="button lime" type="button" disabled={(!ext && !preview) || me.user.status === 'banned'} aria-pressed={running} onClick={toggle}>
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
              </section>
            </>
          )}

          {screen === 'work' && (
            <>
              <div className="dash-page-head"><h2>Sites</h2></div>
              <div className="dash-split">
                <section className="dash-card">
                  <span className="micro">DESTINATIONS</span>
                  <h3 className="desk-title">A LIST. NOT A BLANK CHECK.</h3>
                  {me.destinations.map(d => (
                    <div className="screen-row" key={d.id}><span>{d.hostname}</span><b>{d.status}</b></div>
                  ))}
                  {!me.destinations.length && <p className="muted">None yet. Queue a request.</p>}
                </section>
                <section className="dash-card">
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
                </section>
              </div>
            </>
          )}

          {screen === 'install' && (
            <>
              <div className="dash-page-head"><h2>Extension</h2></div>
              <section className="dash-card">
                <span className="micro">INSTALL. CONNECT. ISSUE A TOKEN.</span>
                <ol className="install-steps">
                  <li>Install AFKMAXX from the Chrome Web Store, or load <code>extension/</code> unpacked while testing.</li>
                  <li>Open the extension popup, paste this site’s origin, and click Connect this site. Local http://127.0.0.1 is already allowed.</li>
                  <li>Click issue token so the extension can poll jobs.</li>
                </ol>
                <button className="button lime" type="button" onClick={issueToken}>Issue device token ↗</button>
                <p className="control-note">{tokenNote}</p>
                <div className="token-stat">
                  <span className="micro">PLACEHOLDER BAG</span>
                  <strong>{formatBag(me.bag)} $AFK</strong>
                  <span className="micro">NOT WITHDRAWABLE / NOT A ROBINHOOD LISTING</span>
                </div>
              </section>
            </>
          )}
        </main>
      </div>
    </div>
  );
}
