async function ping() {
  return chrome.runtime.sendMessage({ type: 'PING' });
}

async function render() {
  const res = await ping();
  const state = res?.state;
  const status = document.querySelector('#status');
  const origin = document.querySelector('#origin');
  if (!state) {
    status.textContent = 'Runtime not ready.';
    return;
  }
  const used = ((state.usedBytes || 0) / (1024 * 1024)).toFixed(2);
  const origins = state.appOrigins || [];
  status.textContent = state.running
    ? `Checking. ${used} / ${state.capMB} MB today.`
    : `Paused. ${used} / ${state.capMB} MB today.`;
  if (!origin.value) origin.value = state.apiBase || origins[0] || '';
  const linked = document.querySelector('#link-note');
  if (origins.length && !linked.textContent) {
    linked.textContent = `Connected: ${origins.join(', ')}`;
  }
}

document.querySelector('#pause').addEventListener('click', async () => {
  await chrome.runtime.sendMessage({ type: 'PAUSE' });
  await render();
});

document.querySelector('#link').addEventListener('click', async () => {
  const note = document.querySelector('#link-note');
  let origin = '';
  try {
    const url = new URL(document.querySelector('#origin').value.trim());
    const local = url.hostname === 'localhost' || url.hostname === '127.0.0.1';
    if (url.protocol === 'https:' || (url.protocol === 'http:' && local)) origin = url.origin;
  } catch {
    origin = '';
  }
  if (!origin) {
    note.textContent = 'Use https://… or http://127.0.0.1';
    return;
  }
  const granted = await chrome.permissions.request({ origins: [`${origin}/*`] });
  if (!granted) {
    note.textContent = 'Permission cancelled.';
    return;
  }
  const res = await chrome.runtime.sendMessage({ type: 'LINK_ORIGIN', origin });
  note.textContent = res?.ok
    ? `Connected ${res.origin}. Open /app there, then issue a device token.`
    : (res?.error || 'Could not connect that origin.');
  await render();
});

document.querySelector('#grant').addEventListener('click', async () => {
  const raw = document.querySelector('#host').value.trim().replace(/^https?:\/\//, '').split('/')[0];
  const host = raw.replace(/^www\./, '');
  const note = document.querySelector('#grant-note');
  if (!host || host.includes(' ')) {
    note.textContent = 'Use an HTTPS hostname such as example.net.';
    return;
  }
  const granted = await chrome.permissions.request({
    origins: [`https://${host}/*`, `https://www.${host}/*`]
  });
  note.textContent = granted
    ? `Granted ${host}. Queue it in the web app so it can receive jobs.`
    : 'Grant cancelled.';
});

render();
