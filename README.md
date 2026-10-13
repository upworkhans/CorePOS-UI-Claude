# Core POS · Back-office Admin Panel (UI prototype)

Clickable design prototype of the **Core POS back-office admin panel**: the web console HQ, regional, country, finance, tax and support teams use to run a multi-region POS (NAM, EMEA, APAC). It covers the backend management side only, not the in-store POS app.

Open `index.html` in a browser. No build step or server is needed. All data is sample data for a fictional tenant, *Atlas Retail Group* (3 brands, 14 countries, 205 stores).

`python3 tools/build.py` bundles everything into one self-contained file at `dist/core-pos-admin.html` for hosting.

## Core design ideas

| Idea | How it shows up |
|---|---|
| **Scope bar: Region › Country › Brand › Store** | Always visible in the top bar. Every screen filters to the selected scope, and lower-level settings are edited "at" that scope. |
| **Configuration inheritance** | Typed config keys cascade Global → Region → Country → Brand → Store. HQ or tax admins can lock values (e.g. legal cash limits), and the effective value is shown with where it comes from. |
| **Pluggable integrations** | Each provider (Adyen, Stripe, Avalara, Vertex, fiskaly, Fluent, SAP…) is connected once, then assigned to the parts of the hierarchy that use it, with mapping, events and logs. |
| **Role × scope access** | A permission is a role (what you can do) plus a scope (where). Approval limits are configurable per role. |
| **Compliance built into configuration** | Tax engine, fiscalisation, receipts/legal text, number series and privacy rules are configured per country, with previews. |

## Screen inventory (26 screens)

| Area | Screen | Key functionality |
|---|---|---|
| Overview | Command center | KPIs (sales, transactions, ATV, stores trading), hourly sales by region, alerts, region vs target, integration health, offline/sync queue |
| Organisation | Hierarchy | Region → Country → Brand → Store tree, node details, add nodes, set as working scope |
| | Stores | Store list with status, business day, sales, sync; store drawer: profile, devices, payments & fiscal, overrides, opening hours |
| | Configuration | Searchable config keys, inheritance cascade, locks, override at current scope, approval, change history |
| | Store rollout | Clone-from-template wizard, go-live readiness checklist, migration waves and peak freeze |
| Catalogue & pricing | Products | Read-only SAP/PIM master, tax class per country, POS flags, availability from OMS, offline package rebuild |
| | Price lists | SKU × country × concept price matrix, scheduled changes, price lists by store cluster, urgent price push |
| | Promotions | Promotion list, builder (type, scope, segment, schedule, stacking, coupons) with live summary and simulation |
| Tax & compliance | Tax engine | Native VAT/GST/JCT vs Avalara/Vertex per country, inclusive/exclusive pricing, rounding, rates, holidays, exemptions |
| | Fiscalisation | Fiscal regimes per country (KassenSichV, RKSV, NF525, RT, VeriFactu…), journal chain integrity, legal exports, outage modes, journal search |
| | Receipts & documents | Template designer with live receipt preview per country/doc type, digital delivery channels, number series, effective-dated legal text |
| | Localisation | Currency/date/address formats, FX rates and foreign cash, language coverage |
| Payments | Payment providers | Adyen / Stripe / local methods, merchant account mapping country × brand, payment safety behaviours, provider webhooks |
| | Tender rules | Accepted tenders per country, max tenders, legal cash limits, cash rounding, refund routing |
| Customers | Customer settings | Field rules per country (mandatory/optional/hidden), consent texts, PII masking by role, matching and guest IDs |
| | Privacy requests | GDPR/CCPA/PDPA/DPDPA request queue, data residency, retention |
| Operations | Devices | Fleet KPIs, app version distribution, device list and drawer (telemetry, lock, sign out, wipe, force sync) |
| | Business day & cash | Store day status, drawers, over/short, Z-close denomination count, cash rules |
| | Releases & flags | App release rings, feature flags with targeting, environments |
| Integrations | Integration hub | Connector catalogue by category; drawer: credentials, where it applies, field/tax-code mapping, events, logs |
| | Events & webhooks | Failed-message queue with inspect/edit/replay, webhook subscriptions, event catalogue, API clients and versioning |
| Finance & reports | Reports | Sales flash (ATV, UPT, CVR, SPH), report library, scheduled reports |
| | Reconciliation | POS vs tenders vs PSP settlement vs SAP per store-day, exception resolution and re-post |
| Access & security | Users & roles | Users with role + scope, permission matrix, approval limits, invite with scope |
| | Audit log | Immutable before/after log with filters, export, SIEM streaming |
| | Security & SSO | OIDC/SAML + MFA, SCIM, device PIN/biometric policy, log shipping, keys and network |

## Files

```
index.html                    shell (sidebar, scope bar, page host)
assets/styles.css             design tokens (light + dark) and components
assets/data.js                sample tenant data
assets/app.js                 router, scope model, drawers/modals/toasts, helpers
assets/screens-org.js         command center, organisation, catalogue & pricing
assets/screens-compliance.js  tax, fiscal, receipts, localisation, payments, customers, privacy
assets/screens-ops.js         operations, integrations, finance & reports, access & security
tools/build.py                single-file bundle → dist/core-pos-admin.html
```
