/* Core POS Admin: sample tenant data.
   Everything here is example data for the prototype ("Atlas Retail Group"),
   modelled on the Region → Country → Brand → Store hierarchy. */
window.CP = window.CP || {};

CP.data = (function () {
  const regions = [
    { id: 'NAM', name: 'North America', tz: 'America/Chicago', currency: 'USD', color: 1 },
    { id: 'EMEA', name: 'Europe, Middle East & Africa', tz: 'Europe/Berlin', currency: 'EUR', color: 2 },
    { id: 'APAC', name: 'Asia Pacific', tz: 'Asia/Singapore', currency: 'SGD', color: 3 },
  ];

  const countries = [
    { id: 'US', name: 'United States', region: 'NAM', currency: 'USD', lang: 'en-US', tax: 'Avalara AvaTax', taxMode: 'exclusive', fiscal: null, stores: 64, residency: 'us-east' },
    { id: 'CA', name: 'Canada', region: 'NAM', currency: 'CAD', lang: 'en-CA, fr-CA', tax: 'Avalara AvaTax', taxMode: 'exclusive', fiscal: null, stores: 11, residency: 'us-east' },
    { id: 'DE', name: 'Germany', region: 'EMEA', currency: 'EUR', lang: 'de-DE', tax: 'Native VAT', taxMode: 'inclusive', fiscal: 'KassenSichV · fiskaly TSE', stores: 22, residency: 'eu-central' },
    { id: 'AT', name: 'Austria', region: 'EMEA', currency: 'EUR', lang: 'de-AT', tax: 'Native VAT', taxMode: 'inclusive', fiscal: 'RKSV signature chain', stores: 6, residency: 'eu-central' },
    { id: 'FR', name: 'France', region: 'EMEA', currency: 'EUR', lang: 'fr-FR', tax: 'Native VAT', taxMode: 'inclusive', fiscal: 'NF525 (LNE)', stores: 14, residency: 'eu-central' },
    { id: 'IT', name: 'Italy', region: 'EMEA', currency: 'EUR', lang: 'it-IT', tax: 'Native VAT', taxMode: 'inclusive', fiscal: 'RT server · AdE', stores: 9, residency: 'eu-central' },
    { id: 'ES', name: 'Spain', region: 'EMEA', currency: 'EUR', lang: 'es-ES', tax: 'Native VAT', taxMode: 'inclusive', fiscal: 'VeriFactu / TicketBAI', stores: 8, residency: 'eu-central' },
    { id: 'GB', name: 'United Kingdom', region: 'EMEA', currency: 'GBP', lang: 'en-GB', tax: 'Native VAT', taxMode: 'inclusive', fiscal: null, stores: 18, residency: 'eu-west' },
    { id: 'CH', name: 'Switzerland', region: 'EMEA', currency: 'CHF', lang: 'de-CH, fr-CH', tax: 'Native VAT', taxMode: 'inclusive', fiscal: null, stores: 5, residency: 'eu-central' },
    { id: 'JP', name: 'Japan', region: 'APAC', currency: 'JPY', lang: 'ja-JP', tax: 'Native JCT', taxMode: 'inclusive', fiscal: 'Qualified invoice (T-no.)', stores: 17, residency: 'ap-northeast' },
    { id: 'AU', name: 'Australia', region: 'APAC', currency: 'AUD', lang: 'en-AU', tax: 'Native GST', taxMode: 'inclusive', fiscal: null, stores: 9, residency: 'ap-southeast' },
    { id: 'SG', name: 'Singapore', region: 'APAC', currency: 'SGD', lang: 'en-SG, zh-SG', tax: 'Native GST', taxMode: 'inclusive', fiscal: null, stores: 6, residency: 'ap-southeast' },
    { id: 'IN', name: 'India', region: 'APAC', currency: 'INR', lang: 'en-IN, hi-IN', tax: 'Native GST (CGST/SGST/IGST)', taxMode: 'inclusive', fiscal: 'e-Invoice IRN', stores: 12, residency: 'ap-south' },
    { id: 'MY', name: 'Malaysia', region: 'APAC', currency: 'MYR', lang: 'ms-MY, en-MY', tax: 'Native SST', taxMode: 'exclusive', fiscal: 'MyInvois', stores: 4, residency: 'ap-southeast' },
  ];

  const brands = [
    { id: 'ATL', name: 'Atlas Time', kind: 'Watches & jewellery', concepts: ['Full price', 'Outlet'], hue: 1 },
    { id: 'KES', name: 'Kestrel', kind: 'Leather goods', concepts: ['Full price', 'Outlet'], hue: 2 },
    { id: 'NOR', name: 'Nordlys', kind: 'Minimalist watches', concepts: ['Full price'], hue: 3 },
  ];

  const stores = [
    { code: 'US-NYC-001', name: 'Fifth Avenue Flagship', country: 'US', brand: 'ATL', concept: 'Full price', city: 'New York', tz: 'America/New_York', devices: 14, status: 'Trading', day: 'Open', sales: 48210, txn: 212, sync: '12s', fw: '4.12.1' },
    { code: 'US-DAL-014', name: 'Galleria Dallas', country: 'US', brand: 'KES', concept: 'Full price', city: 'Dallas', tz: 'America/Chicago', devices: 6, status: 'Trading', day: 'Open', sales: 12880, txn: 71, sync: '31s', fw: '4.12.1' },
    { code: 'US-ORL-208', name: 'Orlando Premium Outlets', country: 'US', brand: 'ATL', concept: 'Outlet', city: 'Orlando', tz: 'America/New_York', devices: 9, status: 'Trading', day: 'Open', sales: 21460, txn: 188, sync: '8s', fw: '4.12.1' },
    { code: 'CA-TOR-003', name: 'Yorkdale', country: 'CA', brand: 'NOR', concept: 'Full price', city: 'Toronto', tz: 'America/Toronto', devices: 4, status: 'Trading', day: 'Open', sales: 6420, txn: 39, sync: '22s', fw: '4.11.0' },
    { code: 'DE-BER-012', name: 'KaDeWe Concession', country: 'DE', brand: 'ATL', concept: 'Full price', city: 'Berlin', tz: 'Europe/Berlin', devices: 5, status: 'Trading', day: 'Closing', sales: 18930, txn: 96, sync: '5s', fw: '4.12.1' },
    { code: 'DE-MUC-004', name: 'Kaufingerstraße', country: 'DE', brand: 'KES', concept: 'Full price', city: 'Munich', tz: 'Europe/Berlin', devices: 4, status: 'Attention', day: 'Open', sales: 9120, txn: 58, sync: '6m', fw: '4.11.0' },
    { code: 'DE-ING-301', name: 'Ingolstadt Village', country: 'DE', brand: 'ATL', concept: 'Outlet', city: 'Ingolstadt', tz: 'Europe/Berlin', devices: 7, status: 'Trading', day: 'Open', sales: 15640, txn: 141, sync: '9s', fw: '4.12.1' },
    { code: 'AT-VIE-002', name: 'Kärntner Straße', country: 'AT', brand: 'NOR', concept: 'Full price', city: 'Vienna', tz: 'Europe/Vienna', devices: 3, status: 'Trading', day: 'Open', sales: 5210, txn: 33, sync: '14s', fw: '4.12.1' },
    { code: 'FR-PAR-001', name: 'Champs-Élysées', country: 'FR', brand: 'ATL', concept: 'Full price', city: 'Paris', tz: 'Europe/Paris', devices: 8, status: 'Trading', day: 'Open', sales: 26770, txn: 118, sync: '4s', fw: '4.12.1' },
    { code: 'IT-MIL-005', name: 'Corso Vittorio Emanuele', country: 'IT', brand: 'KES', concept: 'Full price', city: 'Milan', tz: 'Europe/Rome', devices: 5, status: 'Offline', day: 'Open', sales: 7340, txn: 44, sync: '41m', fw: '4.11.0' },
    { code: 'ES-MAD-007', name: 'Gran Vía', country: 'ES', brand: 'ATL', concept: 'Full price', city: 'Madrid', tz: 'Europe/Madrid', devices: 4, status: 'Trading', day: 'Open', sales: 8810, txn: 61, sync: '11s', fw: '4.12.1' },
    { code: 'GB-LON-001', name: 'Regent Street', country: 'GB', brand: 'ATL', concept: 'Full price', city: 'London', tz: 'Europe/London', devices: 10, status: 'Trading', day: 'Open', sales: 31450, txn: 164, sync: '3s', fw: '4.12.1' },
    { code: 'CH-ZRH-001', name: 'Bahnhofstrasse', country: 'CH', brand: 'NOR', concept: 'Full price', city: 'Zürich', tz: 'Europe/Zurich', devices: 3, status: 'Trading', day: 'Open', sales: 11980, txn: 27, sync: '18s', fw: '4.12.1' },
    { code: 'JP-TYO-011', name: 'Ginza Six', country: 'JP', brand: 'ATL', concept: 'Full price', city: 'Tokyo', tz: 'Asia/Tokyo', devices: 6, status: 'Closed', day: 'Z-closed', sales: 3412000, txn: 132, sync: '2m', fw: '4.12.1' },
    { code: 'JP-OSA-020', name: 'Rinku Premium Outlets', country: 'JP', brand: 'KES', concept: 'Outlet', city: 'Osaka', tz: 'Asia/Tokyo', devices: 5, status: 'Closed', day: 'Z-closed', sales: 1988000, txn: 117, sync: '3m', fw: '4.12.1' },
    { code: 'AU-SYD-002', name: 'Pitt Street Mall', country: 'AU', brand: 'ATL', concept: 'Full price', city: 'Sydney', tz: 'Australia/Sydney', devices: 5, status: 'Closed', day: 'Z-closed', sales: 22140, txn: 97, sync: '5m', fw: '4.11.0' },
    { code: 'SG-SIN-001', name: 'ION Orchard', country: 'SG', brand: 'NOR', concept: 'Full price', city: 'Singapore', tz: 'Asia/Singapore', devices: 4, status: 'Closed', day: 'Z-closed', sales: 14260, txn: 58, sync: '4m', fw: '4.12.1' },
    { code: 'IN-BLR-003', name: 'UB City', country: 'IN', brand: 'ATL', concept: 'Full price', city: 'Bengaluru', tz: 'Asia/Kolkata', devices: 3, status: 'Closed', day: 'Z-closed', sales: 612400, txn: 49, sync: '7m', fw: '4.11.0' },
    { code: 'MY-KUL-001', name: 'Pavilion KL', country: 'MY', brand: 'KES', concept: 'Full price', city: 'Kuala Lumpur', tz: 'Asia/Kuala_Lumpur', devices: 3, status: 'Closed', day: 'Z-closed', sales: 18430, txn: 41, sync: '6m', fw: '4.12.1' },
  ];

  /* Integration catalogue. "scope" is where a connection is assigned in the hierarchy. */
  const integrations = [
    { id: 'adyen', name: 'Adyen', cat: 'Payments', desc: 'In-person terminals, pay-by-link, referenced refunds, gift cards (Givex/SVS).', status: 'Connected', scope: 'Global · 18 merchant accounts', health: 99.98, latency: 412, events: '182k/day' },
    { id: 'stripe', name: 'Stripe Terminal', cat: 'Payments', desc: 'Alternative acquirer for pop-up and franchise stores.', status: 'Connected', scope: 'NAM › US · 3 pop-up stores', health: 99.95, latency: 388, events: '1.2k/day' },
    { id: 'avalara', name: 'Avalara AvaTax', cat: 'Tax', desc: 'US/CA sales tax quote at cart, commit on completion, void on return.', status: 'Connected', scope: 'NAM › US, CA', health: 99.91, latency: 146, events: '64k/day' },
    { id: 'vertex', name: 'Vertex O Series', cat: 'Tax', desc: 'Alternative sales-tax provider. Same quote/commit/void contract.', status: 'Available', scope: 'Not assigned', health: null, latency: null, events: '—' },
    { id: 'fiskaly', name: 'fiskaly SIGN DE / AT', cat: 'Fiscal', desc: 'Cloud TSE (KassenSichV), DSFinV-K export, RKSV signature chain.', status: 'Connected', scope: 'EMEA › DE, AT', health: 99.99, latency: 95, events: '31k/day' },
    { id: 'rtserver', name: 'Epson RT Server', cat: 'Fiscal', desc: 'Italian RT registration and daily totals to Agenzia delle Entrate.', status: 'Degraded', scope: 'EMEA › IT', health: 97.2, latency: 1830, events: '4.1k/day' },
    { id: 'efsta', name: 'efsta EFR', cat: 'Fiscal', desc: 'Fiscal middleware for FR NF525, ES VeriFactu/TicketBAI, PT ATCUD.', status: 'Connected', scope: 'EMEA › FR, ES', health: 99.97, latency: 120, events: '12k/day' },
    { id: 'fluent', name: 'Fluent Commerce', cat: 'Order management', desc: 'Inventory availability, endless aisle, BOPIS, ship-from-store, BORIS.', status: 'Connected', scope: 'Global', health: 99.93, latency: 228, events: '96k/day' },
    { id: 'sap', name: 'SAP S/4HANA', cat: 'ERP', desc: 'Article, price and promotion master in. TLOG, Z-close totals, deposits out.', status: 'Connected', scope: 'Global', health: 99.6, latency: 940, events: '210k/day' },
    { id: 'amperity', name: 'Amperity', cat: 'Customer data', desc: 'Profile lookup, identity resolution, consent and transaction feed.', status: 'Connected', scope: 'Global', health: 99.89, latency: 610, events: '58k/day' },
    { id: 'bloomreach', name: 'Bloomreach', cat: 'Customer engagement', desc: 'Digital receipts by email/SMS, customer events, campaigns.', status: 'Connected', scope: 'NAM, EMEA', health: 99.94, latency: 300, events: '41k/day' },
    { id: 'talon', name: 'Talon.One', cat: 'Promotions', desc: 'External promotion engine with cached-rule fallback.', status: 'Available', scope: 'Not assigned', health: null, latency: null, events: '—' },
    { id: 'okta', name: 'Okta', cat: 'Identity', desc: 'OIDC/SAML sign-in with MFA, SCIM 2.0 provisioning.', status: 'Connected', scope: 'Global', health: 100, latency: 80, events: '8.4k/day' },
    { id: 'jamf', name: 'Jamf Pro', cat: 'Device management', desc: 'Zero-touch enrolment, managed app config, certificate issue.', status: 'Connected', scope: 'NAM, EMEA', health: 99.99, latency: 140, events: '—' },
    { id: 'intune', name: 'Microsoft Intune', cat: 'Device management', desc: 'Android Enterprise enrolment for APAC store devices.', status: 'Connected', scope: 'APAC', health: 99.97, latency: 160, events: '—' },
    { id: 'pagero', name: 'Pagero', cat: 'E-invoicing', desc: 'Peppol BIS 3.0, XRechnung, FatturaPA, Factur-X, India IRN.', status: 'Connected', scope: 'EMEA › DE, IT, FR · APAC › IN', health: 99.8, latency: 720, events: '900/day' },
    { id: 'shoppertrak', name: 'ShopperTrak', cat: 'Traffic', desc: 'Footfall every 15 minutes for conversion rate (CVR%).', status: 'Connected', scope: 'NAM, EMEA', health: 99.5, latency: null, events: '96/store/day' },
    { id: 'ukg', name: 'UKG Pro WFM', cat: 'Workforce', desc: 'Worked and scheduled hours for Sales Per Hour (SPH).', status: 'Error', scope: 'NAM › US', health: 91.4, latency: null, events: 'hourly' },
    { id: 'snowflake', name: 'Snowflake', cat: 'Data warehouse', desc: 'Near-real-time event stream plus daily Parquet export to S3.', status: 'Connected', scope: 'Global', health: 99.99, latency: null, events: 'stream' },
    { id: 'onetrust', name: 'OneTrust', cat: 'Privacy', desc: 'GDPR / PDPA / DPDPA access and erasure requests.', status: 'Connected', scope: 'Global', health: 100, latency: null, events: '30/day' },
    { id: 'globalblue', name: 'Global Blue', cat: 'Tax-free shopping', desc: 'Tourist VAT refund forms at the till.', status: 'Available', scope: 'Not assigned', health: null, latency: null, events: '—' },
  ];

  const alerts = [
    { sev: 'critical', title: 'IT-MIL-005 offline for 41 min', detail: '5 devices trading offline. 44 transactions queued; RT server unreachable.', time: '09:42', link: 'devices' },
    { sev: 'serious', title: 'UKG WFM import failing', detail: 'OAuth token expired. Sales Per Hour for US stores is stale since 06:00 CT.', time: '08:15', link: 'integrations' },
    { sev: 'warning', title: 'Reconciliation: 3 stores with Adyen variance', detail: 'DE-MUC-004 −€42.10 · FR-PAR-001 +€12.00 · US-DAL-014 −$8.99', time: '07:30', link: 'reconciliation' },
    { sev: 'warning', title: '7 devices below minimum app version', detail: 'N-1 (4.11.x) supported until 30 Nov. 4.10.x blocked from login.', time: 'Yesterday', link: 'devices' },
    { sev: 'info', title: 'Price change scheduled for EMEA', detail: '1,284 SKUs activate 01 Nov 00:00 store-local time.', time: 'Yesterday', link: 'pricing' },
  ];

  const users = [
    { name: 'Priya Raman', email: 'priya.raman@atlas-retail.example', role: 'HQ Admin', scope: 'Global', mfa: true, last: '2 min ago', status: 'Active' },
    { name: 'Jonas Weber', email: 'jonas.weber@atlas-retail.example', role: 'Country Manager', scope: 'EMEA › Germany', mfa: true, last: '1 h ago', status: 'Active' },
    { name: 'Aiko Tanaka', email: 'aiko.tanaka@atlas-retail.example', role: 'Tax / Fiscal Admin', scope: 'APAC › Japan', mfa: true, last: 'Today', status: 'Active' },
    { name: 'Marcus Lee', email: 'marcus.lee@atlas-retail.example', role: 'Finance', scope: 'NAM', mfa: true, last: 'Today', status: 'Active' },
    { name: 'Sofia Rossi', email: 'sofia.rossi@atlas-retail.example', role: 'Store Manager', scope: 'IT-MIL-005', mfa: true, last: '3 d ago', status: 'Active' },
    { name: 'Daniel Okafor', email: 'daniel.okafor@atlas-retail.example', role: 'Loss Prevention', scope: 'EMEA', mfa: true, last: 'Today', status: 'Active' },
    { name: 'Chloé Martin', email: 'chloe.martin@atlas-retail.example', role: 'District Manager', scope: 'EMEA › France › Paris district', mfa: true, last: '5 h ago', status: 'Active' },
    { name: 'Vendor L2 · R. Singh', email: 'support-l2@corepos.example', role: 'Support (vendor)', scope: 'Global · expires in 6 h', mfa: true, last: 'Now', status: 'Time-boxed' },
    { name: 'Ethan Brooks', email: 'ethan.brooks@atlas-retail.example', role: 'Store Manager', scope: 'US-NYC-001', mfa: false, last: '—', status: 'Invited' },
  ];

  const roles = ['Associate', 'Senior Associate', 'Store Manager', 'District Manager', 'Country Manager', 'Finance', 'Loss Prevention', 'Tax / Fiscal Admin', 'HQ Admin', 'Support (vendor)'];

  const permissions = [
    { group: 'Selling', items: [
      ['Sell and receipted return', [1,1,1,1,0,0,0,0,0,0]],
      ['Manual discount (up to threshold)', [0,1,1,1,0,0,0,0,0,0]],
      ['Price override', [0,0,1,1,0,0,0,0,0,0]],
      ['Non-receipted return', [0,0,1,1,0,0,0,0,0,0]],
      ['Post-void completed sale', [0,0,1,1,0,0,0,0,0,0]],
      ['Remote approval', [0,0,1,1,1,0,0,0,0,0]],
    ]},
    { group: 'Store operations', items: [
      ['Open / close business day', [0,1,1,1,0,0,0,0,0,0]],
      ['No-sale drawer open', [0,0,1,1,0,0,0,0,0,0]],
      ['X report / Z close', [0,0,1,1,0,1,0,0,0,0]],
    ]},
    { group: 'Data & privacy', items: [
      ['View customer PII (unmasked, logged)', [0,0,0,0,0,0,1,0,0,0]],
      ['Export PII', [0,0,0,0,0,0,1,0,0,0]],
      ['Fiscal journal search & export', [0,0,0,0,0,1,1,1,0,0]],
      ['Audit log export', [0,0,0,1,1,1,1,0,1,0]],
    ]},
    { group: 'Administration', items: [
      ['Edit country configuration', [0,0,0,0,1,0,0,1,1,0]],
      ['Tax rates, holidays, number series', [0,0,0,0,0,0,0,1,1,0]],
      ['Manage integrations & secrets', [0,0,0,0,0,0,0,0,1,0]],
      ['Feature flags & releases', [0,0,0,0,0,0,0,0,1,0]],
      ['Replay failed messages (DLQ)', [0,0,0,0,0,1,0,0,1,1]],
    ]},
  ];

  const audit = [
    { t: '10:14:22', who: 'Priya Raman', action: 'Config changed', target: 'returns.window_days · EMEA › FR', before: '30', after: '14', ip: '10.4.2.18' },
    { t: '10:09:51', who: 'Daniel Okafor', action: 'PII revealed', target: 'Customer C-88213490 · phone', before: 'masked', after: 'shown 60s', ip: '10.9.1.7' },
    { t: '09:58:03', who: 'Sofia Rossi', action: 'Post-void approved', target: 'IT-MIL-005 · TXN 005-03-118842', before: 'Completed', after: 'Voided', ip: 'device D-IT5-02' },
    { t: '09:41:17', who: 'Marcus Lee', action: 'TLOG re-posted', target: 'US-DAL-014 · 2026-10-12', before: 'Failed', after: 'Posted', ip: '10.2.8.44' },
    { t: '09:30:00', who: 'System', action: 'Price list activated', target: 'PL-JP-FULL-2026W42', before: 'Scheduled', after: 'Active', ip: '—' },
    { t: '09:12:40', who: 'Aiko Tanaka', action: 'Number series reserved', target: 'JP-TYO-011 · INV block 40001–41000', before: '—', after: 'Reserved', ip: '10.7.3.2' },
    { t: '08:55:09', who: 'Jonas Weber', action: 'Feature flag enabled', target: 'clienteling.wishlist · DE pilot stores', before: 'Off', after: 'On (3 stores)', ip: '10.4.6.91' },
    { t: '08:31:26', who: 'Okta SCIM', action: 'User deprovisioned', target: 'l.fischer@atlas-retail.example', before: 'Active', after: 'Revoked', ip: '—' },
  ];

  const promotions = [
    { id: 'PR-24117', name: 'Holiday gifting · 20% off leather', type: '% off category', scope: 'NAM · Kestrel', start: '24 Nov', end: '02 Dec', status: 'Scheduled', redemptions: '—', stack: 'Exclusive' },
    { id: 'PR-24102', name: 'Buy a watch, get a strap free', type: 'Gift with purchase', scope: 'Global · Atlas Time', start: '01 Oct', end: '31 Oct', status: 'Live', redemptions: '3,812', stack: 'Stackable' },
    { id: 'PR-24098', name: 'Spend ¥50,000 save ¥5,000', type: 'Tiered spend', scope: 'APAC › JP', start: '07 Oct', end: '20 Oct', status: 'Live', redemptions: '611', stack: 'Best deal' },
    { id: 'PR-24090', name: 'Outlet 2 for €99 straps', type: 'Mix & match', scope: 'EMEA · Outlet concept', start: '15 Sep', end: '31 Dec', status: 'Live', redemptions: '1,204', stack: 'Exclusive' },
    { id: 'PR-24071', name: 'Employee purchase 40%', type: 'Employee discount', scope: 'Global', start: '01 Jan', end: '31 Dec', status: 'Live', redemptions: '9,430', stack: 'Exclusive' },
    { id: 'PR-24055', name: 'Welcome coupon WELCOME15', type: 'Unique coupon codes', scope: 'EMEA, NAM', start: '01 Aug', end: '30 Nov', status: 'Paused', redemptions: '2,077', stack: 'Stackable' },
    { id: 'PR-24030', name: 'Singles Day bundle', type: 'Bundle', scope: 'APAC › SG, MY', start: '11 Nov', end: '11 Nov', status: 'Draft', redemptions: '—', stack: 'Best deal' },
  ];

  const products = [
    { sku: 'ATL-W-40221', name: 'Meridian Chronograph 42mm, steel', brand: 'ATL', cat: 'Watches › Chronograph', taxClass: 'Watches', ean: '4053858942217', status: 'Active' },
    { sku: 'ATL-W-40198', name: 'Meridian Automatic 40mm, rose gold', brand: 'ATL', cat: 'Watches › Automatic', taxClass: 'Watches', ean: '4053858941982', status: 'Active' },
    { sku: 'KES-L-11804', name: 'Harbour Tote, cognac leather', brand: 'KES', cat: 'Leather › Bags', taxClass: 'Leather goods', ean: '0796483118045', status: 'Active' },
    { sku: 'KES-L-11290', name: 'Bifold Wallet RFID, black', brand: 'KES', cat: 'Leather › Small goods', taxClass: 'Leather goods', ean: '0796483112906', status: 'Active' },
    { sku: 'NOR-W-00712', name: 'Fjord 36mm, mesh strap', brand: 'NOR', cat: 'Watches › Quartz', taxClass: 'Watches', ean: '5707446007125', status: 'Active' },
    { sku: 'ATL-S-ENGRV', name: 'Engraving service (up to 20 chars)', brand: 'ATL', cat: 'Services', taxClass: 'Services', ean: '—', status: 'Active' },
    { sku: 'ATL-GC-VAR', name: 'Gift card, variable amount', brand: 'ATL', cat: 'Gift cards', taxClass: 'Non-taxable (stored value)', ean: '—', status: 'Active' },
    { sku: 'KES-L-10022', name: 'Weekender Duffle, olive', brand: 'KES', cat: 'Leather › Bags', taxClass: 'Leather goods', ean: '0796483100224', status: 'Discontinued' },
  ];

  /* Price matrix rows for the selected SKU: country × concept */
  const prices = [
    { country: 'US', concept: 'Full price', list: 'USD 395.00', promo: '—', next: 'USD 425.00 · 01 Jan', tax: 'Excl.' },
    { country: 'US', concept: 'Outlet', list: 'USD 279.00', promo: 'USD 237.15 (−15%)', next: '—', tax: 'Excl.' },
    { country: 'CA', concept: 'Full price', list: 'CAD 529.00', promo: '—', next: '—', tax: 'Excl.' },
    { country: 'DE', concept: 'Full price', list: 'EUR 379,00', promo: '—', next: 'EUR 399,00 · 01 Nov', tax: 'Incl. 19%' },
    { country: 'DE', concept: 'Outlet', list: 'EUR 269,00', promo: '—', next: '—', tax: 'Incl. 19%' },
    { country: 'FR', concept: 'Full price', list: 'EUR 379,00', promo: '—', next: 'EUR 399,00 · 01 Nov', tax: 'Incl. 20%' },
    { country: 'GB', concept: 'Full price', list: 'GBP 329.00', promo: '—', next: '—', tax: 'Incl. 20%' },
    { country: 'CH', concept: 'Full price', list: 'CHF 389.00', promo: '—', next: '—', tax: 'Incl. 8.1%' },
    { country: 'JP', concept: 'Full price', list: 'JPY 59,400', promo: 'JPY 54,400 (tier)', next: '—', tax: 'Incl. 10%' },
    { country: 'AU', concept: 'Full price', list: 'AUD 599.00', promo: '—', next: '—', tax: 'Incl. 10%' },
    { country: 'IN', concept: 'Full price', list: 'INR 32,995', promo: '—', next: '—', tax: 'Incl. 18% GST' },
  ];

  const taxRates = {
    DE: [['Standard', '19%', 'Watches, leather, apparel, engraving'], ['Reduced', '7%', 'Books, printed matter'], ['Exempt', '0%', 'Gift cards (stored value)']],
    FR: [['Normal', '20%', 'All merchandise and services'], ['Exempt', '0%', 'Gift cards (multi-purpose voucher)']],
    GB: [['Standard', '20%', 'Merchandise and services'], ['Zero', '0%', "Children's clothing"]],
    JP: [['Standard', '10%', 'Merchandise'], ['Reduced', '8%', 'Food and beverage (gift sets)']],
    IN: [['GST 18%', 'CGST 9% + SGST 9%', 'Watches HSN 9102'], ['GST 12%', 'CGST 6% + SGST 6%', 'Leather goods HSN 4202 (≤ ₹1,000)'], ['IGST 18%', 'Inter-state', 'Endless-aisle ship-to']],
    US: [['Provider', 'Avalara AvaTax', 'Rates by jurisdiction at quote time'], ['Fallback', 'Cached ZIP rate', 'Used after 800 ms timeout or offline']],
  };

  const devices = [
    { id: 'D-NYC1-01', store: 'US-NYC-001', model: 'iPhone 15 + sled', os: 'iOS 18.6', app: '4.12.1', poiid: 'S1F2-000158201', printer: 'Epson TM-m30III', battery: 82, sync: '12s', state: 'Healthy' },
    { id: 'D-NYC1-02', store: 'US-NYC-001', model: 'iPad Air 11"', os: 'iPadOS 18.6', app: '4.12.1', poiid: 'S1F2-000158202', printer: 'Epson TM-m30III', battery: 64, sync: '9s', state: 'Healthy' },
    { id: 'D-MUC4-01', store: 'DE-MUC-004', model: 'iPhone 14', os: 'iOS 17.7', app: '4.11.0', poiid: 'V400m-806117', printer: 'Star mC-Print3', battery: 23, sync: '6m', state: 'Low battery' },
    { id: 'D-IT5-01', store: 'IT-MIL-005', model: 'iPhone 15', os: 'iOS 18.6', app: '4.11.0', poiid: 'S1F2-000201114', printer: 'Epson FP-81 II RT', battery: 71, sync: '41m', state: 'Offline' },
    { id: 'D-IT5-02', store: 'IT-MIL-005', model: 'iPhone 15', os: 'iOS 18.6', app: '4.11.0', poiid: 'S1F2-000201115', printer: 'Epson FP-81 II RT', battery: 58, sync: '41m', state: 'Offline' },
    { id: 'D-TYO11-03', store: 'JP-TYO-011', model: 'Zebra TC53', os: 'Android 14', app: '4.12.1', poiid: 'AMS1-000330561', printer: 'Epson TM-m30III', battery: 100, sync: '2m', state: 'Charging' },
    { id: 'D-BLR3-01', store: 'IN-BLR-003', model: 'Samsung Tab S9', os: 'Android 14', app: '4.10.2', poiid: 'AMS1-000412880', printer: 'Epson TM-T82X', battery: 90, sync: '7m', state: 'Blocked version' },
    { id: 'D-LON1-04', store: 'GB-LON-001', model: 'iPhone 15 Pro', os: 'iOS 18.6', app: '4.12.1', poiid: 'S1F2-000099340', printer: 'Epson TM-m30III', battery: 47, sync: '3s', state: 'Healthy' },
  ];

  const recon = [
    { store: 'DE-MUC-004', day: '12 Oct', pos: 'EUR 11,402.80', tenders: 'EUR 11,402.80', psp: 'EUR 11,360.70', sap: 'Posted', diff: '−42.10', status: 'Variance' },
    { store: 'FR-PAR-001', day: '12 Oct', pos: 'EUR 24,118.00', tenders: 'EUR 24,118.00', psp: 'EUR 24,130.00', sap: 'Posted', diff: '+12.00', status: 'Variance' },
    { store: 'US-DAL-014', day: '12 Oct', pos: 'USD 13,940.22', tenders: 'USD 13,940.22', psp: 'USD 13,931.23', sap: 'Re-posted', diff: '−8.99', status: 'Variance' },
    { store: 'GB-LON-001', day: '12 Oct', pos: 'GBP 29,880.45', tenders: 'GBP 29,880.45', psp: 'GBP 29,880.45', sap: 'Posted', diff: '0.00', status: 'Matched' },
    { store: 'JP-TYO-011', day: '12 Oct', pos: 'JPY 3,198,600', tenders: 'JPY 3,198,600', psp: 'JPY 3,198,600', sap: 'Posted', diff: '0', status: 'Matched' },
    { store: 'IT-MIL-005', day: '12 Oct', pos: 'EUR 6,904.00', tenders: 'EUR 6,904.00', psp: 'Pending', sap: 'Failed · RT totals missing', diff: '—', status: 'Exception' },
    { store: 'AU-SYD-002', day: '12 Oct', pos: 'AUD 20,410.10', tenders: 'AUD 20,410.10', psp: 'AUD 20,410.10', sap: 'Posted', diff: '0.00', status: 'Matched' },
  ];

  const dlq = [
    { id: 'evt_7f3a91', type: 'TransactionCompleted.v3', target: 'SAP S/4HANA · TLOG', store: 'IT-MIL-005', tries: 9, err: '422 · Missing fiscal day total (RT)', age: '38m' },
    { id: 'evt_7f2c10', type: 'InventoryDelta.v2', target: 'Fluent Commerce', store: 'DE-MUC-004', tries: 4, err: '429 · Rate limited, retrying with backoff', age: '6m' },
    { id: 'whk_19bd02', type: 'webhook · ReturnCompleted', target: 'https://hooks.atlas-retail.example/lp', store: 'US-ORL-208', tries: 12, err: 'TLS handshake timeout', age: '2h' },
    { id: 'evt_7ef801', type: 'CustomerCreated.v2', target: 'Amperity', store: 'SG-SIN-001', tries: 3, err: '409 · Duplicate email, merge required', age: '1h' },
  ];

  const flags = [
    { key: 'clienteling.wishlist', name: 'Clienteling wishlists', target: 'DE pilot (3 stores)', pct: 4, state: 'Pilot' },
    { key: 'endless_aisle.mixed_basket', name: 'Mixed basket (take now + ship)', target: 'NAM, EMEA', pct: 100, state: 'On' },
    { key: 'payments.pay_by_link', name: 'Pay-by-link', target: 'NAM › US', pct: 100, state: 'On' },
    { key: 'receipts.whatsapp', name: 'WhatsApp / LINE receipts', target: 'APAC › SG, MY, JP', pct: 0, state: 'Off' },
    { key: 'tax.tax_free_global_blue', name: 'Tourist tax-free forms', target: '—', pct: 0, state: 'Off' },
    { key: 'ai.recommendations', name: 'AI product recommendations', target: 'Atlas Time · GB, FR', pct: 25, state: 'Pilot' },
  ];

  const privacyRequests = [
    { id: 'DSR-3318', type: 'Erasure', law: 'GDPR Art. 17', country: 'DE', received: '11 Oct', due: '10 Nov', systems: 'Core POS ✓ · Amperity ✓ · Bloomreach …', status: 'In progress' },
    { id: 'DSR-3317', type: 'Access', law: 'GDPR Art. 15', country: 'FR', received: '10 Oct', due: '09 Nov', systems: 'Export ready (JSON, 14 records)', status: 'Ready' },
    { id: 'DSR-3311', type: 'Erasure', law: 'PDPA', country: 'SG', received: '04 Oct', due: '03 Nov', systems: 'All systems ✓ · fiscal refs pseudonymised', status: 'Completed' },
    { id: 'DSR-3302', type: 'Correction', law: 'DPDPA', country: 'IN', received: '29 Sep', due: '29 Oct', systems: 'Awaiting customer ID verification', status: 'Blocked' },
    { id: 'DSR-3297', type: 'Erasure', law: 'CCPA/CPRA', country: 'US', received: '27 Sep', due: '11 Nov', systems: 'All systems ✓', status: 'Completed' },
  ];

  /* Hourly net sales today (reporting currency, USD k) per region, for the dashboard chart. */
  const hourly = {
    hours: ['08', '09', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20'],
    NAM: [2, 9, 21, 34, 46, 52, 49, 55, 61, 66, 58, 41, 22],
    EMEA: [18, 39, 58, 71, 83, 79, 76, 84, 92, 88, 64, 31, 12],
    APAC: [44, 61, 72, 80, 77, 70, 68, 73, 66, 49, 28, 11, 4],
  };

  return { regions, countries, brands, stores, integrations, alerts, users, roles, permissions, audit, promotions, products, prices, taxRates, devices, recon, dlq, flags, privacyRequests, hourly };
})();
