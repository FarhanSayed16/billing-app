# Known limitations (pilot)

Honest list of what BillPush **does** and **does not** do for soft-launch / pilot stores.

## Shipped

- Android POS for Super Admin, Store Admin, Employee (PIN)
- Catalog products, barcode scan, inventory adjust
- Invoice create / void / PDF / device share & WhatsApp share sheet
- Returns with store-admin approval (above brand threshold)
- Loyalty earn / redeem / monthly expiry job (when backend is running with ScheduleModule)
- Customer web lookup by billing ID or phone
- Offline invoice queue (syncs when connectivity returns)
- Optional FCM push (only if Firebase is configured)

## Limitations / caveats

| Topic | Reality |
|-------|---------|
| Roles | `SUPER_ADMIN` / `STORE_ADMIN` / `EMPLOYEE` — not “Cashier / Manager” labels |
| WhatsApp | Opens share / chat with PDF + portal link — **not** Meta Cloud API automation |
| Thermal printers | **Not supported** |
| Email invoices | **Not supported** server-side |
| Payments | Cash/assumed paid — **no** UPI/card gateway |
| Product variants | Single SKU per product — **no** size/color matrix |
| Guest login | Disabled unless `ENABLE_GUEST_LOGIN=true` |
| Public portal | Phone/billing lookup is rate-limited; phone is masked on public invoice |
| Free Render | Cold starts; PDF/Chromium needs enough memory; configure real S3 in production |
| APK in landing | Prefer CDN/Releases; large APKs should stay gitignored |

## Deferred roadmap

OTP portal auth, WhatsApp Cloud API, campaigns/chatbot, full web admin, multi-brand SaaS, payment capture.

---

Keep this file updated when marketing copy changes.
