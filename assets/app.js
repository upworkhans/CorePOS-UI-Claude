/* Core POS Admin: shell, router, hierarchy scope and shared UI helpers. */
window.CP = window.CP || {};

(function () {
  const D = CP.data;

  /* ---------- Icons (24px stroke set) ---------- */
  const P = {
    dashboard: '<rect x="3" y="3" width="7" height="9" rx="1"/><rect x="14" y="3" width="7" height="5" rx="1"/><rect x="14" y="12" width="7" height="9" rx="1"/><rect x="3" y="16" width="7" height="5" rx="1"/>',
    tree: '<rect x="9" y="2" width="6" height="5" rx="1"/><rect x="2" y="17" width="6" height="5" rx="1"/><rect x="16" y="17" width="6" height="5" rx="1"/><path d="M12 7v5M5 17v-3h14v3"/>',
    store: '<path d="M3 9l1.5-5h15L21 9M3 9h18v2a3 3 0 0 1-6 0 3 3 0 0 1-6 0 3 3 0 0 1-6 0V9zM5 13v8h14v-8M10 21v-5h4v5"/>',
    rocket: '<path d="M5 15c-1.5 1.5-2 5-2 5s3.5-.5 5-2M14 4c3-1 6-1 6-1s0 3-1 6l-7 7-5-5 7-7zM9 11l-4 1 2-4h4M13 15l-1 4 4-2v-4"/>',
    sliders: '<path d="M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M1 14h6M9 8h6M17 16h6"/>',
    box: '<path d="M21 8l-9-5-9 5v8l9 5 9-5V8zM3 8l9 5 9-5M12 13v8"/>',
    tag: '<path d="M20.6 13.4l-7.2 7.2a2 2 0 0 1-2.8 0L3 13V3h10l7.6 7.6a2 2 0 0 1 0 2.8z"/><circle cx="7.5" cy="7.5" r="1.5"/>',
    percent: '<path d="M19 5L5 19"/><circle cx="6.5" cy="6.5" r="2.5"/><circle cx="17.5" cy="17.5" r="2.5"/>',
    landmark: '<path d="M3 21h18M5 21V10M9 21V10M15 21V10M19 21V10M2 10l10-6 10 6"/>',
    shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M9 12l2 2 4-4"/>',
    receipt: '<path d="M5 2h14v20l-3-2-2 2-2-2-2 2-2-2-3 2V2zM9 7h6M9 11h6M9 15h4"/>',
    globe: '<circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15 15 0 0 1 0 20M12 2a15 15 0 0 0 0 20"/>',
    card: '<rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20M6 15h4"/>',
    coins: '<circle cx="8" cy="8" r="6"/><path d="M18.1 10.4A6 6 0 1 1 10.3 18M7 6h1v4M16.7 13.9l.7.7-2.8 2.8"/>',
    users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8"/>',
    lock: '<rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
    device: '<rect x="6" y="2" width="12" height="20" rx="2"/><path d="M11 18h2"/>',
    cash: '<rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="12" cy="12" r="2.5"/><path d="M6 12h.01M18 12h.01"/>',
    flag: '<path d="M4 22V4M4 4h13l-2 4 2 4H4"/>',
    plug: '<path d="M9 2v6M15 2v6M6 8h12v4a6 6 0 0 1-12 0V8zM12 18v4"/>',
    activity: '<path d="M22 12h-4l-3 9L9 3l-3 9H2"/>',
    chart: '<path d="M3 3v18h18"/><path d="M7 15l4-4 3 3 6-7"/>',
    scale: '<path d="M12 3v18M5 21h14M3 7h18M6 7l-3 7a3 3 0 0 0 6 0L6 7zM18 7l-3 7a3 3 0 0 0 6 0l-3-7z"/>',
    privacy: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><circle cx="12" cy="10" r="2"/><path d="M8.5 16a4 4 0 0 1 7 0"/>',
    file: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z"/><path d="M14 2v6h6M8 13h8M8 17h5"/>',
    key: '<circle cx="7.5" cy="15.5" r="5.5"/><path d="M11.5 11.5L21 2M16 7l3 3M18 5l2 2"/>',
    customer: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/>',
    bell: '<path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9M13.7 21a2 2 0 0 1-3.4 0"/>',
    menu: '<path d="M3 6h18M3 12h18M3 18h18"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    download: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/>',
    upload: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"/>',
    x: '<path d="M18 6L6 18M6 6l12 12"/>',
    refresh: '<path d="M21 2v6h-6M3 22v-6h6M21 8a9 9 0 0 0-15-3.5L3 8M3 16a9 9 0 0 0 15 3.5l3-3.5"/>',
    eye: '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12z"/><circle cx="12" cy="12" r="3"/>',
    copy: '<rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>',
    moon: '<path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/>',
    play: '<path d="M6 4l14 8-14 8V4z"/>',
  };
  CP.icon = (n, cls = '') => `<svg class="${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${P[n] || ''}</svg>`;

  /* ---------- Small helpers ---------- */
  CP.esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const KIND = {
    good: ['Connected', 'Trading', 'Live', 'Healthy', 'Matched', 'Active', 'On', 'Completed', 'Posted', 'Ready', 'Verified', 'Open', 'Approved', 'Published', 'Charging'],
    warn: ['Degraded', 'Attention', 'Variance', 'Scheduled', 'Low battery', 'Pilot', 'Paused', 'In progress', 'Closing', 'Time-boxed', 'Re-posted', 'Pending approval', 'Draft changes'],
    bad: ['Error', 'Offline', 'Exception', 'Blocked', 'Blocked version', 'Failed', 'Critical'],
    info: ['Available', 'Invited', 'Z-closed', 'Draft', 'Closed', 'Off', 'Not started'],
  };
  CP.badge = (text, kind) => {
    if (!kind) kind = Object.keys(KIND).find((k) => KIND[k].includes(text)) || '';
    return `<span class="badge ${kind}">${CP.esc(text)}</span>`;
  };
  CP.flag = (c) => `<span class="flag">${c}</span>`;
  CP.country = (id) => D.countries.find((c) => c.id === id);
  CP.brand = (id) => D.brands.find((b) => b.id === id);
  CP.money = (store) => {
    const c = CP.country(store.country);
    const nf = new Intl.NumberFormat(c.lang.split(',')[0], { style: 'currency', currency: c.currency, maximumFractionDigits: c.currency === 'JPY' || c.currency === 'INR' ? 0 : 2 });
    return nf.format(store.sales);
  };

  CP.table = (cols, rows, opts = {}) => `
    <div class="tbl-wrap"><table class="tbl ${opts.cls || ''}">
      <thead><tr>${cols.map((c) => `<th class="${c.r ? 'r' : ''}">${c.h}</th>`).join('')}</tr></thead>
      <tbody>${rows.map((r, i) => `<tr ${opts.rowAttr ? opts.rowAttr(r, i) : ''}>${cols.map((c) => `<td class="${c.r ? 'r' : ''}">${c.f(r, i)}</td>`).join('')}</tr>`).join('')}</tbody>
    </table></div>`;

  CP.spark = (vals, color = 'var(--accent)') => {
    const w = 120, h = 30, max = Math.max(...vals), min = Math.min(...vals);
    const pts = vals.map((v, i) => [(i / (vals.length - 1)) * (w - 4) + 2, h - 3 - ((v - min) / (max - min || 1)) * (h - 8)]);
    const d = pts.map((p, i) => (i ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join(' ');
    const last = pts[pts.length - 1];
    return `<svg class="spark" viewBox="0 0 ${w} ${h}" preserveAspectRatio="none" aria-hidden="true">
      <path d="${d} L${last[0]} ${h} L2 ${h} Z" fill="${color}" opacity=".12"/>
      <path d="${d}" fill="none" stroke="${color}" stroke-width="2" vector-effect="non-scaling-stroke"/>
      <circle cx="${last[0]}" cy="${last[1]}" r="2.6" fill="${color}"/></svg>`;
  };

  CP.switch = (id, on, label = '') => `<label class="switch" title="${CP.esc(label)}"><input type="checkbox" id="${id}" ${on ? 'checked' : ''} aria-label="${CP.esc(label)}"><span></span></label>`;

  CP.pageHead = ({ crumbs, title, desc, actions = '', scoped = true }) => `
    <div class="page-head">
      <div class="titles">
        <div class="crumbs">${crumbs.map(CP.esc).join(' <span>/</span> ')}</div>
        <h1>${CP.esc(title)}</h1>
        ${desc ? `<p>${desc}</p>` : ''}
        ${scoped ? `<div><span class="scope-note">${CP.icon('tree', '')}Showing ${CP.esc(CP.scopeLabel())}</span></div>` : ''}
      </div>
      <div class="actions">${actions}</div>
    </div>`;

  /* ---------- Hierarchy scope (Region › Country › Brand › Store) ---------- */
  CP.scope = { region: '', country: '', brand: '', store: '' };
  CP.inScope = (s) => {
    const c = CP.country(s.country);
    const sc = CP.scope;
    return (!sc.region || c.region === sc.region) && (!sc.country || s.country === sc.country) && (!sc.brand || s.brand === sc.brand) && (!sc.store || s.code === sc.store);
  };
  CP.countriesInScope = () => D.countries.filter((c) => (!CP.scope.region || c.region === CP.scope.region) && (!CP.scope.country || c.id === CP.scope.country));
  CP.scopeLabel = () => {
    const sc = CP.scope, parts = [];
    if (sc.store) return sc.store + ' · ' + (D.stores.find((s) => s.code === sc.store) || {}).name;
    parts.push(sc.region || 'All regions');
    if (sc.country) parts.push(CP.country(sc.country).name);
    parts.push(sc.brand ? CP.brand(sc.brand).name : 'all brands');
    return parts.join(' › ');
  };
  CP.scopeLevel = () => (CP.scope.store ? 'Store' : CP.scope.country ? 'Country' : CP.scope.region ? 'Region' : 'Global');

  function renderScope() {
    const sc = CP.scope;
    const opt = (v, l, sel) => `<option value="${v}" ${sel === v ? 'selected' : ''}>${CP.esc(l)}</option>`;
    const countries = D.countries.filter((c) => !sc.region || c.region === sc.region);
    const stores = D.stores.filter((s) => (!sc.region || CP.country(s.country).region === sc.region) && (!sc.country || s.country === sc.country) && (!sc.brand || s.brand === sc.brand));
    document.getElementById('scope').innerHTML = `
      <span class="lbl">Scope</span>
      <select id="sc-region" aria-label="Region">${opt('', 'All regions', sc.region)}${D.regions.map((r) => opt(r.id, r.id, sc.region)).join('')}</select>
      <span class="sep">›</span>
      <select id="sc-country" aria-label="Country">${opt('', 'All countries', sc.country)}${countries.map((c) => opt(c.id, c.name, sc.country)).join('')}</select>
      <span class="sep">›</span>
      <select id="sc-brand" aria-label="Brand">${opt('', 'All brands', sc.brand)}${D.brands.map((b) => opt(b.id, b.name, sc.brand)).join('')}</select>
      <span class="sep">›</span>
      <select id="sc-store" aria-label="Store">${opt('', 'All stores', sc.store)}${stores.map((s) => opt(s.code, s.code, sc.store)).join('')}</select>`;
    const set = (k, reset) => (e) => {
      sc[k] = e.target.value;
      reset.forEach((r) => (sc[r] = ''));
      if (k === 'store' && sc.store) {
        const s = D.stores.find((x) => x.code === sc.store);
        sc.country = s.country; sc.region = CP.country(s.country).region; sc.brand = s.brand;
      }
      if (k === 'country' && sc.country) sc.region = CP.country(sc.country).region;
      renderScope();
      render();
    };
    document.getElementById('sc-region').onchange = set('region', ['country', 'store']);
    document.getElementById('sc-country').onchange = set('country', ['store']);
    document.getElementById('sc-brand').onchange = set('brand', ['store']);
    document.getElementById('sc-store').onchange = set('store', []);
  }
  CP.setScope = (patch) => { Object.assign(CP.scope, patch); renderScope(); render(); };

  /* ---------- Overlays ---------- */
  const layer = () => document.getElementById('layer');
  CP.closeOverlay = () => { layer().innerHTML = ''; document.removeEventListener('keydown', escClose); };
  function escClose(e) { if (e.key === 'Escape') CP.closeOverlay(); }
  CP.drawer = ({ title, sub = '', body, foot = '', mount }) => {
    layer().innerHTML = `<div class="scrim" data-close></div>
      <aside class="drawer" role="dialog" aria-modal="true" aria-label="${CP.esc(title)}">
        <div class="drawer-h"><div style="flex:1;min-width:0;display:grid;gap:4px">${sub ? `<div class="eyebrow">${sub}</div>` : ''}<h2 style="font-size:1.2rem">${CP.esc(title)}</h2></div>
        <button class="iconbtn" data-close aria-label="Close">${CP.icon('x')}</button></div>
        <div class="drawer-b">${body}</div>
        ${foot ? `<div class="drawer-f">${foot}</div>` : ''}
      </aside>`;
    layer().querySelectorAll('[data-close]').forEach((el) => (el.onclick = CP.closeOverlay));
    document.addEventListener('keydown', escClose);
    const d = layer().querySelector('.drawer');
    wire(d);
    mount && mount(d);
    d.querySelector('button, input, select')?.focus();
  };
  CP.confirm = ({ title, body, confirm = 'Confirm', danger = false, onConfirm }) => {
    layer().innerHTML = `<div class="scrim" data-close></div>
      <div class="modal" role="dialog" aria-modal="true" aria-label="${CP.esc(title)}">
        <div class="panel-b"><h2>${CP.esc(title)}</h2><div style="color:var(--fg-2)">${body}</div>
        <div class="row" style="justify-content:flex-end;margin-top:8px"><button class="btn" data-close>Cancel</button><button class="btn ${danger ? 'danger' : 'primary'}" id="modal-ok">${CP.esc(confirm)}</button></div></div>
      </div>`;
    layer().querySelectorAll('[data-close]').forEach((el) => (el.onclick = CP.closeOverlay));
    document.addEventListener('keydown', escClose);
    const ok = document.getElementById('modal-ok');
    ok.focus();
    ok.onclick = () => { CP.closeOverlay(); onConfirm && onConfirm(); };
  };
  let toastT;
  CP.toast = (msg) => {
    let t = document.getElementById('toast');
    if (!t) { t = document.createElement('div'); t.id = 'toast'; t.className = 'toast'; t.setAttribute('role', 'status'); document.body.appendChild(t); }
    t.textContent = msg; t.hidden = false;
    clearTimeout(toastT); toastT = setTimeout(() => (t.hidden = true), 2600);
  };

  /* Generic behaviours: tabs, chips, toast buttons, chart tooltips. */
  function wire(root) {
    root.querySelectorAll('[data-tabs]').forEach((tabs) => {
      const host = tabs.closest('[data-tabhost]') || tabs.parentElement;
      tabs.querySelectorAll('button[data-tab]').forEach((b) => (b.onclick = () => {
        tabs.querySelectorAll('button').forEach((x) => x.classList.toggle('on', x === b));
        host.querySelectorAll('[data-pane]').forEach((p) => (p.hidden = p.dataset.pane !== b.dataset.tab));
      }));
    });
    root.querySelectorAll('[data-chips]').forEach((g) => g.querySelectorAll('.chip').forEach((c) => (c.onclick = () => {
      if (g.dataset.chips === 'multi') c.classList.toggle('on');
      else g.querySelectorAll('.chip').forEach((x) => x.classList.toggle('on', x === c));
      g.dispatchEvent(new CustomEvent('chips', { detail: c.dataset.v }));
    })));
    root.querySelectorAll('[data-toast]').forEach((b) => (b.onclick = () => CP.toast(b.dataset.toast)));
    root.querySelectorAll('[data-go]').forEach((b) => (b.onclick = (e) => { e.preventDefault(); location.hash = b.dataset.go; }));
    root.querySelectorAll('[data-tip]').forEach((el) => {
      el.addEventListener('mouseenter', showTip); el.addEventListener('mousemove', moveTip); el.addEventListener('mouseleave', hideTip);
      el.addEventListener('focus', showTip); el.addEventListener('blur', hideTip);
    });
  }
  CP.wire = wire;
  let tipEl;
  function showTip(e) {
    if (!tipEl) { tipEl = document.createElement('div'); tipEl.className = 'tip'; document.body.appendChild(tipEl); }
    tipEl.innerHTML = e.currentTarget.dataset.tip; tipEl.hidden = false; moveTip(e);
  }
  function moveTip(e) {
    if (!tipEl) return;
    const r = e.currentTarget.getBoundingClientRect();
    const x = e.clientX || r.left + r.width / 2, y = e.clientY || r.top;
    tipEl.style.left = Math.min(x + 12, innerWidth - tipEl.offsetWidth - 8) + 'px';
    tipEl.style.top = Math.max(y - tipEl.offsetHeight - 12, 8) + 'px';
  }
  function hideTip() { if (tipEl) tipEl.hidden = true; }

  /* ---------- Navigation + router ---------- */
  CP.screens = CP.screens || {};
  const NAV = [
    ['Overview', [['dashboard', 'Command center', 'dashboard'], ['transactions', 'Transactions', 'receipt']]],
    ['Organisation', [['hierarchy', 'Hierarchy', 'tree'], ['stores', 'Stores', 'store'], ['config', 'Configuration', 'sliders'], ['rollout', 'Store rollout', 'rocket']]],
    ['Catalogue & pricing', [['products', 'Products', 'box'], ['pricing', 'Price lists', 'tag'], ['promotions', 'Promotions', 'percent']]],
    ['Tax & compliance', [['tax', 'Tax engine', 'landmark'], ['fiscal', 'Fiscalisation', 'shield'], ['receipts', 'Receipts & documents', 'receipt'], ['localization', 'Localisation', 'globe']]],
    ['Payments', [['payments', 'Payment providers', 'card'], ['tenders', 'Tender rules', 'coins']]],
    ['Customers', [['customers', 'Customer settings', 'customer'], ['privacy', 'Privacy requests', 'privacy']]],
    ['Operations', [['devices', 'Devices', 'device', 7], ['cash', 'Business day & cash', 'cash'], ['releases', 'Releases & flags', 'flag']]],
    ['Integrations', [['integrations', 'Integration hub', 'plug', 2], ['events', 'Events & webhooks', 'activity', 4]]],
    ['Finance & reports', [['reports', 'Reports', 'chart'], ['reconciliation', 'Reconciliation', 'scale', 3]]],
    ['Access & security', [['users', 'Users & roles', 'users'], ['audit', 'Audit log', 'file'], ['security', 'Security & SSO', 'key']]],
  ];
  CP.NAV = NAV;

  function renderNav() {
    document.getElementById('nav').innerHTML = NAV.map(([g, items]) => `
      <div class="nav-group"><div class="eyebrow">${g}</div>
      ${items.map(([id, label, ic, n]) => `<a href="#${id}" data-id="${id}">${CP.icon(ic)}<span>${label}</span>${n ? `<span class="count">${n}</span>` : ''}</a>`).join('')}
      </div>`).join('');
  }

  function current() {
    const h = location.hash.replace('#', '');
    return CP.screens[h] ? h : 'dashboard';
  }
  function render() {
    const id = current();
    const scr = CP.screens[id];
    const page = document.getElementById('page');
    page.innerHTML = scr.render();
    document.querySelectorAll('#nav a').forEach((a) => a.classList.toggle('active', a.dataset.id === id));
    wire(page);
    scr.mount && scr.mount(page);
    document.title = 'Core POS Admin';
  }
  CP.render = render;

  window.addEventListener('hashchange', () => {
    CP.closeOverlay();
    document.querySelector('.app').classList.remove('nav-open');
    render();
    document.querySelector('.main').scrollIntoView({ block: 'start' });
    window.scrollTo(0, 0);
  });

  document.addEventListener('DOMContentLoaded', () => {
    renderNav();
    renderScope();
    render();
    document.getElementById('menu-btn').onclick = () => document.querySelector('.app').classList.toggle('nav-open');
    document.getElementById('theme-btn').onclick = () => {
      const r = document.documentElement;
      const dark = r.dataset.theme ? r.dataset.theme === 'dark' : matchMedia('(prefers-color-scheme: dark)').matches;
      r.dataset.theme = dark ? 'light' : 'dark';
    };
    document.getElementById('bell').onclick = () => location.hash = 'dashboard';
    const q = document.getElementById('q');
    document.addEventListener('keydown', (e) => { if (e.key === '/' && document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA') { e.preventDefault(); q.focus(); } });
    q.addEventListener('keydown', (e) => {
      if (e.key !== 'Enter') return;
      const v = q.value.trim().toLowerCase();
      const store = D.stores.find((s) => s.code.toLowerCase() === v || s.name.toLowerCase().includes(v));
      const nav = NAV.flatMap((g) => g[1]).find((n) => n[1].toLowerCase().includes(v));
      if (nav) location.hash = nav[0];
      else if (store) { CP.setScope({ region: CP.country(store.country).region, country: store.country, brand: store.brand, store: store.code }); location.hash = 'stores'; }
      else CP.toast(`No module, store or setting matches “${q.value}”`);
    });
  });
})();
