/* Screens: Tax engine, Fiscalisation, Receipts & documents, Localisation,
   Payment providers, Tender rules, Customer settings, Privacy requests. */
(function () {
  const D = CP.data, S = CP.screens, I = CP.icon, B = CP.badge, E = CP.esc;

  /* Country picker chips limited to the current scope. */
  function countryChips(id, sel, filter = () => true) {
    const cs = CP.countriesInScope().filter(filter);
    return `<div class="chips" data-chips id="${id}">${cs.map((c) => `<button class="chip ${c.id === sel ? 'on' : ''}" data-v="${c.id}">${c.id} · ${c.name}</button>`).join('')}</div>`;
  }
  function pickCountry(sel, filter = () => true) {
    const cs = CP.countriesInScope().filter(filter);
    return cs.find((c) => c.id === sel) ? sel : (cs[0] || {}).id;
  }

  /* ================= Tax engine ================= */
  let taxC = 'DE';
  S.tax = {
    render() {
      taxC = pickCountry(CP.scope.country || taxC);
      const c = CP.country(taxC);
      const ext = c.tax.startsWith('Avalara');
      const rates = D.taxRates[taxC] || [['Standard', c.id === 'AU' || c.id === 'SG' ? (c.id === 'AU' ? '10%' : '9%') : c.id === 'CH' ? '8.1%' : c.id === 'MY' ? 'SST 10%' : c.id === 'CA' ? 'Provider' : c.id === 'IT' ? '22%' : c.id === 'ES' ? '21%' : '20%', 'Merchandise and services'], ['Exempt', '0%', 'Gift cards']];
      const roundingDefault = c.currency === 'JPY' ? '0 decimals' : '2 decimals';
      return `${CP.pageHead({ crumbs: ['Tax & compliance'], title: 'Tax engine', desc: 'Native VAT, GST and JCT rate tables for most markets, with Avalara or Vertex plugged in for US and Canadian sales tax. Choose the engine, pricing mode and rounding per country.', actions: `<button class="btn" data-toast="VAT report for ${c.name} exported">${I('download')}Tax report</button><button class="btn primary" data-toast="Tax settings for ${c.name} saved">Save</button>` })}
      <section class="panel"><div class="toolbar">${countryChips('tax-c', taxC)}</div>
        <div class="panel-b grid g2">
          <div class="stack">
            <h3>${CP.flag(c.id)} ${c.name} · calculation</h3>
            <div class="form-grid">
              <div class="field"><label for="tx-engine">Tax engine</label><select class="input" id="tx-engine"><option ${!ext ? 'selected' : ''}>Native rate tables</option><option ${ext ? 'selected' : ''}>Avalara AvaTax</option><option>Vertex O Series</option></select></div>
              <div class="field"><label for="tx-mode">Shelf prices are</label><select class="input" id="tx-mode"><option ${c.taxMode === 'inclusive' ? 'selected' : ''}>Tax inclusive</option><option ${c.taxMode === 'exclusive' ? 'selected' : ''}>Tax exclusive</option></select></div>
              <div class="field"><label for="tx-round">Rounding</label><select class="input" id="tx-round"><option>Per line, half-up</option><option>Per invoice, half-up</option><option>Per line, half-even</option><option>Truncate</option></select></div>
              <div class="field"><label for="tx-prec">Currency precision</label><input class="input mono" id="tx-prec" value="${c.currency} · ${roundingDefault}"></div>
              <div class="field"><label for="tx-addr">Jurisdiction from</label><select class="input" id="tx-addr"><option>Store address (in-store), ship-to (endless aisle)</option></select></div>
              <div class="field"><label for="tx-b2b">B2B VAT ID validation</label><select class="input" id="tx-b2b"><option>${c.region === 'EMEA' ? 'VIES (EU)' : c.id === 'IN' ? 'GSTIN portal' : 'Off'}</option></select></div>
            </div>
            ${ext ? `<div class="panel" style="background:var(--surface-2)"><div class="panel-h"><h3>Avalara AvaTax connection</h3>${B('Connected')}</div><div class="panel-b"><dl class="kv"><dt>Company code</dt><dd class="mono">ATLAS-${c.id}</dd><dt>Quote at</dt><dd>Every cart change (debounced 300 ms)</dd><dt>Commit at</dt><dd>Transaction completion</dd><dt>Timeout</dt><dd>800 ms → cached ZIP-level rate</dd><dt>Offline</dt><dd>Queue and commit on sync (126 queued today)</dd><dt>Exemption certificates</dt><dd>CertCapture validation on</dd></dl></div></div>` : `<div class="callout"><div>Prices in ${c.name} are ${c.taxMode} of tax. Tax is calculated on the device from the rate table, so it works fully offline.</div></div>`}
          </div>
          <div class="stack">
            <div class="row"><h3>Rates</h3><span class="spacer"></span><button class="btn sm" data-toast="New rate added with effective date">${I('plus')}Add rate</button></div>
            ${CP.table([{ h: 'Tax class', f: (r) => `<b>${r[0]}</b>` }, { h: 'Rate', f: (r) => `<span class="mono">${r[1]}</span>` }, { h: 'Applies to', f: (r) => `<span class="small">${r[2]}</span>` }, { h: 'Effective', f: () => '<span class="mono small">2024-01-01 →</span>' }], rates)}
            <h3>Holidays & thresholds</h3>
            ${taxC === 'US' ? CP.table([{ h: 'Rule', f: (r) => r[0] }, { h: 'Where', f: (r) => r[1] }, { h: 'When', f: (r) => `<span class="mono small">${r[2]}</span>` }], [['Clothing under $110 exempt', 'NY', 'Always'], ['Back-to-school holiday', 'TX, FL, MA', '08 Aug – 10 Aug'], ['Clothing exempt', 'NJ, PA, MN', 'Always']]) : '<div class="small muted">No holidays configured. Add a temporary rate change with start and end time.</div>'}
            <h3>Exemption reasons</h3>
            <div class="chips">${['Diplomatic', 'Export / tourist', 'Reseller certificate', 'Non-profit', 'Government'].map((r) => `<span class="tag">${r}</span>`).join('')}</div>
            <div class="small muted">Exemptions need a certificate number, a photo of the document and manager approval at the till.</div>
          </div>
        </div></section>`;
    },
    mount(root) { root.querySelector('#tax-c')?.addEventListener('chips', (e) => { taxC = e.detail; CP.render(); }); },
  };

  /* ================= Fiscalisation ================= */
  S.fiscal = {
    render() {
      const fc = CP.countriesInScope().filter((c) => c.fiscal);
      const rows = fc.map((c) => ({
        c, provider: { DE: 'fiskaly SIGN DE', AT: 'fiskaly SIGN AT', FR: 'efsta EFR', IT: 'Epson RT Server', ES: 'efsta EFR', JP: 'Native', IN: 'Pagero (IRN)', MY: 'Pagero (MyInvois)' }[c.id],
        chain: c.id === 'IT' ? 'Warning' : 'Verified', export: { DE: 'DSFinV-K', AT: 'DEP7', FR: 'NF525 archive', IT: 'Daily totals (AdE)', ES: 'VeriFactu XML', JP: 'Qualified invoice log', IN: 'IRN register', MY: 'MyInvois' }[c.id],
        retention: { DE: '10 years', AT: '7 years', FR: '6 years', IT: '10 years', ES: '4 years', JP: '7 years', IN: '8 years', MY: '7 years' }[c.id],
        status: c.id === 'IT' ? 'Degraded' : 'Live',
      }));
      return `${CP.pageHead({ crumbs: ['Tax & compliance'], title: 'Fiscalisation', desc: 'Country fiscal regimes behind one fiscal service: signing, registration, hash-chained journals, legal exports and the failure modes each law requires when the signing unit is unreachable.', actions: `<button class="btn" id="verify">${I('shield')}Verify hash chains</button><button class="btn primary" data-toast="DSFinV-K export for DE · Sep 2026 is being prepared">${I('download')}Legal export</button>` })}
      <section class="panel"><div class="panel-b flush">${CP.table([
        { h: 'Country', f: (r) => `${CP.flag(r.c.id)} <b>${r.c.name}</b>` }, { h: 'Regime', f: (r) => r.c.fiscal }, { h: 'Provider', f: (r) => r.provider },
        { h: 'Journal chain', f: (r) => B(r.chain, r.chain === 'Verified' ? 'good' : 'warn') }, { h: 'Export', f: (r) => `<span class="tag">${r.export}</span>` }, { h: 'Retention', f: (r) => r.retention }, { h: 'Status', f: (r) => B(r.status) },
      ], rows)}</div>${rows.length ? '' : '<div class="empty-note">No fiscal regimes in this scope. US, CA, GB, CH, AU and SG do not need fiscal signing.</div>'}</section>
      <div class="grid g2">
        <section class="panel"><div class="panel-h"><h2>Germany · KassenSichV</h2>${B('Live')}</div><div class="panel-b stack">
          <dl class="kv"><dt>TSE type</dt><dd>Cloud TSE (fiskaly SIGN DE)</dd><dt>TSS units</dt><dd>22 · one per store</dd><dt>Clients</dt><dd>118 devices registered</dd><dt>Receipt QR</dt><dd>Printed on every receipt (V0 format)</dd><dt>Registration with tax office</dt><dd>ELSTER notification sent 14 Jan 2025</dd><dt>On TSE outage</dt><dd>Keep selling, print “TSE ausgefallen”, document outage in journal</dd></dl>
          <div class="row"><button class="btn sm" data-toast="TSE health check: 22 / 22 OK">Check TSE units</button><button class="btn sm" data-go="receipts">Preview DE receipt</button></div></div></section>
        <section class="panel"><div class="panel-h"><h2>Italy · RT</h2>${B('Degraded')}</div><div class="panel-b stack">
          <div class="callout warn"><div><b>IT-MIL-005 RT server unreachable for 41 min.</b> Receipts are stored on the device and transmitted with daily totals when the RT server is back. If it is still down at closing, file the manual outage report.</div></div>
          <dl class="kv"><dt>RT devices</dt><dd>9 servers · 41 printers</dd><dt>Daily totals</dt><dd>Sent at Z-close to Agenzia delle Entrate</dd><dt>Lottery code capture</dt><dd>On</dd></dl></div></section>
      </div>
      <section class="panel"><div class="panel-h"><h2>Fiscal journal search</h2><span class="sub">Read-only, write-once storage</span></div>
        <div class="toolbar"><select class="input" aria-label="Country"><option>DE · Germany</option><option>FR · France</option><option>IT · Italy</option></select><input class="input mono" value="DE-BER-012" aria-label="Store"><input class="input mono" value="2026-10-12" aria-label="Date"><input class="input mono" placeholder="Receipt no. or signature counter" aria-label="Receipt number" style="flex:1;min-width:160px"><button class="btn primary sm">Search</button></div>
        <div class="panel-b flush">${CP.table([{ h: 'Receipt', f: (r) => `<span class="mono">${r[0]}</span>` }, { h: 'Type', f: (r) => r[1] }, { h: 'Amount', r: 1, f: (r) => r[2] }, { h: 'Signature counter', r: 1, f: (r) => `<span class="mono">${r[3]}</span>` }, { h: 'Hash', f: (r) => `<span class="mono small muted">${r[4]}</span>` }],
          [['012-02-2026-004118', 'Sale', '€ 379,00', '88214', 'a91f…03ce'], ['012-02-2026-004119', 'Return', '−€ 59,00', '88215', '4c2e…b710'], ['012-01-2026-002071', 'Post-void', '€ 0,00', '88216', '0de9…5a2f'], ['012-02-2026-004120', 'Sale', '€ 1.124,00', '88217', 'f730…91aa']])}</div></section>`;
    },
    mount(root) {
      root.querySelector('#verify').onclick = () => CP.toast('Integrity check started: 4.2M journal entries across 8 countries');
    },
  };

  /* ================= Receipts & documents ================= */
  let rcpt = { country: 'DE', doc: 'Sales receipt', blocks: { logo: true, legal: true, vat: true, fiscal: true, card: true, policy: true, survey: false, notes: true } };
  function receiptHTML() {
    const c = CP.country(rcpt.country), b = rcpt.blocks;
    const cur = { USD: '$', EUR: '€', GBP: '£', JPY: '¥', INR: '₹', CHF: 'CHF ', AUD: 'A$', SGD: 'S$', CAD: 'C$', MYR: 'RM ' }[c.currency];
    const jp = c.id === 'JP', inr = c.id === 'IN';
    const amt = jp ? ['59,400', '3,300', '62,700'] : inr ? ['32,995', '1,500', '34,495'] : ['379.00', '25.00', '404.00'];
    const lines = `<div class="ln"><span>Meridian Chrono 42</span><span>${cur}${amt[0]}</span></div><div class="ln"><span>Engraving service</span><span>${cur}${amt[1]}</span></div>${b.notes ? '<div class="small">  Note: “For A., 10 years”</div>' : ''}`;
    let taxBlock = '';
    if (b.vat) {
      if (c.taxMode === 'exclusive') taxBlock = `<div class="ln"><span>Subtotal</span><span>${cur}${amt[2]}</span></div><div class="ln"><span>Sales tax NY 8.875%</span><span>${cur}35.86</span></div><div class="ln b"><span>TOTAL</span><span>${cur}439.86</span></div>`;
      else if (jp) taxBlock = `<div class="ln b"><span>合計 TOTAL</span><span>¥${amt[2]}</span></div><div class="ln"><span>10%対象 ¥62,700</span><span>内消費税 ¥5,700</span></div>`;
      else if (inr) taxBlock = `<div class="ln b"><span>TOTAL</span><span>₹${amt[2]}</span></div><div class="ln"><span>CGST 9% (HSN 9102)</span><span>₹2,631</span></div><div class="ln"><span>SGST 9%</span><span>₹2,631</span></div>`;
      else taxBlock = `<div class="ln b"><span>TOTAL</span><span>${cur}${amt[2]}</span></div><div class="ln"><span>incl. VAT ${c.id === 'DE' ? '19' : c.id === 'CH' ? '8.1' : '20'}% on ${cur}${amt[2]}</span><span>${cur}${c.id === 'DE' ? '64.50' : c.id === 'CH' ? '30.30' : '67.33'}</span></div>`;
    }
    const fiscal = !b.fiscal || !c.fiscal ? '' : c.id === 'DE' ? `<div class="hl"><div class="rule"></div><div>TSE-Seriennr: 9b1e…c204</div><div>Signaturzähler: 88214</div><div>Start: 2026-10-13T10:14:02</div><div class="qr"></div></div>` : c.id === 'FR' ? '<div class="hl"><div class="rule"></div><div>NF525 · Cert. LNE 0012-B</div><div>Signature: X7aQ…p2</div></div>' : c.id === 'IT' ? '<div class="hl"><div class="rule"></div><div>DOCUMENTO COMMERCIALE</div><div>RT 99MEX018442 · n. 0118-0042</div></div>' : jp ? '<div class="hl"><div class="rule"></div><div>登録番号 T1234567890123</div></div>' : inr ? '<div class="hl"><div class="rule"></div><div>IRN: 7f3c…a91d (B2B only)</div><div>GSTIN 29ABCDE1234F1Z5</div></div>' : '';
    return `<div class="receipt" aria-label="Receipt preview">
      ${b.logo ? '<div class="c b" style="font-size:14px;letter-spacing:.2em">ATLAS TIME</div>' : ''}
      <div class="c">KaDeWe Concession · ${c.name}</div><div class="c small">${c.id === 'DE' ? 'USt-IdNr. DE298441903' : c.id === 'US' ? '5th Ave, New York NY 10022' : 'Reg. ' + c.id + '298441903'}</div>
      <div class="rule"></div><div class="ln"><span>${rcpt.doc === 'Credit note' ? 'CREDIT NOTE' : rcpt.doc === 'Gift receipt' ? 'GIFT RECEIPT' : 'RECEIPT'}</span><span>${c.id}-012-02-004118</span></div><div class="ln"><span>13.10.2026 10:14</span><span>Assoc. #1182</span></div><div class="rule"></div>
      ${rcpt.doc === 'Gift receipt' ? '<div class="ln"><span>Meridian Chrono 42</span><span>1</span></div><div class="ln"><span>Engraving service</span><span>1</span></div>' : lines + '<div class="rule"></div>' + taxBlock}
      ${b.card && rcpt.doc !== 'Gift receipt' ? `<div class="rule"></div><div>VISA •••• 4417  CONTACTLESS</div><div class="small">AID A0000000031010 · Auth 0K82QF</div><div class="small">PSP ref 8817 2934 0021 9921</div>` : ''}
      ${fiscal}
      ${b.policy ? `<div class="rule"></div><div class="small">${c.id === 'DE' ? 'Umtausch innerhalb von 30 Tagen mit Beleg.' : c.id === 'FR' ? 'Échange sous 14 jours sur présentation du ticket.' : jp ? '返品はレシート持参で30日以内' : 'Returns within 60 days with receipt.'}</div>` : ''}
      ${b.legal ? `<div class="small">${c.region === 'EMEA' ? 'Privacy notice: atlas-retail.example/privacy' : 'Terms: atlas-retail.example/terms'}</div>` : ''}
      ${b.survey ? '<div class="c small" style="margin-top:8px">Tell us how we did · scan QR</div><div class="qr" style="width:56px;height:56px"></div>' : ''}
      <div class="c" style="margin-top:8px">*${c.id}012020041182*</div></div>`;
  }
  S.receipts = {
    render() {
      rcpt.country = pickCountry(CP.scope.country || rcpt.country);
      const blk = [['logo', 'Brand logo'], ['legal', 'Legal & privacy text'], ['vat', 'Tax breakdown per rate'], ['fiscal', 'Fiscal signature / QR'], ['card', 'Card scheme data (from Adyen)'], ['policy', 'Return policy'], ['notes', 'Item notes (engraving, gift)'], ['survey', 'Survey QR code']];
      return `${CP.pageHead({ crumbs: ['Tax & compliance'], title: 'Receipts & documents', desc: 'One global template with overrides by brand, country, store, language and document type. Preview the result, send it for approval and publish to selected stores.', actions: `<button class="btn" data-toast="Template v8 sent for approval">Send for approval</button><button class="btn primary" id="publish">Publish</button>` })}
      <div class="grid g-rc">
        <section class="panel"><div class="panel-h"><h2>Template</h2><span class="sub">ATL-${rcpt.country}-receipt · v8 draft</span></div>
          <div class="panel-b stack">
            <div class="form-grid">
              <div class="field"><label for="rc-country">Country</label><select class="input" id="rc-country">${CP.countriesInScope().map((c) => `<option value="${c.id}" ${c.id === rcpt.country ? 'selected' : ''}>${c.name}</option>`).join('')}</select></div>
              <div class="field"><label for="rc-doc">Document type</label><select class="input" id="rc-doc">${['Sales receipt', 'Gift receipt', 'Credit note', 'Full VAT invoice', 'Refund slip', 'X / Z report'].map((d) => `<option ${d === rcpt.doc ? 'selected' : ''}>${d}</option>`).join('')}</select></div>
              <div class="field"><label for="rc-brand">Brand</label><select class="input" id="rc-brand">${D.brands.map((b) => `<option>${b.name}</option>`).join('')}</select></div>
              <div class="field"><label for="rc-lang">Language</label><select class="input" id="rc-lang">${CP.country(rcpt.country).lang.split(', ').map((l) => `<option>${l}</option>`).join('')}<option>en-GB (tourist)</option></select></div>
            </div>
            <h3>Blocks</h3>
            <div class="grid g2" style="gap:10px">${blk.map(([k, l]) => `<label class="row" style="gap:10px">${CP.switch('rb-' + k, rcpt.blocks[k], l)}<span class="small">${l}</span></label>`).join('')}</div>
            <div class="field"><label>Digital receipt delivery</label><div class="chips" data-chips="multi">${['Email', 'SMS', 'QR on screen', 'WhatsApp', 'LINE'].map((x, i) => `<button class="chip ${i < 3 ? 'on' : ''}">${x}</button>`).join('')}</div><span class="hint">Sent through Bloomreach, or SES / Twilio. Branded HTML and PDF.</span></div>
          </div></section>
        <section class="panel" style="background:var(--surface-2)"><div class="panel-h"><h2>Preview</h2><span class="sub">80 mm thermal</span></div><div class="panel-b" id="rc-prev" style="padding:22px 16px 30px">${receiptHTML()}</div><div class="empty-note">Highlighted: fiscal block required by law in this country.</div></section>
      </div>
      <div class="grid g2">
        <section class="panel"><div class="panel-h"><h2>Number series</h2><span class="sub">Gapless, per device, blocks reserved for offline</span></div><div class="panel-b flush">${CP.table([
          { h: 'Document', f: (r) => r[0] }, { h: 'Pattern', f: (r) => `<span class="mono small">${r[1]}</span>` }, { h: 'Reset', f: (r) => r[2] }, { h: 'Block size', r: 1, f: (r) => r[3] }],
          [['Sales receipt', '{CC}-{store}-{device}-{seq:6}', 'Yearly', '1,000'], ['Credit note', 'CN-{CC}-{store}-{yyyy}-{seq:5}', 'Yearly', '200'], ['Full VAT invoice', 'INV-{CC}-{yyyy}-{seq:7}', 'Yearly', '500'], ['Gift receipt', 'Same as sale', '—', '—']])}</div></section>
        <section class="panel"><div class="panel-h"><h2>Legal text</h2><span class="sub">Effective-dated, per country and language</span></div><div class="panel-b flush">${CP.table([
          { h: 'Text', f: (r) => r[0] }, { h: 'Locale', f: (r) => `<span class="tag">${r[1]}</span>` }, { h: 'Effective', f: (r) => `<span class="mono small">${r[2]}</span>` }, { h: 'Status', f: (r) => B(r[3]) }],
          [['Return policy', 'de-DE', '2026-01-01', 'Published'], ['Return policy', 'fr-FR', '2026-11-01', 'Pending approval'], ['Privacy notice', 'en-GB', '2025-05-25', 'Published'], ['Consumer rights (JP)', 'ja-JP', '2024-04-01', 'Published']])}</div></section>
      </div>`;
    },
    mount(root) {
      const prev = () => (root.querySelector('#rc-prev').innerHTML = receiptHTML());
      root.querySelector('#rc-country').onchange = (e) => { rcpt.country = e.target.value; CP.render(); };
      root.querySelector('#rc-doc').onchange = (e) => { rcpt.doc = e.target.value; prev(); };
      root.querySelectorAll('[id^="rb-"]').forEach((x) => (x.onchange = () => { rcpt.blocks[x.id.slice(3)] = x.checked; prev(); }));
      root.querySelector('#publish').onclick = () => CP.confirm({ title: 'Publish template v8?', body: `Publishes to ${CP.scopeLabel()}. Devices download it at next sync; receipts already printed are not affected.`, confirm: 'Publish', onConfirm: () => CP.toast('Template v8 published') });
    },
  };

  /* ================= Localisation ================= */
  S.localization = {
    render() {
      const cs = CP.countriesInScope();
      const fx = [['EUR', '1.0842', '0.9223'], ['GBP', '1.2970', '0.7710'], ['JPY', '0.006690', '149.48'], ['CAD', '0.7291', '1.3716'], ['AUD', '0.6612', '1.5124'], ['CHF', '1.1310', '0.8842'], ['INR', '0.011950', '83.68'], ['SGD', '0.7480', '1.3369'], ['MYR', '0.2241', '4.4623']];
      return `${CP.pageHead({ crumbs: ['Tax & compliance'], title: 'Localisation', desc: 'Currencies, exchange rates, languages and local formats for each country. Every transaction stores the local amount, the reporting-currency amount and the rate used.', actions: `<button class="btn" data-toast="Rates imported from treasury feed">${I('refresh')}Import rates</button><button class="btn primary" data-toast="Localisation saved">Save</button>` })}
      <section class="panel"><div class="panel-h"><h2>Country formats</h2></div><div class="panel-b flush">${CP.table([
        { h: 'Country', f: (c) => `${CP.flag(c.id)} ${c.name}` }, { h: 'Currency', f: (c) => `<span class="tag">${c.currency}</span>` }, { h: 'Languages', f: (c) => c.lang },
        { h: 'Amount', f: (c) => `<span class="mono">${new Intl.NumberFormat(c.lang.split(',')[0], { style: 'currency', currency: c.currency }).format(1234.5)}</span>` },
        { h: 'Date', f: (c) => `<span class="mono">${new Intl.DateTimeFormat(c.lang.split(',')[0], { dateStyle: 'short' }).format(new Date(2026, 9, 13))}</span>` },
        { h: 'Address format', f: (c) => `<span class="small">${{ US: 'Street · City, ST ZIP', JP: '〒 Postcode · Prefecture · City', GB: 'Street · Town · Postcode', IN: 'Street · City · PIN' }[c.id] || 'Street · Postcode City'}</span>` },
      ], cs)}</div></section>
      <div class="grid g2">
        <section class="panel"><div class="panel-h"><h2>Exchange rates</h2><span class="sub">Reporting currency USD · effective 13 Oct 2026 00:00 UTC</span></div><div class="panel-b flush">${CP.table([
          { h: 'Currency', f: (r) => `<b class="mono">${r[0]}</b>` }, { h: '→ USD', r: 1, f: (r) => `<span class="mono">${r[1]}</span>` }, { h: 'USD →', r: 1, f: (r) => `<span class="mono">${r[2]}</span>` }, { h: 'Foreign cash at till', f: (r, i) => CP.switch('fx' + i, ['EUR', 'USD', 'GBP'].includes(r[0]), 'Accept ' + r[0] + ' cash') }], fx)}</div>
          <div class="empty-note">Foreign cash rates for tills are Finance-managed and effective-dated. Change is always given in local currency.</div></section>
        <section class="panel"><div class="panel-h"><h2>Languages</h2><span class="sub">POS app, receipts, customer display</span></div><div class="panel-b stack">
          ${[['English', 100], ['Deutsch', 100], ['Français', 100], ['Italiano', 98], ['Español', 97], ['日本語', 99], ['हिन्दी', 84], ['Bahasa Melayu', 91], ['中文 (简体)', 93]].map(([l, p]) => `<div class="row"><span style="width:120px">${l}</span><div class="meter" style="flex:1" data-tip="${p}% of 4,812 strings"><i style="width:${p}%;${p < 95 ? 'background:var(--warn)' : ''}"></i></div><span class="mono small" style="width:40px;text-align:right">${p}%</span></div>`).join('')}
          <button class="btn sm" data-toast="Missing strings exported for translation (XLIFF)">Export missing strings</button></div></section>
      </div>`;
    },
  };

  /* ================= Payment providers ================= */
  S.payments = {
    render() {
      const accts = [];
      CP.countriesInScope().forEach((c) => D.brands.forEach((b) => {
        if ((c.id === 'MY' || c.id === 'IN') && b.id === 'NOR') return;
        accts.push({ c, b, provider: c.id === 'US' && b.id === 'NOR' ? 'Stripe Terminal' : 'Adyen', acct: c.id === 'US' && b.id === 'NOR' ? 'acct_1Nordlys_US' : `Atlas${b.name.replace(/\s/g, '')}_${c.id}_POS`, terminals: Math.round(c.stores * 2.4 / 3) });
      }));
      return `${CP.pageHead({ crumbs: ['Payments'], title: 'Payment providers', desc: 'Connect acquirers and map merchant accounts to each country and brand. Card data never reaches Core POS: terminals talk to the provider, and Core POS stores only the payment reference.', actions: `<button class="btn primary" data-go="integrations">${I('plus')}Add provider</button>` })}
      <div class="grid g3">
        ${[['Adyen', 'Primary acquirer · 1,388 terminals', 'Connected', ['In-person cards & wallets', 'Pay-by-link', 'Referenced refunds', 'Gift cards (Givex, SVS)', 'DCC']], ['Stripe Terminal', 'Pop-up & franchise · 14 readers', 'Connected', ['In-person cards & wallets', 'Refunds']], ['Local methods', 'Wallets via Adyen', 'Connected', ['Alipay+, WeChat Pay (APAC)', 'PayPay (JP)', 'UPI (IN)', 'TWINT (CH)']]].map(([n, s, st, caps]) => `<section class="panel"><div class="panel-h"><div class="int-logo">${n.slice(0, 2)}</div><div><h3>${n}</h3><div class="small muted">${s}</div></div><div class="actions">${B(st)}</div></div><div class="panel-b"><div class="chips">${caps.map((x) => `<span class="tag">${x}</span>`).join('')}</div></div></section>`).join('')}
      </div>
      <section class="panel"><div class="panel-h"><h2>Merchant account mapping</h2><span class="sub">Country × brand → acquirer account</span><div class="actions"><button class="btn sm" data-toast="Mapping saved">Save mapping</button></div></div>
        <div class="panel-b flush">${CP.table([
          { h: 'Country', f: (a) => `${CP.flag(a.c.id)} ${a.c.name}` }, { h: 'Brand', f: (a) => a.b.name },
          { h: 'Provider', f: (a) => `<select class="input" aria-label="Provider"><option ${a.provider === 'Adyen' ? 'selected' : ''}>Adyen</option><option ${a.provider !== 'Adyen' ? 'selected' : ''}>Stripe Terminal</option></select>` },
          { h: 'Merchant account', f: (a) => `<span class="mono small">${a.acct}</span>` }, { h: 'Settlement', f: (a) => a.c.currency }, { h: 'Terminals', r: 1, f: (a) => a.terminals },
        ], accts.slice(0, 18))}</div></section>
      <div class="grid g2">
        <section class="panel"><div class="panel-h"><h2>Payment behaviour</h2></div><div class="panel-b stack">
          ${[['Check payment status before any retry (prevents double charge)', true], ['Auto-reverse orphaned authorisations after 10 min', true], ['Allow referenced refund without card present', true], ['Store card alias for returns (only with consent)', true], ['Offer Dynamic Currency Conversion to tourists', false], ['Pre-authorise endless-aisle orders, capture at shipment', true]].map(([t, on], i) => `<label class="row">${CP.switch('pb' + i, on, t)}<span class="small">${t}</span></label>`).join('')}
        </div></section>
        <section class="panel"><div class="panel-h"><h2>Webhooks from providers</h2></div><div class="panel-b"><dl class="kv"><dt>Adyen notifications</dt><dd>${B('Healthy')} HMAC verified · 182k today</dd><dt>Settlement reports</dt><dd>Imported daily 04:00 UTC → Reconciliation</dd><dt>Chargebacks</dt><dd>3 open · routed to Finance</dd><dt>Stripe events</dt><dd>${B('Healthy')} signing secret rotated 2 Sep</dd></dl></div></section>
      </div>`;
    },
  };

  /* ================= Tender rules ================= */
  let tenC = 'FR';
  S.tenders = {
    render() {
      tenC = pickCountry(CP.scope.country || tenC);
      const c = CP.country(tenC);
      const tenders = [['Cash', true], ['Card (Adyen)', true], ['Gift card', true], ['Store credit', true], ['Paper voucher', c.region === 'EMEA'], ['Pay-by-link', c.region !== 'APAC'], ['Employee purchase', true], ['Alipay+ / WeChat Pay', c.region === 'APAC'], ['PayPay', c.id === 'JP'], ['UPI', c.id === 'IN'], ['TWINT', c.id === 'CH'], ['Foreign cash (EUR/USD)', c.id === 'CH' || c.id === 'GB']];
      const limit = { FR: '€1,000 (residents) · €15,000 (tourists)', IT: '€4,999.99', ES: '€999.99', IN: '₹199,999' }[c.id] || 'No limit';
      return `${CP.pageHead({ crumbs: ['Payments'], title: 'Tender rules', desc: 'Which tenders each country accepts, how they combine, legal cash limits, cash rounding and where refunds go.', actions: `<button class="btn primary" data-toast="Tender rules for ${c.name} saved">Save</button>` })}
      <section class="panel"><div class="toolbar">${countryChips('ten-c', tenC)}</div>
        <div class="panel-b grid g2">
          <div class="stack"><h3>Accepted tenders · ${c.name}</h3>
            ${tenders.map(([t, on], i) => `<label class="row" style="justify-content:space-between;border-bottom:1px solid var(--line);padding-bottom:8px"><span>${t}</span>${CP.switch('tn' + i, on, t)}</label>`).join('')}</div>
          <div class="stack"><h3>Rules</h3>
            <div class="form-grid">
              <div class="field"><label for="tr-max">Max tenders per sale</label><input class="input mono" id="tr-max" value="4"></div>
              <div class="field"><label for="tr-cash">Cash limit per sale</label><input class="input mono" id="tr-cash" value="${limit}"></div>
              <div class="field"><label for="tr-round">Cash rounding</label><select class="input" id="tr-round"><option>${['CH', 'AU', 'CA'].includes(c.id) ? '0.05, cash portion only' : 'None'}</option><option>0.05</option><option>0.10</option></select><span class="hint">Posted to SAP as a separate rounding line.</span></div>
              <div class="field"><label for="tr-change">Change given in</label><select class="input" id="tr-change"><option>Cash only</option><option>Cash or store credit</option></select></div>
              <div class="field"><label for="tr-refund">Refund to</label><select class="input" id="tr-refund"><option>Original tender, proportionally</option><option>Original tender, card first</option><option>Store credit</option></select></div>
              <div class="field"><label for="tr-high">ID check for cash over</label><input class="input mono" id="tr-high" value="${c.id === 'IN' ? '₹200,000 (PAN)' : 'Off'}"></div>
            </div>
            <div class="callout"><div>Split tender is allowed in every combination except gift card → gift card. Gift cards cannot be bought with gift cards or store credit.</div></div>
          </div>
        </div></section>`;
    },
    mount(root) { root.querySelector('#ten-c')?.addEventListener('chips', (e) => { tenC = e.detail; CP.render(); }); },
  };

  /* ================= Customer settings ================= */
  S.customers = {
    render() {
      const cs = CP.countriesInScope().slice(0, 8);
      const fields = ['First / last name', 'Email', 'Mobile (E.164)', 'Postal address', 'Date of birth', 'Gender', 'Marketing consent', 'National ID'];
      const rule = (f, c) => {
        if (f === 'National ID') return c.id === 'IN' ? 'Optional' : 'Hidden';
        if (f === 'Gender' || f === 'Date of birth') return c.region === 'EMEA' ? 'Hidden' : 'Optional';
        if (f === 'Email' || f === 'First / last name') return 'Mandatory';
        if (f === 'Marketing consent') return 'Mandatory';
        return 'Optional';
      };
      const k = { Mandatory: 'accent', Optional: '', Hidden: 'info' };
      return `${CP.pageHead({ crumbs: ['Customers'], title: 'Customer settings', desc: 'What associates may capture per country, how consent is recorded, and what each role can see. Data minimisation is enforced by configuration, not by training.', actions: `<button class="btn primary" data-toast="Customer settings saved">Save</button>` })}
      <section class="panel"><div class="panel-h"><h2>Profile fields by country</h2><span class="sub">Click a cell to change it</span></div><div class="panel-b flush"><div class="tbl-wrap"><table class="tbl" id="cust-fields">
        <thead><tr><th>Field</th>${cs.map((c) => `<th>${c.id}</th>`).join('')}</tr></thead>
        <tbody>${fields.map((f) => `<tr><td class="strong">${f}</td>${cs.map((c) => { const r = rule(f, c); return `<td><button class="badge plain ${k[r]}" data-cycle style="cursor:pointer">${r}</button></td>`; }).join('')}</tr>`).join('')}</tbody></table></div></div></section>
      <div class="grid g3">
        <section class="panel"><div class="panel-h"><h2>Consent texts</h2></div><div class="panel-b flush">${CP.table([{ h: 'Purpose', f: (r) => r[0] }, { h: 'Version', f: (r) => `<span class="tag">${r[1]}</span>` }, { h: 'Locales', r: 1, f: (r) => r[2] }], [['Marketing email', 'v4', 11], ['Marketing SMS', 'v3', 9], ['Digital receipt', 'v2', 14], ['Profiling / recommendations', 'v1', 6]])}</div>
          <div class="empty-note">Consent is stored append-only with text version, time, store, associate and channel.</div></section>
        <section class="panel"><div class="panel-h"><h2>PII masking</h2></div><div class="panel-b stack small">
          <dl class="kv"><dt>Associate</dt><dd>j•••@g•••.com · +49 •••• 4417</dd><dt>Store Manager</dt><dd>Masked, reveal with reason</dd><dt>Loss Prevention</dt><dd>Reveal allowed, every reveal logged</dd><dt>Support (vendor)</dt><dd>Never</dd></dl></div></section>
        <section class="panel"><div class="panel-h"><h2>Matching & guests</h2></div><div class="panel-b stack">
          ${[['Duplicate check on email and phone', true], ['Offline-created profiles get a temporary ID', true], ['Anonymous guest ID from e-receipt email hash', true], ['Use card alias for guest matching (where lawful)', false], ['Postal code capture for anonymous sales', true]].map(([t, on], i) => `<label class="row">${CP.switch('cm' + i, on, t)}<span class="small">${t}</span></label>`).join('')}</div></section>
      </div>`;
    },
    mount(root) {
      const order = ['Mandatory', 'Optional', 'Hidden'], k = { Mandatory: 'accent', Optional: '', Hidden: 'info' };
      root.querySelectorAll('[data-cycle]').forEach((b) => (b.onclick = () => {
        const n = order[(order.indexOf(b.textContent) + 1) % 3];
        b.textContent = n; b.className = 'badge plain ' + k[n];
      }));
    },
  };

  /* ================= Privacy requests ================= */
  S.privacy = {
    render() {
      const list = D.privacyRequests.filter((r) => CP.countriesInScope().some((c) => c.id === r.country));
      return `${CP.pageHead({ crumbs: ['Customers'], title: 'Privacy requests', desc: 'Access, correction and erasure requests under GDPR, UK GDPR, CCPA/CPRA, PDPA and DPDPA. Erasure removes the profile, pseudonymises the customer on financial and fiscal records that must be kept, and confirms deletion in every connected system.', actions: `<button class="btn" data-toast="Requests pulled from OneTrust">${I('refresh')}Sync OneTrust</button><button class="btn primary" data-toast="Request DSR-3319 created">${I('plus')}New request</button>` })}
      <div class="grid g4">${[['Open', '3'], ['Due in 7 days', '0'], ['Median time to close', '6 days'], ['Overdue', '0']].map(([a, b]) => `<div class="panel kpi"><div class="eyebrow">${a}</div><div class="v">${b}</div></div>`).join('')}</div>
      <section class="panel"><div class="panel-b flush">${CP.table([
        { h: 'Request', f: (r) => `<b class="mono">${r.id}</b>` }, { h: 'Type', f: (r) => `${r.type}<div class="cell-sub">${r.law}</div>` }, { h: 'Country', f: (r) => CP.flag(r.country) },
        { h: 'Received', f: (r) => r.received }, { h: 'Due', f: (r) => r.due }, { h: 'Systems', f: (r) => `<span class="small">${r.systems}</span>` }, { h: 'Status', f: (r) => B(r.status) },
      ], list)}</div></section>
      <div class="grid g2">
        <section class="panel"><div class="panel-h"><h2>Data residency</h2></div><div class="panel-b flush">${CP.table([{ h: 'Region', f: (r) => `<b>${r[0]}</b>` }, { h: 'Customer & transaction data', f: (r) => `<span class="mono small">${r[1]}</span>` }, { h: 'Countries', f: (r) => r[2] }], [['EU', 'eu-central-1 (Frankfurt)', 'DE, AT, FR, IT, ES, CH'], ['UK', 'eu-west-2 (London)', 'GB'], ['US', 'us-east-1', 'US, CA'], ['APAC', 'ap-southeast-1 + ap-south-1', 'SG, AU, MY · IN (local copy)'], ['Japan', 'ap-northeast-1', 'JP']])}</div></section>
        <section class="panel"><div class="panel-h"><h2>Retention</h2></div><div class="panel-b flush">${CP.table([{ h: 'Data', f: (r) => r[0] }, { h: 'Kept for', f: (r) => r[1] }, { h: 'Then', f: (r) => r[2] }], [['Customer profile (inactive)', '3 years', 'Anonymise'], ['Transactions', '10 years (DE/IT) · 7 years default', 'Archive'], ['Fiscal journal', 'Per country law', 'Write-once archive'], ['Audit log', '7 years', 'Archive to SIEM'], ['Device logs', '90 days', 'Delete']])}</div></section>
      </div>`;
    },
  };
})();
