# BillPush Audit — Required Fixes & Improvements

**Audit date:** 25 Sep 2026  
**Scope:** Full monorepo (`backend`, `mobile`, `web`, `landing`, docs/ops)  
**Verdict:** Core POS / invoicing MVP is largely present, but several shipped features are **broken end-to-end**, security hardening is incomplete, and marketing/docs overclaim relative to the codebase.

Use this document as the backlog of **required fixes** and **recommended improvements** before treating the product as production-complete.

---

## Executive summary

| Area | Status |
|------|--------|
| Auth (admin / employee login) | Working at a basic level |
| Invoice create / list / PDF | Mostly working |
| Inventory decrement on POS sale | **Broken** (checkout omits `product_id`) |
| Returns flow | **Broken** (JWT fields + missing routes + missing item IDs) |
| Loyalty admin APIs / expiry cron | **Broken / inactive** |
| Audit logs API | **Not wired** |
| Customer web portal | **Broken API base URL** (`/api` missing) |
| Offline sync / FCM | Scaffold only — never initialized |
| Guest login | **Production risk** (open JWT issuance) |
| Tests / CI | Near-zero |

---

## Priority legend

| Priority | Meaning |
|----------|---------|
| **P0** | Broken core feature or severe security risk — fix before any real production use |
| **P1** | High impact correctness / security / completeness gap |
| **P2** | Important hardening, UX, or ops improvement |
| **P3** | Nice-to-have polish, docs alignment, deferred product features |

---

## P0 — Critical (fix before production)

### 1. Returns feature uses wrong JWT user fields
- **Problem:** JWT strategy attaches `userId`, `brandId`, `storeId`. Returns controller/service read `brand_id`, `store_id`, `id`. Create/approve/pending returns fail or write `undefined` into Prisma.
- **Evidence:** `backend/src/auth/jwt.strategy.ts`, `backend/src/returns/returns.controller.ts`, `backend/src/returns/returns.service.ts`
- **Fix:** Standardize on `req.user.brandId` / `storeId` / `userId` everywhere in returns (and any remaining snake_case JWT access).

### 2. Loyalty authenticated endpoints use `req.user.brand_id`
- **Problem:** Same JWT mismatch → loyalty lookups by customer ID/phone return empty/errors for staff.
- **Evidence:** `backend/src/loyalty/loyalty.controller.ts`
- **Fix:** Use `req.user.brandId`.

### 3. Mobile GoRouter missing major screens
- **Problem:** Screens exist but are not registered; navigation will fail or features are unreachable:
  - Super Admin: products, add/edit product, audit logs, data exports, customer ledger
  - Store Admin: pending returns
  - Employee: barcode scan, return scanner, process return
  - Onboarding screen orphaned
- **Evidence:** `mobile/lib/core/router/app_router.dart` vs screens under `mobile/lib/features/`
- **Fix:** Register all routes; wire dashboard tabs / quick actions to those routes.

### 4. POS checkout does not send `product_id`
- **Problem:** Invoice payload only sends name/qty/price/tax. Backend only decrements inventory when `product_id` is present → **stock never updates from normal POS sales**.
- **Evidence:** `mobile/lib/features/employee/screens/checkout_screen.dart` (items map); `backend/src/invoices/invoices.service.ts` inventory loop
- **Fix:** Include `product_id` from cart line items in the create-invoice payload.

### 5. Customer web portal API base URL missing `/api`
- **Problem:** Nest uses global prefix `api`. Web calls `${NEXT_PUBLIC_API_URL}/invoices/...` while `.env.local` is `https://billpush-backend.onrender.com` (no `/api`) → 404s.
- **Evidence:** `backend/src/main.ts`, `web/.env.local`, `web/src/app/history/page.tsx`, `web/src/app/invoice/[billingId]/page.tsx`
- **Fix:** Set `NEXT_PUBLIC_API_URL` to `…/api` (or append `/api` in fetch helpers). Document in `.env.example`.

