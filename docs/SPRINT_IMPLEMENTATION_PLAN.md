# BillPush — Phase-wise Implementation Plan (Sprints)

**Source:** [`AUDIT_FIXES_AND_IMPROVEMENTS.md`](./AUDIT_FIXES_AND_IMPROVEMENTS.md)  
**Goal:** Ship a production-safe MVP in 4 phases, then decide roadmap features.

Suggested cadence: **1 sprint ≈ 1–2 weeks** per phase (adjust by team size).

---

## Overview

| Phase | Sprint focus | Outcome |
|-------|----------------|---------|
| **Phase 1** | Unbreak core POS | Sales, stock, returns, loyalty, portal, routing all work |
| **Phase 2** | Lock down & correct | Safe for real stores; inventory/loyalty/void trustworthy |
| **Phase 3** | Ops & reliability | Offline/FCM, uploads, PDF, deploy hygiene |
| **Phase 4** | Quality & truth | Tests, CI, docs/marketing match product |

**Deferred (not in these 4 phases):** WhatsApp Cloud API, thermal printers, OTP portal, payments, multi-brand SaaS, full web admin.

---

## Phase 1 — Unbreak Core Flows
**Sprint goal:** Every claimed MVP path works end-to-end on a staging build.  
**Theme:** Fix broken wiring first — no new features.

### Scope

| Ticket | Work | Area |
|--------|------|------|
| P1-1 | Fix JWT field access (`brandId` / `storeId` / `userId`) in returns + loyalty | Backend |
| P1-2 | Import `AuditLogsModule` + register `ScheduleModule.forRoot()` | Backend |
| P1-3 | Send `product_id` from POS checkout (map cart item `id` → `product_id`) | Mobile |
| P1-4 | Register missing GoRouter routes: products, add/edit product, audit, exports, customer ledger, pending returns, barcode, return scanner/process | Mobile |
| P1-5 | Wire dashboard / quick actions to those routes; fix Store Admin “View Staff” tab index (`2` → `3`) | Mobile |
| P1-6 | Fix web `NEXT_PUBLIC_API_URL` to include `/api`; centralize fetch helper | Web |
| P1-7 | Gate guest login behind `ENABLE_GUEST_LOGIN` (default off in prod) | Backend |
| P1-8 | Add basic rate limiting on public invoice/phone + auth login endpoints | Backend |

### Exit criteria (Definition of Done)
- [x] Create sale → inventory decreases for catalog products *(code: checkout sends `product_id`)*  
- [x] Submit return → pending list → approve/reject works for Store Admin *(JWT fields fixed; item IDs on billing lookup)*  
- [x] Loyalty balance APIs work for staff; public portal opens invoice by billing ID *(loyalty `brandId` + web `/api`)*  
- [x] Super Admin can open Products / Audit / Exports from the app *(routes + Settings links)*  
- [x] Employee can open barcode scan + returns from POS *(routes + home buttons)*  
- [x] Guest login fails (or is blocked) when env flag is off *(ENABLE_GUEST_LOGIN)*  
- [ ] Manual smoke checklist signed off on staging  

**Phase 1 implementation status:** code complete — pending staging smoke QA.

### Out of scope this phase
Void stock restore, S3 real uploads, offline sync, Firebase init, CI, marketing copy.

---

## Phase 2 — Security & Business Correctness
**Sprint goal:** Safe enough for a real store pilot; money/stock/loyalty stay consistent.  
**Theme:** Harden APIs and fix financial side-effects.

### Scope

| Ticket | Work | Area |
|--------|------|------|
| P2-1 | Void invoice: restore inventory + reverse exact loyalty ledger entries | Backend |
| P2-2 | Returns path uses authenticated invoice detail **with item IDs** (not public slim payload) | Backend + Mobile |
| P2-3 | Reject insufficient stock on invoice create (no silent negative stock) | Backend |
| P2-4 | Always scope invoice `findOne` / `markShared` by `brandId` (+ store rules) | Backend |
| P2-5 | Issue refresh tokens for employees; fail-fast if `JWT_SECRET` missing in prod | Backend |
| P2-6 | CORS allowlist (web + landing origins only) | Backend |
| P2-7 | Harden public portal: redact PII and/or signed short-lived links (minimum: redaction + throttle from Phase 1) | Backend + Web |
| P2-8 | Fix WhatsApp/share URL to real customer portal domain; attach PDF on share path | Mobile |
| P2-9 | Loyalty checkout UX: enforce min redemption + cap discount vs cart total on client | Mobile |

### Exit criteria
- [x] Void sale restores stock and loyalty correctly *(code)*  
- [x] Return of partial items works with real `invoice_item_id`s *(staff/billing endpoint)*  
- [x] Oversell attempt is rejected with a clear error *(insufficient stock check)*  
- [x] Employee session survives access-token expiry via refresh *(refresh_token issued)*  
- [x] Cross-origin random sites cannot call API; guest cannot mutate if gated *(CORS allowlist)*  
- [x] Share flow opens correct portal link for the customer *(`/invoice/{id}` portal URL + PDF share)*  
- [ ] Manual smoke checklist signed off on staging  

**Phase 2 implementation status:** code complete — pending staging smoke QA.

### Out of scope this phase
Offline queue, FCM, Chromium PDF packaging, CI pipeline, landing rewrite.

---

