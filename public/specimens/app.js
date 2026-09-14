const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

function selectedOf(inputs) {
  return [...inputs].filter(input => input.checked);
}

function wireLandingDemo() {
  const toggle = document.querySelector('#toggle-check');
  if (!toggle) return;
  const dashboard = document.querySelector('.dashboard');
  const destinations = [...document.querySelectorAll('[data-destination]')];
  let checking = false;
  function render() {
    const selected = selectedOf(destinations);
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
  toggle.addEventListener('click', () => { checking = !checking; render(); });
  destinations.forEach(input => input.addEventListener('change', render));
  document.querySelector('#data-cap').addEventListener('input', event => {
    document.querySelector('#cap-output').value = `${event.target.value} MB`;
  });
}

function wireReveal() {
  if (!('IntersectionObserver' in window) || reduceMotion) return;
  const observer = new IntersectionObserver(entries => entries.forEach(entry => {
    if (entry.isIntersecting) { entry.target.classList.add('visible'); observer.unobserve(entry.target); }
  }), { threshold: .08 });
  document.querySelectorAll('.reveal').forEach(element => { element.classList.add('ready'); observer.observe(element); });
}

function wireSystemDemo() {
  const consent = document.querySelector('#consent');
  if (!consent) return;
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

function showScreen(screens, name, attr) {
  screens.forEach(screen => {
    const on = screen.getAttribute(attr) === name;
    screen.classList.toggle('is-active', on);
    screen.hidden = !on;
  });
}

function wireDesktopApp() {
  const root = document.querySelector('[data-app="desktop"]');
  if (!root) return;
  const toggle = document.querySelector('#desk-toggle');
  const destinations = [...document.querySelectorAll('[data-desk-destination]')];
  const historyBody = document.querySelector('#desk-history-body');
  const historyEmpty = document.querySelector('#desk-history-empty');
  const bag = document.querySelector('#desk-bag');
  const bagNote = document.querySelector('#desk-bag-note');
  const navButtons = [...document.querySelectorAll('[data-desk-screen]')];
  const screens = [...document.querySelectorAll('.desk-screen')];
  let checking = false;
  let timer = 0;
  let sampleCredits = 0;

  function addHistory(host) {
    if (historyBody.rows.length >= 6) historyBody.deleteRow(0);
    const row = historyBody.insertRow();
    row.innerHTML = `<td>${host}</td><td>200 OK</td><td>Sample only</td>`;
    historyEmpty.hidden = true;
    sampleCredits = Math.min(12, sampleCredits + 2);
    bag.textContent = `${sampleCredits} $AFK`;
    bagNote.textContent = 'ILLUSTRATIVE CREDIT / NOT SETTLED';
  }

  function render() {
    const selected = selectedOf(destinations);
    if (!selected.length) checking = false;
    root.classList.toggle('checking', checking);
    toggle.setAttribute('aria-pressed', String(checking));
    toggle.disabled = !selected.length;
    toggle.innerHTML = checking ? 'Pause demo checks <span>Ⅱ</span>' : 'Start demo checks <span>↗</span>';
    document.querySelector('#desk-status-title').innerHTML = `${checking ? 'CHECKING' : 'PAUSED'}<span class="status-symbol" aria-hidden="true">Ⅱ</span>`;
    document.querySelector('#desk-status-label').textContent = checking ? 'SIMULATED SIGNAL / YOUR LIMITS APPLY' : 'YOUR CONNECTION IS TAKING A BREATHER';
    document.querySelector('#desk-status-description').textContent = !selected.length ? 'Select a destination to start the demo.' : checking ? 'Demo only. No network requests are being made.' : 'Nothing runs until you say so.';
    clearInterval(timer);
    if (checking && selected.length) {
      addHistory(selected[0].dataset.deskDestination);
      timer = setInterval(() => {
        const live = selectedOf(destinations);
        if (!live.length) return;
        addHistory(live[Math.floor(Math.random() * live.length)].dataset.deskDestination);
      }, reduceMotion ? 8000 : 3200);
    }
  }

  navButtons.forEach(button => button.addEventListener('click', () => {
    const name = button.dataset.deskScreen;
    navButtons.forEach(item => item.classList.toggle('is-active', item === button));
    showScreen(screens, name, 'data-screen');
  }));
  toggle.addEventListener('click', () => { checking = !checking; render(); });
  destinations.forEach(input => input.addEventListener('change', render));
  document.querySelector('#desk-data-cap').addEventListener('input', event => {
    document.querySelector('#desk-cap-output').value = `${event.target.value} MB`;
  });
}

function wireMobileApp() {
  const root = document.querySelector('[data-app="mobile"]');
  if (!root) return;
  const go = document.querySelector('#phone-go');
  const pause = document.querySelector('#phone-pause');
  const destinations = [...document.querySelectorAll('[data-phone-destination]')];
  const tabs = [...document.querySelectorAll('[data-phone-tab]')];
  const screens = [...document.querySelectorAll('.phone-screen')];
  const meter = document.querySelector('#phone-meter');
  const clearer = document.querySelector('#phone-clearer');
  const bag = document.querySelector('#phone-bag-value');
  const bagNote = document.querySelector('#phone-bag-note');
  let checking = false;
  let timer = 0;
  let sampleCredits = 0;

  function openScreen(name) {
    tabs.forEach(tab => tab.classList.toggle('is-active', tab.dataset.phoneTab === name));
    showScreen(screens, name, 'data-phone-screen');
  }

  function render() {
    const selected = selectedOf(destinations);
    if (!selected.length) checking = false;
    root.classList.toggle('checking', checking);
    go.setAttribute('aria-pressed', String(checking));
    pause.setAttribute('aria-pressed', String(checking));
    document.querySelector('#phone-check-title').textContent = checking ? 'CHECKING' : 'PAUSED';
    document.querySelector('#phone-check-label').textContent = checking ? 'SCANNING INTERNET HABITS..' : 'YOUR CONNECTION IS TAKING A BREATHER';
    document.querySelector('#phone-check-copy').textContent = !selected.length ? 'Select a destination on Limits to start the demo.' : checking ? 'Demo only. No network requests are being made.' : 'Nothing runs until you say so.';
    clearer.classList.toggle('is-on', checking);
    meter.style.width = checking ? '72%' : '8%';
    if (selected.length) {
      document.querySelector('#phone-receipt-destination').textContent = selected[0].dataset.phoneDestination;
    }
    document.querySelector('#phone-receipt-status').textContent = checking ? 'SIMULATED / NOT SUBMITTED' : 'ILLUSTRATIVE / NOT SUBMITTED';
    clearInterval(timer);
    if (checking && selected.length) {
      sampleCredits = Math.min(12, sampleCredits + 2);
      bag.textContent = `${sampleCredits} $AFK`;
      bagNote.textContent = 'ILLUSTRATIVE CREDIT / NOT SETTLED';
      timer = setInterval(() => {
        sampleCredits = Math.min(12, sampleCredits + 2);
        bag.textContent = `${sampleCredits} $AFK`;
      }, reduceMotion ? 8000 : 3200);
    }
  }

  tabs.forEach(tab => tab.addEventListener('click', () => openScreen(tab.dataset.phoneTab)));
  go.addEventListener('click', () => {
    if (!selectedOf(destinations).length) { openScreen('limits'); return; }
    checking = true;
    render();
    openScreen('check');
  });
  pause.addEventListener('click', () => { checking = false; render(); });
  destinations.forEach(input => input.addEventListener('change', render));
  document.querySelector('#phone-data-cap').addEventListener('input', event => {
    document.querySelector('#phone-cap-output').value = `${event.target.value} MB`;
  });
}

wireLandingDemo();
wireReveal();
wireSystemDemo();
wireDesktopApp();
wireMobileApp();
