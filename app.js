const toggle = document.querySelector('#toggle-check');
if (toggle) {
  const dashboard = document.querySelector('.dashboard');
  const destinations = [...document.querySelectorAll('[data-destination]')];
  let checking = false;
  function render() {
    const selected = destinations.filter(input => input.checked);
    if (!selected.length) checking = false;
    dashboard.classList.toggle('checking', checking);
    toggle.setAttribute('aria-pressed', String(checking));
    toggle.disabled = !selected.length;
    toggle.innerHTML = checking ? 'Pause demo checks <span>Ⅱ</span>' : 'Start demo checks <span>↗</span>';
    document.querySelector('#status-title').innerHTML = `${checking ? 'CHECKING' : 'PAUSED'}<span class="status-symbol" aria-hidden="true">Ⅱ</span>`;
    document.querySelector('#status-label').textContent = checking ? 'SIMULATED SIGNAL / YOUR LIMITS APPLY' : 'YOUR CONNECTION IS TAKING A BREATHER';
    document.querySelector('#status-description').textContent = !selected.length ? 'Select a destination to start the demo.' : checking ? 'Demo only. No network requests are being made.' : 'Nothing runs until you say so.';
    if (checking) {
      document.querySelector('#receipt-destination').textContent = selected[0].dataset.destination;
      document.querySelector('#receipt-status').textContent = 'SIMULATED / NOT SUBMITTED';
    }
  }
  toggle.addEventListener('click', () => {checking = !checking; render();});
  destinations.forEach(input => input.addEventListener('change', render));
  document.querySelector('#data-cap').addEventListener('input', event => {
    document.querySelector('#cap-output').value = `${event.target.value} MB`;
  });
}
if ('IntersectionObserver' in window && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const observer = new IntersectionObserver(entries => entries.forEach(entry => {
    if (entry.isIntersecting) { entry.target.classList.add('visible'); observer.unobserve(entry.target); }
  }), {threshold: .08});
  document.querySelectorAll('.reveal').forEach(element => {element.classList.add('ready'); observer.observe(element);});
}
const consent = document.querySelector('#consent');
if (consent) {
  consent.addEventListener('change', () => document.querySelector('#preview-onboarding').disabled = !consent.checked);
  document.querySelector('#preview-onboarding').addEventListener('click', () => {
    document.querySelector('#onboarding-feedback').textContent = 'Demo preferences reviewed. No software installed or permission granted.';
  });
  document.querySelector('#request-form').addEventListener('submit', event => {
    event.preventDefault();
    const url = new URL(document.querySelector('#request-url').value);
    document.querySelector('#request-feedback').textContent = url.protocol === 'https:' ? `Local preview: HTTPS response check for ${url.hostname}, from ${document.querySelector('#request-region').value}. Nothing submitted.` : 'Use an HTTPS URL for this sample request.';
  });
}
