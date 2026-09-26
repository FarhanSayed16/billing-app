# Soft-launch checklist

Use before onboarding the first real pilot store.

## Environment

- [ ] `NODE_ENV=production`
- [ ] Strong `JWT_SECRET` (not placeholder)
- [ ] `ENABLE_GUEST_LOGIN=false`
- [ ] `CORS_ORIGINS` includes web portal + landing origins
- [ ] Real `S3_*` credentials (`S3_MOCK=false`)
- [ ] `DATABASE_URL` + `DIRECT_URL` + `REDIS_URL` set
- [ ] `prisma migrate deploy` succeeds on boot (Render start command)
- [ ] Customer portal `NEXT_PUBLIC_API_URL` ends with `/api`
- [ ] Mobile `baseUrl` / `CUSTOMER_PORTAL_URL` point at production hosts

## Smoke QA (staging or prod)

- [ ] Health: `GET /api/health` → `{ status: "ok" }`
- [ ] Super Admin login → Products / Audit / Exports open
- [ ] Store Admin → Staff tab, Pending Returns
- [ ] Employee: New Bill with catalog product → stock decreases
- [ ] Oversell rejected with clear error
- [ ] Return submit → pending → approve/reject
- [ ] Void restores stock + loyalty
- [ ] Share opens portal URL `/invoice/{billingId}`
- [ ] Web portal loads invoice by billing ID
- [ ] Guest login blocked
- [ ] Offline sale queues and syncs when online (optional device test)
- [ ] Daily/loyalty crons appear in logs after schedule ticks (or force-run in staging)

## Docs & marketing

- [ ] Landing/README match [KNOWN_LIMITATIONS.md](./KNOWN_LIMITATIONS.md)
- [ ] Pilot store receives limitations list
- [ ] Support contact / escalation path agreed

## Sign-off

| Role | Name | Date |
|------|------|------|
| Eng | | |
| Product / owner | | |

When this checklist is signed, Phases 1–4 are considered closed for soft launch.
