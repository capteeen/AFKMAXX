const KEY = 'afkmaxx.web.v1';
const SOURCE = 'afkmaxx-page';
const REPLY = 'afkmaxx-extension';
const DEFAULTS = {
  consent: false,
  cap: 100,
  destinations: { 'example.com': true, 'example.org': true },
  extras: [],
  requests: []
};

function loadLocal() {
  try {
    const saved = JSON.parse(localStorage.getItem(KEY) || '{}');
    return {
      ...DEFAULTS,
      ...saved,
      destinations: { ...DEFAULTS.destinations, ...(saved.destinations || {}) },
      extras: Array.isArray(saved.extras) ? saved.extras : [],
      requests: Array.isArray(saved.requests) ? saved.requests : []
    };
  } catch {
    return { ...DEFAULTS, destinations: { ...DEFAULTS.destinations }, extras: [], requests: [] };
  }
}

function saveLocal(state) {
  localStorage.setItem(KEY, JSON.stringify(state));
}

function selectedHosts(state, inputs) {
  const fromBoxes = [...inputs].filter(input => input.checked).map(input => input.dataset.prodDestination);
  return [...new Set([...fromBoxes, ...state.extras])];
}

function formatBytes(bytes) {
  if (!bytes) return '0 KB';
  if (bytes < 1024) return `${bytes} B`;
  return `${(bytes / 1024).toFixed(1)} KB`;
}

