# BillPush Backend

NestJS API for BillPush (`/api` prefix).

## Quick start

```bash
cp .env.example .env
npm install
npx prisma generate
npx prisma migrate deploy
npm run start:dev
```

- Health: `GET /api/health`
- Swagger: `/api/docs`
- See root [README.md](../README.md) and [docs/SOFT_LAUNCH_CHECKLIST.md](../docs/SOFT_LAUNCH_CHECKLIST.md)

## Scripts

| Script | Purpose |
|--------|---------|
| `npm run start:dev` | Watch mode |
| `npm run build` / `start:prod` | Production |
| `npm test` | Unit tests |
| `npm run test:e2e` | Health e2e |

Dangerous one-off DB scripts live under `scripts/dangerous/` and require `CONFIRM_DANGEROUS=YES`.