### 6. Unauthenticated guest login is an open backdoor
- **Problem:** `POST /auth/guest-login` issues real JWTs as SUPER_ADMIN / STORE_ADMIN / EMPLOYEE. Guest is only blocked on approve/reject/suspend — guests can still create invoices, mutate inventory, etc.
- **Evidence:** `backend/src/auth/auth.controller.ts`, `backend/src/auth/auth.service.ts`
- **Fix:** Disable in production (`ENABLE_GUEST_LOGIN=false`), or restrict to demo DB and block all mutating endpoints when `isGuest`.

### 7. Public invoice / phone history APIs expose PII without auth
- **Problem:** Anyone can fetch full invoice by billing ID or purchase history by phone (name, phone, line items, totals). Enables enumeration and privacy risk.
- **Evidence:** `backend/src/invoices/invoices.controller.ts` public routes
- **Fix:** Short-lived signed links, OTP gate, rate limiting, and/or redact sensitive fields for public views.

---

## P1 — High (correctness, security, completeness)

### Backend wiring

| # | Issue | Fix |
|---|--------|-----|
| 8 | `AuditLogsModule` not imported in `AppModule` → `/audit-logs` 404; mobile audit/export broken | Import module in `app.module.ts` |
| 9 | `ScheduleModule.forRoot()` never registered → loyalty expiry + daily FCM summary crons never run | Add `ScheduleModule.forRoot()` to `AppModule` |
| 10 | Process-return flow uses public invoice endpoint that omits invoice item `id`s → return line matching fails | Use authenticated invoice detail that includes item IDs |
| 11 | Invoice void sets `FULLY_REFUNDED` but does not restore inventory; loyalty reversal may be incorrect vs ledger | Restore stock; reverse exact earn/redeem ledger entries |
| 12 | Invoice create allows negative stock (creates inventory row with negative qty) | Reject insufficient stock (or configurable soft warn) |
| 13 | `findOne` invoice for SUPER_ADMIN lacks `brand_id` filter → cross-tenant UUID guess risk | Always scope by `brandId` |
| 14 | `markShared` lacks store/brand ownership check | Authorize like other invoice mutations |
| 15 | Employee login does not issue `refresh_token` → employees drop after access-token expiry | Issue refresh tokens for employees like admins |
| 16 | JWT secret falls back to `'secretKey'` if env missing | Fail fast on boot in production when unset |
| 17 | CORS is fully open (`enableCors()` with no origin list) | Allowlist web portal + landing origins |
| 18 | No rate limiting on login, guest, public phone/billing lookups | Add `@nestjs/throttler` |
| 19 | Public loyalty balance by phone is not brand-scoped (first match) | Require brand slug/code; rate-limit |
| 20 | Public employee login list exposes staff names/IDs by `storeId` | Add store code + rate limit |
| 21 | Product image upload returns mocked `s3.mock.com` URL | Call real `S3Service.uploadFile` |
| 22 | S3 silently mocks when keys are `xxx` | Fail closed in prod; mock only behind explicit flag |
| 23 | Puppeteer PDF likely OOM/crash on free Render (no Chromium packaging) | Use `@sparticuz/chromium` or external PDF; raise memory |
| 24 | PDF HTML interpolates names without escaping → HTML injection in PDFs | Escape all dynamic HTML entities |
| 25 | Money math uses JS floats for tax/totals | Prefer Decimal / integer paise |
| 26 | Refresh tokens stored as full token string in Redis (unhashed) | Store hashed `jti`; bind to user |

### Mobile

| # | Issue | Fix |
|---|--------|-----|
| 27 | Hive / `SyncService` never initialized in `main.dart`; offline invoices never written | Init Hive + sync; write offline queue on network failure — or remove dead code |
| 28 | Offline sync would send client `billing_id` that backend ignores/regenerates | Accept optional client billing ID server-side, or stop generating client IDs |
| 29 | Firebase Messaging in pubspec but never initialized | Init Firebase + register FCM token with backend |
| 30 | Store Admin “View Staff” switches to tab index `2` (Inventory) instead of Staff (`3`) | Fix index in `store_dashboard_tab.dart` |
| 31 | WhatsApp share opens chat with text; primary path may not attach PDF; share URL uses non-existent `bills.billpush.com` | Attach PDF via share intent; point to real web portal URL |
| 32 | On refresh failure, storage cleared but auth provider not notified | Force logout / update `authProvider` |
| 33 | Unsafe `state.extra as Map/String` casts can crash | Null-check / typed extras |
| 34 | Super Admin Settings Account/Notifications tiles appear inert | Implement or remove |

