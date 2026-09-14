const ALARM = 'afkmaxx-tick';
const MAX_BODY = 256 * 1024;
const STORE = 'afkmaxx.runtime.v1';

const defaults = {
  running: false,
  capMB: 100,
  usedBytes: 0,
  usedDay: '',
  apiBase: '',
  deviceToken: '',
  appOrigins: [],
  history: []
};

const BRIDGE_SCRIPT = 'afkmaxx-app-bridge';

function parseAppOrigin(value) {
  try {
    const url = new URL(String(value || '').trim());
    const local = url.hostname === 'localhost' || url.hostname === '127.0.0.1';
    if (url.protocol === 'https:') return url.origin;
    if (url.protocol === 'http:' && local) return url.origin;
    return '';
  } catch {
    return '';
  }
}

async function registerAppBridge(state) {
  const matches = [...new Set(state.appOrigins || [])]
    .map(origin => `${origin.replace(/\/$/, '')}/*`)
    .filter(match => !match.startsWith('http://127.0.0.1/') && !match.startsWith('http://localhost/'));
  try {
    await chrome.scripting.unregisterContentScripts({ ids: [BRIDGE_SCRIPT] });
  } catch {
    /* not registered yet */
  }
  if (!matches.length) return;
  await chrome.scripting.registerContentScripts([{
    id: BRIDGE_SCRIPT,
    js: ['bridge.js'],
    matches,
    runAt: 'document_start',
    persistAcrossSessions: true
  }]);
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

async function load() {
  const bag = await chrome.storage.local.get(STORE);
  const state = { ...defaults, ...(bag[STORE] || {}) };
  if (state.usedDay !== today()) {
    state.usedDay = today();
    state.usedBytes = 0;
  }
  return state;
}

async function save(state) {
  await chrome.storage.local.set({ [STORE]: state });
  return state;
}

function originFor(host) {
  return `https://${host}/*`;
}

function hostOf(value) {
  try {
    const url = new URL(value.includes('://') ? value : `https://${value}`);
    if (url.protocol !== 'https:') return '';
    return url.hostname.replace(/^www\./, '');
  } catch {
    return '';
  }
}

async function allowed(host) {
  return chrome.permissions.contains({ origins: [originFor(host)] })
    .then(ok => ok || chrome.permissions.contains({ origins: [originFor(`www.${host}`)] }));
}

async function boundedGet(url, signal) {
  const started = Date.now();
  const res = await fetch(url, {
    method: 'GET',
    credentials: 'omit',
    cache: 'no-store',
    redirect: 'manual',
    referrerPolicy: 'no-referrer',
    signal,
    headers: { Accept: 'text/html,application/xhtml+xml;q=0.9,*/*;q=0.8' }
  });
  const finalHost = hostOf(res.url || url);
  const startHost = hostOf(url);
  if (finalHost && startHost && finalHost !== startHost) {
    return { status: 0, statusText: 'redirect-off-allowlist', ms: Date.now() - started, bytes: 0, failed: true };
  }
  let bytes = 0;
  if (res.body) {
    const reader = res.body.getReader();
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      bytes += value.byteLength;
      if (bytes >= MAX_BODY) {
        await reader.cancel();
        break;
      }
    }
  }
  return { status: res.status, statusText: res.statusText || 'OK', ms: Date.now() - started, bytes, failed: false };
}

let inflight = null;

async function api(state, path, init = {}) {
  if (!state.apiBase || !state.deviceToken) throw new Error('Not linked');
  const res = await fetch(`${state.apiBase}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${state.deviceToken}`,
      'Content-Type': 'application/json',
      ...(init.headers || {})
    }
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || res.statusText);
  return data;
}

async function stop(state) {
  state.running = false;
  if (inflight) inflight.abort();
  inflight = null;
  await chrome.alarms.clear(ALARM);
  return save(state);
}

async function tick() {
  const state = await load();
  if (!state.running) return stop(state);
  inflight = new AbortController();
  try {
    const next = await api(state, '/api/jobs/next');
    if (next.usedBytes != null) state.usedBytes = next.usedBytes;
    if (next.capMb) state.capMB = next.capMb;
    if (!next.job) {
      await save(state);
      return;
    }
    const host = hostOf(next.job.hostname || next.job.url);
    if (!host || !(await allowed(host))) {
      await api(state, '/api/results', {
        method: 'POST',
        body: JSON.stringify({ jobId: next.job.id, hostname: host, statusCode: 0, bytes: 0, ms: 0, failed: true })
      });
      return;
    }
    const result = await boundedGet(next.job.url, inflight.signal);
    state.usedBytes += result.bytes;
    await api(state, '/api/results', {
      method: 'POST',
      body: JSON.stringify({
        jobId: next.job.id,
        hostname: host,
        statusCode: result.status,
        bytes: result.bytes,
        ms: result.ms,
        failed: result.failed
      })
    });
    state.history = [...(state.history || []), { host, status: result.status, at: new Date().toISOString() }].slice(-40);
    await save(state);
  } catch (error) {
    if (error.name === 'AbortError') return;
    await save(state);
  } finally {
    inflight = null;
  }
}

async function start(partial) {
  const state = await load();
  Object.assign(state, partial);
  state.running = true;
  await save(state);
  await chrome.alarms.create(ALARM, { periodInMinutes: 0.5 });
  await tick();
  return load();
}

chrome.alarms.onAlarm.addListener(alarm => {
  if (alarm.name === ALARM) tick();
});

async function restoreBridge() {
  await registerAppBridge(await load());
}

chrome.runtime.onInstalled.addListener(restoreBridge);
chrome.runtime.onStartup.addListener(restoreBridge);

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  (async () => {
    if (message?.type === 'PING') {
      sendResponse({ ok: true, state: await load() });
      return;
    }
    if (message?.type === 'START') {
      sendResponse({ ok: true, state: await start({ capMB: Number(message.capMB) || 100 }) });
      return;
    }
    if (message?.type === 'PAUSE') {
      sendResponse({ ok: true, state: await stop(await load()) });
      return;
    }
    if (message?.type === 'CONFIG') {
      const state = await load();
      if (message.apiBase) state.apiBase = String(message.apiBase).replace(/\/$/, '');
      if (message.deviceToken) state.deviceToken = String(message.deviceToken);
      if (message.capMB) state.capMB = Number(message.capMB);
      sendResponse({ ok: true, state: await save(state) });
      return;
    }
    if (message?.type === 'LINK_ORIGIN') {
      const origin = parseAppOrigin(message.origin);
      if (!origin) {
        sendResponse({ ok: false, error: 'Use https://… or http://127.0.0.1' });
        return;
      }
      const allowed = await chrome.permissions.contains({ origins: [`${origin}/*`] });
      if (!allowed) {
        sendResponse({ ok: false, error: 'Grant access to that site from the popup first.' });
        return;
      }
      const state = await load();
      state.appOrigins = [...new Set([...(state.appOrigins || []), origin])];
      state.apiBase = origin;
      await save(state);
      await registerAppBridge(state);
      sendResponse({ ok: true, origin, state });
      return;
    }
    sendResponse({ ok: false });
  })().catch(error => sendResponse({ ok: false, error: String(error) }));
  return true;
});
