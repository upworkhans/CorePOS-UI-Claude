/* Screens: Devices, Business day & cash, Releases & flags, Integration hub,
   Events & webhooks, Reports, Reconciliation, Users & roles, Audit log, Security & SSO. */
(function () {
  const D = CP.data, S = CP.screens, I = CP.icon, B = CP.badge, E = CP.esc;
  const storeIn = (code) => CP.inScope(D.stores.find((s) => s.code === code));

  /* ================= Devices ================= */
  S.devices = {
    render() {
      const list = D.devices.filter((d) => storeIn(d.store));
      const vers = [['4.12.1', 1188, 'var(--s1)'], ['4.11.0', 236, 'var(--s3)'], ['4.10.x', 7, 'var(--bad)']];
      const tot = vers.reduce((a, v) => a + v[1], 0);
      return `${CP.pageHead({ crumbs: ['Operations'], title: 'Devices', desc: 'Every POS device, terminal and printer: which store it belongs to, its app version, payment terminal, battery and last sync. Enrolment is zero-touch through your MDM.', actions: `<button class="btn" data-toast="Enrolment QR generated for ${E(CP.scopeLabel())}">Enrolment QR</button><button class="btn primary" data-toast="Sync requested on devices in scope">${I('refresh')}Force sync</button>` })}
      <div class="grid g4">${[['Registered', '1,431'], ['Online now', '1,402'], ['Below min. version', '7'], ['Low battery (<25%)', '19']].map(([a, b]) => `<div class="panel kpi"><div class="eyebrow">${a}</div><div class="v">${b}</div></div>`).join('')}</div>
      <section class="panel"><div class="panel-h"><h2>App versions</h2><span class="sub">N and N-1 supported · minimum 4.11.0</span></div><div class="panel-b stack">
        <div class="bar" style="height:16px">${vers.map((v) => `<i style="width:${(v[1] / tot) * 100}%;background:${v[2]};border-radius:4px" data-tip="<b>${v[0]}</b><br>${v[1]} devices"></i>`).join('')}</div>
        <div class="legend">${vers.map((v) => `<span><i style="background:${v[2]}"></i>${v[0]} · ${v[1]}</span>`).join('')}</div></div></section>
      <section class="panel"><div class="toolbar"><div class="chips" data-chips><button class="chip on">All</button><button class="chip">Offline</button><button class="chip">Needs update</button><button class="chip">Low battery</button></div><span class="spacer"></span><input class="input" placeholder="Device, serial or terminal POIID" aria-label="Search devices" style="width:240px"></div>
        <div class="panel-b flush">${CP.table([
          { h: 'Device', f: (d) => `<b class="mono">${d.id}</b><div class="cell-sub">${d.model} · ${d.os}</div>` }, { h: 'Store', f: (d) => `<span class="mono small">${d.store}</span>` },
          { h: 'App', f: (d) => `<span class="tag">${d.app}</span>` }, { h: 'Terminal (POIID)', f: (d) => `<span class="mono small">${d.poiid}</span>` }, { h: 'Printer', f: (d) => `<span class="small">${d.printer}</span>` },
          { h: 'Battery', r: 1, f: (d) => `<span class="num ${d.battery < 25 ? 'down' : ''}">${d.battery}%</span>` }, { h: 'Last sync', r: 1, f: (d) => `<span class="mono">${d.sync}</span>` }, { h: 'State', f: (d) => B(d.state) },
        ], list, { rowAttr: (d) => `class="click" data-dev="${d.id}" tabindex="0"` })}</div>
        ${list.length ? '' : '<div class="empty-note">No sample devices in this scope.</div>'}</section>`;
    },
    mount(root) {
      root.querySelectorAll('[data-dev]').forEach((tr) => (tr.onclick = () => {
        const d = D.devices.find((x) => x.id === tr.dataset.dev);
        CP.drawer({ title: d.id, sub: `${d.store} · ${d.model}`, body: `
          <div class="row">${B(d.state)}<span class="small muted">Last sync ${d.sync} ago</span></div>
          <dl class="kv"><dt>Operating system</dt><dd>${d.os}</dd><dt>Core POS app</dt><dd>${d.app}</dd><dt>MDM</dt><dd>${d.os.startsWith('Android') ? 'Microsoft Intune' : 'Jamf Pro'} · supervised</dd><dt>Device certificate</dt><dd class="mono small">mTLS · expires 2027-03-02</dd><dt>Payment terminal</dt><dd class="mono">${d.poiid}</dd><dt>Printer</dt><dd>${d.printer}</dd><dt>Offline queue</dt><dd>${d.state === 'Offline' ? '22 transactions' : '0'}</dd><dt>Number block</dt><dd class="mono">004001–005000 · 118 left</dd><dt>Signed-in associate</dt><dd>#1182 (PIN)</dd></dl>
          <div class="stack"><h3>Telemetry · last 24 h</h3><div class="panel" style="padding:10px 12px">${CP.spark([82, 80, 76, 70, 66, 61, 100, 98, 95, 91, 86, d.battery], 'var(--accent)')}<div class="small muted">Battery %</div></div></div>`,
          foot: `<button class="btn danger" id="wipe">Remote wipe</button><span class="spacer"></span><button class="btn" data-toast="Associate signed out">Sign out user</button><button class="btn" data-toast="Lock command sent through MDM">Lock</button><button class="btn primary" data-toast="Sync requested">${I('refresh')}Force sync</button>`,
          mount: (dr) => { dr.querySelector('#wipe').onclick = () => CP.confirm({ title: `Wipe ${d.id}?`, body: 'The device is erased through MDM. Unsynced transactions on it will be lost if it is offline. This cannot be undone.', confirm: 'Wipe device', danger: true, onConfirm: () => CP.toast('Wipe command queued for ' + d.id) }); } });
      }));
    },
  };

  /* ================= Business day & cash ================= */
  S.cash = {
    render() {
      const list = D.stores.filter(CP.inScope);
      const os = (s) => ({ 'DE-MUC-004': '−€4.20', 'US-DAL-014': '+$1.00', 'JP-TYO-011': '¥0', 'AU-SYD-002': '−A$0.05' }[s.code] || (s.day === 'Z-closed' ? '0.00' : '—'));
      return `${CP.pageHead({ crumbs: ['Operations'], title: 'Business day & cash', desc: 'Opening, trading and closing by store in local time. Drawer sessions, cash pickups, X reports and Z-close with over/short, all posted to SAP.', actions: `<button class="btn" data-toast="Cash report exported">${I('download')}Cash report</button>` })}
      <div class="grid g4">${[['Open', list.filter((s) => s.day === 'Open').length], ['Closing', list.filter((s) => s.day === 'Closing').length], ['Z-closed', list.filter((s) => s.day === 'Z-closed').length], ['Over/short alerts', 2]].map(([a, b]) => `<div class="panel kpi"><div class="eyebrow">${a}</div><div class="v">${b}</div></div>`).join('')}</div>
      <div class="grid g-2-1">
        <section class="panel"><div class="panel-b flush">${CP.table([
          { h: 'Store', f: (s) => `<b class="mono">${s.code}</b><div class="cell-sub">${s.tz}</div>` }, { h: 'Business day', f: (s) => B(s.day, s.day === 'Open' ? 'good' : s.day === 'Closing' ? 'warn' : 'info') },
          { h: 'Drawers', r: 1, f: (s) => Math.max(1, Math.round(s.devices / 3)) }, { h: 'Net sales', r: 1, f: (s) => `<span class="num">${CP.money(s)}</span>` }, { h: 'Over / short', r: 1, f: (s) => `<span class="num ${os(s).startsWith('−') ? 'down' : ''}">${os(s)}</span>` },
          { h: 'SAP', f: (s) => (s.day === 'Z-closed' ? B('Posted') : '<span class="muted small">After Z</span>') },
        ], list)}</div></section>
        <section class="panel"><div class="panel-h"><h2>Z-close · JP-TYO-011</h2><span class="sub">12 Oct · Drawer 1</span></div><div class="panel-b stack">
          ${CP.table([{ h: 'Denomination', f: (r) => r[0] }, { h: 'Count', r: 1, f: (r) => r[1] }, { h: 'Value', r: 1, f: (r) => r[2] }], [['¥10,000', 14, '¥140,000'], ['¥5,000', 6, '¥30,000'], ['¥1,000', 22, '¥22,000'], ['¥500', 9, '¥4,500'], ['¥100', 31, '¥3,100'], ['Coins < ¥100', '—', '¥840']])}
          <dl class="kv"><dt>Expected</dt><dd class="num">¥200,440</dd><dt>Counted</dt><dd class="num">¥200,440</dd><dt>Over / short</dt><dd class="num up">¥0</dd><dt>Bank deposit</dt><dd>¥150,000 · bag #JP11-2041</dd><dt>Float for tomorrow</dt><dd>¥50,440</dd></dl></div></section>
      </div>
      <section class="panel"><div class="panel-h"><h2>Cash rules</h2></div><div class="panel-b grid g3">
        ${[['Blind count at close', true], ['Manager approval for no-sale drawer open', true], ['Pickup prompt when drawer exceeds limit', true], ['Auto Z-close at 03:00 if not closed', true], ['Allow paid-out without receipt', false], ['Over/short tolerance', '±1.00 local']].map(([t, v], i) => typeof v === 'boolean' ? `<label class="row">${CP.switch('cr' + i, v, t)}<span class="small">${t}</span></label>` : `<div class="field"><label for="cr${i}">${t}</label><input class="input mono" id="cr${i}" value="${v}"></div>`).join('')}</div></section>`;
    },
  };

  /* ================= Releases & feature flags ================= */
  S.releases = {
    render() {
      return `${CP.pageHead({ crumbs: ['Operations'], title: 'Releases & flags', desc: 'Roll out app versions in rings and switch features on by country, store, device group or user group. New features ship switched off.', scoped: false, actions: `<button class="btn primary" data-toast="Feature flag created (off everywhere)">${I('plus')}New flag</button>` })}
      <section class="panel"><div class="panel-h"><h2>POS app 4.13.0</h2>${B('In progress')}<span class="sub">Ring 2 of 4 · paused automatically if crash rate > 0.5%</span></div>
        <div class="steps">${[['Ring 0', 'Internal & lab devices', 'done'], ['Ring 1', 'Pilot stores (3)', 'done'], ['Ring 2', '10% · NAM', 'now'], ['Ring 3', 'All regions', '']].map(([a, b, s]) => `<div class="st ${s}"><b>${a}</b>${b}</div>`).join('')}</div>
        <div class="panel-b row"><span class="small muted">Crash-free sessions 99.86% · median checkout 31 s (−2 s)</span><span class="spacer"></span><button class="btn sm" data-toast="Rollout paused">Pause</button><button class="btn sm primary" data-toast="Promoted to Ring 3">Promote to next ring</button></div></section>
      <section class="panel"><div class="panel-h"><h2>Feature flags</h2></div><div class="panel-b flush">${CP.table([
        { h: 'Feature', f: (f) => `<b>${f.name}</b><div class="cell-sub mono">${f.key}</div>` }, { h: 'Targeting', f: (f) => f.target }, { h: 'Rollout', f: (f) => `<div class="row" style="gap:8px"><div class="meter" style="width:90px"><i style="width:${f.pct}%"></i></div><span class="mono small">${f.pct}%</span></div>` },
        { h: 'State', f: (f) => B(f.state) }, { h: 'On', f: (f, i) => CP.switch('ff' + i, f.state !== 'Off', f.name) },
      ], D.flags)}</div></section>
      <section class="panel"><div class="panel-h"><h2>Environments</h2></div><div class="panel-b flush">${CP.table([{ h: 'Environment', f: (r) => `<b>${r[0]}</b>` }, { h: 'Backend', f: (r) => `<span class="tag">${r[1]}</span>` }, { h: 'Connected to', f: (r) => r[2] }, { h: 'Status', f: (r) => B(r[3]) }],
        [['Production · EU', '2026.10.3', 'Live acquirer, live fiscal', 'Healthy'], ['Production · US', '2026.10.3', 'Live', 'Healthy'], ['Production · APAC', '2026.10.3', 'Live', 'Healthy'], ['UAT', '2026.11.0-rc2', 'Adyen test, fiskaly test', 'Healthy'], ['QA', '2026.11.0-rc3', 'Mocks + sandboxes', 'Healthy'], ['Training', '2026.10.3', 'Training mode, no fiscal', 'Healthy']])}</div></section>`;
    },
    mount(root) { root.querySelectorAll('[id^="ff"]').forEach((x) => (x.onchange = () => CP.toast(x.checked ? 'Flag switched on for its targets' : 'Flag switched off everywhere'))); },
  };

  /* ================= Integration hub ================= */
  let intCat = 'All';
  S.integrations = {
    render() {
      const cats = ['All', ...new Set(D.integrations.map((i) => i.cat))];
      const list = D.integrations.filter((i) => intCat === 'All' || i.cat === intCat);
      const k = (s) => (s === 'Connected' ? 'good' : s === 'Degraded' ? 'warn' : s === 'Error' ? 'bad' : 'info');
      return `${CP.pageHead({ crumbs: ['Integrations'], title: 'Integration hub', desc: 'Every third-party service Core POS talks to. Connect a provider once, then assign it to the regions, countries, brands or stores that should use it. Swap a provider without changing the till.', scoped: false, actions: `<button class="btn" data-go="events">${I('activity')}Events & webhooks</button><button class="btn primary" data-toast="Custom connector template created">${I('plus')}Custom connector</button>` })}
      <div class="grid g4">${[['Connected', D.integrations.filter((i) => i.status === 'Connected').length], ['Needs attention', D.integrations.filter((i) => ['Degraded', 'Error'].includes(i.status)).length], ['Available', D.integrations.filter((i) => i.status === 'Available').length], ['Events today', '717k']].map(([a, b]) => `<div class="panel kpi"><div class="eyebrow">${a}</div><div class="v">${b}</div></div>`).join('')}</div>
      <div class="chips" data-chips id="int-cats">${cats.map((c) => `<button class="chip ${c === intCat ? 'on' : ''}" data-v="${c}">${c}</button>`).join('')}</div>
      <div class="grid g3">${list.map((i) => `<article class="panel int-card" data-int="${i.id}" tabindex="0">
        <div class="row" style="gap:12px;flex-wrap:nowrap"><div class="int-logo">${i.name.slice(0, 2)}</div><div style="min-width:0;flex:1"><h3>${i.name}</h3><div class="small muted">${i.cat}</div></div>${B(i.status, k(i.status))}</div>
        <p>${i.desc}</p>
        <div class="row small" style="justify-content:space-between;border-top:1px solid var(--line);padding-top:10px"><span class="muted">${I('tree').replace('<svg', '<svg width="13" height="13" style="vertical-align:-2px"')} ${i.scope}</span>${i.health ? `<span class="mono">${i.health}%</span>` : ''}</div>
      </article>`).join('')}</div>`;
    },
    mount(root) {
      root.querySelector('#int-cats').addEventListener('chips', (e) => { intCat = e.detail; CP.render(); });
      root.querySelectorAll('[data-int]').forEach((c) => { const go = () => intDrawer(D.integrations.find((i) => i.id === c.dataset.int)); c.onclick = go; c.onkeydown = (e) => e.key === 'Enter' && go(); });
    },
  };
  function intDrawer(i) {
    const avail = i.status === 'Available';
    const creds = {
      adyen: [['API key', '••••••••••••AQEyhmfxK4'], ['Company account', 'AtlasRetailGroup'], ['HMAC key (webhooks)', '••••••••3F9A'], ['Live endpoint prefix', 'a1b2c3-AtlasRetail']],
      stripe: [['Secret key', 'sk_live_••••••••Wq7'], ['Location IDs', 'tml_3 locations']],
      avalara: [['Account ID', '2000183344'], ['License key', '••••••••••••8E1D'], ['Company codes', 'ATLAS-US, ATLAS-CA']],
      vertex: [['Client ID', ''], ['Client secret', ''], ['Trusted ID', '']],
      fiskaly: [['API key', 'test_••••••••x91'], ['API secret', '••••••••••••'], ['Organisation', 'Atlas Retail DE GmbH']],
      sap: [['Middleware', 'SAP Integration Suite'], ['OData endpoint', 'https://s4.atlas-retail.example/sap/opu/odata'], ['TLOG format', 'POSDM / CAR compatible']],
    }[i.id] || [['Endpoint', 'https://api.' + i.id + '.example'], ['Client ID', avail ? '' : 'corepos-prod'], ['Client secret', avail ? '' : '••••••••••••']];
    const scopeRows = D.regions.map((r) => ({ r, cs: D.countries.filter((c) => c.region === r.id) }));
    const assigned = (c) => i.scope.startsWith('Global') || i.scope.includes(c.id) || i.scope.split(/[ ,›·]+/).includes(c.region) && !i.scope.includes('›');
    const events = { adyen: ['TransactionCompleted', 'RefundRequested', 'GiftCardActivated'], avalara: ['TaxQuoteRequested', 'TransactionCompleted → commit', 'ReturnCompleted → adjust'], fluent: ['InventoryDelta', 'OrderCreated', 'FulfilmentTaskUpdated'], sap: ['TransactionCompleted (TLOG)', 'StoreDayClosed', 'CashDeposited'] }[i.id] || ['TransactionCompleted', 'CustomerUpdated'];
    CP.drawer({
      title: i.name, sub: i.cat,
      body: `<div class="row">${B(i.status)}${i.health ? `<span class="small muted">Availability 30 d <b class="mono">${i.health}%</b>${i.latency ? ` · p95 <b class="mono">${i.latency} ms</b>` : ''} · ${i.events}</span>` : ''}</div>
        <p class="small" style="color:var(--fg-2)">${i.desc}</p>
        ${i.status === 'Error' ? '<div class="callout warn"><div><b>OAuth token expired at 06:00 CT.</b> Re-authorise the connection to resume the hourly import. Missed hours are back-filled automatically.</div></div>' : ''}
        ${i.status === 'Degraded' ? '<div class="callout warn"><div><b>1 of 9 RT servers unreachable</b> (IT-MIL-005). Other Italian stores are unaffected.</div></div>' : ''}
        <div data-tabhost><div class="tabs" data-tabs>${['Connection', 'Where it applies', 'Mapping', 'Events', 'Logs'].map((t, n) => `<button data-tab="${n}" class="${n ? '' : 'on'}">${t}</button>`).join('')}</div>
          <div data-pane="0" class="stack" style="padding-top:16px">
            <div class="field"><label for="ic-env">Environment</label><div class="chips" data-chips id="ic-env"><button class="chip ${avail ? '' : 'on'}">Live</button><button class="chip ${avail ? 'on' : ''}">Sandbox</button></div></div>
            ${creds.map(([k, v], n) => `<div class="field"><label for="ic-${n}">${k}</label><input class="input mono" id="ic-${n}" value="${E(v)}" placeholder="Required"></div>`).join('')}
            <div class="field"><label for="ic-timeout">Timeout and fallback</label><select class="input" id="ic-timeout"><option>${i.cat === 'Tax' ? '800 ms → cached rates, commit on sync' : i.cat === 'Payments' ? '60 s → check status before retry' : '5 s → queue and retry with backoff (24 h)'}</option></select></div>
            <div class="small muted">Secrets are stored in the vault and never shown again after saving. Rotation reminder every 90 days.</div>
          </div>
          <div data-pane="1" hidden class="stack" style="padding-top:16px">
            <div class="small" style="color:var(--fg-2)">Choose where this connection is used. A lower level can point to a different account of the same provider (for example one Avalara company code per country).</div>
            ${scopeRows.map(({ r, cs }) => `<div class="panel" style="padding:10px 12px"><label class="row" style="font-weight:650"><input type="checkbox" ${cs.every(assigned) ? 'checked' : ''} aria-label="${r.id}"> ${r.id} <span class="muted small" style="font-weight:400">${r.name}</span></label>
              <div class="chips" style="margin:8px 0 0 22px">${cs.map((c) => `<label class="chip ${assigned(c) ? 'on' : ''}" style="display:inline-flex;gap:6px;align-items:center"><input type="checkbox" ${assigned(c) ? 'checked' : ''} style="display:none" aria-label="${c.name}">${c.id}</label>`).join('')}</div></div>`).join('')}
            <div class="field"><label for="ic-brand">Brands</label><select class="input" id="ic-brand"><option>All brands</option>${D.brands.map((b) => `<option>${b.name} only</option>`).join('')}</select></div>
          </div>
          <div data-pane="2" hidden class="stack" style="padding-top:16px">
            ${i.cat === 'Tax' ? CP.table([{ h: 'Core POS tax class', f: (r) => r[0] }, { h: `${i.name} code`, f: (r) => `<input class="input mono" value="${r[1]}" aria-label="Code for ${r[0]}" style="width:140px">` }], [['Watches', 'PC040144'], ['Leather goods', 'PC040500'], ['Services (engraving)', 'SR020000'], ['Gift cards', 'PG050000'], ['Shipping', 'FR020100']])
              : i.cat === 'Payments' ? CP.table([{ h: 'Core POS tender', f: (r) => r[0] }, { h: 'Provider payment method', f: (r) => `<span class="mono small">${r[1]}</span>` }], [['Card', 'visa, mc, amex, maestro, cup, jcb'], ['Wallet', 'applepay, googlepay, alipay_hk, wechatpay'], ['Gift card', 'givex, svs'], ['Pay-by-link', 'paybylink']])
              : CP.table([{ h: 'Core POS field', f: (r) => `<span class="mono small">${r[0]}</span>` }, { h: 'Provider field', f: (r) => `<span class="mono small">${r[1]}</span>` }, { h: 'Transform', f: (r) => r[2] }], [['store.code', 'locationRef', 'none'], ['transaction.id', 'externalId', 'none'], ['line.sku', 'productRef', 'upper()'], ['amount.local', 'amount', 'minor units']])}
          </div>
          <div data-pane="3" hidden class="stack" style="padding-top:16px">${events.map((ev) => `<label class="row" style="justify-content:space-between;border-bottom:1px solid var(--line);padding-bottom:8px"><span class="mono small">${ev}</span>${CP.switch('ev' + ev.length, true, ev)}</label>`).join('')}</div>
          <div data-pane="4" hidden style="padding-top:16px"><div class="code">10:14:22.118  POST /v71/payments        200  412 ms  S1F2-000158201
10:14:19.004  POST /v71/payments        200  388 ms  S1F2-000158202
10:13:57.761  GET  /status/svc-88123    200   96 ms  retry check
10:13:41.230  POST /v71/refunds         201  530 ms  referenced
10:12:02.554  WEBHOOK AUTHORISATION     200    8 ms  HMAC ok</div></div>
        </div>`,
      foot: `${avail ? '' : '<button class="btn danger" id="ic-dis">Disconnect</button><span class="spacer"></span>'}<button class="btn" id="ic-test">Test connection</button><button class="btn primary" id="ic-save">${avail ? 'Connect' : i.status === 'Error' ? 'Re-authorise' : 'Save'}</button>`,
      mount(d) {
        d.querySelectorAll('.panel > label.row > input[type=checkbox]').forEach((rc) => (rc.onchange = () => rc.closest('.panel').querySelectorAll('.chip').forEach((ch) => { ch.classList.toggle('on', rc.checked); ch.querySelector('input').checked = rc.checked; })));
        d.querySelectorAll('.chip > input[type=checkbox]').forEach((cb) => (cb.parentElement.onclick = (e) => { e.preventDefault(); cb.checked = !cb.checked; cb.parentElement.classList.toggle('on', cb.checked); }));
        d.querySelector('#ic-test').onclick = () => CP.toast(avail ? 'Enter credentials to test the connection' : `${i.name}: connection OK · ${i.latency || 120} ms`);
        d.querySelector('#ic-save').onclick = () => { CP.closeOverlay(); CP.toast(avail ? `${i.name} connected in sandbox. Assign it to a scope to start using it.` : `${i.name} saved`); };
        const dis = d.querySelector('#ic-dis');
        if (dis) dis.onclick = () => CP.confirm({ title: `Disconnect ${i.name}?`, body: `Stores using it (${E(i.scope)}) fall back to their configured fallback behaviour. Pending messages stay in the queue.`, confirm: 'Disconnect', danger: true, onConfirm: () => CP.toast(i.name + ' disconnected') });
      },
    });
  }

  /* ================= Events & webhooks ================= */
  S.events = {
    render() {
      return `${CP.pageHead({ crumbs: ['Integrations'], title: 'Events & webhooks', desc: 'Domain events published as versioned CloudEvents, webhook subscriptions for your own services, and a console to inspect, fix and replay anything that failed.', scoped: false, actions: `<button class="btn primary" id="new-hook">${I('plus')}New webhook</button>` })}
      <section class="panel" data-tabhost><div class="tabs" data-tabs><button data-tab="dlq" class="on">Failed messages (${D.dlq.length})</button><button data-tab="hooks">Webhooks</button><button data-tab="cat">Event catalogue</button><button data-tab="keys">API clients</button></div>
        <div data-pane="dlq">${CP.table([
          { h: 'Message', f: (m) => `<b class="mono">${m.id}</b><div class="cell-sub">${m.type}</div>` }, { h: 'Destination', f: (m) => `<span class="small">${E(m.target)}</span>` }, { h: 'Store', f: (m) => `<span class="mono small">${m.store}</span>` },
          { h: 'Error', f: (m) => `<span class="small down">${m.err}</span>` }, { h: 'Tries', r: 1, f: (m) => m.tries }, { h: 'Age', r: 1, f: (m) => m.age },
          { h: '', f: (m) => `<div class="row" style="gap:6px;flex-wrap:nowrap"><button class="btn sm" data-insp="${m.id}">Inspect</button><button class="btn sm primary" data-replay="${m.id}">Replay</button></div>` },
        ], D.dlq)}<div class="empty-note">Messages retry with exponential backoff for up to 24 hours before landing here. Replays keep the original idempotency key.</div></div>
        <div data-pane="hooks" hidden>${CP.table([{ h: 'Endpoint', f: (r) => `<span class="mono small">${r[0]}</span>` }, { h: 'Events', f: (r) => r[1] }, { h: 'Auth', f: (r) => `<span class="tag">${r[2]}</span>` }, { h: 'Success 24 h', r: 1, f: (r) => r[3] }, { h: 'Status', f: (r) => B(r[4]) }],
          [['https://hooks.atlas-retail.example/lp', 'ReturnCompleted, TransactionPostVoided', 'HMAC-SHA256', '97.1%', 'Degraded'], ['https://clienteling.atlas-retail.example/events', 'CustomerUpdated, TransactionCompleted', 'OAuth2', '100%', 'Healthy'], ['https://bi.atlas-retail.example/ingest', 'All transaction events', 'mTLS', '99.99%', 'Healthy']])}</div>
        <div data-pane="cat" hidden>${CP.table([{ h: 'Event type', f: (r) => `<b class="mono small">${r[0]}</b>` }, { h: 'Version', f: (r) => `<span class="tag">${r[1]}</span>` }, { h: 'Published when', f: (r) => `<span class="small">${r[2]}</span>` }, { h: 'Subscribers', r: 1, f: (r) => r[3] }],
          [['TransactionCompleted', 'v3', 'A sale, return or exchange is completed', 6], ['TransactionPostVoided', 'v2', 'A completed sale is voided', 3], ['ReturnCompleted', 'v2', 'A return is completed', 4], ['InventoryDelta', 'v2', 'Stock moves at the till', 1], ['CustomerCreated / Updated', 'v2', 'Profile changes', 3], ['ConsentChanged', 'v1', 'Marketing or receipt consent changes', 2], ['StoreDayClosed', 'v1', 'Z-close completes', 2], ['PriceChangeActivated', 'v1', 'A scheduled price becomes active', 1]])}</div>
        <div data-pane="keys" hidden>${CP.table([{ h: 'Client', f: (r) => `<b>${r[0]}</b>` }, { h: 'Client ID', f: (r) => `<span class="mono small">${r[1]}</span>` }, { h: 'Scopes', f: (r) => `<span class="small">${r[2]}</span>` }, { h: 'API', f: (r) => `<span class="tag">${r[3]}</span>` }, { h: 'Last used', f: (r) => r[4] }],
          [['Clienteling app', 'cli_7f21a9', 'customers:read, transactions:read', 'v3', '1 min ago'], ['Loss prevention BI', 'cli_09bd44', 'transactions:read, audit:read', 'v3', '2 h ago'], ['Legacy kiosk', 'cli_00a1f2', 'products:read', 'v2 (sunset 31 Mar)', '5 d ago']])}
          <div class="empty-note">API versions are supported for at least 12 months after the next major release. Deprecated calls return a Sunset header.</div></div>
      </section>`;
    },
    mount(root) {
      root.querySelectorAll('[data-replay]').forEach((b) => (b.onclick = () => { CP.toast(`${b.dataset.replay} replayed. Delivered.`); b.closest('tr').style.opacity = 0.45; b.disabled = true; }));
      root.querySelectorAll('[data-insp]').forEach((b) => (b.onclick = () => {
        const m = D.dlq.find((x) => x.id === b.dataset.insp);
        CP.drawer({ title: m.id, sub: m.type, body: `<div class="callout warn"><div><b>${m.err}</b><br>${m.tries} attempts · first failure ${m.age} ago · destination ${E(m.target)}</div></div>
          <div class="field"><label for="payload">Payload (editable before replay)</label><textarea class="input mono" id="payload" rows="14" style="font-size:12px">{
  "specversion": "1.0",
  "type": "com.corepos.${m.type.split(' ')[0]}",
  "source": "/stores/${m.store}/devices/D-IT5-02",
  "id": "${m.id}",
  "time": "2026-10-13T09:36:11Z",
  "data": {
    "transactionId": "005-03-118842",
    "businessDay": "2026-10-13",
    "currency": "EUR",
    "total": 349.00,
    "fiscal": { "rt": null, "status": "PENDING_RT" }
  }
}</textarea></div>`, foot: `<button class="btn" data-close>Close</button><button class="btn danger" id="dl-discard">Discard</button><button class="btn primary" id="dl-replay">Replay</button>`,
          mount: (d) => { d.querySelector('[data-close]').onclick = CP.closeOverlay; d.querySelector('#dl-replay').onclick = () => { CP.closeOverlay(); CP.toast('Replayed with edited payload'); }; d.querySelector('#dl-discard').onclick = () => CP.confirm({ title: 'Discard this message?', body: 'It will not be delivered. The discard is recorded in the audit log.', confirm: 'Discard', danger: true, onConfirm: () => CP.toast('Message discarded') }); } });
      }));
      root.querySelector('#new-hook').onclick = () => CP.drawer({ title: 'New webhook', sub: 'Events & webhooks', body: `
        <div class="field"><label for="wh-url">Endpoint URL</label><input class="input mono" id="wh-url" value="https://"></div>
        <div class="field"><label>Events</label><div class="chips" data-chips="multi">${['TransactionCompleted', 'ReturnCompleted', 'TransactionPostVoided', 'CustomerUpdated', 'ConsentChanged', 'StoreDayClosed', 'InventoryDelta'].map((e, i) => `<button class="chip ${i < 2 ? 'on' : ''}">${e}</button>`).join('')}</div></div>
        <div class="form-grid"><div class="field"><label for="wh-auth">Authentication</label><select class="input" id="wh-auth"><option>HMAC-SHA256 signature</option><option>OAuth2 client credentials</option><option>Mutual TLS</option></select></div>
        <div class="field"><label for="wh-scope">Scope</label><select class="input" id="wh-scope"><option>${E(CP.scopeLabel())}</option><option>Global</option></select></div>
        <div class="field"><label for="wh-ip">IP allow-list</label><input class="input mono" id="wh-ip" value="Any"></div><div class="field"><label for="wh-retry">Retry policy</label><select class="input" id="wh-retry"><option>Backoff up to 24 h, then failed queue</option></select></div></div>`,
        foot: `<button class="btn" data-close>Cancel</button><button class="btn" data-toast="Test event delivered · 200 OK · 142 ms">Send test event</button><button class="btn primary" id="wh-save">Create webhook</button>`,
        mount: (d) => { d.querySelector('[data-close]').onclick = CP.closeOverlay; d.querySelector('#wh-save').onclick = () => { CP.closeOverlay(); CP.toast('Webhook created. Signing secret shown once in the next step.'); }; } });
    },
  };

  /* ================= Reports ================= */
  S.reports = {
    render() {
      const cs = CP.countriesInScope();
      const data = cs.map((c, i) => ({ c, sales: Math.round(c.stores * (9.8 + ((i * 37) % 7))), atv: [212, 244, 198, 230, 189, 251, 205, 266, 301, 174, 220, 236, 142, 168][D.countries.indexOf(c)], upt: (1.2 + ((i * 13) % 5) / 10).toFixed(2), cvr: (14 + ((i * 7) % 9)).toFixed(1), sph: c.region === 'NAM' ? 412 + i * 9 : null }));
      const max = Math.max(...data.map((d) => d.sales), 1);
      const col = { NAM: 'var(--s1)', EMEA: 'var(--s2)', APAC: 'var(--s3)' };
      const regs = [...new Set(cs.map((c) => c.region))];
      const lib = [['Sales flash', 'Sales vs target by store, hour and associate', 'chart'], ['Discounts & exceptions', 'Manual discounts, overrides, post-voids, top discounters', 'percent'], ['Tender summary', 'By tender, card scheme and drawer', 'coins'], ['Returns analysis', 'Reasons, disposition, non-receipted returns', 'refresh'], ['VAT / GST report', 'By country, store, period and rate', 'landmark'], ['Conversion (CVR%)', 'Footfall from ShopperTrak every 15 min', 'users'], ['Sales per hour (SPH)', 'Worked hours from UKG vs sales', 'activity'], ['Open orders', 'Endless aisle, BOPIS and ship-from-store', 'box']];
      return `${CP.pageHead({ crumbs: ['Finance & reports'], title: 'Reports', desc: 'Operational and finance reports for stores and corporate, filtered to each user’s access scope. Schedule by email, export to Excel, or stream everything to the data warehouse.', actions: `<button class="btn" data-toast="Report scheduled every Monday 07:00 local">Schedule</button><button class="btn primary" data-toast="Exported to Excel">${I('download')}Export</button>` })}
      <section class="panel"><div class="panel-h"><h2>Sales flash</h2><span class="sub">Month to date · USD k reporting currency</span>
        <div class="actions"><div class="chips" data-chips><button class="chip">Today</button><button class="chip">WTD</button><button class="chip on">MTD</button><button class="chip">YTD</button></div></div></div>
        <div class="panel-b grid g2">
          <div class="stack"><div class="legend">${regs.map((r) => `<span><i style="background:${col[r]}"></i>${r}</span>`).join('')}</div>
            ${data.map((d) => `<div class="row" style="gap:10px;flex-wrap:nowrap"><span class="mono small" style="width:26px">${d.c.id}</span><div style="flex:1;min-width:0"><div class="bar" style="height:14px" data-tip="<b>${d.c.name}</b><br>$${d.sales}k MTD · ${d.c.stores} stores" tabindex="0"><i style="width:${(d.sales / max) * 100}%;background:${col[d.c.region]}"></i></div></div><span class="mono small num" style="width:56px;text-align:right">$${d.sales}k</span></div>`).join('')}</div>
          <div class="tbl-wrap">${CP.table([{ h: 'Country', f: (d) => `${CP.flag(d.c.id)} ${d.c.name}` }, { h: 'ATV', r: 1, f: (d) => '$' + d.atv }, { h: 'UPT', r: 1, f: (d) => d.upt }, { h: 'CVR', r: 1, f: (d) => d.cvr + '%' }, { h: 'SPH', r: 1, f: (d) => (d.sph ? '$' + d.sph : '<span class="muted">—</span>') }], data)}</div>
        </div></section>
      <div class="grid g4">${lib.map(([t, d, ic]) => `<button class="panel int-card" style="text-align:left;font:inherit;color:inherit" data-toast="Opening ${t}"><div class="int-logo" style="font-family:var(--font)">${I(ic).replace('<svg', '<svg width="18" height="18"')}</div><h3>${t}</h3><p>${d}</p></button>`).join('')}</div>
      <section class="panel"><div class="panel-h"><h2>Scheduled reports</h2></div><div class="panel-b flush">${CP.table([{ h: 'Report', f: (r) => `<b>${r[0]}</b>` }, { h: 'Scope', f: (r) => r[1] }, { h: 'Schedule', f: (r) => r[2] }, { h: 'Recipients', f: (r) => r[3] }, { h: 'Format', f: (r) => `<span class="tag">${r[4]}</span>` }],
        [['Manual discount report', 'EMEA', 'Daily 07:00 local', 'LP team (4)', 'XLSX'], ['Sales flash', 'Global', 'Hourly 09–21', 'Exec list (12)', 'Email'], ['VAT report', 'DE, AT', 'Monthly, 2nd', 'Tax DE', 'CSV'], ['SPH by associate', 'NAM', 'Weekly, Monday', 'District managers', 'XLSX']])}</div></section>`;
    },
  };

  /* ================= Reconciliation ================= */
  S.reconciliation = {
    render() {
      const list = D.recon.filter((r) => storeIn(r.store));
      return `${CP.pageHead({ crumbs: ['Finance & reports'], title: 'Reconciliation', desc: 'Each store-day matched four ways: POS sales, tenders, the payment provider’s settlement and SAP postings. Anything that does not match lands in the exception queue.', actions: `<button class="btn" data-toast="Settlement report re-imported from Adyen">${I('refresh')}Re-import settlement</button><button class="btn primary" data-toast="Reconciliation exported">${I('download')}Export</button>` })}
      <div class="grid g4">${[['Store-days matched', '201 / 205', 'good'], ['Variance', '3', 'warn'], ['Exceptions', '1', 'bad'], ['Net variance', '−$38.72', '']].map(([a, b, k]) => `<div class="panel kpi"><div class="eyebrow">${a}</div><div class="v ${k === 'bad' ? 'down' : ''}">${b}</div></div>`).join('')}</div>
      <section class="panel"><div class="toolbar"><input class="input mono" value="2026-10-12" aria-label="Business day" style="width:140px"><div class="chips" data-chips><button class="chip on">All</button><button class="chip">Variance</button><button class="chip">Exception</button></div></div>
        <div class="panel-b flush">${CP.table([
          { h: 'Store', f: (r) => `<b class="mono">${r.store}</b><div class="cell-sub">${r.day}</div>` }, { h: 'POS sales', r: 1, f: (r) => `<span class="num">${r.pos}</span>` }, { h: 'Tenders', r: 1, f: (r) => `<span class="num">${r.tenders}</span>` },
          { h: 'PSP settlement', r: 1, f: (r) => `<span class="num">${r.psp}</span>` }, { h: 'SAP', f: (r) => `<span class="small">${r.sap}</span>` }, { h: 'Difference', r: 1, f: (r) => `<span class="num ${r.diff.startsWith('−') ? 'down' : ''}">${r.diff}</span>` }, { h: 'Status', f: (r) => B(r.status) },
          { h: '', f: (r) => (r.status === 'Matched' ? '' : `<button class="btn sm" data-rec="${r.store}">Resolve</button>`) },
        ], list)}</div></section>`;
    },
    mount(root) {
      root.querySelectorAll('[data-rec]').forEach((b) => (b.onclick = () => {
        const r = D.recon.find((x) => x.store === b.dataset.rec);
        CP.drawer({ title: `${r.store} · ${r.day}`, sub: 'Reconciliation exception', body: `
          <div class="callout warn"><div><b>${r.status}: ${r.diff}</b> between tenders and provider settlement.</div></div>
          ${CP.table([{ h: 'Check', f: (x) => x[0] }, { h: 'Result', f: (x) => x[1] }], [['POS sales = tenders', B('Matched')], ['Tenders = Adyen settlement', B(r.status === 'Exception' ? 'Pending' : 'Variance', 'warn')], ['Tenders = SAP posting', B(r.sap.startsWith('Failed') ? 'Failed' : 'Matched')], ['Cash over/short within tolerance', B('Matched')]])}
          <div class="stack"><h3>Likely cause</h3><div class="small" style="color:var(--fg-2)">${r.status === 'Exception' ? 'SAP rejected the TLOG because the RT daily total is missing. Re-post after the RT server reconnects.' : 'One card refund (PSP 8817 2934 0021 9921) settled the next day. It will match automatically in tomorrow’s settlement file.'}</div></div>
          <div class="field"><label for="rec-note">Resolution note</label><textarea class="input" id="rec-note" rows="3" placeholder="Visible to Finance and in the audit log"></textarea></div>`,
          foot: `<button class="btn" data-close>Cancel</button><button class="btn" id="rec-repost">Re-post to SAP</button><button class="btn primary" id="rec-ok">Mark resolved</button>`,
          mount: (d) => { d.querySelector('[data-close]').onclick = CP.closeOverlay; d.querySelector('#rec-repost').onclick = () => CP.toast('TLOG re-posted to SAP'); d.querySelector('#rec-ok').onclick = () => { CP.closeOverlay(); CP.toast(r.store + ' marked resolved'); }; } });
      }));
    },
  };

  /* ================= Users & roles ================= */
  S.users = {
    render() {
      const R = D.roles;
      return `${CP.pageHead({ crumbs: ['Access & security'], title: 'Users & roles', desc: 'Access is a role (what someone can do) plus a scope (where they can do it): store, district, country, brand, region or global. Users are provisioned from your identity provider.', scoped: false, actions: `<button class="btn" data-toast="SCIM sync complete: 2 added, 1 removed">${I('refresh')}Sync from Okta</button><button class="btn primary" id="invite">${I('plus')}Invite user</button>` })}
      <section class="panel" data-tabhost><div class="tabs" data-tabs><button data-tab="u" class="on">Users</button><button data-tab="r">Roles & permissions</button><button data-tab="t">Approval limits</button></div>
        <div data-pane="u">${CP.table([
          { h: 'User', f: (u) => `<b>${E(u.name)}</b><div class="cell-sub">${u.email}</div>` }, { h: 'Role', f: (u) => u.role }, { h: 'Scope', f: (u) => `<span class="scope-note" style="font-size:11.5px">${E(u.scope)}</span>` },
          { h: 'MFA', f: (u) => (u.mfa ? B('On', 'good') : B('Pending', 'warn')) }, { h: 'Last active', f: (u) => u.last }, { h: 'Status', f: (u) => B(u.status) },
        ], D.users)}</div>
        <div data-pane="r" hidden><div class="tbl-wrap"><table class="tbl matrix"><thead><tr><th>Permission</th>${R.map((r) => `<th class="rot">${r}</th>`).join('')}</tr></thead><tbody>
          ${D.permissions.map((g) => `<tr><td colspan="${R.length + 1}" class="eyebrow" style="background:var(--surface-2)">${g.group}</td></tr>${g.items.map(([p, v]) => `<tr><td>${p}</td>${v.map((on, i) => `<td class="ck"><input type="checkbox" ${on ? 'checked' : ''} aria-label="${E(p)} for ${R[i]}"></td>`).join('')}</tr>`).join('')}`).join('')}
        </tbody></table></div><div class="empty-note">Predefined roles can be copied into custom roles. Changes reach devices within 15 minutes, or at next sync when offline.</div></div>
        <div data-pane="t" hidden>${CP.table([{ h: 'Action', f: (r) => r[0] }, { h: 'Associate', r: 1, f: (r) => r[1] }, { h: 'Senior Associate', r: 1, f: (r) => r[2] }, { h: 'Store Manager', r: 1, f: (r) => r[3] }, { h: 'Above that', f: (r) => r[4] }],
          [['Manual line discount', '0%', '10%', '30%', 'District Manager, remote approval'], ['Price override', '—', '—', '50% of list', 'Country Manager'], ['Refund without receipt', '—', '—', '€250 / $300', 'District Manager'], ['Post-void', '—', '—', 'Same day', 'Finance'], ['Paid-out', '—', '€20', '€200', 'Not allowed']])}
          <div class="empty-note">Limits can be overridden per country, brand and store in Configuration. Approvals are bound to the transaction and the action approved.</div></div>
      </section>`;
    },
    mount(root) {
      root.querySelector('#invite').onclick = () => CP.drawer({ title: 'Invite user', sub: 'Users & roles', body: `
        <div class="form-grid"><div class="field"><label for="iv-name">Name</label><input class="input" id="iv-name" value="Hannah Schulz"></div><div class="field"><label for="iv-email">Work email</label><input class="input" id="iv-email" value="hannah.schulz@atlas-retail.example"></div></div>
        <div class="field"><label for="iv-role">Role</label><select class="input" id="iv-role">${D.roles.map((r) => `<option ${r === 'Store Manager' ? 'selected' : ''}>${r}</option>`).join('')}</select></div>
        <div class="field"><label>Scope</label><div class="row" style="gap:6px">${['Region', 'Country', 'Brand', 'Store'].map((l, i) => `<select class="input" aria-label="${l}"><option>${['EMEA', 'Germany', 'Kestrel', 'DE-MUC-004'][i]}</option><option>All</option></select>`).join('<span class="muted">›</span>')}</div><span class="hint">The user sees data and can act only inside this scope.</span></div>
        <div class="field"><label for="iv-exp">Access expires</label><select class="input" id="iv-exp"><option>Never</option><option>In 8 hours (support)</option><option>In 30 days</option></select></div>
        <div class="callout"><div>Sign-in goes through Okta with MFA. At the till the user sets a PIN for fast switching on shared devices.</div></div>`,
        foot: `<button class="btn" data-close>Cancel</button><button class="btn primary" id="iv-send">Send invite</button>`,
        mount: (d) => { d.querySelector('[data-close]').onclick = CP.closeOverlay; d.querySelector('#iv-send').onclick = () => { CP.closeOverlay(); CP.toast('Invite sent to hannah.schulz@atlas-retail.example'); }; } });
    },
  };

  /* ================= Audit log ================= */
  S.audit = {
    render() {
      return `${CP.pageHead({ crumbs: ['Access & security'], title: 'Audit log', desc: 'An append-only record of sales exceptions, voids, overrides, refunds, cash movements, configuration changes, sign-ins, PII views and exports, with before and after values.', actions: `<button class="btn primary" data-toast="Audit export queued (CSV, signed)">${I('download')}Export</button>` })}
      <section class="panel"><div class="toolbar"><input class="input" placeholder="Search user, store, transaction or key" aria-label="Search audit log" style="flex:1;min-width:200px">
        <select class="input" aria-label="Action type"><option>All actions</option><option>Config changed</option><option>PII revealed</option><option>Post-void</option><option>Sign-in</option><option>Export</option></select><input class="input mono" value="Today" aria-label="Date range" style="width:110px"></div>
        <div class="panel-b flush">${CP.table([
          { h: 'Time (UTC)', f: (a) => `<span class="mono small">${a.t}</span>` }, { h: 'Who', f: (a) => `<b>${E(a.who)}</b>` }, { h: 'Action', f: (a) => B(a.action, a.action.includes('PII') ? 'warn' : 'plain') }, { h: 'Target', f: (a) => `<span class="small">${E(a.target)}</span>` },
          { h: 'Before → after', f: (a) => `<span class="mono small"><span class="muted">${E(a.before)}</span> → ${E(a.after)}</span>` }, { h: 'Source', f: (a) => `<span class="mono small muted">${a.ip}</span>` },
        ], D.audit)}</div><div class="empty-note">Streaming to Splunk SIEM over HTTPS · JSON · last event 3 s ago. Retained 7 years.</div></section>`;
    },
  };

  /* ================= Security & SSO ================= */
  S.security = {
    render() {
      return `${CP.pageHead({ crumbs: ['Access & security'], title: 'Security & SSO', desc: 'Sign-in, provisioning, session and device policies, and where logs are shipped.', scoped: false, actions: `<button class="btn primary" data-toast="Security settings saved">Save</button>` })}
      <div class="grid g2">
        <section class="panel"><div class="panel-h"><h2>Single sign-on</h2>${B('Connected')}</div><div class="panel-b stack">
          <div class="form-grid"><div class="field"><label for="sso-p">Identity provider</label><select class="input" id="sso-p"><option>Okta (OIDC)</option><option>Microsoft Entra ID (SAML 2.0)</option><option>Ping Identity</option></select></div>
          <div class="field"><label for="sso-mfa">MFA</label><select class="input" id="sso-mfa"><option>Required for all admin users</option><option>Required for HQ only</option></select></div>
          <div class="field"><label for="sso-iss">Issuer</label><input class="input mono" id="sso-iss" value="https://atlas.okta.com/oauth2/default"></div><div class="field"><label for="sso-sess">Admin session timeout</label><input class="input mono" id="sso-sess" value="8 h · idle 30 min"></div></div>
          <label class="row">${CP.switch('scim', true, 'SCIM provisioning')}<span class="small">SCIM 2.0 provisioning: revoked users lose device access within 15 min</span></label></div></section>
        <section class="panel"><div class="panel-h"><h2>Store devices</h2></div><div class="panel-b stack">
          <div class="form-grid"><div class="field"><label for="pin-len">Associate PIN length</label><input class="input mono" id="pin-len" value="6 digits"></div><div class="field"><label for="pin-lock">Lock after</label><input class="input mono" id="pin-lock" value="5 failed attempts"></div>
          <div class="field"><label for="dev-idle">Auto sign-out when idle</label><input class="input mono" id="dev-idle" value="3 min"></div><div class="field"><label for="dev-off">Offline sign-in allowed for</label><input class="input mono" id="dev-off" value="72 h"></div></div>
          <label class="row">${CP.switch('bio', true, 'Biometric switch')}<span class="small">Allow Face ID / fingerprint for fast user switching</span></label><label class="row">${CP.switch('badge', false, 'Badge login')}<span class="small">Badge (NFC) login</span></label></div></section>
        <section class="panel"><div class="panel-h"><h2>Log shipping</h2></div><div class="panel-b flush">${CP.table([{ h: 'Destination', f: (r) => `<b>${r[0]}</b>` }, { h: 'Transport', f: (r) => `<span class="tag">${r[1]}</span>` }, { h: 'Logs', f: (r) => r[2] }, { h: 'Status', f: (r) => B(r[3]) }],
          [['Splunk', 'HTTPS HEC · JSON', 'Audit, security', 'Healthy'], ['AWS S3 (atlas-logs)', 'S3 · JSON gzip', 'All application logs', 'Healthy'], ['Syslog (SOC)', 'TLS syslog · CEF', 'Sign-ins', 'Healthy']])}</div></section>
        <section class="panel"><div class="panel-h"><h2>Network & keys</h2></div><div class="panel-b stack">
          <dl class="kv"><dt>Admin console IP allow-list</dt><dd class="mono small">10.0.0.0/8, 185.22.14.0/24</dd><dt>Encryption at rest</dt><dd>AES-256, customer-managed keys (KMS)</dd><dt>Key rotation</dt><dd>Every 365 days · next 02 Mar</dd><dt>Card data</dt><dd>Never stored · out of PCI scope</dd><dt>Pen test</dt><dd>Last: Aug 2026 · 0 high findings</dd></dl></div></section>
      </div>`;
    },
  };
})();