### Web / landing / ops

| # | Issue | Fix |
|---|--------|-----|
| 35 | `web/src/lib/api.ts` empty; duplicated invoice UI (`InvoiceDetailClient` unused) | Centralize API client; delete duplicate |
| 36 | Large APK (`landing/assets/billpush-app.apk`) tracked in git (~70MB+) | Host on Releases/CDN; `gitignore` `*.apk` |
| 37 | `cleanup.bat` runs `git rm -r --cached .` then recommits — ops hazard | Delete or heavily guard |
| 38 | Utility scripts (`reset_pins.ts` can write plaintext PIN, `get_creds.ts` prints secrets) | Delete from deploy image; always bcrypt; never run against prod |
| 39 | `render.yaml` has no `prisma migrate deploy`; free tier + PDF Chromium risk | Add migrate step; document memory/Chromium needs |
| 40 | `.env.example` missing `DIRECT_URL`, Firebase, web `NEXT_PUBLIC_API_URL`, guest flag | Expand example env docs |

---

## P2 — Medium (hardening & quality)

1. **DTO validation gaps** — phone format, password max length, stronger invoice item validation.
2. **Stock alerts** — README claims low-stock alerts; confirm FCM path works once ScheduleModule + Firebase are fixed.
3. **Error handling** — many mobile screens swallow errors with empty `catch`; surface Dio messages.
4. **Sync robustness** — classify 4xx vs 5xx, exponential backoff, dead-letter for failed offline invoices.
5. **Loyalty UX on checkout** — client should enforce min redemption and cap discount vs cart total (server already has min check).
6. **Cart mutations** — prefer immutable quantity updates in `cart_provider.dart`.
7. **Migration vs schema drift** — verify ReturnStatus enum / `return_items` vs `return_request_items` / brand threshold default (500 vs 1000) against live DB.
8. **Single-brand assumption** — store admin registration always attaches to first super admin’s brand; document or add invite codes for multi-brand later.
9. **Helmet CSP** — tune if backend ever serves HTML beyond PDFs.
10. **Empty `shared/` package** — implement shared types/DTOs or remove from architecture docs.
11. **Root `test.py` / ad-hoc backend scripts** — clean up or move to `scripts/` with README warnings.
12. **No CI** — add GitHub Actions for backend lint/test/build, Flutter analyze, Next build.
13. **Meaningful tests** — replace Flutter counter template test; expand Nest unit/e2e beyond Hello World; add web smoke tests.
14. **Backend README** — still Nest starter boilerplate; replace with project-specific setup.
15. **Mobile API flavors** — replace hardcoded production URL in `constants.dart` with `--dart-define` / flavors for local/dev/prod.
16. **`pubspec.yaml` assets** — uncomment `assets/` if in-app images are needed.
17. **Web responsiveness** — stack invoice columns on small screens.
18. **.gitignore** — ensure `*.apk`, `backend/dist`, secrets scripts are covered.

---

## P3 — Enhancements & deferred product gaps

Align expectations: these are either marketing claims or explicitly deferred in `docs/MASTERPLAN.md` / `PROJECT_PLAN.md`.

| Item | Notes |
|------|--------|
| Bluetooth thermal printing | Claimed on landing/README; no BT print packages in Flutter |
| Automated WhatsApp Cloud API | Actual = device share / `whatsapp://` deep link |
| Customer OTP portal login | Removed from plan; portal is open lookup |
| Payment gateway (UPI/cards) | Not in schema; no payment method on invoices |
| Product variations | Not in schema |
| Web admin dashboard | Deferred; `web/` is customer-only |
| Campaigns / chatbot / multi-brand SaaS | Deferred enterprise vision |
| Role naming | Docs say Admin/Cashier/Manager; code uses SUPER_ADMIN / STORE_ADMIN / EMPLOYEE |
| Email invoice delivery | Claimed in places; not implemented as server email |
| “Free forever” / GST-compliance marketing | Soften or substantiate legally/technically |

---

