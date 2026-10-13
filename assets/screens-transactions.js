/* Screen: Transactions journal. Search and filter every completed sale, return,
   exchange, post-void and endless-aisle order across the hierarchy, then open one
   to see lines, tax, tenders, fiscal signature and downstream postings. */
(function () {
  const D = CP.data, S = CP.screens, I = CP.icon, B = CP.badge, E = CP.esc;

  /* ---------- Sample journal (deterministic, generated once) ---------- */
  const FX = { USD: 1, EUR: 1.0842, GBP: 1.297, JPY: 0.00669, CAD: 0.7291, AUD: 0.6612, CHF: 1.131, INR: 0.01195, SGD: 0.748, MYR: 0.2241 };
  const BASE = { 'ATL-W-40221': 395, 'ATL-W-40198': 595, 'KES-L-11804': 495, 'KES-L-11290': 129, 'NOR-W-00712': 189, 'ATL-S-ENGRV': 25, 'ATL-GC-VAR': 100, 'KES-L-10022': 345 };
  const VAT = { DE: 19, AT: 20, FR: 20, IT: 22, ES: 21, GB: 20, CH: 8.1, JP: 10, AU: 10, SG: 9, IN: 18, MY: 10, US: 8.875, CA: 13 };
  const FIRST = ['Anna', 'Lukas', 'Emma', 'Noah', 'Mia', 'Léa', 'Giulia', 'Hiro', 'Yuki', 'Olivia', 'Liam', 'Aarav', 'Priya', 'Chloe', 'Wei', 'Sofia', 'Jack', 'Isla'];
  const LAST = ['Becker', 'Martin', 'Rossi', 'García', 'Smith', 'Tanaka', 'Sato', 'Brown', 'Sharma', 'Tan', 'Wilson', 'Novak', 'Dubois', 'Lee'];

  function rng(seed) { return () => { seed |= 0; seed = (seed + 0x6d2b79f5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
  const r = rng(20261013);
  const pick = (a) => a[Math.floor(r() * a.length)];
  const localPrice = (usd, cur) => {
    const v = usd / FX[cur];
    if (cur === 'JPY') return Math.round(v / 100) * 100;
    if (cur === 'INR') return Math.round(v / 5) * 5;
    return Math.round(v) - (v > 50 ? 0.01 : 0);
  };

  const TX = [];
  D.stores.forEach((s, si) => {
    const c = CP.country(s.country), cur = c.currency;
    const brandSkus = Object.keys(BASE).filter((k) => k.startsWith(s.brand) || (s.brand === 'NOR' && k.startsWith('NOR')) || k === 'ATL-GC-VAR');
    const n = 12 + Math.floor(r() * 6);
    let seq = 4000 + si * 37;
    for (let k = 0; k < n; k++) {
      const roll = r();
      const type = roll < 0.74 ? 'Sale' : roll < 0.84 ? 'Return' : roll < 0.89 ? 'Exchange' : roll < 0.91 ? 'Post-void' : 'Endless aisle';
      const day = k < 5 ? 0 : Math.floor(r() * 7);
      const hour = 10 + Math.floor(r() * 10), min = Math.floor(r() * 60);
      const nLines = type === 'Return' ? 1 : 1 + Math.floor(r() * (type === 'Exchange' ? 2 : 3));
      const lines = [];
      for (let l = 0; l < nLines; l++) {
        const sku = type === 'Exchange' && l === 0 ? brandSkus[0] : pick(brandSkus);
        const p = D.products.find((x) => x.sku === sku);
        const price = sku === 'ATL-GC-VAR' ? Math.max(1, Math.round(BASE[sku] / FX[cur] / (cur === 'JPY' || cur === 'INR' ? 1000 : 50))) * (cur === 'JPY' || cur === 'INR' ? 1000 : 50) : localPrice(BASE[sku] * (s.concept === 'Outlet' ? 0.72 : 1), cur);
        const qty = sku === 'ATL-S-ENGRV' || r() > 0.9 ? 1 + (r() > 0.7 ? 1 : 0) : 1;
        const disc = r() < 0.18 ? Math.round(price * qty * (r() < 0.5 ? 0.1 : 0.15) * 100) / 100 : 0;
        const sign = type === 'Return' || (type === 'Exchange' && l === 0) ? -1 : 1;
        lines.push({ sku, name: p.name, qty: qty * sign, price, disc: disc * sign, net: (price * qty - disc) * sign, discReason: disc ? pick(['Manual · damaged box', 'Manual · loyalty goodwill', 'Promo PR-24102', 'Employee 40%']) : '' });
      }
      let total = Math.round(lines.reduce((a, b) => a + b.net, 0) * 100) / 100;
      if (type === 'Post-void') total = 0;
      const taxRate = VAT[s.country];
      const tax = c.taxMode === 'inclusive' ? total - total / (1 + taxRate / 100) : total * (taxRate / 100);
      const gross = c.taxMode === 'inclusive' ? total : total + tax;
      const tRoll = r();
      const tender = Math.abs(gross) < 0.01 ? 'None' : tRoll < 0.62 ? 'Card' : tRoll < 0.76 ? 'Cash' : tRoll < 0.84 ? 'Wallet' : tRoll < 0.9 ? 'Gift card' : tRoll < 0.95 ? 'Store credit' : 'Split';
      const offline = s.status === 'Offline' && day === 0 && k < 4;
      const status = type === 'Post-void' ? 'Voided' : offline ? 'Pending sync' : r() < 0.025 ? 'Posting failed' : 'Completed';
      const known = r() < 0.55;
      const d = new Date(Date.UTC(2026, 9, 13 - day, hour, min));
      const devN = 1 + Math.floor(r() * Math.max(1, Math.min(s.devices, 4)));
      seq += 1 + Math.floor(r() * 9);
      TX.push({
        id: `${s.code.slice(-3)}-0${devN}-${String(seq).padStart(6, '0')}`,
        store: s.code, country: s.country, region: c.region, brand: s.brand, currency: cur, day,
        date: d, local: `${String(13 - day).padStart(2, '0')} Oct · ${String(hour).padStart(2, '0')}:${String(min).padStart(2, '0')}`,
        type, channel: type === 'Endless aisle' ? 'Endless aisle' : 'In store', lines, total: gross, tax, taxRate, tender, status,
        usd: gross * FX[cur], device: `D-${s.code.split('-')[1]}${s.code.slice(-1)}-0${devN}`,
        associate: '#' + (1100 + Math.floor(r() * 90)), customer: known ? `${pick(FIRST)} ${pick(LAST)}` : null, loyalty: known ? pick(['Gold', 'Silver', 'Member', 'Platinum']) : null,
        manualDisc: lines.some((l) => l.discReason.startsWith('Manual')), approval: type === 'Post-void' || (type === 'Return' && r() < 0.4) || lines.some((l) => l.discReason.startsWith('Manual') && r() < 0.5),
        psp: tender === 'Card' || tender === 'Wallet' || tender === 'Split' ? `88${Math.floor(1e13 + r() * 9e13)}` : null,
        card: pick(['VISA •••• 4417', 'MC •••• 9021', 'AMEX •••• 1008', 'JCB •••• 3350', 'Apple Pay · VISA •••• 7731']),
      });
    }
  });
  TX.sort((a, b) => b.date - a.date);
  CP.data.transactions = TX;

  const fmt = (v, cur) => {
    const c = D.countries.find((x) => x.currency === cur) || { lang: 'en-US' };
    return new Intl.NumberFormat(c.lang.split(',')[0], { style: 'currency', currency: cur, maximumFractionDigits: cur === 'JPY' || cur === 'INR' ? 0 : 2 }).format(v);
  };
  const usd = (v) => (v < 0 ? '−' : '') + '$' + Math.abs(v).toLocaleString('en-US', { maximumFractionDigits: 0 });

  /* ---------- Filter state (hierarchy part mirrors the scope bar) ---------- */
  const F = { date: '7d', types: [], status: 'Any', tender: 'Any', channel: 'Any', min: '', max: '', q: '', manual: false, approval: false, sort: 'date', dir: -1, page: 0 };
  const PAGE = 25;
  const TYPES = ['Sale', 'Return', 'Exchange', 'Post-void', 'Endless aisle'];
  const VIEWS = {
    'All transactions': { date: '7d', types: [], status: 'Any', tender: 'Any', manual: false, approval: false, min: '' },
    'Returns needing review': { date: '7d', types: ['Return'], status: 'Any', approval: true },
    'Manual discounts today': { date: 'today', types: [], manual: true },
    'Post-voids this week': { date: '7d', types: ['Post-void'] },
    'Failed or unsynced': { date: '7d', types: [], status: 'Problems' },
    'High-value sales (>$500)': { date: '7d', types: ['Sale'], min: '500' },
  };

  function filtered() {
    const maxDay = { today: 0, yesterday: 1, '7d': 6 }[F.date];
    const minDay = F.date === 'yesterday' ? 1 : 0;
    const q = F.q.trim().toLowerCase();
    let list = TX.filter((t) => {
      const s = D.stores.find((x) => x.code === t.store);
      if (!CP.inScope(s)) return false;
      if (t.day > maxDay || t.day < minDay) return false;
      if (F.types.length && !F.types.includes(t.type)) return false;
      if (F.status === 'Problems' ? !['Pending sync', 'Posting failed'].includes(t.status) : F.status !== 'Any' && t.status !== F.status) return false;
      if (F.tender !== 'Any' && t.tender !== F.tender) return false;
      if (F.channel !== 'Any' && t.channel !== F.channel) return false;
      if (F.min !== '' && Math.abs(t.usd) < +F.min) return false;
      if (F.max !== '' && Math.abs(t.usd) > +F.max) return false;
      if (F.manual && !t.manualDisc) return false;
      if (F.approval && !t.approval) return false;
      if (q && !(t.id + t.store + (t.customer || '') + (t.psp || '') + t.associate + t.lines.map((l) => l.sku + l.name).join(' ')).toLowerCase().includes(q)) return false;
      return true;
    });
    const key = { date: (t) => t.date, amount: (t) => t.usd, store: (t) => t.store, type: (t) => t.type }[F.sort];
    list = list.slice().sort((a, b) => (key(a) > key(b) ? 1 : key(a) < key(b) ? -1 : 0) * F.dir);
    return list;
  }

  function summary(list) {
    const sales = list.filter((t) => t.usd > 0).reduce((a, t) => a + t.usd, 0);
    const refunds = list.filter((t) => t.usd < 0).reduce((a, t) => a + t.usd, 0);
    const saleCount = list.filter((t) => t.type === 'Sale' || t.type === 'Endless aisle').length;
    const units = list.filter((t) => t.type === 'Sale').reduce((a, t) => a + t.lines.reduce((x, l) => x + l.qty, 0), 0);
    return [
      ['Transactions', list.length.toLocaleString('en-US'), `${saleCount} sales · ${list.filter((t) => t.type === 'Return').length} returns`],
      ['Gross sales', usd(sales), 'USD reporting currency'],
      ['Refunds', usd(refunds), `${sales ? Math.round((-refunds / sales) * 1000) / 10 : 0}% of gross`],
      ['Net sales', usd(sales + refunds), `ATV ${usd(saleCount ? sales / saleCount : 0)} · UPT ${saleCount ? (units / Math.max(1, list.filter((t) => t.type === 'Sale').length)).toFixed(2) : '0'}`],
      ['Need attention', list.filter((t) => ['Pending sync', 'Posting failed'].includes(t.status)).length, 'Unsynced or failed posting'],
    ];
  }

  const typeKind = { Sale: 'good', Return: 'warn', Exchange: 'info', 'Post-void': 'bad', 'Endless aisle': 'accent' };
  const statusKind = { Completed: 'good', 'Pending sync': 'warn', 'Posting failed': 'bad', Voided: '' };

  function tableHTML(list) {
    const pages = Math.max(1, Math.ceil(list.length / PAGE));
    F.page = Math.min(F.page, pages - 1);
    const rows = list.slice(F.page * PAGE, F.page * PAGE + PAGE);
    const th = (label, key, r) => key
      ? `<th class="${r ? 'r' : ''}"><button class="sortbtn" data-sort="${key}" aria-label="Sort by ${label}">${label}${F.sort === key ? (F.dir < 0 ? ' ↓' : ' ↑') : ''}</button></th>`
      : `<th class="${r ? 'r' : ''}">${label}</th>`;
    if (!list.length) return `<div class="empty-note" style="border-radius:0;padding:28px 16px;text-align:center">No transactions match these filters. <button class="btn sm" id="tx-clear2">Clear filters</button></div>`;
    return `<div class="tbl-wrap"><table class="tbl"><thead><tr>
        ${th('Date (local)', 'date')}${th('Receipt', '')}${th('Store', 'store')}${th('Type', 'type')}<th>Customer</th><th>Tender</th>${th('Amount', 'amount', 1)}<th class="r">USD</th><th>Status</th>
      </tr></thead><tbody>${rows.map((t) => `<tr class="click" data-tx="${t.store}|${t.id}" tabindex="0">
        <td class="mono small">${t.local}</td>
        <td><b class="mono">${t.id}</b><div class="cell-sub">${t.device} · ${t.associate}</div></td>
        <td>${CP.flag(t.country)} <span class="mono small">${t.store}</span><div class="cell-sub">${CP.brand(t.brand).name}</div></td>
        <td>${B(t.type, typeKind[t.type])}${t.manualDisc ? ' <span class="tag" title="Manual discount">%</span>' : ''}${t.approval ? ' <span class="tag" title="Manager approval">MGR</span>' : ''}</td>
        <td>${t.customer ? `${E(t.customer.split(' ')[0])} ${t.customer.split(' ')[1][0]}.<div class="cell-sub">${t.loyalty}</div>` : '<span class="muted small">Guest</span>'}</td>
        <td class="small">${t.tender}</td>
        <td class="r"><b class="num ${t.total < 0 ? 'down' : ''}">${fmt(t.total, t.currency)}</b></td>
        <td class="r num small muted">${usd(t.usd)}</td>
        <td>${B(t.status, statusKind[t.status])}</td></tr>`).join('')}</tbody></table></div>
      <div class="toolbar" style="border-top:1px solid var(--line);border-bottom:0;justify-content:space-between">
        <span class="small muted">${F.page * PAGE + 1}–${Math.min(list.length, (F.page + 1) * PAGE)} of ${list.length} sample transactions</span>
        <div class="row" style="gap:6px"><button class="btn sm" id="pg-prev" ${F.page ? '' : 'disabled'}>Previous</button><span class="mono small">${F.page + 1} / ${pages}</span><button class="btn sm" id="pg-next" ${F.page < pages - 1 ? '' : 'disabled'}>Next</button></div></div>`;
  }

  function activeChips() {
    const sc = CP.scope, out = [];
    if (sc.region) out.push(['Region: ' + sc.region, 'region']);
    if (sc.country) out.push(['Country: ' + CP.country(sc.country).name, 'country']);
    if (sc.brand) out.push(['Brand: ' + CP.brand(sc.brand).name, 'brand']);
    if (sc.store) out.push(['Store: ' + sc.store, 'store']);
    F.types.forEach((t) => out.push(['Type: ' + t, 'type:' + t]));
    if (F.status !== 'Any') out.push(['Status: ' + (F.status === 'Problems' ? 'Unsynced or failed' : F.status), 'status']);
    if (F.tender !== 'Any') out.push(['Tender: ' + F.tender, 'tender']);
    if (F.channel !== 'Any') out.push(['Channel: ' + F.channel, 'channel']);
    if (F.min !== '' || F.max !== '') out.push([`Amount: ${F.min || 0}–${F.max || '∞'} USD`, 'amount']);
    if (F.manual) out.push(['Manual discount', 'manual']);
    if (F.approval) out.push(['Manager approval', 'approval']);
    if (F.q) out.push([`Search: “${F.q}”`, 'q']);
    return out;
  }

  S.transactions = {
    render() {
      const sc = CP.scope, list = filtered();
      const opt = (v, l, sel) => `<option value="${v}" ${sel === v ? 'selected' : ''}>${E(l)}</option>`;
      const countries = D.countries.filter((c) => !sc.region || c.region === sc.region);
      const stores = D.stores.filter((s) => (!sc.region || CP.country(s.country).region === sc.region) && (!sc.country || s.country === sc.country) && (!sc.brand || s.brand === sc.brand));
      const chips = activeChips();
      return `${CP.pageHead({ crumbs: ['Overview'], title: 'Transactions', scoped: false, desc: 'Every sale, return, exchange, post-void and endless-aisle order, read-only and immutable. Filter by any level of the hierarchy, open a transaction to see its lines, tax, tenders, fiscal signature and where it was posted.', actions: `<select class="input" id="tx-view" aria-label="Saved view">${Object.keys(VIEWS).map((v) => `<option>${v}</option>`).join('')}</select><button class="btn" data-toast="Export of ${list.length} transactions queued. You'll get an email with the CSV.">${I('download')}Export CSV</button>` })}
      <section class="panel">
        <div class="toolbar" style="gap:10px;align-items:flex-end">
          <div class="field"><label for="tx-region">Region</label><select class="input" id="tx-region">${opt('', 'All regions', sc.region)}${D.regions.map((r) => opt(r.id, r.id, sc.region)).join('')}</select></div>
          <div class="field"><label for="tx-country">Country</label><select class="input" id="tx-country">${opt('', 'All countries', sc.country)}${countries.map((c) => opt(c.id, c.name, sc.country)).join('')}</select></div>
          <div class="field"><label for="tx-brand">Brand</label><select class="input" id="tx-brand">${opt('', 'All brands', sc.brand)}${D.brands.map((b) => opt(b.id, b.name, sc.brand)).join('')}</select></div>
          <div class="field"><label for="tx-store">Store</label><select class="input" id="tx-store">${opt('', 'All stores', sc.store)}${stores.map((s) => opt(s.code, `${s.code} · ${s.name}`, sc.store)).join('')}</select></div>
          <div class="field"><label for="tx-date">Business day</label><select class="input" id="tx-date">${opt('today', 'Today', F.date)}${opt('yesterday', 'Yesterday', F.date)}${opt('7d', 'Last 7 days', F.date)}</select></div>
          <div class="field" style="flex:1;min-width:200px"><label for="tx-q">Search</label><input class="input" id="tx-q" value="${E(F.q)}" placeholder="Receipt no., customer, PSP ref, SKU, associate"></div>
        </div>
        <div class="toolbar" style="gap:10px;align-items:flex-end">
          <div class="field"><label>Type</label><div class="chips" data-chips="multi" id="tx-types">${TYPES.map((t) => `<button class="chip ${F.types.includes(t) ? 'on' : ''}" data-v="${t}">${t}</button>`).join('')}</div></div>
          <div class="field"><label for="tx-status">Status</label><select class="input" id="tx-status">${['Any', 'Completed', 'Pending sync', 'Posting failed', 'Voided'].map((s) => opt(s, s, F.status)).join('')}${opt('Problems', 'Unsynced or failed', F.status)}</select></div>
          <div class="field"><label for="tx-tender">Tender</label><select class="input" id="tx-tender">${['Any', 'Card', 'Wallet', 'Cash', 'Gift card', 'Store credit', 'Split'].map((s) => opt(s, s, F.tender)).join('')}</select></div>
          <div class="field"><label for="tx-channel">Channel</label><select class="input" id="tx-channel">${['Any', 'In store', 'Endless aisle'].map((s) => opt(s, s, F.channel)).join('')}</select></div>
          <div class="field"><label for="tx-min">Amount (USD)</label><div class="row" style="gap:4px;flex-wrap:nowrap"><input class="input mono" id="tx-min" value="${F.min}" placeholder="Min" style="width:76px"><span class="muted">–</span><input class="input mono" id="tx-max" value="${F.max}" placeholder="Max" style="width:76px" aria-label="Maximum amount"></div></div>
          <label class="row small" style="gap:6px;padding-bottom:6px">${CP.switch('tx-manual', F.manual, 'Manual discount only')} Manual discount</label>
          <label class="row small" style="gap:6px;padding-bottom:6px">${CP.switch('tx-appr', F.approval, 'Manager approval only')} Manager approval</label>
        </div>
        ${chips.length ? `<div class="toolbar" style="gap:6px"><span class="small muted">Filtered by</span>${chips.map(([l, k]) => `<button class="chip on" data-rm="${k}" aria-label="Remove filter ${E(l)}">${E(l)} ✕</button>`).join('')}<button class="btn sm ghost" id="tx-clear">Clear all</button></div>` : ''}
        <div class="grid" style="grid-template-columns:repeat(auto-fit,minmax(170px,1fr));gap:0;border-bottom:1px solid var(--line)">
          ${summary(list).map(([a, b, c], i) => `<div class="kpi" style="${i ? 'border-left:1px solid var(--line)' : ''}"><div class="eyebrow">${a}</div><div class="v" style="font-size:1.3rem">${b}</div><div class="d">${c}</div></div>`).join('')}
        </div>
        <div id="tx-table">${tableHTML(list)}</div>
      </section>`;
    },
    mount(root) {
      const rerender = () => CP.render();
      const setScope = (patch) => { F.page = 0; CP.setScope(patch); };
      root.querySelector('#tx-region').onchange = (e) => setScope({ region: e.target.value, country: '', store: '' });
      root.querySelector('#tx-country').onchange = (e) => setScope({ country: e.target.value, store: '', region: e.target.value ? CP.country(e.target.value).region : CP.scope.region });
      root.querySelector('#tx-brand').onchange = (e) => setScope({ brand: e.target.value, store: '' });
      root.querySelector('#tx-store').onchange = (e) => {
        const s = D.stores.find((x) => x.code === e.target.value);
        setScope(s ? { store: s.code, country: s.country, region: CP.country(s.country).region, brand: s.brand } : { store: '' });
      };
      const bindSel = (id, key) => (root.querySelector(id).onchange = (e) => { F[key] = e.target.value; F.page = 0; rerender(); });
      bindSel('#tx-date', 'date'); bindSel('#tx-status', 'status'); bindSel('#tx-tender', 'tender'); bindSel('#tx-channel', 'channel');
      root.querySelector('#tx-types').addEventListener('chips', (e) => { const v = e.detail; F.types = F.types.includes(v) ? F.types.filter((x) => x !== v) : [...F.types, v]; F.page = 0; rerender(); });
      root.querySelector('#tx-manual').onchange = (e) => { F.manual = e.target.checked; F.page = 0; rerender(); };
      root.querySelector('#tx-appr').onchange = (e) => { F.approval = e.target.checked; F.page = 0; rerender(); };
      ['min', 'max'].forEach((k) => (root.querySelector('#tx-' + k).onchange = (e) => { F[k] = e.target.value.replace(/[^\d.]/g, ''); F.page = 0; rerender(); }));
      let qt;
      const q = root.querySelector('#tx-q');
      q.oninput = () => { clearTimeout(qt); qt = setTimeout(() => { F.q = q.value; F.page = 0; rerender(); const n = document.getElementById('tx-q'); n.focus(); n.setSelectionRange(n.value.length, n.value.length); }, 300); };
      const clearAll = () => { Object.assign(F, { types: [], status: 'Any', tender: 'Any', channel: 'Any', min: '', max: '', q: '', manual: false, approval: false, page: 0 }); setScope({ region: '', country: '', brand: '', store: '' }); };
      root.querySelector('#tx-clear')?.addEventListener('click', clearAll);
      root.querySelector('#tx-clear2')?.addEventListener('click', clearAll);
      root.querySelectorAll('[data-rm]').forEach((b) => (b.onclick = () => {
        const k = b.dataset.rm;
        if (['region', 'country', 'brand', 'store'].includes(k)) return setScope(k === 'region' ? { region: '', country: '', store: '' } : k === 'country' ? { country: '', store: '' } : { [k]: '' , store: '' });
        if (k.startsWith('type:')) F.types = F.types.filter((t) => t !== k.slice(5));
        else if (k === 'amount') { F.min = ''; F.max = ''; }
        else if (k === 'manual' || k === 'approval') F[k] = false;
        else if (k === 'q') F.q = '';
        else F[k] = 'Any';
        F.page = 0; rerender();
      }));
      const view = root.querySelector('#tx-view');
      view.onchange = () => { Object.assign(F, { types: [], status: 'Any', tender: 'Any', channel: 'Any', min: '', max: '', q: '', manual: false, approval: false, page: 0 }, VIEWS[view.value]); rerender(); CP.toast('Saved view: ' + view.value); };
      const bindTable = () => {
        const tb = root.querySelector('#tx-table');
        tb.querySelectorAll('[data-sort]').forEach((b) => (b.onclick = () => { const k = b.dataset.sort; F.dir = F.sort === k ? -F.dir : -1; F.sort = k; tb.innerHTML = tableHTML(filtered()); bindTable(); }));
        tb.querySelector('#pg-prev')?.addEventListener('click', () => { F.page--; tb.innerHTML = tableHTML(filtered()); bindTable(); root.querySelector('#tx-table').scrollIntoView({ block: 'start' }); });
        tb.querySelector('#pg-next')?.addEventListener('click', () => { F.page++; tb.innerHTML = tableHTML(filtered()); bindTable(); root.querySelector('#tx-table').scrollIntoView({ block: 'start' }); });
        tb.querySelectorAll('[data-tx]').forEach((tr) => {
          const open = () => { const [st, id] = tr.dataset.tx.split('|'); txDrawer(TX.find((t) => t.store === st && t.id === id)); };
          tr.onclick = open; tr.onkeydown = (e) => e.key === 'Enter' && open();
        });
        tb.querySelector('#tx-clear2')?.addEventListener('click', clearAll);
      };
      bindTable();
    },
  };

  /* ---------- Detail drawer ---------- */
  function txDrawer(t) {
    const s = D.stores.find((x) => x.code === t.store), c = CP.country(t.country);
    const ext = c.tax.startsWith('Avalara');
    const sub = t.lines.reduce((a, l) => a + l.price * l.qty, 0);
    const disc = t.lines.reduce((a, l) => a + l.disc, 0);
    const fiscal = c.fiscal ? {
      DE: ['TSE signature', 'fiskaly · TSS 9b1e…c204 · counter ' + (88000 + parseInt(t.id.slice(-4)))], AT: ['RKSV signature', 'Chain OK · Kassen-ID AT-' + t.store.slice(-3)], FR: ['NF525', 'Hash chained · signature X7aQ…p2'],
      IT: ['RT document', t.status === 'Pending sync' ? 'Pending · RT server unreachable' : 'RT 99MEX018442 · n. ' + t.id.slice(-4)], ES: ['VeriFactu', 'Chained hash · QR issued'], JP: ['Qualified invoice', 'T1234567890123'], IN: ['GST invoice', 'GSTIN 29ABCDE1234F1Z5'], MY: ['MyInvois', 'Consolidated monthly'],
    }[c.id] : null;
    const timeline = [
      ['Completed on device', `${t.device} · ${t.local} local`, 'good'],
      t.status === 'Pending sync' ? ['Waiting to sync', 'Device is offline. Stored and signed on the device.', 'warn'] : ['Synced to Core POS', 'Within 2 s · idempotency key ' + t.id, 'good'],
      ext ? ['Tax committed', 'Avalara AvaTax · doc ' + t.id, t.status === 'Pending sync' ? 'info' : 'good'] : null,
      fiscal ? ['Fiscal registration', fiscal[1], t.status === 'Pending sync' ? 'warn' : 'good'] : null,
      t.psp ? ['Payment captured', 'Adyen PSP ' + t.psp, 'good'] : null,
      ['Posted to SAP (TLOG)', t.status === 'Posting failed' ? '422 · Missing cost centre for store, in failed-message queue' : t.status === 'Pending sync' ? 'After sync' : 'Batch 2026-10-' + String(13 - t.day).padStart(2, '0') + ' · POSDM', t.status === 'Posting failed' ? 'bad' : t.status === 'Pending sync' ? 'info' : 'good'],
      ['Inventory delta to Fluent', t.status === 'Pending sync' ? 'After sync' : 'Sent in 3 s', t.status === 'Pending sync' ? 'info' : 'good'],
      t.customer ? ['Customer event to Amperity', 'TransactionCompleted.v3', t.status === 'Pending sync' ? 'info' : 'good'] : null,
    ].filter(Boolean);
    const dot = { good: 'var(--good)', warn: 'var(--warn)', bad: 'var(--bad)', info: 'var(--fg-3)' };
    CP.drawer({
      title: `${t.type} ${t.id}`, sub: `${t.store} · ${s.name} · ${t.local}`,
      body: `<div class="row">${B(t.type, typeKind[t.type])}${B(t.status, statusKind[t.status])}${t.approval ? B('Manager approved', 'info') : ''}<span class="spacer"></span><b class="num" style="font-size:1.3rem">${fmt(t.total, t.currency)}</b></div>
        ${t.status === 'Posting failed' ? `<div class="callout warn"><div><b>SAP rejected this transaction.</b> Fix the store's cost centre mapping, then retry. The transaction itself is final and cannot be edited.</div></div>` : ''}
        ${t.status === 'Pending sync' ? `<div class="callout warn"><div><b>Not synced yet.</b> ${t.store} is trading offline. This transaction will arrive with its original time and number when the device reconnects.</div></div>` : ''}
        <div class="stack"><h3>Items</h3>${CP.table([
          { h: 'Item', f: (l) => `${E(l.name)}<div class="cell-sub mono">${l.sku}</div>${l.discReason ? `<div class="cell-sub">${l.discReason}</div>` : ''}` },
          { h: 'Qty', r: 1, f: (l) => l.qty }, { h: 'Price', r: 1, f: (l) => fmt(l.price, t.currency) },
          { h: 'Discount', r: 1, f: (l) => (l.disc ? `<span class="down">−${fmt(Math.abs(l.disc), t.currency)}</span>` : '<span class="muted">—</span>') },
          { h: 'Net', r: 1, f: (l) => `<b>${fmt(l.net, t.currency)}</b>` }], t.lines)}</div>
        <dl class="kv">
          <dt>Subtotal</dt><dd class="num">${fmt(sub, t.currency)}</dd>
          <dt>Discounts</dt><dd class="num">${disc ? '−' + fmt(Math.abs(disc), t.currency) : '—'}</dd>
          <dt>${c.taxMode === 'inclusive' ? 'Included tax' : 'Sales tax'}</dt><dd class="num">${fmt(t.tax, t.currency)} <span class="muted small">(${ext ? 'Avalara, ' : ''}${t.taxRate}%)</span></dd>
          <dt>Total</dt><dd class="num"><b>${fmt(t.total, t.currency)}</b> <span class="muted small">≈ ${usd(t.usd)} at ${FX[t.currency]} USD</span></dd>
        </dl>
        <div class="grid g2">
          <div class="stack"><h3>Payment</h3><dl class="kv"><dt>Tender</dt><dd>${t.tender}</dd>${t.psp ? `<dt>Card</dt><dd class="mono small">${t.card}</dd><dt>PSP reference</dt><dd class="mono small">${t.psp}</dd><dt>Terminal</dt><dd class="mono small">${D.devices.find((d) => d.store === t.store)?.poiid || 'S1F2-000' + t.store.slice(-3) + '01'}</dd>` : ''}${t.tender === 'Cash' ? `<dt>Drawer</dt><dd>Drawer 1 · change given in ${t.currency}</dd>` : ''}</dl></div>
          <div class="stack"><h3>People</h3><dl class="kv"><dt>Associate</dt><dd>${t.associate}${t.lines.length > 1 && t.type === 'Sale' ? ' (split 50/50 with ' + (t.associate === '#1121' ? '#1122' : '#1121') + ')' : ''}</dd><dt>Customer</dt><dd>${t.customer ? `${E(t.customer.split(' ')[0])} ${t.customer.split(' ')[1][0]}. · ${t.loyalty}<br><span class="small muted">j•••@g•••.com · +•• •••• ${t.id.slice(-4)}</span>` : 'Guest'}</dd>${t.approval ? `<dt>Approved by</dt><dd>Store Manager #1003 · PIN on device</dd>` : ''}</dl>
            ${t.customer ? '<button class="btn sm" id="tx-reveal">' + I('eye') + 'Reveal contact (logged)</button>' : ''}</div>
        </div>
        ${fiscal ? `<div class="stack"><h3>Fiscal</h3><dl class="kv"><dt>${fiscal[0]}</dt><dd class="mono small">${fiscal[1]}</dd><dt>Journal</dt><dd>Write-once, hash-chained</dd></dl></div>` : ''}
        <div class="stack"><h3>Where it went</h3>
          <div class="list">${timeline.map(([a, b, k]) => `<div class="list-item" style="padding:8px 0;border-bottom:0"><span style="width:10px;height:10px;border-radius:50%;background:${dot[k]};margin-top:5px;flex:none"></span><div class="grow"><b class="small">${a}</b><div class="small muted">${E(b)}</div></div></div>`).join('')}</div></div>`,
      foot: `${t.status === 'Posting failed' ? '<button class="btn" id="tx-retry">' + I('refresh') + 'Retry posting</button>' : ''}<span class="spacer"></span><button class="btn" data-toast="Receipt copy emailed to the customer">Email receipt</button><button class="btn" data-toast="Receipt copy sent to ${t.device}">Reprint</button>${t.type === 'Sale' && t.psp ? '<button class="btn primary" id="tx-refund">Referenced refund</button>' : ''}`,
      mount(d) {
        d.querySelector('#tx-reveal')?.addEventListener('click', (e) => { e.currentTarget.outerHTML = `<div class="small">${E(t.customer.toLowerCase().replace(' ', '.'))}@example.com · +44 7700 90${t.id.slice(-4)}<div class="muted">Reveal logged to audit as Priya Raman</div></div>`; });
        d.querySelector('#tx-retry')?.addEventListener('click', () => CP.toast('Re-posted to SAP. Accepted.'));
        d.querySelector('#tx-refund')?.addEventListener('click', () => CP.confirm({ title: `Refund ${fmt(t.total, t.currency)}?`, body: `A referenced refund goes back to ${t.card} through Adyen without the card present. It creates a linked return document and needs Finance approval above ${fmt(localPrice(300, t.currency), t.currency)}.`, confirm: 'Start refund', onConfirm: () => CP.toast('Refund request created and sent for approval') }));
      },
    });
  }
})();
