const onApp = /(^|\/)app(?:\.html)?$/i.test(location.pathname);
if (onApp) {
  const SOURCE = 'afkmaxx-page';
  const REPLY = 'afkmaxx-extension';

  function reply(id, payload) {
    window.postMessage({ source: REPLY, id, ...payload }, '*');
  }

  window.addEventListener('message', event => {
    if (event.source !== window) return;
    const data = event.data;
    if (!data || data.source !== SOURCE) return;
    chrome.runtime.sendMessage(data.payload || { type: data.kind }, response => {
      if (chrome.runtime.lastError) {
        reply(data.id, { ok: false, error: chrome.runtime.lastError.message });
        return;
      }
      reply(data.id, response || { ok: false });
    });
  });

  chrome.storage.onChanged.addListener((changes, area) => {
    if (area !== 'local' || !changes['afkmaxx.runtime.v1']) return;
    window.postMessage({ source: REPLY, type: 'STATE', state: changes['afkmaxx.runtime.v1'].newValue }, '*');
  });

  function hello() {
    window.postMessage({ source: REPLY, type: 'HELLO' }, '*');
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', hello);
  else hello();
}
