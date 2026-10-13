/* Screens: Command center, Organisation (hierarchy, stores, configuration, rollout),
   Catalogue & pricing (products, price lists, promotions). */
(function () {
  const D = CP.data, S = CP.screens, I = CP.icon, B = CP.badge, E = CP.esc;

  /* Share of the tenant inside the current scope, used to scale the example KPIs. */
  function scopeFactor() {
    if (CP.scope.store) return 1 / 205;
    const cs = CP.countriesInScope();
    let f = cs.reduce((a, c) => a + c.stores, 0) / 205;
    if (CP.scope.brand) f *= { ATL: 0.52, KES: 0.31, NOR: 0.17 }[CP.scope.brand];
    return f;
  }
  const fmtUSD = (n) => '$' + (n >= 1e6 ? (n / 1e6).toFixed(2) + 'M' : n >= 1e3 ? (n / 1e3).toFixed(1) + 'k' : n.toFixed(0));

  /* ================= Command center ================= */
  function hourlyChart() {
    const H = D.hourly, regs = CP.scope.region ? [CP.scope.region] : ['NAM', 'EMEA', 'APAC'];
    const f = CP.scope.country || CP.scope.store || CP.scope.brand ? scopeFactor() * 3 : 1;
    const W = 640, Ht = 220, L = 40, R = 12, T = 12, Bm = 26;
    const max = 100, n = H.hours.length;
    const x = (i) => L + (i / (n - 1)) * (W - L - R);
    const y = (v) => T + (1 - v / max) * (Ht - T - Bm);
    const col = { NAM: 'var(--s1)', EMEA: 'var(--s2)', APAC: 'var(--s3)' };
    const grid = [0, 25, 50, 75, 100].map((v) => `<line x1="${L}" x2="${W - R}" y1="${y(v)}" y2="${y(v)}"/><text x="${L - 8}" y="${y(v) + 4}" text-anchor="end">${v}k</text>`).join('');
    const lines = regs.map((r) => {
      const vals = H[r].map((v) => v * Math.min(f, 1));
      const d = vals.map((v, i) => (i ? 'L' : 'M') + x(i).toFixed(1) + ' ' + y(v).toFixed(1)).join(' ');
      const li = vals.length - 1;
      return `<path d="${d}" fill="none" stroke="${col[r]}" stroke-width="2" stroke-linejoin="round"/>
        <circle cx="${x(li)}" cy="${y(vals[li])}" r="4" fill="${col[r]}" stroke="var(--surface)" stroke-width="2"/>`;
    }).join('');
    const hits = H.hours.map((h, i) => {
      const tip = `<b>${h}:00 UTC</b><br>` + regs.map((r) => `${r}: ${fmtUSD(H[r][i] * Math.min(f, 1) * 1000)}`).join('<br>');
      const w = (W - L - R) / (n - 1);
      return `<rect x="${x(i) - w / 2}" y="${T}" width="${w}" height="${Ht - T - Bm}" fill="transparent" data-tip="${E(tip)}" tabindex="0"/>`;
    }).join('');
    const xl = H.hours.map((h, i) => (i % 2 ? '' : `<text x="${x(i)}" y="${Ht - 6}" text-anchor="middle">${h}:00</text>`)).join('');
    return `<div class="legend" style="padding:0 0 8px">${regs.map((r) => `<span><i style="background:${col[r]}"></i>${r}</span>`).join('')}<span class="muted">Net sales per hour, USD reporting currency (UTC)</span></div>
      <svg class="chart" viewBox="0 0 ${W} ${Ht}" role="img" aria-label="Hourly net sales by region"><g class="grid">${grid}</g>${lines}${xl}${hits}</svg>`;
  }

  S.dashboard = {
    render() {
      const f = scopeFactor();
      const sales = 2486000 * f, txn = Math.round(11940 * f), atv = sales / Math.max(txn, 1);
      const inScope = D.stores.filter(CP.inScope);
      const off = inScope.filter((s) => s.status === 'Offline').length, att = inScope.filter((s) => s.status === 'Attention').length;
      const kpi = (label, v, d, spark, col) => `<div class="panel kpi"><div class="eyebrow">${label}</div><div class="v">${v}</div><div class="d">${d}</div>${CP.spark(spark, col)}</div>`;
      const regRows = D.regions.filter((r) => !CP.scope.region || r.id === CP.scope.region).map((r, i) => {
        const pct = [0.92, 1.06, 0.98][i], col = ['var(--s1)', 'var(--s2)', 'var(--s3)'][i];
        return `<div class="region-row"><div><b>${r.id}</b><div class="cell-sub">${r.currency}</div></div>
          <div><div class="bar" data-tip="${E(`<b>${r.id}</b><br>${Math.round(pct * 100)}% of today's target`)}"><i style="width:${Math.min(pct, 1) * 100}%;background:${col}"></i></div>
          <div class="cell-sub" style="margin-top:4px">${Math.round(pct * 100)}% of daily target · ${['64% stores trading', '81% stores trading', 'all stores Z-closed'][i]}</div></div>
          <div class="num strong">${['$812k', '$1.21M', '$0.46M'][i]}</div></div>`;
      }).join('');
      return `
      ${CP.pageHead({ crumbs: ['Overview'], title: 'Command center', desc: 'Live trading, store health and integration status across every region you can see. Change the scope in the top bar to drill from global down to a single store.', actions: `<button class="btn" data-toast="Dashboard exported to Excel">${I('download')}Export</button><button class="btn primary" data-go="reports">${I('chart')}Open reports</button>` })}
      <div class="grid g4">
        ${kpi('Net sales today', fmtUSD(sales), '<span class="up">▲ 6.4%</span> vs same day last year', [40, 42, 39, 47, 51, 49, 55, 58], 'var(--accent)')}
        ${kpi('Transactions', txn.toLocaleString('en-US'), '<span class="up">▲ 3.1%</span> · UPT 1.42', [30, 31, 35, 33, 36, 38, 37, 41], 'var(--accent)')}
        ${kpi('Average transaction', '$' + atv.toFixed(0), '<span class="down">▼ 1.2%</span> · CVR 18.6%', [52, 50, 51, 49, 50, 48, 49, 48], 'var(--accent)')}
        ${kpi('Stores trading', `${Math.round(117 * f * 205 / 205)} / ${Math.round(205 * f) || 1}`, `${off ? `<span class="down">${off} offline</span>` : '0 offline'} · ${att} need attention`, [60, 80, 120, 140, 150, 140, 130, 117], 'var(--accent)')}
      </div>
      <div class="grid g-2-1">
        <section class="panel"><div class="panel-h"><h2>Sales by hour</h2><span class="sub">Today, by region</span>
          <div class="actions"><div class="chips" data-chips><button class="chip on">Today</button><button class="chip">7 days</button><button class="chip">MTD</button></div></div></div>
          <div class="panel-b">${hourlyChart()}</div></section>
        <section class="panel"><div class="panel-h"><h2>Alerts</h2><span class="sub">${D.alerts.length} open</span><div class="actions"><button class="btn sm ghost" data-toast="All alerts acknowledged">Acknowledge all</button></div></div>
          <div class="list">${D.alerts.map((a) => `<div class="list-item"><span class="sev ${a.sev}"></span><div class="grow"><div class="row" style="gap:6px"><b>${E(a.title)}</b></div><div class="small muted">${E(a.detail)}</div></div><div class="stack" style="gap:4px;justify-items:end"><span class="small muted mono">${a.time}</span><button class="btn sm" data-go="${a.link}">View</button></div></div>`).join('')}</div></section>
      </div>
      <div class="grid g3">
        <section class="panel"><div class="panel-h"><h2>Region performance</h2><span class="sub">vs daily target</span></div><div class="panel-b flush">${regRows}</div></section>
        <section class="panel"><div class="panel-h"><h2>Integration health</h2><div class="actions"><button class="btn sm" data-go="integrations">All</button></div></div>
          <div class="panel-b flush">${CP.table([
            { h: 'Service', f: (i) => `<b>${i.name}</b><div class="cell-sub">${i.cat}</div>` },
            { h: 'Status', f: (i) => B(i.status) },
            { h: 'p95', r: 1, f: (i) => (i.latency ? i.latency + ' ms' : '—') },
          ], D.integrations.filter((i) => i.status !== 'Available').sort((a, b) => (a.health || 0) - (b.health || 0)).slice(0, 6))}</div></section>
        <section class="panel"><div class="panel-h"><h2>Offline & sync</h2><span class="sub">Store-and-forward queue</span></div>
          <div class="panel-b stack">
            <dl class="kv"><dt>Devices online</dt><dd class="num">1,402 / 1,431</dd><dt>Trading offline</dt><dd class="num">5 devices · 1 store</dd><dt>Queued transactions</dt><dd class="num">44</dd><dt>Oldest unsynced</dt><dd>41 min · IT-MIL-005</dd><dt>Offline package</dt><dd><span class="tag">v8812</span> built 06:00 UTC</dd><dt>Number blocks low</dt><dd>2 devices &lt; 50 left</dd></dl>
            <div class="callout warn"><div><b>IT-MIL-005 is selling offline.</b> Fiscal RT totals will be sent once the RT server reconnects. No action needed in store.</div></div>
          </div></section>
      </div>`;
    },
  };

  /* ================= Hierarchy ================= */
  let hierSel = { level: 'Global', id: 'GLOBAL' };
  function hierTree() {
    const sel = (l, id) => (hierSel.level === l && hierSel.id === id ? 'sel' : '');
    return `<div class="tree">
      <details open><summary class="${sel('Global', 'GLOBAL')}" data-node="Global|GLOBAL"><b>Atlas Retail Group</b><span class="lvl">Global</span></summary>
      ${D.regions.map((r) => `<details ${r.id === 'EMEA' ? 'open' : ''}><summary class="${sel('Region', r.id)}" data-node="Region|${r.id}">${r.id} <span class="muted small">${r.name}</span><span class="lvl">Region</span></summary>
        ${D.countries.filter((c) => c.region === r.id).map((c) => `<details ${c.id === 'DE' ? 'open' : ''}><summary class="${sel('Country', c.id)}" data-node="Country|${c.id}">${CP.flag(c.id)} ${c.name}<span class="lvl">${c.stores} stores</span></summary>
          ${D.brands.map((b) => {
            const st = D.stores.filter((s) => s.country === c.id && s.brand === b.id);
            if (!st.length) return '';
            return `<details open><summary class="${sel('Brand', c.id + ':' + b.id)}" data-node="Brand|${c.id}:${b.id}">${b.name}<span class="lvl">Brand</span></summary>
              ${st.map((s) => `<div class="leaf ${sel('Store', s.code)}" data-node="Store|${s.code}" tabindex="0">${CP.icon('store', '').replace('<svg', '<svg width="14" height="14"')} ${s.code}<span class="lvl">${s.concept}</span></div>`).join('')}</details>`;
          }).join('')}
        </details>`).join('')}
      </details>`).join('')}
      </details></div>`;
  }
  function hierDetail() {
    const { level, id } = hierSel;
    let title, rows, kids = '', inh;
    if (level === 'Global') {
      title = 'Atlas Retail Group'; rows = [['Level', 'Global (tenant)'], ['Regions', '3'], ['Countries', '14'], ['Brands', '3 · 2 concepts'], ['Stores', '205'], ['Reporting currency', 'USD'], ['Default language', 'en-GB']];
      kids = CP.table([{ h: 'Region', f: (r) => `<b>${r.id}</b><div class="cell-sub">${r.name}</div>` }, { h: 'Countries', r: 1, f: (r) => D.countries.filter((c) => c.region === r.id).length }, { h: 'Stores', r: 1, f: (r) => D.countries.filter((c) => c.region === r.id).reduce((a, c) => a + c.stores, 0) }, { h: 'Data residency', f: (r) => ({ NAM: 'us-east', EMEA: 'eu-central', APAC: 'ap-southeast' }[r.id]) }], D.regions);
      inh = 'Root of all configuration. Values set here apply everywhere unless a lower level overrides them, and HQ can lock a value so it cannot be overridden.';
    } else if (level === 'Region') {
      const r = D.regions.find((x) => x.id === id);
      title = `${r.id} · ${r.name}`; rows = [['Level', 'Region'], ['Countries', D.countries.filter((c) => c.region === id).length], ['Regional currency', r.currency], ['Ops time zone', r.tz], ['Regional admins', '4']];
      kids = CP.table([{ h: 'Country', f: (c) => `${CP.flag(c.id)} ${c.name}` }, { h: 'Currency', f: (c) => c.currency }, { h: 'Tax', f: (c) => c.tax }, { h: 'Fiscal', f: (c) => c.fiscal || '<span class="muted">Not required</span>' }, { h: 'Stores', r: 1, f: (c) => c.stores }], D.countries.filter((c) => c.region === id));
      inh = 'Inherits from Global. 6 configuration keys overridden at this level.';
    } else if (level === 'Country') {
      const c = CP.country(id);
      title = c.name; rows = [['Level', 'Country'], ['Region', c.region], ['Currency', c.currency], ['Languages', c.lang], ['Tax model', `${c.tax} · prices ${c.taxMode} of tax`], ['Fiscal regime', c.fiscal || 'None'], ['Data residency', c.residency]];
      kids = CP.table([{ h: 'Store', f: (s) => `<b>${s.code}</b><div class="cell-sub">${s.name}</div>` }, { h: 'Brand', f: (s) => CP.brand(s.brand).name }, { h: 'Concept', f: (s) => s.concept }, { h: 'Status', f: (s) => B(s.status) }], D.stores.filter((s) => s.country === id));
      inh = 'Inherits from ' + c.region + '. Country is where legal rules live: tax, fiscal, receipts, cash limits, privacy.';
    } else if (level === 'Brand') {
      const [cid, bid] = id.split(':'); const b = CP.brand(bid);
      title = `${b.name} in ${CP.country(cid).name}`; rows = [['Level', 'Brand (within country)'], ['Category', b.kind], ['Concepts', b.concepts.join(', ')], ['Receipt template', `${bid}-${cid}-v7`], ['Adyen merchant account', `Atlas${b.name.replace(/\s/g, '')}_${cid}_POS`]];
      kids = CP.table([{ h: 'Store', f: (s) => `<b>${s.code}</b><div class="cell-sub">${s.name}</div>` }, { h: 'Concept', f: (s) => s.concept }, { h: 'Devices', r: 1, f: (s) => s.devices }], D.stores.filter((s) => s.country === cid && s.brand === bid));
      inh = 'Brand-level overrides cover look and feel, receipt branding, promotions and the payment merchant account.';
    } else {
      const s = D.stores.find((x) => x.code === id);
      title = `${s.code} · ${s.name}`; rows = [['Level', 'Store'], ['Brand / concept', `${CP.brand(s.brand).name} · ${s.concept}`], ['City', s.city], ['Time zone', s.tz], ['Business day', s.day], ['Devices', s.devices], ['Store cluster', s.concept === 'Outlet' ? 'OUTLET-' + s.country : 'FULL-' + s.country]];
      inh = 'Store overrides are limited to what HQ and the country permit (e.g. opening hours, printer pairing, local discount threshold).';
    }
    return `<div class="panel-h"><div style="display:grid;gap:2px"><span class="eyebrow">${level}</span><h2>${E(title)}</h2></div>
      <div class="actions"><button class="btn sm" id="use-scope">${I('tree')}Use as scope</button><button class="btn sm primary" id="add-child">${I('plus')}Add ${{ Global: 'region', Region: 'country', Country: 'brand', Brand: 'store', Store: 'device' }[level]}</button></div></div>
      <div class="panel-b stack"><dl class="kv">${rows.map(([k, v]) => `<dt>${k}</dt><dd>${v}</dd>`).join('')}</dl>
      <div class="callout"><div>${inh}</div></div></div>${kids ? `<div class="panel-b flush" style="border-top:1px solid var(--line)">${kids}</div>` : ''}`;
  }
  S.hierarchy = {
    render() {
      return `${CP.pageHead({ crumbs: ['Organisation'], title: 'Hierarchy', scoped: false, desc: 'The organisation model every setting, report and permission hangs off: Region → Country → Brand → Store. Districts and store clusters group stores across it.', actions: `<button class="btn" data-toast="Hierarchy exported as CSV">${I('download')}Export</button><button class="btn" data-toast="Import started: 0 errors in preview">${I('upload')}Bulk import</button>` })}
      <div class="grid g-1-2">
        <section class="panel"><div class="panel-h"><h2>Organisation tree</h2><span class="sub">205 stores</span></div>${hierTree()}
          <div class="empty-note">Also maintained: 18 districts · 9 store clusters (price & assortment groups)</div></section>
        <section class="panel" id="hier-detail">${hierDetail()}</section>
      </div>`;
    },
    mount(root) {
      const bind = () => {
        root.querySelector('#use-scope').onclick = () => {
          const { level, id } = hierSel;
          if (level === 'Global') CP.setScope({ region: '', country: '', brand: '', store: '' });
          else if (level === 'Region') CP.setScope({ region: id, country: '', brand: '', store: '' });
          else if (level === 'Country') CP.setScope({ region: CP.country(id).region, country: id, brand: '', store: '' });
          else if (level === 'Brand') { const [c, b] = id.split(':'); CP.setScope({ region: CP.country(c).region, country: c, brand: b, store: '' }); }
          else { const s = D.stores.find((x) => x.code === id); CP.setScope({ region: CP.country(s.country).region, country: s.country, brand: s.brand, store: s.code }); }
          CP.toast('Scope set to ' + CP.scopeLabel());
        };
        root.querySelector('#add-child').onclick = () => addNodeDrawer(hierSel.level);
      };
      root.querySelectorAll('[data-node]').forEach((n) => {
        const pick = (e) => {
          if (n.tagName === 'SUMMARY') e.preventDefault();
          const [level, id] = n.dataset.node.split('|');
          hierSel = { level, id };
          root.querySelectorAll('.sel').forEach((x) => x.classList.remove('sel'));
          n.classList.add('sel');
          root.querySelector('#hier-detail').innerHTML = hierDetail();
          CP.wire(root.querySelector('#hier-detail'));
          bind();
          if (n.tagName === 'SUMMARY') n.parentElement.open = true;
        };
        n.addEventListener('click', pick);
        n.addEventListener('keydown', (e) => { if (e.key === 'Enter') pick(e); });
      });
      bind();
    },
  };
  function addNodeDrawer(level) {
    if (level === 'Brand' || level === 'Country') return storeDrawer(null);
    const what = { Global: 'region', Region: 'country', Store: 'device' }[level];
    CP.drawer({ title: 'Add ' + what, sub: 'Hierarchy', body: `<div class="form-grid">
      <div class="field"><label for="n-name">Name</label><input class="input" id="n-name" value="${what === 'country' ? 'Netherlands' : what === 'region' ? 'LATAM' : 'D-NEW-01'}"></div>
      <div class="field"><label for="n-code">Code</label><input class="input mono" id="n-code" value="${what === 'country' ? 'NL' : what === 'region' ? 'LATAM' : 'D-NEW-01'}"></div>
      <div class="field"><label for="n-cur">Currency</label><select class="input" id="n-cur"><option>EUR</option><option>USD</option><option>GBP</option></select></div>
      <div class="field"><label for="n-res">Data residency</label><select class="input" id="n-res"><option>eu-central</option><option>us-east</option><option>ap-southeast</option></select></div></div>
      <div class="callout">New ${what}s start with every value inherited from their parent and all new features switched off.</div>`,
      foot: `<button class="btn" data-close>Cancel</button><button class="btn primary" id="n-save">Create ${what}</button>`,
      mount: (d) => { d.querySelector('[data-close]').onclick = CP.closeOverlay; d.querySelector('#n-save').onclick = () => { CP.closeOverlay(); CP.toast(`${what[0].toUpperCase() + what.slice(1)} created. Inheriting parent settings.`); }; } });
  }

  /* ================= Stores ================= */
  let storeFilter = 'All';
  S.stores = {
    render() {
      const list = D.stores.filter(CP.inScope).filter((s) => storeFilter === 'All' || s.status === storeFilter);
      return `${CP.pageHead({ crumbs: ['Organisation'], title: 'Stores', desc: 'Every store with its trading status, business day and device health. Open a store to manage its profile, devices, payments, fiscal setup and local overrides.', actions: `<button class="btn" data-toast="Stores exported as CSV">${I('download')}Export</button><button class="btn" data-go="rollout">${I('rocket')}Clone from template</button><button class="btn primary" id="new-store">${I('plus')}New store</button>` })}
      <section class="panel">
        <div class="toolbar"><div class="chips" data-chips id="st-chips">${['All', 'Trading', 'Attention', 'Offline', 'Closed'].map((c) => `<button class="chip ${c === storeFilter ? 'on' : ''}" data-v="${c}">${c}</button>`).join('')}</div>
          <span class="spacer"></span><input class="input" id="st-q" placeholder="Filter by code, name or city" aria-label="Filter stores" style="width:240px"></div>
        <div class="panel-b flush" id="st-table">${storeTable(list)}</div>
        <div class="empty-note">Showing ${list.length} sample stores of ${Math.max(1, Math.round(205 * scopeFactor()))} in scope. Sales in local currency, business day to now.</div>
      </section>`;
    },
    mount(root) {
      root.querySelector('#st-chips').addEventListener('chips', (e) => { storeFilter = e.detail; CP.render(); });
      root.querySelector('#new-store').onclick = () => storeDrawer(null);
      const bindRows = () => root.querySelectorAll('tr[data-store]').forEach((tr) => (tr.onclick = () => storeDrawer(D.stores.find((s) => s.code === tr.dataset.store))));
      root.querySelector('#st-q').oninput = (e) => {
        const v = e.target.value.toLowerCase();
        const list = D.stores.filter(CP.inScope).filter((s) => (storeFilter === 'All' || s.status === storeFilter) && (s.code + s.name + s.city).toLowerCase().includes(v));
        root.querySelector('#st-table').innerHTML = storeTable(list); bindRows();
      };
      bindRows();
    },
  };
  function storeTable(list) {
    return CP.table([
      { h: 'Store', f: (s) => `<b class="mono">${s.code}</b><div class="cell-sub">${E(s.name)}</div>` },
      { h: 'Country', f: (s) => `${CP.flag(s.country)} <span class="small">${s.city}</span>` },
      { h: 'Brand · concept', f: (s) => `${CP.brand(s.brand).name}<div class="cell-sub">${s.concept}</div>` },
      { h: 'Status', f: (s) => B(s.status) },
      { h: 'Business day', f: (s) => B(s.day, s.day === 'Open' ? 'good' : s.day === 'Closing' ? 'warn' : 'info') },
      { h: 'Sales', r: 1, f: (s) => `<span class="num">${CP.money(s)}</span><div class="cell-sub">${s.txn} txns</div>` },
      { h: 'Devices', r: 1, f: (s) => s.devices },
      { h: 'Last sync', r: 1, f: (s) => `<span class="mono ${/m$/.test(s.sync) && parseInt(s.sync) > 5 ? 'down' : ''}">${s.sync}</span>` },
    ], list, { rowAttr: (s) => `class="click" data-store="${s.code}" tabindex="0"` });
  }
  function storeDrawer(s) {
    const isNew = !s;
    s = s || { code: 'NL-AMS-001', name: 'Kalverstraat', country: 'NL', brand: 'ATL', concept: 'Full price', city: 'Amsterdam', tz: 'Europe/Amsterdam', devices: 0, status: 'Draft', day: '—' };
    const c = CP.country(s.country) || { name: 'Netherlands', currency: 'EUR', region: 'EMEA', tax: 'Native VAT', fiscal: null, lang: 'nl-NL' };
    const dev = D.devices.filter((d) => d.store === s.code);
    CP.drawer({
      title: isNew ? 'New store' : `${s.code} · ${s.name}`, sub: isNew ? 'Store setup' : `${c.name} · ${CP.brand(s.brand).name} · ${s.concept}`,
      body: `<div data-tabhost><div class="tabs" data-tabs>${['Profile', 'Devices', 'Payments & fiscal', 'Overrides', 'Hours'].map((t, i) => `<button data-tab="${i}" class="${i ? '' : 'on'}">${t}</button>`).join('')}</div>
        <div data-pane="0" style="padding-top:16px" class="stack"><div class="form-grid">
          <div class="field"><label for="sd-code">Store code</label><input class="input mono" id="sd-code" value="${s.code}"></div>
          <div class="field"><label for="sd-name">Store name</label><input class="input" id="sd-name" value="${E(s.name)}"></div>
          <div class="field"><label for="sd-region">Region › Country</label><select class="input" id="sd-region">${D.countries.map((x) => `<option ${x.id === s.country ? 'selected' : ''}>${x.region} › ${x.name}</option>`).join('')}<option ${isNew ? 'selected' : ''}>EMEA › Netherlands</option></select></div>
          <div class="field"><label for="sd-brand">Brand</label><select class="input" id="sd-brand">${D.brands.map((b) => `<option ${b.id === s.brand ? 'selected' : ''}>${b.name}</option>`).join('')}</select></div>
          <div class="field"><label for="sd-concept">Concept</label><select class="input" id="sd-concept"><option ${s.concept === 'Full price' ? 'selected' : ''}>Full price</option><option ${s.concept === 'Outlet' ? 'selected' : ''}>Outlet</option><option>Concession</option><option>Pop-up</option></select></div>
          <div class="field"><label for="sd-cluster">Store cluster</label><select class="input" id="sd-cluster"><option>${s.concept === 'Outlet' ? 'OUTLET' : 'FULL'}-${s.country}</option><option>FLAGSHIP-GLOBAL</option></select><span class="hint">Drives the price list and assortment.</span></div>
          <div class="field"><label for="sd-tz">Time zone</label><input class="input mono" id="sd-tz" value="${s.tz}"></div>
          <div class="field"><label for="sd-district">District</label><select class="input" id="sd-district"><option>${c.name} North</option><option>${c.name} South</option></select></div>
          <div class="field" style="grid-column:1/-1"><label for="sd-addr">Address (used for tax jurisdiction)</label><input class="input" id="sd-addr" value="${E(s.city)} · street, postcode"></div>
          <div class="field"><label for="sd-vat">VAT / tax registration no.</label><input class="input mono" id="sd-vat" value="${s.country === 'US' ? 'Seller permit NY-4021-118' : s.country + '298441903'}"></div>
          <div class="field"><label for="sd-sap">SAP plant / site</label><input class="input mono" id="sd-sap" value="${s.country}${s.code.slice(-3)}"></div>
        </div></div>
        <div data-pane="1" hidden style="padding-top:16px" class="stack">
          ${dev.length ? CP.table([{ h: 'Device', f: (d) => `<b class="mono">${d.id}</b><div class="cell-sub">${d.model}</div>` }, { h: 'App', f: (d) => `<span class="tag">${d.app}</span>` }, { h: 'Terminal', f: (d) => `<span class="mono small">${d.poiid}</span>` }, { h: 'State', f: (d) => B(d.state) }], dev) : `<div class="callout">No devices registered yet. Devices enrol automatically when the MDM profile for <b class="mono">${s.code}</b> is installed.</div>`}
          <div class="row"><button class="btn" data-toast="Enrolment token copied">${I('copy')}Copy enrolment token</button><button class="btn" data-toast="Printer pairing sent to devices">Pair printer</button></div></div>
        <div data-pane="2" hidden style="padding-top:16px" class="stack">
          <dl class="kv"><dt>Payment provider</dt><dd>Adyen · merchant <span class="mono">Atlas${CP.brand(s.brand).name.replace(/\s/g, '')}_${s.country}_POS</span></dd><dt>Store ID (Adyen)</dt><dd class="mono">${s.code.replace(/-/g, '')}</dd>
          <dt>Tax</dt><dd>${c.tax}</dd><dt>Fiscal</dt><dd>${c.fiscal || 'Not required in ' + c.name}</dd>${c.fiscal && s.country === 'DE' ? '<dt>TSE client</dt><dd class="mono">fiskaly · tss_9b1e…c204 · 5 clients</dd>' : ''}
          <dt>Number series</dt><dd class="mono">${s.country}-${s.code.slice(-3)}-{device}-{yyyy}-{seq:6}</dd></dl>
          <button class="btn" data-go="fiscal">Open fiscal settings</button></div>
        <div data-pane="3" hidden style="padding-top:16px" class="stack">
          ${CP.table([{ h: 'Setting', f: (r) => `<span class="mono small">${r[0]}</span>` }, { h: 'Inherited', f: (r) => `<span class="muted">${r[1]}</span>` }, { h: 'This store', f: (r) => r[2] ? `<b>${r[2]}</b>` : '<span class="muted">—</span>' }, { h: '', f: (r) => r[3] ? '<span class="lock">' + I('lock').replace('<svg', '<svg width="12" height="12"') + 'Locked</span>' : '' }], [
            ['discount.manual_max_pct', '10% (EMEA)', s.code === 'DE-BER-012' ? '20%' : '', false], ['returns.window_days', '30 (Global)', '', false], ['cash.max_cash_payment', s.country === 'FR' ? '€1,000 (FR)' : '—', '', s.country === 'FR'], ['receipts.print_mandatory', s.country === 'DE' ? 'Yes (DE)' : 'No', '', s.country === 'DE'], ['parked_cart.expiry_hours', '24 (Global)', '', false]])}
          <button class="btn" data-go="config">Manage in Configuration</button></div>
        <div data-pane="4" hidden style="padding-top:16px" class="stack">
          ${['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d, i) => `<div class="row"><b style="width:44px">${d}</b><input class="input mono" style="width:90px" value="${i === 6 ? '12:00' : '10:00'}" aria-label="${d} open"> – <input class="input mono" style="width:90px" value="${i === 6 ? '18:00' : '20:00'}" aria-label="${d} close">${CP.switch('h' + i, true, d + ' open')}</div>`).join('')}
          <div class="field"><label for="sd-autoclose">Auto Z-close if not closed by</label><input class="input mono" id="sd-autoclose" value="03:00 local" style="width:160px"></div></div>
      </div>`,
      foot: `${isNew ? '' : '<button class="btn danger" id="sd-deact">Deactivate store</button><span class="spacer"></span>'}<button class="btn" data-close>Cancel</button><button class="btn primary" id="sd-save">${isNew ? 'Create store' : 'Save changes'}</button>`,
      mount(d) {
        d.querySelectorAll('[data-close]').forEach((x) => (x.onclick = CP.closeOverlay));
        d.querySelector('#sd-save').onclick = () => { CP.closeOverlay(); CP.toast(isNew ? 'Store created as draft. Finish setup in Store rollout.' : 'Store saved. Devices pick up changes at next sync.'); };
        const de = d.querySelector('#sd-deact');
        if (de) de.onclick = () => CP.confirm({ title: `Deactivate ${s.code}?`, body: 'Devices are signed out and the store stops trading. Fiscal journals and transaction history are kept for the legal retention period.', confirm: 'Deactivate', danger: true, onConfirm: () => CP.toast(s.code + ' deactivated') });
      },
    });
  }

  /* ================= Configuration (inheritance) ================= */
  const CFG = [
    { key: 'returns.window_days', cat: 'Returns', label: 'Return window (days)', type: 'number', v: { Global: 30, NAM: 60, FR: 14, 'US-ORL-208': 30 }, lock: {} , hist: [['10:14 today', 'Priya Raman', 'FR: 30 → 14']] },
    { key: 'returns.non_receipted', cat: 'Returns', label: 'Non-receipted returns', type: 'select', opts: ['Not allowed', 'Store credit only', 'Lowest price in 90 days'], v: { Global: 'Store credit only', JP: 'Not allowed' }, lock: {}, hist: [] },
    { key: 'discount.manual_max_pct', cat: 'Discounts', label: 'Manual discount limit without approval (%)', type: 'number', v: { Global: 15, EMEA: 10, 'DE-BER-012': 20 }, lock: {}, hist: [['2 Oct', 'Jonas Weber', 'DE-BER-012: — → 20']] },
    { key: 'discount.employee_pct', cat: 'Discounts', label: 'Employee discount (%)', type: 'number', v: { Global: 40 }, lock: { Global: true }, hist: [] },
    { key: 'cash.max_cash_payment', cat: 'Cash', label: 'Maximum cash payment per sale', type: 'text', v: { FR: '€1,000', IT: '€4,999.99', ES: '€999.99' }, lock: { FR: true, IT: true, ES: true }, hist: [['1 Jan', 'Tax / Fiscal Admin', 'IT: €2,999.99 → €4,999.99']] },
    { key: 'cash.rounding', cat: 'Cash', label: 'Cash rounding increment', type: 'select', opts: ['None', '0.05', '0.10', '1'], v: { Global: 'None', CH: '0.05', AU: '0.05', CA: '0.05' }, lock: { CH: true }, hist: [] },
    { key: 'receipts.print_mandatory', cat: 'Receipts', label: 'Printed receipt mandatory', type: 'bool', v: { Global: false, DE: true, AT: true, IT: true }, lock: { DE: true, AT: true, IT: true }, hist: [] },
    { key: 'receipts.digital_default', cat: 'Receipts', label: 'Default receipt channel', type: 'select', opts: ['Ask customer', 'Email', 'SMS', 'Print'], v: { Global: 'Ask customer', JP: 'Print' }, lock: {}, hist: [] },
    { key: 'customer.id_required_cash_over', cat: 'Customers', label: 'Capture ID for cash sales over', type: 'text', v: { Global: 'Off', IN: '₹200,000' }, lock: { IN: true }, hist: [] },
    { key: 'offline.max_hours', cat: 'Offline', label: 'Maximum offline trading (hours)', type: 'number', v: { Global: 72, APAC: 48 }, lock: {}, hist: [] },
    { key: 'parked_cart.expiry_hours', cat: 'Selling', label: 'Parked cart expiry (hours)', type: 'number', v: { Global: 24 }, lock: {}, hist: [] },
    { key: 'app.min_version', cat: 'Devices', label: 'Minimum POS app version', type: 'text', v: { Global: '4.11.0' }, lock: { Global: true }, hist: [['1 Oct', 'Priya Raman', '4.10.0 → 4.11.0']] },
  ];
  let cfgSel = 0;
  function cascade(k) {
    const sc = CP.scope;
    const levels = [
      ['Global', 'GLOBAL', 'Global'],
      ['Region', sc.region, sc.region || ''],
      ['Country', sc.country, sc.country ? CP.country(sc.country).name : ''],
      ['Brand', sc.brand, sc.brand ? CP.brand(sc.brand).name : ''],
      ['Store', sc.store, sc.store || ''],
    ];
    let eff = null, effI = -1, lockedAt = null;
    levels.forEach(([lv, id], i) => {
      const key = lv === 'Global' ? 'Global' : id;
      if (key && k.v[key] !== undefined && !lockedAt) { eff = k.v[key]; effI = i; }
      if (key && k.lock[key]) lockedAt = lockedAt || lv;
    });
    const show = (v) => (v === true ? 'Yes' : v === false ? 'No' : v);
    const html = levels.map(([lv, id, name], i) => {
      const key = lv === 'Global' ? 'Global' : id;
      const has = key && k.v[key] !== undefined;
      const val = !key ? `<span class="inh">Pick a ${lv.toLowerCase()} in the scope bar</span>` : has ? E(show(k.v[key])) : '<span class="inh">inherits</span>';
      return `<div class="lv ${has ? 'set' : ''} ${i === effI ? 'eff' : ''}"><div class="lvn"><div class="eyebrow">${lv}</div><div class="small">${E(name)}</div></div><div class="val">${val}</div>
        <div>${key && k.lock[key] ? `<span class="lock">${I('lock').replace('<svg', '<svg width="12" height="12"')}Locked here</span>` : i === effI ? B('Effective', 'accent') : ''}</div></div>`;
    }).join('');
    return { html, eff: eff === null ? 'Not set' : show(eff), lockedAt };
  }
  S.config = {
    render() {
      const k = CFG[cfgSel], c = cascade(k), level = CP.scopeLevel();
      const cats = [...new Set(CFG.map((x) => x.cat))];
      return `${CP.pageHead({ crumbs: ['Organisation'], title: 'Configuration', desc: 'Typed business rules that inherit down the hierarchy. HQ sets defaults and can lock them; regions, countries, brands and stores override only where allowed. Every change is versioned and can require approval.', actions: `<button class="btn" data-toast="Configuration diff exported">${I('download')}Export diff</button><button class="btn primary" data-toast="2 pending changes sent for approval">Submit for approval</button>` })}
      <div class="grid g-1-2">
        <section class="panel"><div class="toolbar"><input class="input" id="cfg-q" placeholder="Search 214 keys" aria-label="Search configuration keys" style="flex:1"></div>
          <div class="list" id="cfg-list">${cats.map((cat) => `<div class="eyebrow" style="padding:12px 16px 4px">${cat}</div>${CFG.map((x, i) => (x.cat !== cat ? '' : `<button class="list-item" data-cfg="${i}" style="all:unset;display:flex;gap:10px;padding:9px 16px;cursor:pointer;${i === cfgSel ? 'background:var(--accent-soft);' : ''}border-bottom:1px solid var(--line)"><div class="grow"><div style="font-weight:600;font-size:13px">${x.label}</div><div class="mono small muted">${x.key}</div></div>${Object.keys(x.lock).length ? I('lock').replace('<svg', '<svg width="13" height="13" style="color:var(--scope)"') : ''}</button>`)).join('')}`).join('')}</div></section>
        <div class="stack" style="gap:16px">
          <section class="panel"><div class="panel-h"><div style="display:grid;gap:2px"><span class="mono small muted">${k.key}</span><h2>${k.label}</h2></div>
            <div class="actions">${B('Effective here: ' + c.eff, 'accent')}</div></div>
            <div class="panel-b stack"><div class="cascade">${c.html}</div>
            ${c.lockedAt && c.lockedAt !== level ? `<div class="callout warn"><div><b>Locked at ${c.lockedAt} level.</b> Lower levels cannot override this value. Ask a ${c.lockedAt === 'Global' ? 'HQ Admin' : 'Tax / Fiscal Admin'} to change it.</div></div>` : ''}</div></section>
          <section class="panel"><div class="panel-h"><h2>Override at ${E(CP.scopeLabel())}</h2><span class="sub">${level} level</span></div>
            <div class="panel-b stack">
              <div class="form-grid">
                <div class="field"><label for="cfg-val">Value</label>${k.type === 'select' ? `<select class="input" id="cfg-val">${k.opts.map((o) => `<option>${o}</option>`).join('')}</select>` : k.type === 'bool' ? `<div>${CP.switch('cfg-val', c.eff === 'Yes', 'Value')}</div>` : `<input class="input mono" id="cfg-val" value="${E(c.eff === 'Not set' ? '' : c.eff)}">`}</div>
                <div class="field"><label for="cfg-eff">Effective from</label><input class="input mono" id="cfg-eff" value="Immediately" ></div>
                <div class="field" style="grid-column:1/-1"><label for="cfg-reason">Reason for change</label><input class="input" id="cfg-reason" placeholder="Shown in the audit log and approval request"></div>
              </div>
              <div class="row"><label class="row small" style="gap:8px">${CP.switch('cfg-lock', false, 'Lock for lower levels')} Lock for lower levels</label><span class="spacer"></span>
                <button class="btn" id="cfg-clear">Remove override</button><button class="btn primary" id="cfg-save" ${c.lockedAt && c.lockedAt !== level && level !== 'Global' ? 'disabled title="Locked at a higher level"' : ''}>Save override</button></div>
            </div></section>
          <section class="panel"><div class="panel-h"><h2>Change history</h2></div><div class="panel-b flush">${k.hist.length ? CP.table([{ h: 'When', f: (h) => h[0] }, { h: 'Who', f: (h) => h[1] }, { h: 'Change', f: (h) => `<span class="mono small">${h[2]}</span>` }], k.hist) : '<div class="empty-note">No changes in the last 90 days.</div>'}</div></section>
        </div>
      </div>`;
    },
    mount(root) {
      root.querySelectorAll('[data-cfg]').forEach((b) => (b.onclick = () => { cfgSel = +b.dataset.cfg; CP.render(); }));
      root.querySelector('#cfg-q').oninput = (e) => {
        const v = e.target.value.toLowerCase();
        root.querySelectorAll('[data-cfg]').forEach((b) => (b.hidden = !b.textContent.toLowerCase().includes(v)));
      };
      root.querySelector('#cfg-save').onclick = () => CP.toast(`Override saved for ${CP.scopeLabel()}. Pending approval by a country admin.`);
      root.querySelector('#cfg-clear').onclick = () => CP.toast('Override removed. Value now inherits from the parent level.');
    },
  };

  /* ================= Store rollout ================= */
  S.rollout = {
    render() {
      const waves = [
        ['Pilot', 'DE-BER-012, DE-ING-301, US-NYC-001', 3, '02 Sep', 100, 'Completed'],
        ['Wave 1 · NAM', 'US full-price stores', 41, '06 Oct', 78, 'In progress'],
        ['Wave 2 · EMEA', 'DE, AT, FR, GB, CH', 65, '03 Nov', 12, 'Scheduled'],
        ['Wave 3 · APAC', 'JP, AU, SG, IN, MY', 48, '19 Jan', 0, 'Not started'],
        ['Peak freeze', 'No go-lives', 0, '20 Nov – 05 Jan', 0, 'Scheduled'],
      ];
      return `${CP.pageHead({ crumbs: ['Organisation'], title: 'Store rollout', desc: 'Open new stores and migrate existing ones in waves. Clone a template store, adjust what differs, check readiness, then schedule go-live.', actions: `<button class="btn primary" data-toast="Go-live scheduled for NL-AMS-001 on 03 Nov">${I('rocket')}Schedule go-live</button>` })}
      <section class="panel"><div class="panel-h"><h2>New store from template</h2><span class="sub">NL-AMS-001 · Kalverstraat</span></div>
        <div class="steps">${[['1', 'Template', 'done'], ['2', 'Identity & address', 'done'], ['3', 'Devices & payments', 'now'], ['4', 'Tax & fiscal', ''], ['5', 'Review & go-live', '']].map(([n, t, s]) => `<div class="st ${s}"><b>STEP ${n}</b>${t}</div>`).join('')}</div>
        <div class="panel-b grid g2">
          <div class="stack">
            <div class="field"><label for="ro-tpl">Cloned from</label><select class="input" id="ro-tpl"><option>DE-BER-012 · KaDeWe Concession (Atlas Time, Full price)</option><option>FR-PAR-001 · Champs-Élysées</option></select><span class="hint">Copies 186 settings, receipt template, printer layout and device profile. Address, tax IDs and fiscal registration are never copied.</span></div>
            <div class="form-grid">
              <div class="field"><label for="ro-dev">POS devices</label><input class="input" id="ro-dev" value="4 × iPhone 15 + sled"></div>
              <div class="field"><label for="ro-term">Adyen terminals</label><input class="input" id="ro-term" value="4 × S1F2 (auto-assign POIID)"></div>
              <div class="field"><label for="ro-merch">Merchant account</label><select class="input" id="ro-merch"><option>AtlasTime_NL_POS</option><option>Create new in Adyen</option></select></div>
              <div class="field"><label for="ro-mdm">MDM profile</label><select class="input" id="ro-mdm"><option>Jamf · EMEA-POS-iOS</option></select></div>
            </div>
            <div class="row"><button class="btn">Back</button><span class="spacer"></span><button class="btn primary" data-toast="Saved. Next: Tax & fiscal">Continue</button></div>
          </div>
          <div class="panel" style="background:var(--surface-2)"><div class="panel-h"><h3>Go-live readiness</h3><span class="sub">9 of 12</span></div>
            <div class="list">${[['Store profile & address', 1], ['Price list assigned (FULL-NL)', 1], ['Tax: NL VAT 21% / 9%', 1], ['Receipt template & legal text (nl-NL)', 1], ['Users provisioned via SCIM (6)', 1], ['Adyen merchant & store created', 1], ['Devices enrolled (0 / 4)', 0], ['Printer paired', 0], ['Fluent location & inventory synced', 1], ['SAP site mapping', 1], ['Test transaction + refund in pilot mode', 0], ['Opening float set (€300)', 1]].map(([t, ok]) => `<div class="list-item" style="padding:8px 16px"><span style="color:${ok ? 'var(--good)' : 'var(--fg-3)'}">${ok ? '●' : '○'}</span><div class="grow small">${t}</div></div>`).join('')}</div></div>
        </div></section>
      <section class="panel"><div class="panel-h"><h2>Migration waves</h2><span class="sub">From the legacy POS, with the canonical TLOG accepted from both systems during coexistence</span></div>
        <div class="panel-b flush">${CP.table([{ h: 'Wave', f: (w) => `<b>${w[0]}</b>` }, { h: 'Stores', f: (w) => `${w[1]}<div class="cell-sub">${w[2] ? w[2] + ' stores' : ''}</div>` }, { h: 'Go-live', f: (w) => w[3] }, { h: 'Progress', f: (w) => `<div class="meter" style="width:140px" data-tip="${w[4]}% stores live"><i style="width:${w[4]}%"></i></div>` }, { h: 'Status', f: (w) => B(w[5]) }], waves)}</div></section>`;
    },
  };

  /* ================= Products ================= */
  S.products = {
    render() {
      const list = D.products.filter((p) => !CP.scope.brand || p.brand === CP.scope.brand);
      return `${CP.pageHead({ crumbs: ['Catalogue & pricing'], title: 'Products', desc: 'Read-only article master synced from SAP / PIM. Core POS adds what the till needs on top: tax class, POS flags, searchable attributes and the offline catalogue package.', actions: `<button class="btn" data-toast="Delta sync from SAP started">${I('refresh')}Sync now</button><button class="btn" data-toast="Offline package v8813 queued for 205 stores">Rebuild offline package</button>` })}
      <div class="grid g4">
        ${[['Active SKUs', '48,210'], ['Last SAP delta', '06:02 UTC · 1,118 changes'], ['Search index', 'Healthy · 41 ms p95'], ['Missing tax class', '3 SKUs']].map(([a, b]) => `<div class="panel kpi"><div class="eyebrow">${a}</div><div style="font-weight:650">${b}</div></div>`).join('')}
      </div>
      <section class="panel"><div class="toolbar"><input class="input" placeholder="Search SKU, EAN, style or name" aria-label="Search products" style="flex:1;min-width:200px">
        <select class="input" aria-label="Category"><option>All categories</option><option>Watches</option><option>Leather</option><option>Services</option><option>Gift cards</option></select>
        <select class="input" aria-label="Status"><option>Active</option><option>Discontinued</option></select></div>
        <div class="panel-b flush">${CP.table([
          { h: 'SKU', f: (p) => `<b class="mono">${p.sku}</b>` },
          { h: 'Product', f: (p) => `${E(p.name)}<div class="cell-sub">${p.cat}</div>` },
          { h: 'Brand', f: (p) => CP.brand(p.brand).name },
          { h: 'EAN / UPC', f: (p) => `<span class="mono small">${p.ean}</span>` },
          { h: 'Tax class', f: (p) => `<span class="tag">${p.taxClass}</span>` },
          { h: 'Status', f: (p) => B(p.status, p.status === 'Active' ? 'good' : 'info') },
        ], list, { rowAttr: (p) => `class="click" data-sku="${p.sku}" tabindex="0"` })}</div></section>`;
    },
    mount(root) {
      root.querySelectorAll('tr[data-sku]').forEach((tr) => (tr.onclick = () => {
        const p = D.products.find((x) => x.sku === tr.dataset.sku);
        CP.drawer({ title: p.name, sub: p.sku + ' · ' + CP.brand(p.brand).name, body: `
          <dl class="kv"><dt>Source</dt><dd>SAP S/4HANA article ${p.sku.replace(/\D/g, '')} (read-only)</dd><dt>Category</dt><dd>${p.cat}</dd><dt>EAN</dt><dd class="mono">${p.ean}</dd><dt>Attributes</dt><dd>Case 42 mm · Steel · Quartz · Men</dd></dl>
          <div class="stack"><h3>Tax class by country</h3>${CP.table([{ h: 'Country', f: (r) => CP.flag(r[0]) + ' ' + r[0] }, { h: 'Tax class', f: (r) => `<select class="input" aria-label="Tax class ${r[0]}"><option>${r[1]}</option><option>Reduced</option><option>Exempt</option></select>` }, { h: 'Code', f: (r) => `<span class="mono small">${r[2]}</span>` }], [['US', p.taxClass, 'Avalara PC040144'], ['DE', p.taxClass, '19%'], ['IN', p.taxClass, 'HSN 9102'], ['JP', p.taxClass, '10%']])}</div>
          <div class="stack"><h3>POS behaviour</h3>${[['Allow manual price override', true], ['Requires serial number capture', p.cat.startsWith('Watches')], ['Eligible for engraving', p.cat.startsWith('Watches')], ['Returnable', !p.cat.startsWith('Gift')]].map(([t, on], i) => `<label class="row">${CP.switch('pf' + i, on, t)}<span>${t}</span></label>`).join('')}</div>
          <div class="stack"><h3>Availability (Fluent)</h3>${CP.table([{ h: 'Location', f: (r) => r[0] }, { h: 'On hand', r: 1, f: (r) => r[1] }, { h: 'ATS', r: 1, f: (r) => r[2] }], [['DE-BER-012', 4, 3], ['DE-MUC-004', 1, 1], ['DC Frankfurt', 312, 288]])}</div>`,
          foot: `<button class="btn" data-go="pricing">View prices</button><button class="btn primary" data-close>Save POS settings</button>`,
          mount: (d) => d.querySelectorAll('[data-close]').forEach((x) => (x.onclick = () => { CP.closeOverlay(); CP.toast('POS settings saved'); })) });
      }));
    },
  };

  /* ================= Price lists ================= */
  S.pricing = {
    render() {
      const lists = [
        ['PL-US-FULL', 'US', 'USD', 'Full price', 'FULL-US (52 stores)', 'Active'], ['PL-US-OUT', 'US', 'USD', 'Outlet', 'OUTLET-US (12 stores)', 'Active'],
        ['PL-DE-FULL', 'DE', 'EUR', 'Full price', 'FULL-DE (16)', 'Active'], ['PL-EU-FULL-W44', 'DE, FR, AT, ES, IT', 'EUR', 'Full price', '5 clusters', 'Scheduled'],
        ['PL-GB-FULL', 'GB', 'GBP', 'Full price', 'FULL-GB (18)', 'Active'], ['PL-JP-FULL-2026W42', 'JP', 'JPY', 'Full price', 'FULL-JP (14)', 'Active'], ['PL-IN-FULL', 'IN', 'INR', 'Full price', 'FULL-IN (12)', 'Active'],
      ].filter((l) => !CP.scope.country || l[1].includes(CP.scope.country));
      const rows = D.prices.filter((p) => CP.countriesInScope().some((c) => c.id === p.country));
      return `${CP.pageHead({ crumbs: ['Catalogue & pricing'], title: 'Price lists', desc: 'Prices per country, currency and concept, assigned to store clusters. Changes are staged with an effective date and activate at midnight in each store’s own time zone.', actions: `<button class="btn" id="urgent">${I('play')}Push urgent price change</button><button class="btn primary" data-toast="Price list draft created">${I('plus')}New price list</button>` })}
      <section class="panel"><div class="panel-h"><h2>Price matrix</h2><span class="sub">ATL-W-40221 · Meridian Chronograph 42mm</span><div class="actions"><input class="input mono" value="ATL-W-40221" aria-label="SKU" style="width:150px"></div></div>
        <div class="panel-b flush">${CP.table([
          { h: 'Country', f: (p) => `${CP.flag(p.country)} ${CP.country(p.country).name}` }, { h: 'Concept', f: (p) => p.concept },
          { h: 'List price', r: 1, f: (p) => `<b class="num">${p.list}</b>` }, { h: 'Promo price', r: 1, f: (p) => `<span class="num">${p.promo}</span>` },
          { h: 'Next change', f: (p) => p.next === '—' ? '<span class="muted">—</span>' : `<span class="badge warn">${p.next}</span>` }, { h: 'Tax', f: (p) => `<span class="tag">${p.tax}</span>` },
        ], rows)}</div><div class="empty-note">Store and corporate users see the same matrix, filtered by their access scope.</div></section>
      <section class="panel"><div class="panel-h"><h2>Price lists</h2></div><div class="panel-b flush">${CP.table([
        { h: 'Price list', f: (l) => `<b class="mono">${l[0]}</b>` }, { h: 'Countries', f: (l) => l[1] }, { h: 'Currency', f: (l) => l[2] }, { h: 'Concept', f: (l) => l[3] }, { h: 'Assigned to', f: (l) => l[4] }, { h: 'Status', f: (l) => B(l[5]) },
      ], lists)}</div></section>`;
    },
    mount(root) {
      root.querySelector('#urgent').onclick = () => CP.confirm({ title: 'Push urgent price change?', body: 'Devices in the selected scope receive a silent push and pull the price delta within 5 minutes. Use this only for errors, recalls or legal corrections.', confirm: 'Push to devices', onConfirm: () => CP.toast('Urgent price delta pushed to ' + CP.scopeLabel()) });
    },
  };

  /* ================= Promotions ================= */
  S.promotions = {
    render() {
      return `${CP.pageHead({ crumbs: ['Catalogue & pricing'], title: 'Promotions', scoped: false, desc: 'Automatic promotions, coupons, bundles and employee discounts with stacking rules and best-deal resolution. Promotions can also come from SAP or an external engine such as Talon.One.', actions: `<button class="btn" data-toast="5,000 unique codes generated for WELCOME15">Generate coupon codes</button><button class="btn primary" id="new-promo">${I('plus')}New promotion</button>` })}
      <section class="panel"><div class="toolbar"><div class="chips" data-chips><button class="chip on">All</button><button class="chip">Live</button><button class="chip">Scheduled</button><button class="chip">Draft</button><button class="chip">Paused</button></div></div>
        <div class="panel-b flush">${CP.table([
          { h: 'Promotion', f: (p) => `<b>${E(p.name)}</b><div class="cell-sub mono">${p.id}</div>` }, { h: 'Type', f: (p) => p.type }, { h: 'Applies to', f: (p) => p.scope },
          { h: 'Dates', f: (p) => `${p.start} – ${p.end}` }, { h: 'Stacking', f: (p) => `<span class="tag">${p.stack}</span>` }, { h: 'Redemptions', r: 1, f: (p) => p.redemptions }, { h: 'Status', f: (p) => B(p.status) },
        ], D.promotions, { rowAttr: () => 'class="click" data-promo tabindex="0"' })}</div></section>`;
    },
    mount(root) {
      const open = () => promoDrawer();
      root.querySelector('#new-promo').onclick = open;
      root.querySelectorAll('[data-promo]').forEach((r) => (r.onclick = open));
    },
  };
  function promoDrawer() {
    CP.drawer({ title: 'New promotion', sub: 'Promotion builder', body: `
      <div class="field"><label for="pm-name">Name</label><input class="input" id="pm-name" value="Holiday gifting · 20% off leather"></div>
      <div class="field"><label>Type</label><div class="chips" data-chips id="pm-type">${['% off', 'Amount off', 'Fixed price', 'Buy X get Y', 'Bundle', 'Tiered spend', 'Gift with purchase'].map((t, i) => `<button class="chip ${i ? '' : 'on'}" data-v="${t}">${t}</button>`).join('')}</div></div>
      <div class="form-grid">
        <div class="field"><label for="pm-val">Discount</label><input class="input mono" id="pm-val" value="20"></div>
        <div class="field"><label for="pm-target">Applies to</label><select class="input" id="pm-target"><option>Category: Leather › Bags</option><option>Whole basket</option><option>SKU list (upload)</option></select></div>
        <div class="field"><label for="pm-scope">Where</label><select class="input" id="pm-scope"><option>NAM · Kestrel · all stores</option><option>${E(CP.scopeLabel())}</option></select></div>
        <div class="field"><label for="pm-seg">Customer segment</label><select class="input" id="pm-seg"><option>Everyone</option><option>Loyalty Gold+</option><option>Employees</option></select></div>
        <div class="field"><label for="pm-start">Starts (store local time)</label><input class="input mono" id="pm-start" value="2026-11-24 00:00"></div>
        <div class="field"><label for="pm-end">Ends</label><input class="input mono" id="pm-end" value="2026-12-02 23:59"></div>
        <div class="field"><label for="pm-stack">Stacking</label><select class="input" id="pm-stack"><option>Exclusive</option><option>Stackable</option><option>Best deal wins</option></select></div>
        <div class="field"><label for="pm-coupon">Coupon</label><select class="input" id="pm-coupon"><option>No coupon (automatic)</option><option>Single shared code</option><option>Unique codes (one use each)</option></select></div>
        <div class="field"><label for="pm-max">Max uses per customer</label><input class="input mono" id="pm-max" value="Unlimited"></div>
        <div class="field"><label for="pm-sap">Post to SAP as</label><select class="input" id="pm-sap"><option>Condition type ZPRO</option></select></div>
      </div>
      <div class="callout"><div id="pm-summary"></div></div>
      <div class="stack"><h3>Simulate</h3><div class="code">Harbour Tote, cognac   USD 495.00
  − Holiday gifting 20%   USD  99.00
Bifold Wallet RFID     USD 129.00   (not eligible: Small goods)
Subtotal               USD 525.00   + sales tax via Avalara</div></div>`,
      foot: `<button class="btn" data-close>Cancel</button><button class="btn" id="pm-draft">Save draft</button><button class="btn primary" id="pm-sched">Schedule</button>`,
      mount(d) {
        const sum = () => {
          const t = d.querySelector('#pm-type .chip.on').dataset.v;
          d.querySelector('#pm-summary').innerHTML = `<b>${t === '% off' ? d.querySelector('#pm-val').value + '% off' : t}</b> ${d.querySelector('#pm-target').value.toLowerCase()} for ${d.querySelector('#pm-seg').value.toLowerCase()} in ${E(d.querySelector('#pm-scope').value)}, ${d.querySelector('#pm-start').value} → ${d.querySelector('#pm-end').value}. ${d.querySelector('#pm-stack').value}.`;
        };
        d.querySelectorAll('input, select').forEach((x) => x.addEventListener('input', sum));
        d.querySelector('#pm-type').addEventListener('chips', sum);
        sum();
        d.querySelector('[data-close]').onclick = CP.closeOverlay;
        d.querySelector('#pm-draft').onclick = () => { CP.closeOverlay(); CP.toast('Promotion saved as draft'); };
        d.querySelector('#pm-sched').onclick = () => { CP.closeOverlay(); CP.toast('Promotion scheduled. Included in tonight’s offline package.'); };
      },
    });
  }
})();