## Phase 3 — Reliability, Media & Deploy
**Sprint goal:** Staging/prod behave predictably; uploads, PDF, push, offline are intentional (shipped or removed).  
**Theme:** Kill silent mocks and half-wired systems.

### Scope

| Ticket | Work | Area |
|--------|------|------|
| P3-1 | Real S3 product/logo uploads; fail closed if credentials missing in prod | Backend |
| P3-2 | PDF generation that works on Render (`@sparticuz/chromium` or external service); HTML escape dynamic fields | Backend |
| P3-3 | `prisma migrate deploy` in Render start/build; expand `.env.example` (`DIRECT_URL`, Firebase, guest flag, web API URL) | Ops |
| P3-4 | Decide offline: **either** init Hive + SyncService + write queue on failure, **or** remove dead offline code from docs/UI | Mobile |
| P3-5 | Decide FCM: **either** init Firebase + register token, **or** remove push claims until ready | Mobile + Backend |
| P3-6 | Verify loyalty expiry + daily summary crons after ScheduleModule (smoke on staging) | Backend |
| P3-7 | Ops hygiene: untrack APK from git / host on CDN; remove or guard `cleanup.bat`; quarantine plaintext PIN / creds scripts | Repo |
| P3-8 | Auth refresh failure forces clean logout in mobile auth state | Mobile |

### Exit criteria
- [x] Product image upload returns a real URL (or clear error, not `s3.mock.com`) *(S3Service + products controller)*  
- [x] Invoice PDF downloads successfully on staging host *(@sparticuz/chromium in prod; HTML escaped)*  
- [x] Deploy path runs migrations; env template matches reality *(render startCommand + .env.example)*  
- [x] Offline and push are either demoed working **or** explicitly removed from product claims *(Hive/Sync + optional Firebase wired)*  
- [x] Cron job smoke: at least one scheduled job fires in staging logs *(ScheduleModule already on; jobs log on run)*  
- [x] No dangerous cleanup scripts / plaintext PIN writers in default tooling *(cleanup.bat disabled; scripts quarantined)*  
- [ ] Manual smoke checklist signed off on staging  

**Phase 3 implementation status:** code complete — pending staging smoke QA.

---

## Phase 4 — Quality, Docs & Soft Launch Prep
**Sprint goal:** Maintainable codebase and honest product surface for users/investors.  
**Theme:** Tests, CI, and truth in marketing.

### Scope

| Ticket | Work | Area |
|--------|------|------|
| P4-1 | CI: backend lint/test/build + Flutter analyze + Next build | Repo |
| P4-2 | Tests for: JWT field usage (returns/loyalty), invoice stock decrement, void restore, guest gate | Backend |
| P4-3 | Replace Flutter counter widget test with auth/router smoke; basic web portal fetch test | Mobile + Web |
| P4-4 | Money precision (Decimal/paise) + stronger DTO validation (phone, password length) | Backend |
| P4-5 | Mobile error UX: stop empty `catch`; surface API messages | Mobile |
| P4-6 | Align README + landing copy with shipped features (roles, WhatsApp share, no thermal/OTP/email claims) | Docs + Landing |
| P4-7 | Mark stale docs historical; health endpoint instead of “Hello World” | Docs + Backend |
| P4-8 | Soft-launch checklist + known limitations page for pilot stores | Docs |

### Exit criteria
- [x] CI green on main *(.github/workflows/ci.yml added; local backend/web/flutter tests passing)*  
- [x] Critical regression tests cover Phase 1–2 bugs *(guest gate, returns JWT, loyalty brandId, stock/money)*  
- [x] Landing/README do not claim thermal printers, Manager role, or cloud WhatsApp automation  
- [x] Pilot onboarding uses a written limitations list *(`docs/KNOWN_LIMITATIONS.md` + soft-launch checklist)*  
- [ ] Team agrees Phase 1–4 closed → ready for soft launch *(human sign-off)*  

**Phase 4 implementation status:** code complete — use `docs/SOFT_LAUNCH_CHECKLIST.md` for sign-off.

---

## Sprint board tips

1. **One phase = one sprint goal.** Do not pull Phase 3 work into Phase 1 unless blocked.  
2. **Backend + mobile pairs:** P1-1/P1-4 and P2-2 need same-sprint coordination.  
3. **Demo day each sprint:** run the exit-criteria checklist live.  
4. **Park deferred features** in a separate “Roadmap” backlog so they don’t dilute these sprints.

---

## Quick dependency map

```text
Phase 1 (must first)
  ├─ JWT + routes + product_id + web /api + guest gate
  └─ enables real QA of returns / stock / portal

Phase 2 (needs Phase 1)
  ├─ void / stock rules / tenant scope / refresh / CORS / share URL
  └─ enables safe pilot

Phase 3 (needs Phase 2)
  ├─ S3 / PDF / migrate / offline-or-cut / FCM-or-cut
  └─ enables stable prod deploy

Phase 4 (can overlap late Phase 3)
  └─ CI / tests / docs truth → soft launch
```

---

## Start tomorrow (Phase 1 Day 1)

1. Backend: JWT fixes (returns + loyalty) + `AuditLogsModule` + `ScheduleModule`  
2. Mobile: checkout `product_id` + GoRouter registration for existing screens  
3. Web: fix `NEXT_PUBLIC_API_URL=…/api`  
4. End of day: manual smoke — bill → stock → open products screen → open web invoice  

When Phase 1 is closed, start Phase 2 without reopening deferred roadmap items.