## Documentation & marketing alignment (required cleanup)

1. Update root `README.md` to reflect real roles, omit thermal printers / email / product variations until implemented, and mention the customer portal (`web/`).
2. Update `landing/index.html` feature copy to match shipped behavior (share-intent WhatsApp, no thermal, no Manager role).
3. Mark stale docs (`PROJECT_UNDERSTANDING.md`, parts of `PROJECT_COMPLETE_DOCUMENTATION.md`) as historical or reconcile with MASTERPLAN.
4. Fix Nest “Hello World” root controller messaging if still present for production health checks.

---

## Suggested fix order (implementation waves)

### Wave 1 — Unbreak core flows (P0)
1. Fix JWT field access (returns + loyalty).
2. Wire `AuditLogsModule` + `ScheduleModule`.
3. Send `product_id` from checkout; fix stock decrement path.
4. Register missing GoRouter routes + pending returns / barcode / products / audit.
5. Fix web `NEXT_PUBLIC_API_URL` to include `/api`.
6. Gate or disable guest login in production.
7. Rate-limit + harden public invoice/phone endpoints (minimum: throttling + field redaction).

### Wave 2 — Correctness & security (P1)
1. Void/return inventory + loyalty ledger correctness.
2. Insufficient-stock checks; brand scoping on invoice `findOne` / `markShared`.
3. Employee refresh tokens; JWT secret fail-fast; CORS allowlist.
4. Real S3 uploads; PDF/Chromium for Render.
5. Init or remove offline Hive sync + Firebase.
6. Fix Store Admin “View Staff” tab index; WhatsApp share URLs.
7. Env example, remove/guard `cleanup.bat` and plaintext PIN scripts; untrack APK.

### Wave 3 — Quality & polish (P2–P3)
1. CI + real tests.
2. Docs/landing/README truthfulness.
3. Money Decimal handling, DTO validation, error UX.
4. Decide which deferred features (OTP, payments, thermal, WhatsApp API) enter the next roadmap.

---

## Completeness checklist (feature vs code)

| Feature | Backend | Mobile | Web | Notes |
|---------|---------|--------|-----|-------|
| Super Admin setup / approvals | Yes | Yes | — | Guest risk |
| Store Admin register / store setup | Yes | Yes | — | Single-brand attach |
| Employee PIN login | Yes | Yes | — | No refresh token |
| Products CRUD / barcode / CSV | Yes | Screens exist, **routes missing** | — | Image upload mocked |
| Inventory get/adjust | Yes | Yes (store admin) | — | POS sales don’t decrement |
| Create invoice / PDF / share flag | Yes | Yes | — | Share URL wrong domain |
| Customer lookup | Yes | Yes | Phone history | Public PII risk |
| Returns | Yes but **JWT broken** | Screens **unrouted** | — | End-to-end broken |
| Loyalty earn/redeem | Yes | Partial on checkout | Public balance | Admin API JWT bug; cron dead |
| Analytics / CSV | Yes | Via dashboards | — | |
| Audit logs | Code exists, **module unwired** | Screen unrouted | — | |
| Offline POS | Models only | **Not initialized** | — | |
| Push notifications | Service + cron | **Firebase not init** | — | Cron dead |
| Customer invoice portal | Public APIs | — | Pages exist, **URL broken** | |
| Thermal print / WhatsApp API / OTP / payments | No | No | No | Marketing only |

---

## Out of scope / accepted deferred (do not treat as bugs unless claimed as shipped)

- Meta WhatsApp Cloud API automation  
- In-app chatbot / campaigns  
- Full web admin  
- Payment capture (UPI/cards)  
- Multi-brand SaaS tenancy beyond current single-brand model  
- Product variant matrix  

---

## How to use this document

- Treat **P0** as a release blocker.  
- Track each numbered item as a ticket; check off when fixed and verified (manual QA + at least one automated test for P0/P1 backend bugs).  
- After Wave 1–2, re-run a focused regression: create sale → stock down → return → loyalty → void → web invoice lookup → audit export → cron smoke.

---

*Generated from a full-repo audit of BillPush / Billing-App. Prefer code and this checklist over marketing copy as the source of truth until docs are updated.*
