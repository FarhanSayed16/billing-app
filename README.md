# BillPush

Omni-Channel Digital Invoice & Retail CRM Platform built with NestJS, Next.js, and Flutter.

See `docs/MASTERPLAN.md` for the complete implementation checklist and execution guide.

## Production Deployment (Render)

This backend is pre-configured to be deployed natively on [Render](https://render.com/) utilizing cloud databases. The legacy Docker configuration has been removed to ensure seamless scalability.

### Prerequisites
1. **Supabase (PostgreSQL)**: Create a project on Supabase. Note down both the **Transaction URL** (Port 6543, used for connection pooling) and the **Session URL** (Port 5432, used for Prisma migrations).
2. **Managed Redis**: Create a Redis database (e.g., using Upstash or Render's Redis add-on).
3. **AWS S3**: You will need S3 bucket credentials for media uploads.

### 1-Click Deploy
The repository includes a `render.yaml` Blueprint file. 
1. Go to your Render Dashboard -> **Blueprints** -> **New Blueprint Instance**.
2. Connect this repository.
3. Render will automatically detect the `billpush-backend` web service.
4. Fill in the requested Environment Variables:
   - `DATABASE_URL`: Your Supabase Transaction Pooler URL (`pgbouncer=true`).
   - `DIRECT_URL`: Your Supabase Session URL.
   - `REDIS_URL`: Your Managed Redis connection string (e.g., `rediss://...`).
   - `JWT_SECRET`: A strong secret key.
   - S3 configuration keys.

Render will automatically run `npm install`, generate Prisma clients, run your production migrations (`prisma migrate deploy`), and start the NestJS server.