function wireProductApp() {
  const root = document.querySelector('[data-app="product"]');
  if (!root) return;
  const state = loadLocal();
  const toggle = document.querySelector('#prod-toggle');
  const consent = document.querySelector('#prod-consent');
  const cap = document.querySelector('#prod-data-cap');
  const capOut = document.querySelector('#prod-cap-output');
  const banner = document.querySelector('#ext-banner');
  const inputs = [...document.querySelectorAll('[data-prod-destination]')];
  const navButtons = [...document.querySelectorAll('[data-prod-screen]')];
  const screens = [...document.querySelectorAll('[data-app="product"] .desk-screen')];
  const extraList = document.querySelector('#prod-extra-list');
  const historyBody = document.querySelector('#prod-history-body');
  const historyEmpty = document.querySelector('#prod-history-empty');
  let extensionOn = false;
  let runtime = null;
  let pending = new Map();
  let nextId = 1;

  function send(payload, wait = 4000) {
    return new Promise(resolve => {
      const id = nextId++;
      const timer = setTimeout(() => {
        pending.delete(id);
        resolve({ ok: false, error: 'timeout' });
      }, wait);
      pending.set(id, result => { clearTimeout(timer); resolve(result); });
      window.postMessage({ source: SOURCE, id, payload }, '*');
    });
  }

  window.addEventListener('message', event => {
    if (event.source !== window || !event.data || event.data.source !== REPLY) return;
    if (event.data.type === 'HELLO') {
      extensionOn = true;
      send({ type: 'PING' }, 800).then(res => {
        if (res?.ok) runtime = res.state;
        render();
      });
      return;
    }
    if (event.data.type === 'STATE') {
      runtime = event.data.state;
      render();
      return;
    }
    const waiter = pending.get(event.data.id);
    if (waiter) {
      pending.delete(event.data.id);
      waiter(event.data);
    }
  });

  function persistFromDom() {
    state.consent = consent.checked;
    state.cap = Number(cap.value);
    inputs.forEach(input => { state.destinations[input.dataset.prodDestination] = input.checked; });
    saveLocal(state);
  }

  function paintExtras() {
    extraList.innerHTML = state.extras.map(host => `<div class="screen-row"><span>${host}<br><small>HTTPS / saved request</small></span><b>ALLOWLISTED</b></div>`).join('');
  }

  function paintRequests() {
    const log = document.querySelector('#prod-request-log');
    log.innerHTML = state.requests.map(item => `<li><strong>${item.host}</strong> · ${item.region} · ${item.at} · ownership not verified</li>`).join('') || '<li class="muted">No saved requests.</li>';
  }

  function paintHistory(rows) {
    historyBody.replaceChildren();
    if (!rows?.length) {
      historyEmpty.hidden = false;
      return;
    }
    historyEmpty.hidden = true;
    rows.slice().reverse().slice(0, 20).forEach(row => {
      const tr = historyBody.insertRow();
      tr.innerHTML = `<td>${row.host}</td><td>${row.status}</td><td>${formatBytes(row.bytes)}${row.ms ? ` / ${row.ms} ms` : ''}</td><td>${row.review}</td>`;
    });
  }

  function render() {
    persistFromDom();
    paintExtras();
    paintRequests();
    capOut.value = `${state.cap} MB`;
    const hosts = selectedHosts(state, inputs);
    const running = Boolean(runtime?.running);
    const usedMb = runtime ? (runtime.usedBytes / (1024 * 1024)).toFixed(2) : '0.00';
    document.querySelector('#prod-usage-note').textContent = `Usage today: ${usedMb} / ${runtime?.capMB ?? state.cap} MB. The extension stops when the cap is reached.`;
    paintHistory(runtime?.history || []);
    root.classList.toggle('checking', running);
    if (!extensionOn) {
      banner.textContent = 'Extension not found. Open the Extension screen and load the unpacked AFKMAXX folder.';
      banner.className = 'ext-banner warn';
      toggle.disabled = true;
      toggle.innerHTML = 'Install the extension first <span>↗</span>';
      document.querySelector('#prod-status-title').innerHTML = 'PAUSED<span class="status-symbol" aria-hidden="true">Ⅱ</span>';
      document.querySelector('#prod-status-label').textContent = 'WEB APP READY / RUNTIME MISSING';
      document.querySelector('#prod-status-description').textContent = 'This page can remember your limits. It cannot fetch other people’s sites until the extension is loaded.';
      return;
    }
    banner.textContent = running ? 'Extension connected. Checks are running from this machine.' : 'Extension connected. Nothing runs until you start.';
    banner.className = 'ext-banner ok';
    const canStart = state.consent && hosts.length;
    toggle.disabled = !canStart && !running;
    toggle.setAttribute('aria-pressed', String(running));
    toggle.innerHTML = running ? 'Pause checks <span>Ⅱ</span>' : 'Start checks <span>↗</span>';
    document.querySelector('#prod-status-title').innerHTML = `${running ? 'CHECKING' : 'PAUSED'}<span class="status-symbol" aria-hidden="true">Ⅱ</span>`;
    document.querySelector('#prod-status-label').textContent = running ? 'YOUR CONNECTION / YOUR LIMITS' : 'YOUR CONNECTION IS TAKING A BREATHER';
    document.querySelector('#prod-status-description').textContent = !state.consent
      ? 'Confirm the consent line to start.'
      : !hosts.length
        ? 'Select a destination to start.'
        : running
          ? 'HTTPS GETs go only to approved hosts. Results are unaudited. Pause anytime.'
          : 'Start to run allowlisted HTTPS checks through the extension.';
  }

  navButtons.forEach(button => button.addEventListener('click', () => {
    navButtons.forEach(item => item.classList.toggle('is-active', item === button));
    screens.forEach(screen => {
      const on = screen.getAttribute('data-screen') === button.dataset.prodScreen;
      screen.classList.toggle('is-active', on);
      screen.hidden = !on;
    });
  }));

  consent.checked = state.consent;
  cap.value = state.cap;
  inputs.forEach(input => { input.checked = state.destinations[input.dataset.prodDestination] !== false; });
  consent.addEventListener('change', render);
  cap.addEventListener('input', () => {
    persistFromDom();
    if (extensionOn) send({ type: 'CONFIG', capMB: state.cap, destinations: selectedHosts(state, inputs) });
    render();
  });
  inputs.forEach(input => input.addEventListener('change', () => {
    persistFromDom();
    if (extensionOn) send({ type: 'CONFIG', destinations: selectedHosts(state, inputs), capMB: state.cap });
    render();
  }));

  toggle.addEventListener('click', async () => {
    persistFromDom();
    const hosts = selectedHosts(state, inputs);
    if (runtime?.running) {
      const res = await send({ type: 'PAUSE' });
      if (res?.state) runtime = res.state;
    } else {
      const res = await send({ type: 'START', destinations: hosts, capMB: state.cap });
      if (res?.state) runtime = res.state;
    }
    render();
  });

  document.querySelector('#prod-request-form').addEventListener('submit', event => {
    event.preventDefault();
    const raw = document.querySelector('#prod-request-url').value;
    let url;
    try { url = new URL(raw); } catch {
      document.querySelector('#prod-request-feedback').textContent = 'Use a full HTTPS URL.';
      return;
    }
    if (url.protocol !== 'https:') {
      document.querySelector('#prod-request-feedback').textContent = 'Only HTTPS URLs are accepted.';
      return;
    }
    const host = url.hostname.replace(/^www\./, '');
    const region = document.querySelector('#prod-request-region').value.trim();
    if (!state.extras.includes(host) && host !== 'example.com' && host !== 'example.org') state.extras.push(host);
    state.requests.unshift({ host, region, at: new Date().toISOString().slice(0, 16).replace('T', ' ') });
    state.requests = state.requests.slice(0, 20);
    saveLocal(state);
    if (extensionOn) send({ type: 'CONFIG', destinations: selectedHosts(state, inputs), capMB: state.cap });
    document.querySelector('#prod-request-feedback').textContent = `Saved ${host}. Domain ownership is not verified. Grant this host in the extension popup before it can be fetched.`;
    render();
  });

  send({ type: 'PING' }, 800).then(res => {
    if (res?.ok) {
      extensionOn = true;
      runtime = res.state;
    }
    render();
  });
}

wireProductApp();
