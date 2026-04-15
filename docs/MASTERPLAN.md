# BillPush — MASTERPLAN
### Complete Implementation Checklist and Execution Guide

> **Version:** 1.0
> **Created:** 15 April 2026
> **Source Documents:** PROJECT_PLAN.md + PROJECT_COMPLETE_DOCUMENTATION.md
> **Purpose:** This is the SINGLE execution checklist. Every task required to build BillPush from zero to production is listed here. Check off items as you complete them. Do NOT skip any item.

---

## How to Use This Document

- `[ ]` = Not started
- `[/]` = In progress
- `[x]` = Completed
- Each **Phase** is a major milestone. Do NOT start the next phase until the current phase is fully tested.
- Each Phase contains **Sub-Phases** (e.g., 1A, 1B, 1C) that group related work.
- Each Sub-Phase contains individual **Tasks** with checkboxes.
- **RULE:** After completing each Sub-Phase, do a checkpoint test before moving on.

---

## Quick Reference — What We Are Building

| Component | Tech | Purpose |
|---|---|---|
| Backend API | Node.js + NestJS + TypeScript | All business logic, REST endpoints |
| Database | PostgreSQL 16 + Prisma ORM | Data storage, multi-tenant isolation |
| Mobile App | Flutter (Dart) | POS, Admin dashboards, employee management |
| Web Portal | React (Next.js 15) | Customer bill lookup, Super Admin exports |
| File Storage | AWS S3 / Cloudflare R2 | Store logos, product images, invoice PDFs |
| Cache | Redis | Product catalog cache, session management |
| Push Notifications | Firebase Cloud Messaging | Admin alerts, daily summaries |
| Invoice Delivery | Native Share Intent (FREE) | Share PDF + link via WhatsApp/SMS/Email |

---

# ================================================================
# PHASE 0 — ENVIRONMENT SETUP AND PROJECT INITIALIZATION
# ================================================================

**Goal:** Set up all development environments, repositories, and tooling so that the team can start coding immediately.

---

## Sub-Phase 0A: Development Environment Setup

- [x] Install Node.js (v20 LTS) and verify with `node --version`
- [x] Install npm (comes with Node.js) and verify with `npm --version`
- [ ] Install Flutter SDK (latest stable) and verify with `flutter doctor`
- [ ] Install Dart SDK (bundled with Flutter)
- [ ] Install PostgreSQL 16 locally (or use Docker container)
- [ ] Install Redis locally (or use Docker container)
- [ ] Install VS Code with extensions:
  - [ ] Flutter extension
  - [ ] Dart extension
  - [ ] Prisma extension
  - [ ] ESLint extension
  - [ ] Thunder Client or Postman for API testing
- [ ] Install Android Studio (for Android emulator and build tools)
- [ ] Install Xcode (if on Mac, for iOS builds)
- [x] Install Git and configure identity (`git config --global user.name/email`)
- [ ] Install Docker Desktop (for containerized development)

---

## Sub-Phase 0B: Repository Initialization

- [x] Create the project root directory structure:
  ```
  BillPush/
  ├── backend/          # NestJS API
  ├── mobile/           # Flutter app
  ├── web/              # Next.js web portal
  ├── shared/           # Shared types, constants, utilities
  ├── docs/             # Documentation (move existing .md files here)
  └── docker/           # Docker compose files
  ```
- [x] Initialize Git repository: `git init`
- [x] Create `.gitignore` with entries for: node_modules, .env, build/, .dart_tool/, .flutter-plugins, .idea/, .vscode/
- [x] Create initial `README.md` with project overview
- [x] Make initial commit: "chore: project structure initialization"

---

## Sub-Phase 0C: Backend Project Initialization (NestJS)

- [x] Navigate to `backend/` directory
- [x] Initialize NestJS project: `npx -y @nestjs/cli new . --skip-git --package-manager npm`
- [x] Install core dependencies:
  - [x] `npm install @nestjs/config` (environment variables)
  - [x] `npm install @prisma/client` (database ORM)
  - [x] `npm install prisma --save-dev` (Prisma CLI)
  - [x] `npm install @nestjs/jwt @nestjs/passport passport passport-jwt` (authentication)
  - [x] `npm install bcrypt` and `npm install @types/bcrypt --save-dev` (password hashing)
  - [x] `npm install class-validator class-transformer` (DTO validation)
  - [x] `npm install @nestjs/swagger` (API documentation)
  - [x] `npm install helmet` (security headers)
  - [x] `npm install compression` (response compression)
  - [x] `npm install ioredis @nestjs/cache-manager cache-manager` (Redis caching)
- [x] Initialize Prisma: `npx prisma init`
- [x] Create `.env` file with variables:
  ```
  DATABASE_URL=postgresql://user:password@localhost:5432/billpush
  JWT_SECRET=your-strong-secret-key
  JWT_EXPIRY=15m
  JWT_REFRESH_EXPIRY=7d
  REDIS_URL=redis://localhost:6379
  S3_BUCKET_NAME=billpush-assets
  S3_REGION=ap-south-1
  S3_ACCESS_KEY=xxx
  S3_SECRET_KEY=xxx
  PORT=3000
  ```
- [x] Create `.env.example` with placeholder values (committed to Git)
- [x] Verify backend starts: `npm run start:dev`
- [x] Verify Swagger docs accessible at `http://localhost:3000/api`

---

## Sub-Phase 0D: Mobile Project Initialization (Flutter)

- [x] Navigate to `mobile/` directory
- [x] Create Flutter project: `flutter create . --org com.billpush --project-name billpush`
- [x] Add core dependencies to `pubspec.yaml`:
  - [x] `dio` (HTTP client for API calls)
  - [x] `flutter_riverpod` or `provider` (state management)
  - [x] `go_router` (navigation/routing)
  - [x] `shared_preferences` (simple key-value local storage)
  - [x] `hive` + `hive_flutter` (offline data caching)
  - [x] `pdf` (in-app PDF generation)
  - [x] `share_plus` (native share sheet for WhatsApp sharing)
  - [x] `mobile_scanner` (camera-based barcode scanning)
  - [x] `flutter_secure_storage` (secure token storage)
  - [x] `image_picker` (logo upload for Store Admin)
  - [x] `qr_flutter` (QR code generation on invoices)
  - [x] `firebase_messaging` (push notifications)
  - [x] `firebase_core` (Firebase initialization)
  - [x] `intl` (date/currency formatting for Indian locale)
  - [x] `connectivity_plus` (online/offline detection)
  - [x] `path_provider` (local file system access for PDF storage)
  - [x] `fl_chart` (charts for analytics dashboards)
- [x] Run `flutter pub get`
- [x] Set up Flutter project folder structure:
  ```
  lib/
  ├── main.dart
  ├── app.dart
  ├── config/
  │   ├── api_config.dart
  │   ├── routes.dart
  │   └── theme.dart
  ├── core/
  │   ├── network/
  │   │   ├── api_client.dart
  │   │   └── interceptors.dart
  │   ├── storage/
  │   │   ├── secure_storage.dart
  │   │   └── hive_service.dart
  │   └── utils/
  │       ├── validators.dart
  │       └── formatters.dart
  ├── features/
  │   ├── auth/
  │   ├── pos/
  │   ├── invoices/
  │   ├── customers/
  │   ├── stores/
  │   ├── employees/
  │   ├── analytics/
  │   ├── catalog/
  │   ├── loyalty/
  │   ├── returns/
  │   └── settings/
  ├── models/
  ├── providers/
  └── widgets/
      ├── common/
      └── layouts/
  ```
- [x] Verify app runs: `flutter run`

---

## Sub-Phase 0E: Web Portal Project Initialization (Next.js)

- [x] Navigate to `web/` directory
- [x] Create Next.js project: `npx -y create-next-app@latest . --typescript --eslint --app --src-dir --no-tailwind`
- [x] Install dependencies:
  - [x] `npm install axios` (API client)
  - [x] `npm install @react-pdf/renderer` or use server-side Puppeteer for PDF (evaluate)
- [x] Set up project folder structure:
  ```
  src/
  ├── app/
  │   ├── page.tsx              # Landing page (bill lookup)
  │   ├── layout.tsx            # Root layout
  │   ├── lookup/
  │   │   └── page.tsx          # Billing ID lookup
  │   ├── history/
  │   │   └── page.tsx          # Phone number purchase history
  │   └── invoice/
  │       └── [billingId]/
  │           └── page.tsx      # Individual invoice view (store-branded)
  ├── components/
  ├── lib/
  │   └── api.ts
  └── styles/
      └── globals.css
  ```
- [x] Verify web portal starts: `npm run dev` and loads at `http://localhost:3001`

---

## Sub-Phase 0F: Database Setup

- [x] Create PostgreSQL database: `CREATE DATABASE billpush;`
- [x] Create a dedicated database user with limited permissions
- [x] Test connection from backend `.env` using `npx prisma db pull` (should connect without error)
- [x] Start Redis server and verify with `redis-cli ping` (should return PONG)

---

## Sub-Phase 0G: Docker Compose (Optional but Recommended)

- [x] Create `docker/docker-compose.yml` with services:
  - [x] PostgreSQL 16 container (port 5432)
  - [x] Redis container (port 6379)
- [x] Verify `docker-compose up -d` starts both services
- [x] Verify backend can connect to Dockerized PostgreSQL and Redis

---

### PHASE 0 CHECKPOINT
- [x] Backend project starts without errors on `http://localhost:3000`
- [x] Flutter app builds and launches on emulator/device
- [x] Next.js web portal starts on `http://localhost:3001`
- [x] PostgreSQL is running and accessible
- [x] Redis is running and accessible
- [x] Git repo has initial commit with all project scaffolding
- [x] **Commit:** "chore: complete project scaffolding for all 3 apps"

---

# ================================================================
# PHASE 1 — CORE MVP: AUTH + STORES + POS + INVOICES + SHARE
# ================================================================

**Goal:** A fully working billing app where an employee can log in, create a bill, generate a PDF, and share it to the customer via WhatsApp using the phone's native share sheet. The Super Admin can approve Store Admin registrations. Customers can look up bills on the web portal using a Billing ID.

---

## Sub-Phase 1A: Database Schema (Prisma)

### 1A.1 — Define Core Prisma Schema

- [x] Open `backend/prisma/schema.prisma`
- [x] Define the `brands` model:
  ```
  Fields: id (UUID), name, logo_url, primary_color, gst_number,
  loyalty_points_per_100 (Int, default 1),
  loyalty_min_redemption (Int, default 100),
  loyalty_expiry_months (Int, default 12),
  created_at, updated_at
  ```
  - [x] NOTE: No whatsapp_phone_id or whatsapp_api_token (removed per PROJECT_PLAN)
- [x] Define the `stores` model:
  ```
  Fields: id (UUID), brand_id (FK), name, address, city, state,
  gst_number, phone, logo_url, brand_color (nullable),
  is_active (Boolean, default true),
  created_at, updated_at
  ```
  - [x] Relation: stores belongsTo brands (brand_id)
- [x] Define the `users` model:
  ```
  Fields: id (UUID), brand_id (FK), store_id (FK, nullable),
  email (nullable, unique), password_hash (nullable),
  name, phone, pin (nullable),
  role (Enum: SUPER_ADMIN, STORE_ADMIN, EMPLOYEE),
  approval_status (Enum: PENDING, APPROVED, REJECTED, SUSPENDED),
  is_active (Boolean, default true),
  last_login_at (nullable), created_at, updated_at
  ```
  - [x] Relation: users belongsTo brands, users belongsTo stores (nullable)
- [x] Define the `customers` model:
  ```
  Fields: id (UUID), brand_id (FK), phone (unique per brand),
  name, total_visits (Int, default 0),
  total_spend (Decimal, default 0),
  loyalty_points (Int, default 0),
  first_visit_at (nullable), last_visit_at (nullable),
  created_at, updated_at
  ```
  - [x] Relation: customers belongsTo brands
  - [x] Unique constraint: @@unique([brand_id, phone])
- [x] Define the `products` model:
  ```
  Fields: id (UUID), brand_id (FK), name, sku, barcode (nullable),
  category, base_price (Decimal), tax_rate (Decimal),
  image_url (nullable), is_active (Boolean, default true),
  created_at, updated_at
  ```
- [x] Define the `store_inventory` model:
  ```
  Fields: id (UUID), store_id (FK), product_id (FK),
  quantity (Int), low_stock_threshold (Int, default 10),
  updated_at
  ```
- [x] Define the `invoices` model:
  ```
  Fields: id (UUID), invoice_number, billing_id (unique, 16 chars),
  brand_id (FK), store_id (FK), customer_id (FK, nullable for guest),
  employee_id (FK), subtotal (Decimal), tax_amount (Decimal),
  discount_amount (Decimal, default 0),
  loyalty_points_redeemed (Int, default 0),
  loyalty_discount (Decimal, default 0),
  grand_total (Decimal), loyalty_points_earned (Int, default 0),
  status (Enum: ACTIVE, PARTIALLY_REFUNDED, FULLY_REFUNDED),
  share_triggered (Boolean, default false),
  invoice_pdf_url (nullable),
  qr_code_url (nullable),
  created_at
  ```
  - [x] NOTE: No whatsapp_status column (removed per PROJECT_PLAN)
- [x] Define the `invoice_items` model:
  ```
  Fields: id (UUID), invoice_id (FK), product_id (FK, nullable),
  name, quantity (Int), unit_price (Decimal),
  tax_rate (Decimal), tax_amount (Decimal), total (Decimal)
  ```
- [x] Define the `loyalty_ledger` model:
  ```
  Fields: id (UUID), customer_id (FK), invoice_id (FK, nullable),
  type (Enum: EARNED, REDEEMED, EXPIRED, ADJUSTED),
  points (Int), description, created_at
  ```
- [x] Define the `audit_logs` model:
  ```
  Fields: id (UUID), brand_id (FK), user_id (FK),
  action, target_type, target_id (UUID),
  metadata (Json, nullable), ip_address (nullable),
  created_at
  ```
- [x] NOTE: No `campaigns` table (deferred to Phase 4 per PROJECT_PLAN)

### 1A.2 — Run Migration

- [x] Generate migration: `npx prisma migrate dev --name init_core_schema`
- [x] Verify all tables created in PostgreSQL
- [x] Generate Prisma client: `npx prisma generate`
- [x] Create a seed file (`backend/prisma/seed.ts`) with:
  - [x] One default brand (BillPush demo brand)
  - [x] One Super Admin user (email: admin@billpush.com, password: hashed)
- [x] Run seed: `npx prisma db seed`
- [x] Verify seed data exists in database

### 1A CHECKPOINT
- [x] All tables exist in PostgreSQL
- [x] Prisma client is generated and importable
- [x] Seed data is in place
- [x] **Commit:** "feat: complete Prisma schema with all core tables"

---

## Sub-Phase 1B: Backend Authentication System

### 1B.1 — Auth Module Setup

- [x] Create NestJS module: `nest g module auth`
- [x] Create NestJS controller: `nest g controller auth`
- [x] Create NestJS service: `nest g service auth`
- [x] Create Prisma service (shared database access):
  - [x] File: `backend/src/prisma/prisma.service.ts`
  - [x] Extends `PrismaClient`, implements `onModuleInit`
  - [x] Register as global module

### 1B.2 — Super Admin Registration (First-Time Setup)

- [x] Create DTO: `CreateSuperAdminDto` (name, email, password, phone, brand_name, brand_gst)
- [x] Endpoint: `POST /auth/setup`
  - [x] Guard: Only works if NO Super Admin exists in the database yet
  - [x] Creates the Brand record
  - [x] Creates the Super Admin user with role=SUPER_ADMIN, approval_status=APPROVED
  - [x] Hashes password with bcrypt (cost factor 12)
  - [x] Returns JWT access token + refresh token
- [x] Validate: email format, password min 8 chars, required fields

### 1B.3 — Store Admin Self-Registration

- [x] Create DTO: `RegisterStoreAdminDto` (name, email, password, phone)
- [x] Endpoint: `POST /auth/register`
  - [x] Creates user with role=STORE_ADMIN, approval_status=PENDING
  - [x] store_id is NULL initially (set later after approval + store profile setup)
  - [x] Hashes password with bcrypt
  - [x] Returns: `{ message: "Registration successful. Awaiting Super Admin approval." }`
  - [x] Does NOT return a JWT (user cannot log in until approved)
- [x] Validate: unique email, password requirements, phone format

### 1B.4 — Login Endpoints

- [x] Create DTO: `AdminLoginDto` (email, password)
- [x] Endpoint: `POST /auth/login`
  - [x] Accepts email + password
  - [x] Verifies password with bcrypt
  - [x] Checks: is_active=true AND approval_status=APPROVED
  - [x] If PENDING: return 403 "Your account is pending approval"
  - [x] If REJECTED: return 403 "Your registration was rejected"
  - [x] If SUSPENDED: return 403 "Your account has been suspended"
  - [x] If approved: Generate JWT (payload: userId, role, brandId, storeId) + refresh token
  - [x] Update last_login_at
  - [x] Return: `{ access_token, refresh_token, user: { id, name, role, store } }`

- [x] Create DTO: `EmployeeLoginDto` (store_id, employee_id, pin)
- [x] Endpoint: `POST /auth/employee-login`
  - [x] Accepts store_id, employee user_id, 4-digit PIN
  - [x] Verifies PIN hash with bcrypt
  - [x] Checks: is_active=true, user belongs to the given store
  - [x] Generate JWT with minimal permissions (role=EMPLOYEE, storeId, userId)
  - [x] Return: `{ access_token, user: { id, name, role, store_name } }`

### 1B.5 — Token Refresh

- [x] Endpoint: `POST /auth/refresh`
  - [x] Accepts refresh token
  - [x] Validates refresh token, generates new access token + new refresh token
  - [x] Old refresh token is invalidated (rotation)

### 1B.6 — JWT Strategy and Guards

- [x] Implement JwtStrategy (extends PassportStrategy)
  - [x] Extracts token from Authorization header (Bearer scheme)
  - [x] Validates token signature and expiry
  - [x] Attaches user payload (userId, role, brandId, storeId) to request object
- [x] Create `JwtAuthGuard` (applies to all protected routes)
- [x] Create `RolesGuard` (checks if user.role is authorized for the endpoint)
- [x] Create `@Roles()` decorator for role-based endpoint protection
- [x] Test: unauthenticated request returns 401
- [x] Test: wrong role returns 403

### 1B.7 — Approval System (Super Admin)

- [x] Endpoint: `GET /auth/pending-registrations` (Super Admin only)
  - [x] Returns all users where approval_status=PENDING
- [x] Endpoint: `PATCH /auth/approve/:userId` (Super Admin only)
  - [x] Sets approval_status=APPROVED
  - [x] Sends push notification to the Store Admin (or just 200 OK for now)
- [x] Endpoint: `PATCH /auth/reject/:userId` (Super Admin only)
  - [x] Sets approval_status=REJECTED
- [x] Endpoint: `PATCH /auth/suspend/:userId` (Super Admin only)
  - [x] Sets approval_status=SUSPENDED, is_active=false
  - [x] Invalidates all active sessions for this user

### 1B CHECKPOINT
- [x] Super Admin can register (first-time setup) and receive JWT
- [x] Store Admin can self-register and gets "pending approval" message
- [x] Super Admin can approve/reject/suspend Store Admin
- [x] Approved Store Admin can login and receive JWT
- [x] Employee can login with PIN and receive JWT
- [x] Wrong credentials return appropriate errors
- [x] JWT guards protect all routes
- [x] Role guards restrict access properly
- [x] Token refresh works with rotation
- [x] Test all endpoints with Postman/Thunder Client
- [x] **Commit:** "feat: complete auth system with self-registration and approval"

---

## Sub-Phase 1C: Store Management Module

### 1C.1 — Store CRUD

- [x] Create NestJS module: `nest g module stores`
- [x] Create NestJS controller: `nest g controller stores`
- [x] Create NestJS service: `nest g service stores`

- [x] Create DTO: `CreateStoreDto` (name, address, city, state, gst_number, phone, logo_url, brand_color)
- [x] Endpoint: `POST /stores` (Store Admin only — creates their store after approval)
  - [x] Associates the store with the brand_id from the Store Admin's JWT
  - [x] Updates the Store Admin's user record: sets store_id to the new store's ID
  - [x] Returns created store

- [x] Endpoint: `GET /stores` (Super Admin only)
  - [x] Returns all stores for the brand_id from JWT
  - [x] Includes: employee count, total invoices, today's revenue (aggregated)

- [x] Endpoint: `GET /stores/:id` (Store Admin: own store only; Super Admin: any store)
  - [x] Returns full store details with stats

- [x] Endpoint: `PATCH /stores/:id` (Store Admin: own store; Super Admin: any store)
  - [x] Update: name, address, phone, logo_url, brand_color, gst_number

- [x] Endpoint: `PATCH /stores/:id/deactivate` (Super Admin only)
  - [x] Sets is_active=false. No new bills can be generated.

- [x] Endpoint: `PATCH /stores/:id/activate` (Super Admin only)
  - [x] Sets is_active=true. Store resumes operations.

### 1C.2 — Store Logo Upload

- [x] Set up file upload infrastructure:
  - [x] Install `@nestjs/platform-express` and `multer`
  - [x] Install AWS SDK: `npm install @aws-sdk/client-s3`
  - [x] Create S3 upload service (`backend/src/common/s3.service.ts`)
- [x] Endpoint: `POST /stores/:id/logo` (multipart form-data)
  - [x] Accepts image file (PNG/JPG, max 2MB)
  - [x] Uploads to S3 bucket under `logos/{store_id}/logo.{ext}`
  - [x] Updates store's `logo_url` field with the S3 URL
  - [x] Returns the logo URL

### 1C CHECKPOINT
- [x] Store Admin can create their store profile after approval
- [x] Store Admin can upload a store logo
- [x] Super Admin can view all stores
- [x] Super Admin can activate/deactivate stores
- [x] Store Admin can only see their own store
- [x] **Commit:** "feat: store management with logo upload"

---

## Sub-Phase 1D: Employee Management Module

- [x] Create NestJS module: `nest g module employees`
- [x] Create controller and service

- [x] Create DTO: `CreateEmployeeDto` (name, phone, pin — 4 digits)
- [x] Endpoint: `POST /employees` (Store Admin only)
  - [x] Creates user with role=EMPLOYEE, store_id from Store Admin's JWT
  - [x] Hashes the 4-digit PIN with bcrypt
  - [x] Sets approval_status=APPROVED (employees don't need Super Admin approval)
  - [x] Returns: employee id, name

- [x] Endpoint: `GET /employees` (Store Admin: own store; Super Admin: any store via query param)
  - [x] Returns list of employees for the store
  - [x] Includes: name, phone, is_active, last_login_at, bills_today_count

- [x] Endpoint: `PATCH /employees/:id` (Store Admin only)
  - [x] Update: name, phone, is_active

- [x] Endpoint: `PATCH /employees/:id/reset-pin` (Store Admin only)
  - [x] Accepts new 4-digit PIN, hashes it, updates the record

- [x] Endpoint: `DELETE /employees/:id` (Store Admin only)
  - [x] Soft delete: sets is_active=false
  - [x] The employee can no longer log in

- [x] Endpoint: `GET /employees/login-list/:storeId` (Public — needed for the employee login dropdown)
  - [x] Returns only: employee id and name (NO sensitive data)
  - [x] Only active employees
  - [x] This is used on the Flutter login screen to populate the name dropdown

### 1D CHECKPOINT
- [x] Store Admin can create employees with PINs
- [x] Store Admin can view, edit, deactivate employees
- [x] Employee login dropdown shows active employee names
- [x] Employee can log in with their name + PIN
- [x] **Commit:** "feat: employee management module"

---

## Sub-Phase 1E: Customer Management Module

- [x] Create NestJS module: `nest g module customers`
- [x] Create controller and service

- [x] Endpoint: `POST /customers` (Employee, Store Admin)
  - [x] Create DTO: `CreateCustomerDto` (phone, name)
  - [x] Creates customer record under the brand_id from JWT
  - [x] If phone already exists for this brand: return existing customer (deduplication)
  - [x] Returns: customer id, name, phone, total_visits, loyalty_points

- [x] Endpoint: `GET /customers/lookup/:phone` (Employee, Store Admin)
  - [x] Looks up customer by phone within the brand
  - [x] If found: returns customer profile (name, total_visits, loyalty_points)
  - [x] If not found: returns 404 (triggers "New Customer" flow in the app)

- [x] Endpoint: `GET /customers` (Store Admin: filtered by store visits; Super Admin: all)
  - [x] Query params: search (name or phone), sort_by, page, limit
  - [x] Returns paginated customer list with stats

- [x] Endpoint: `GET /customers/:id` (Store Admin, Super Admin)
  - [x] Returns full customer profile with visit history

- [x] Endpoint: `PATCH /customers/:id` (Store Admin, Super Admin)
  - [x] Update: name only (phone is immutable)

### 1E CHECKPOINT
- [x] Customer can be created during checkout
- [x] Duplicate phone numbers return existing customer (same brand)
- [x] Customer lookup by phone works
- [x] Customer list is searchable and paginated
- [x] **Commit:** "feat: customer management with deduplication"

---

## Sub-Phase 1F: Invoice Generation Module (Backend)

### 1F.1 — Invoice Creation

- [x] Create NestJS module: `nest g module invoices`
- [x] Create controller and service

- [x] Create utility: **Billing ID Generator**
  - [x] Generates 16-character alphanumeric string (uppercase)
  - [x] Checks uniqueness in database before returning
  - [x] Example output: `A1B2C3D4E5F6G7H8`

- [x] Create utility: **Invoice Number Generator**
  - [x] Format: `{STORE_PREFIX}-{YEAR}-{SEQUENTIAL_NUMBER}`
  - [x] Example: `TB-2026-00047`
  - [x] Store prefix = first 2 letters of store name (uppercase)
  - [x] Sequential number auto-increments per store per year

- [x] Create DTO: `CreateInvoiceDto`
  ```
  {
    customer_id: UUID (nullable for guest),
    customer_phone: string,
    customer_name: string,
    items: [
      {
        product_id: UUID (nullable for custom items),
        name: string,
        quantity: number,
        unit_price: number,
        tax_rate: number
      }
    ],
    discount_amount: number (default 0),
    loyalty_points_redeemed: number (default 0)
  }
  ```

- [x] Endpoint: `POST /invoices` (Employee only)
  - [x] Validates all items and calculates:
    - [x] Per-item tax_amount = quantity * unit_price * (tax_rate / 100)
    - [x] Per-item total = (quantity * unit_price) + tax_amount
    - [x] subtotal = sum of all (quantity * unit_price)
    - [x] tax_amount = sum of all per-item tax_amounts
    - [x] loyalty_discount = calculate ₹ value of redeemed points
    - [x] grand_total = subtotal + tax_amount - discount_amount - loyalty_discount
  - [x] Creates or finds customer (by phone, deduplication)
  - [x] Generates unique billing_id (16 chars)
  - [x] Generates invoice_number (sequential per store)
  - [x] Creates invoice record in database
  - [x] Creates all invoice_item records
  - [x] Updates customer stats: total_visits++, total_spend += grand_total, last_visit_at = now
  - [x] If loyalty points redeemed: deduct from customer balance, create REDEEMED ledger entry
  - [x] Calculate loyalty points earned: grand_total / 100 * points_per_100 (from brand config)
  - [x] Add earned points to customer balance, create EARNED ledger entry
  - [x] Create audit_log entry: INVOICE_CREATED
  - [x] Return: complete invoice object with billing_id, invoice_number, all items, totals

### 1F.2 — Invoice Retrieval

- [x] Endpoint: `GET /invoices` (Employee: own bills today; Store Admin: all store bills; Super Admin: all bills)
  - [x] Query params: store_id, employee_id, customer_id, date_from, date_to, status, page, limit
  - [x] Returns paginated invoice list with: invoice_number, billing_id, customer_name, grand_total, created_at, status

- [x] Endpoint: `GET /invoices/:id` (Employee: own; Store Admin: own store; Super Admin: any)
  - [x] Returns full invoice with all items, customer info, store info

- [x] Endpoint: `GET /invoices/billing/:billingId` (PUBLIC — no auth required)
  - [x] This is used by the Customer Web Portal
  - [x] Returns: full invoice detail WITH store branding info (store name, logo_url, address, phone, gst_number)
  - [x] Does NOT return employee info or internal IDs

- [x] Endpoint: `GET /invoices/customer/:phone` (PUBLIC — no auth required)
  - [x] Returns summary list only: invoice date, store_name, grand_total, billing_id
  - [x] Does NOT return itemized details (privacy: requires billing_id for full detail)

### 1F.3 — Invoice Voiding (Returns)

- [x] Endpoint: `PATCH /invoices/:id/void` (Store Admin only)
  - [x] Sets status to FULLY_REFUNDED
  - [x] Adjusts customer total_spend
  - [x] Reverses loyalty points earned (create ADJUSTED ledger entry)
  - [x] Create audit_log entry: INVOICE_VOIDED

### 1F.4 — Invoice PDF Generation (Server-Side)

- [x] Install Puppeteer: `npm install puppeteer`
- [x] Create PDF generation service:
  - [x] Builds an HTML invoice template with:
    - [x] Store logo, name, address, phone, GST at the top (WHITE-LABEL branding)
    - [x] Invoice number, date, customer details
    - [x] Itemized table with quantities, prices, taxes
    - [x] Subtotal, tax breakdown, discounts, grand total
    - [x] QR code (encoding the billing_id)
    - [x] Footer: "Powered by BillPush" + web link
  - [x] Uses Puppeteer to render HTML to PDF
  - [x] Uploads PDF to S3
  - [x] Updates invoice record with invoice_pdf_url
- [x] Endpoint: `GET /invoices/:id/pdf` (generates on demand if not cached)
  - [x] Returns PDF file or redirect to S3 URL

### 1F CHECKPOINT
- [x] Employee can create an invoice with items, taxes, discounts
- [x] Billing ID and invoice number are generated correctly
- [x] Customer stats update automatically on invoice creation
- [x] Loyalty points earned and redeemed correctly
- [x] Invoice PDF generates with store branding (NOT app branding)
- [x] Public endpoints work without auth (for web portal)
- [x] Phone number lookup returns summaries only
- [x] Billing ID lookup returns full detail
- [x] Invoice voiding works correctly
- [x] **Commit:** "feat: complete invoice generation with PDF and QR code"

---

## Sub-Phase 1G: Flutter Mobile App — Authentication Screens

### 1G.1 — App Theme and Design System

- [x] Define app theme in `config/theme.dart`:
  - [x] Primary colors, typography, button styles, input decoration
  - [x] Light mode (primary focus)
  - [x] Use Google Fonts: Inter or Poppins
- [x] Create reusable widgets:
  - [x] `BillPushTextField` (custom styled text input)
  - [x] `BillPushButton` (primary action button)
  - [x] `BillPushAppBar` (custom app bar)
  - [x] `LoadingOverlay` (full-screen loading indicator)

### 1G.2 — API Client Setup

- [x] Configure Dio HTTP client in `core/network/api_client.dart`:
  - [x] Base URL from config
  - [x] Request interceptor: attach JWT from secure storage
  - [x] Response interceptor: handle 401 (token expired) → try refresh → retry
  - [x] Error interceptor: parse error responses into user-friendly messages

### 1G.3 — Splash Screen

- [x] Build splash screen:
  - [x] BillPush logo animation (fade in + scale)
  - [x] Check if JWT exists in secure storage
  - [x] If yes and valid: navigate to role-based home screen
  - [x] If no: navigate to Login screen

### 1G.4 — Login Screen

- [x] Build login screen with two tabs/options:
  - [x] **Admin Login Tab:**
    - [x] Email input field
    - [x] Password input field (with show/hide toggle)
    - [x] "Login" button
    - [x] "Register as Store Manager" link (navigates to registration)
    - [x] Handle responses: success → navigate to home, pending → show message, rejected → show message
  - [x] **Employee Login Tab:**
    - [x] Store selector dropdown (fetched from API — publicly accessible list)
    - [x] Employee name dropdown (fetched when store is selected)
    - [x] 4-digit PIN input (large number buttons, optimized for speed)
    - [x] "Login" button
    - [x] Handle: success → navigate to POS Home

### 1G.5 — Store Admin Registration Screen

- [x] Build registration screen:
  - [x] Name, Email, Password, Confirm Password, Phone Number fields
  - [x] Client-side validation (email format, password match, phone 10 digits)
  - [x] "Register" button → POST /auth/register
  - [x] On success: show "Registration submitted! You'll be notified when approved." and navigate back to login

### 1G.6 — Store Profile Setup Screen (First-Time for Store Admin)

- [x] Build store setup screen (shown after first login if store_id is null):
  - [x] Store Name input
  - [x] Store Address input
  - [x] City input
  - [x] State dropdown (Indian states list)
  - [x] GST Number input
  - [x] Phone Number input
  - [x] Logo upload button (image picker → upload to S3 via API)
  - [x] Brand Color picker (optional)
  - [x] "Save Store Profile" button → POST /stores
  - [x] On success: navigate to Store Admin home dashboard

### 1G.7 — Role-Based Navigation

- [x] Implement `go_router` with route guards:
  - [x] Route: `/` → Splash
  - [x] Route: `/login` → Login screen
  - [x] Route: `/register` → Registration screen
  - [x] Route: `/setup-store` → Store profile setup
  - [x] Route: `/super-admin/...` → Super Admin screens (guard: role=SUPER_ADMIN)
  - [x] Route: `/store-admin/...` → Store Admin screens (guard: role=STORE_ADMIN)
  - [x] Route: `/pos/...` → Employee screens (guard: role=EMPLOYEE)
- [x] Redirect logic: if token expired or invalid, redirect to `/login`

### 1G CHECKPOINT
- [x] Super Admin can log in and reaches their dashboard shell
- [x] Store Admin can register and sees "pending" message
- [x] After Super Admin approves (via Postman for now), Store Admin can log in
- [x] Store Admin completes store profile setup with logo
- [x] Employee can log in with store + name + PIN
- [x] Role-based routing works correctly
- [x] Token storage and auto-refresh work
- [x] **Commit:** "feat: Flutter auth flow with registration, login, and store setup"

---

## Sub-Phase 1H: Flutter Mobile App — Super Admin Screens (MVP)

- [ ] **Pending Approvals Screen:**
  - [ ] List of Store Admins with approval_status=PENDING
  - [ ] Each card shows: name, email, phone, registration date
  - [ ] Approve button (green) and Reject button (red)
  - [ ] Pull-to-refresh
  - [ ] Badge count shown on navigation

- [ ] **Store List Screen:**
  - [ ] List of all stores with: name, city, is_active status, today's revenue
  - [ ] Tap to view store detail
  - [ ] Search bar to filter by store name

- [ ] **Store Detail Screen (Super Admin View):**
  - [ ] Store info: name, address, logo, phone, GST
  - [ ] Employee count
  - [ ] Today's stats: bills generated, revenue
  - [ ] Activate/Deactivate toggle

- [ ] **Super Admin Bottom Navigation:**
  - [ ] Dashboard (placeholder for Phase 2)
  - [ ] Stores (store list)
  - [ ] Approvals (pending registrations with badge)
  - [ ] Settings

### 1H CHECKPOINT
- [x] Super Admin can approve/reject Store Admin registrations from the app
- [x] Super Admin can view all stores
- [x] Super Admin can activate/deactivate a store
- [x] **Commit:** "feat: Super Admin MVP screens — approvals and store management"

---

## Sub-Phase 1I: Flutter Mobile App — Store Admin Screens (MVP)

- [ ] **Store Dashboard Screen:**
  - [ ] Today's revenue (large number)
  - [ ] Bills generated today
  - [ ] Average bill value
  - [ ] Quick action: "View Employees" and "View Invoices"

- [ ] **Employee Management Screen:**
  - [ ] List of employees with: name, is_active, last_login
  - [ ] "Add Employee" FAB → bottom sheet or new screen:
    - [ ] Name, Phone, 4-digit PIN input
    - [ ] "Create" button
  - [ ] Swipe to deactivate/reactivate
  - [ ] Tap to edit or reset PIN

- [ ] **Invoice List Screen:**
  - [ ] List of all invoices from this store
  - [ ] Each row: invoice_number, customer_name, grand_total, time, status
  - [ ] Filter by: today, this week, this month, custom date range
  - [ ] Search by customer name or phone
  - [ ] Tap to view invoice detail

- [ ] **Invoice Detail Screen:**
  - [ ] Full invoice view: store header, customer info, itemized list, totals
  - [ ] "Void Invoice" button (with confirmation dialog)
  - [ ] "Re-share" button (opens share sheet with PDF)
  - [ ] Status badge (ACTIVE / REFUNDED)

- [ ] **Store Settings Screen:**
  - [ ] Edit store profile: name, address, logo, phone, GST, color
  - [ ] Discount settings: can employees apply discounts? Max discount %?

- [ ] **Store Admin Bottom Navigation:**
  - [ ] Dashboard
  - [ ] Invoices
  - [ ] Employees
  - [ ] Settings

### 1I CHECKPOINT
- [x] Store Admin sees their store dashboard with today's stats
- [x] Store Admin can create, edit, deactivate employees
- [x] Store Admin can view all store invoices
- [x] Store Admin can void an invoice
- [x] Store Admin can update store profile
- [x] **Commit:** "feat: Store Admin MVP screens — dashboard, employees, invoices"

---

## Sub-Phase 1J: Flutter Mobile App — Employee POS Screens

### 1J.1 — POS Home Screen

- [x] Build POS home with two large buttons:
  - [x] "New Bill" (primary action, large)
  - [x] "Recent Bills" (secondary)
- [x] Show employee name and store name at the top
- [x] Show online/offline indicator

### 1J.2 — Customer Entry Screen

- [x] Large phone number input field (numeric keyboard, 10 digits)
- [x] "Next" button → calls `GET /customers/lookup/:phone`
- [x] If customer exists:
  - [x] Show "Welcome back, {Name}!" with loyalty points
  - [x] Auto-fill name, proceed to cart
- [x] If customer not found:
  - [x] Show "New Customer" label
  - [x] Name input field appears
  - [x] "Continue" button

### 1J.3 — Cart / Item Entry Screen

- [x] Cart view with running total at the bottom
- [x] Two modes for adding items:
  - [x] **Manual mode (MVP — Phase 1):**
    - [x] Product search field with autocomplete (searches catalog API)
    - [x] OR "Custom Item" button → name + price input
    - [x] Quantity adjuster (+/-)
    - [x] "Add to Cart" button
  - [ ] Barcode scanning will be added in Phase 2
- [x] Cart item list:
  - [x] Each item shows: name, qty, unit price, line total
  - [x] Swipe to remove
  - [x] Tap to edit quantity
- [x] Running total bar always visible at bottom:
  - [x] Subtotal | Tax | Grand Total

### 1J.4 — Review and Confirm Screen

- [x] Full bill summary:
  - [x] Customer: name (phone)
  - [x] Items (itemized table)
  - [x] Subtotal
  - [x] Tax breakdown (GST %)
  - [x] Discount (if applied) — toggle with amount input
  - [x] Loyalty Points (if applied) — toggle showing available points and ₹ value
  - [x] **Grand Total** (large, bold)
- [x] Big green button: **"CONFIRM & SHARE"**
- [x] On tap:
  1. [x] POST /invoices to create the invoice
  2. [x] Receive response with billing_id and all data
  3. [x] Generate PDF locally using `pdf` Flutter package:
     - [x] Store logo at top (from store profile)
     - [x] Store name, address, phone, GST
     - [x] Invoice details (number, date, customer)
     - [x] Itemized table
     - [x] Totals
     - [x] QR code (encoding billing_id)
     - [x] Footer: "Powered by BillPush" + web link
  4. [x] Save PDF to local temp directory
  5. [x] Open **Native Share Sheet** using `share_plus` package:
     - [x] Pre-compose message text
     - [x] Attach PDF file
  6. [x] After share sheet is dismissed: update invoice `share_triggered = true` via API
  7. [x] Navigate to Success Screen

### 1J.5 — Success Screen

- [x] Confirmation animation (checkmark)
- [x] "Invoice shared successfully!"
- [x] Invoice number and billing ID displayed
- [x] Two buttons:
  - [x] "New Bill" (goes back to POS Home)
  - [x] "View Bill" (opens invoice detail)

### 1J.6 — Recent Bills Screen

- [x] List of employee's own bills from the current shift
- [x] Each row: time, customer name, grand_total
- [x] Tap to view invoice detail
- [x] "Re-share" button on each item

### 1J CHECKPOINT
- [x] Employee can enter customer phone and name
- [x] Customer auto-fill works for returning customers
- [x] Items can be added to cart (manual entry)
- [x] Tax calculation is correct
- [x] Discounts and loyalty points work
- [x] Invoice is created in the database
- [x] PDF is generated locally with store branding
- [x] Native share sheet opens with message + PDF
- [x] Success screen shows after sharing
- [x] Recent bills list works
- [x] Invoice re-sharing works
- [x] **Commit:** "feat: complete Employee POS flow with PDF generation and share"

---

## Sub-Phase 1K: Customer Web Portal (MVP)

### 1K.1 — Landing Page

- [ ] Build `web/src/app/page.tsx`:
  - [ ] Clean centered layout with BillPush logo
  - [ ] Two cards/options:
    - [ ] "I have a Billing ID" → input field + "Look Up" button
    - [ ] "View Purchase History" → phone number input + "Search" button
  - [ ] Responsive design (works on mobile browser)

### 1K.2 — Invoice Detail Page (Billing ID Lookup)

- [ ] Build `web/src/app/invoice/[billingId]/page.tsx`:
  - [ ] Calls: `GET /invoices/billing/:billingId`
  - [ ] Renders STORE-BRANDED invoice page:
    - [ ] Store logo at top
    - [ ] Store name, address, phone, GST
    - [ ] Invoice number and date
    - [ ] Customer name
    - [ ] Itemized table
    - [ ] Totals (subtotal, tax, discount, grand total)
    - [ ] QR code
    - [ ] "Download as PDF" button
    - [ ] Footer: "Powered by BillPush"
  - [ ] If billing_id not found: show "Invoice not found" page

### 1K.3 — Purchase History Page (Phone Lookup)

- [ ] Build `web/src/app/history/page.tsx`:
  - [ ] Phone number input field
  - [ ] On submit: calls `GET /invoices/customer/:phone`
  - [ ] Shows summary list: Date, Store Name, Amount
  - [ ] Each item has: "Enter Billing ID to view full detail" or "View Summary"
  - [ ] No sensitive details without billing_id (privacy)

### 1K.4 — Styling

- [ ] Clean, minimal CSS (vanilla CSS as per guidelines)
- [ ] Responsive layout (mobile-first)
- [ ] Professional typography (Google Fonts: Inter)
- [ ] BillPush branding on landing page only
- [ ] Store branding on invoice detail pages

### 1K CHECKPOINT
- [ ] Landing page loads with two lookup options
- [ ] Billing ID lookup shows full branded invoice
- [ ] Phone number lookup shows summary list only
- [ ] PDF download works
- [ ] Responsive on mobile and desktop
- [ ] Store branding (logo, name, colors) renders correctly
- [ ] "Powered by BillPush" footer on all invoice pages
- [ ] **Commit:** "feat: customer web portal with bill lookup and history"

---

## Sub-Phase 1L: End-to-End Integration Testing (Phase 1)

- [ ] **Test Scenario 1: Full Onboarding Flow**
  1. [ ] Super Admin registers (first-time setup)
  2. [ ] Store Admin self-registers
  3. [ ] Super Admin approves Store Admin via app
  4. [ ] Store Admin logs in and creates store profile with logo
  5. [ ] Store Admin creates 2 employees with PINs

- [ ] **Test Scenario 2: Full Billing Flow**
  1. [ ] Employee logs in with PIN
  2. [ ] Employee taps "New Bill"
  3. [ ] Employee enters a new customer phone number
  4. [ ] Employee adds 3 items to cart
  5. [ ] Employee applies a ₹50 discount
  6. [ ] Employee confirms and shares via WhatsApp
  7. [ ] PDF opens in share sheet with correct store branding
  8. [ ] Invoice appears in Store Admin's invoice list
  9. [ ] Customer stats are updated

- [ ] **Test Scenario 3: Returning Customer**
  1. [ ] Employee enters the same phone number as above
  2. [ ] System shows "Welcome back, {Name}! Points: {X}"
  3. [ ] Employee creates another bill
  4. [ ] Customer's total_visits and total_spend increase

- [ ] **Test Scenario 4: Web Portal**
  1. [ ] Open browser, go to web portal
  2. [ ] Enter the billing_id from Test Scenario 2
  3. [ ] Full invoice loads with correct store branding
  4. [ ] Download PDF works
  5. [ ] Enter the customer's phone number
  6. [ ] Summary list shows both invoices

- [ ] **Test Scenario 5: Invoice Voiding**
  1. [ ] Store Admin voids the first invoice
  2. [ ] Invoice status changes to FULLY_REFUNDED
  3. [ ] Customer's total_spend decreases

- [ ] **Test Scenario 6: Guest Checkout**
  1. [ ] Employee creates a bill without a phone number (guest mode)
  2. [ ] Invoice is created with customer_id = null
  3. [ ] Share sheet still opens with just the PDF (no customer-specific message)

### 1L CHECKPOINT
- [ ] ALL 6 test scenarios pass
- [ ] No console errors in backend
- [ ] No UI crashes in Flutter app
- [ ] Web portal renders correctly
- [ ] **Commit:** "test: Phase 1 end-to-end integration verified"
- [ ] **Tag:** `v0.1.0-mvp`

---

# ================================================================
# PHASE 2 — INTELLIGENCE: ANALYTICS + CATALOG + BARCODE + PUSH
# ================================================================

**Goal:** Super Admin and Store Admin get analytics dashboards. Product catalog with barcode scanning. Push notifications for daily summaries.

---

## Sub-Phase 2A: Analytics Engine (Backend)

- [ ] Create NestJS module: `nest g module analytics`
- [ ] Create service with aggregation queries

- [ ] Endpoint: `GET /analytics/global` (Super Admin only)
  - [ ] Returns:
    - [ ] Total revenue: today, this week, this month, this year
    - [ ] Total invoices: today, this week, this month
    - [ ] Total active stores count
    - [ ] Total unique customers count
    - [ ] Revenue comparison vs previous period (percentage change)
    - [ ] Top 5 stores by revenue (this month)
    - [ ] Top 5 products by quantity sold (this month)
    - [ ] New customers this week vs last week

- [ ] Endpoint: `GET /analytics/store/:storeId` (Store Admin: own store; Super Admin: any)
  - [ ] Returns:
    - [ ] Today's revenue, bill count, average bill value
    - [ ] Comparison to yesterday (percentage change)
    - [ ] This week daily breakdown (array of 7 day totals)
    - [ ] This month weekly breakdown
    - [ ] Peak hours distribution (bills per hour for today)
    - [ ] Employee performance (bills per employee today/this week)
    - [ ] Top 5 selling products at this store
    - [ ] Customer return rate (repeat customers / total customers)

- [ ] Endpoint: `GET /analytics/revenue-chart` (Super Admin)
  - [ ] Query params: period (daily/weekly/monthly), store_id (optional)
  - [ ] Returns array of { date, revenue } for charting

- [ ] Optimize with Redis caching:
  - [ ] Cache global analytics for 5 minutes
  - [ ] Cache store analytics for 2 minutes
  - [ ] Invalidate cache when new invoice is created

### 2A CHECKPOINT
- [ ] Global analytics endpoint returns accurate data
- [ ] Store analytics endpoint returns accurate data
- [ ] Revenue chart data is correct
- [ ] Caching works (second request is faster)
- [ ] **Commit:** "feat: analytics engine with global and store-level stats"

---

## Sub-Phase 2B: Product Catalog Module (Backend)

- [ ] Create NestJS module: `nest g module catalog`

- [ ] Endpoint: `POST /products` (Super Admin only)
  - [ ] Create product: name, sku, barcode, category, base_price, tax_rate, image_url
  - [ ] Associates with brand_id from JWT

- [ ] Endpoint: `GET /products` (All authenticated users)
  - [ ] Query params: search, category, page, limit
  - [ ] Returns paginated product list
  - [ ] Cache in Redis (invalidate on create/update/delete)

- [ ] Endpoint: `GET /products/barcode/:barcode` (Employee)
  - [ ] Looks up product by barcode string
  - [ ] Returns product info (used by the barcode scanner)

- [ ] Endpoint: `PATCH /products/:id` (Super Admin only)
  - [ ] Update any field

- [ ] Endpoint: `DELETE /products/:id` (Super Admin only)
  - [ ] Soft delete: is_active = false

- [ ] Endpoint: `POST /products/:id/image` (Super Admin)
  - [ ] Upload product image to S3
  - [ ] Update image_url

- [ ] Endpoint: `POST /products/bulk-upload` (Super Admin — Web Portal)
  - [ ] Accepts CSV file
  - [ ] Parses and creates multiple products
  - [ ] Returns: created count, error count, error details

### 2B CHECKPOINT
- [ ] Products can be created, updated, soft-deleted
- [ ] Product search works with pagination
- [ ] Barcode lookup returns correct product
- [ ] Bulk CSV upload works
- [ ] Redis cache is used for product listings
- [ ] **Commit:** "feat: product catalog with barcode lookup and bulk upload"

---

## Sub-Phase 2C: Flutter — Barcode Scanning in POS

- [ ] Integrate `mobile_scanner` package in the cart screen
- [ ] Add "Scan Barcode" button to the cart screen:
  - [ ] Opens camera overlay
  - [ ] Scans barcode (EAN-13, UPC, Code128, etc.)
  - [ ] Calls `GET /products/barcode/:barcode`
  - [ ] If found: auto-adds product to cart with name, price, tax rate
  - [ ] If not found: shows "Product not found — switch to manual entry?"
- [ ] Add haptic feedback on successful scan
- [ ] Add visual confirmation (green flash on camera preview)
- [ ] Continuous scanning mode: after one scan, camera stays open for next item

### 2C CHECKPOINT
- [ ] Camera opens and scans barcodes
- [ ] Product auto-adds to cart from scan
- [ ] Fallback to manual entry works
- [ ] Multiple items can be scanned consecutively
- [ ] **Commit:** "feat: barcode scanning in POS cart"

---

## Sub-Phase 2D: Flutter — Analytics Dashboards

### 2D.1 — Super Admin Global Dashboard

- [ ] Build dashboard screen with:
  - [ ] Revenue cards: Today, This Week, This Month (with % change indicators)
  - [ ] Tile: Total Active Stores count
  - [ ] Tile: Total Customers count
  - [ ] Store Leaderboard: top 5 stores ranked by revenue (bar chart or list)
  - [ ] Top Products: top 5 products by quantity sold
  - [ ] Revenue trend line chart (last 7 days or 30 days, toggleable)
- [ ] Use `fl_chart` package for charts
- [ ] Pull-to-refresh to reload data
- [ ] Loading skeleton while data is fetching

### 2D.2 — Store Admin Dashboard Enhancement

- [ ] Enhance the existing store dashboard with:
  - [ ] Revenue trend chart (this week, day-by-day)
  - [ ] Peak hours bar chart (bills per hour)
  - [ ] Employee performance cards (bills per employee)
  - [ ] Top selling products list (this week)
  - [ ] Customer stats: total customers, new this week, repeat rate

### 2D CHECKPOINT
- [ ] Super Admin dashboard shows accurate global stats with charts
- [ ] Store Admin dashboard shows detailed store analytics
- [ ] Charts render correctly with real data
- [ ] Pull-to-refresh works
- [ ] **Commit:** "feat: analytics dashboards for Super Admin and Store Admin"

---

## Sub-Phase 2E: Flutter — Product Catalog Management (Super Admin)

- [ ] **Product List Screen:**
  - [ ] Grid/list of all products with: image, name, price, category, active/inactive badge
  - [ ] Search bar with real-time filtering
  - [ ] Filter by category (dropdown or chips)
  - [ ] FAB: "Add Product"

- [ ] **Add/Edit Product Screen:**
  - [ ] Inputs: Name, SKU, Barcode, Category (dropdown), Price, Tax Rate
  - [ ] Image picker + upload
  - [ ] "Save" button

- [ ] **Catalog Notification:**
  - [ ] After adding/editing products, show a confirmation
  - [ ] Catalog automatically available to all stores (no manual push needed since products are fetched via API)

### 2E CHECKPOINT
- [ ] Super Admin can view, add, edit, deactivate products
- [ ] Product images upload correctly
- [ ] Search and filter work
- [ ] **Commit:** "feat: Super Admin product catalog management"

---

## Sub-Phase 2F: Web Portal — Purchase History Enhancement

- [ ] Update phone number lookup page to show a proper list:
  - [ ] Show: Date, Store Name, Amount, Status for each invoice
  - [ ] Clickable rows: prompt for Billing ID to see full detail
  - [ ] OR show limited summary view (items count, total only)
- [ ] Add pagination for customers with many invoices

### 2F CHECKPOINT
- [ ] Phone lookup page shows proper list
- [ ] Pagination works
- [ ] **Commit:** "feat: enhanced purchase history on web portal"

---

## Sub-Phase 2G: Push Notifications (FCM)

### 2G.1 — Backend FCM Integration

- [ ] Install Firebase Admin SDK: `npm install firebase-admin`
- [ ] Create notification service (`backend/src/notifications/notification.service.ts`)
- [ ] Store FCM device tokens:
  - [ ] Add `fcm_token` column to `users` table (migration)
  - [ ] Endpoint: `POST /users/fcm-token` (save device token on login)
- [ ] Create notification triggers:
  - [ ] **Daily Summary Cron Job (9 PM):**
    - [ ] For each active store: calculate today's stats
    - [ ] Send push to Store Admin: "Today: {count} bills, ₹{revenue}"
    - [ ] Send aggregated push to Super Admin: "Today across all stores: ₹{total}"
  - [ ] **New Registration Alert:**
    - [ ] When Store Admin registers: push to Super Admin "New registration: {name}"
  - [ ] **Invoice Voided Alert:**
    - [ ] When Store Admin voids invoice: push to Super Admin

### 2G.2 — Flutter FCM Integration

- [ ] Configure Firebase for Android (google-services.json)
- [ ] Configure Firebase for iOS (GoogleService-Info.plist)
- [ ] Initialize Firebase in `main.dart`
- [ ] Request notification permissions on app launch
- [ ] Handle foreground notifications (show in-app banner)
- [ ] Handle background notifications (system notification)
- [ ] On login: send FCM token to backend
- [ ] On logout: clear FCM token

### 2G CHECKPOINT
- [ ] Daily summary push notification arrives at 9 PM
- [ ] New registration alert works
- [ ] Invoice voided alert works
- [ ] Notifications appear correctly on Android and iOS
- [ ] **Commit:** "feat: push notifications with FCM for daily summaries and alerts"

---

## Sub-Phase 2H: Phase 2 Integration Testing

- [ ] Super Admin dashboard shows correct global analytics
- [ ] Store Admin dashboard shows correct store analytics
- [ ] Barcode scanning adds products to cart correctly
- [ ] Super Admin can manage product catalog
- [ ] Push notifications arrive for daily summaries
- [ ] Web portal purchase history works with pagination
- [ ] **Commit:** "test: Phase 2 integration verified"
- [ ] **Tag:** `v0.2.0-intelligence`

---

# ================================================================
# PHASE 3 — ENGAGEMENT: LOYALTY + RETURNS + OFFLINE
# ================================================================

**Goal:** Loyalty points system is fully functional at POS and web. QR code returns work. App works offline.

---

## Sub-Phase 3A: Loyalty and Rewards System

### 3A.1 — Backend Loyalty Module

- [ ] Create NestJS module: `nest g module loyalty`

- [ ] Endpoint: `GET /loyalty/:customerId` (Store Admin, Super Admin)
  - [ ] Returns: current balance, lifetime earned, lifetime redeemed, ledger history

- [ ] Endpoint: `GET /loyalty/customer/:phone/balance` (Employee — used during POS checkout)
  - [ ] Returns: points balance, ₹ equivalent, eligible to redeem (boolean)

- [ ] Loyalty logic is already integrated in invoice creation (Phase 1F)
- [ ] Add: Points expiry cron job
  - [ ] Runs monthly
  - [ ] Finds points older than brand.loyalty_expiry_months
  - [ ] Creates EXPIRED ledger entries
  - [ ] Deducts from customer balance

### 3A.2 — Flutter Loyalty Display

- [ ] **POS Customer Entry:** Already shows points. Enhance with:
  - [ ] Show ₹ value equivalent
  - [ ] "Use Points" toggle with slider for partial redemption

- [ ] **Customer Detail Screen (Store Admin / Super Admin):**
  - [ ] Add loyalty section:
    - [ ] Current balance with ₹ value
    - [ ] Ledger history (earned, redeemed, expired entries with dates)

- [ ] **Super Admin Loyalty Settings:**
  - [ ] Already built in Phase 1. Verify:
    - [ ] Points per ₹100 configurable
    - [ ] Minimum redemption threshold configurable
    - [ ] Expiry months configurable
    - [ ] Changes apply to future transactions

### 3A.3 — Web Portal Loyalty Display

- [ ] On invoice detail page: show points earned on this transaction
- [ ] On purchase history page: show current points balance summary at the top

### 3A CHECKPOINT
- [ ] Points earned on every purchase correctly
- [ ] Points redeemable at POS across any store
- [ ] Partial redemption works
- [ ] Points expiry cron job works
- [ ] Loyalty history visible in customer detail
- [ ] Web portal shows points info
- [ ] **Commit:** "feat: complete loyalty and rewards system"

---

## Sub-Phase 3B: Returns and Exchanges

### 3B.1 — Backend Returns Module

- [ ] Create NestJS module: `nest g module returns`

- [ ] Endpoint: `POST /returns` (Employee — initiated; Store Admin — approved)
  - [ ] DTO: `CreateReturnDto` (invoice_id, items: [{invoice_item_id, quantity_returned}], reason)
  - [ ] Logic:
    - [ ] Validates original invoice exists and is ACTIVE
    - [ ] Validates return quantities don't exceed original quantities
    - [ ] Calculates refund amount
    - [ ] If refund > configurable threshold: set status=PENDING_APPROVAL
    - [ ] If refund <= threshold: auto-approve
    - [ ] Creates return record
    - [ ] On approval: updates invoice status, reverses loyalty points, adjusts customer stats
    - [ ] Creates audit log entry

- [ ] Endpoint: `GET /returns/pending` (Store Admin)
  - [ ] Returns pending return requests

- [ ] Endpoint: `PATCH /returns/:id/approve` (Store Admin)
  - [ ] Approves the return, executes refund logic

- [ ] Endpoint: `PATCH /returns/:id/reject` (Store Admin)
  - [ ] Rejects the return request

### 3B.2 — Flutter Returns Flow

- [ ] **QR Scanner Screen:**
  - [ ] Employee taps "Returns" on POS Home (or separate button)
  - [ ] Camera opens to scan QR code from customer's phone/invoice
  - [ ] QR encodes billing_id → calls `GET /invoices/billing/:billingId`
  - [ ] Shows original invoice with all items

- [ ] **Select Return Items:**
  - [ ] Checklist of items from the original invoice
  - [ ] Quantity selector for partial returns
  - [ ] Reason input (optional text)
  - [ ] "Submit Return Request" button

- [ ] **Return Confirmation:**
  - [ ] Shows refund amount breakdown
  - [ ] Shows loyalty points being reversed
  - [ ] If auto-approved: success screen
  - [ ] If pending: "Awaiting Store Admin approval" message

- [ ] **Store Admin Pending Returns Screen:**
  - [ ] List of pending return requests
  - [ ] Tap to view details
  - [ ] Approve / Reject buttons

### 3B CHECKPOINT
- [ ] QR code scanning loads original invoice
- [ ] Employee can select items and quantities for return
- [ ] Refund amount calculated correctly
- [ ] Loyalty points reversed on return
- [ ] Store Admin approval flow works
- [ ] Customer stats updated after return
- [ ] **Commit:** "feat: returns and exchanges with QR scanning"

---

## Sub-Phase 3C: Offline Mode

### 3C.1 — Hive Local Database Setup

- [ ] Define Hive adapters for:
  - [ ] PendingInvoice (all invoice data needed for later sync)
  - [ ] CachedProduct (for offline product catalog)
  - [ ] CachedCustomer (for offline customer lookup)

### 3C.2 — Offline Detection

- [ ] Use `connectivity_plus` to monitor network state
- [ ] Show persistent banner at top of POS: "Offline Mode — bills will sync when online"
- [ ] Change color indicator: green dot (online) / orange dot (offline)

### 3C.3 — Offline Invoice Creation

- [ ] When offline:
  - [ ] Invoice is created locally in Hive with all data
  - [ ] PDF is generated locally (all data is available)
  - [ ] Share sheet works normally (WhatsApp send works if phone has internet even if app thinks it's offline)
  - [ ] A "pending sync" counter shows: "3 bills pending sync"

### 3C.4 — Background Sync

- [ ] When connectivity returns:
  - [ ] App detects online status
  - [ ] Reads all pending invoices from Hive
  - [ ] POSTs each to the backend API one by one
  - [ ] On success: removes from Hive, decrements pending counter
  - [ ] On failure: keeps in Hive, retries on next connectivity change
  - [ ] Shows sync progress indicator

### 3C.5 — Data Pre-Caching

- [ ] On app launch (if online):
  - [ ] Fetch and cache product catalog to Hive
  - [ ] Fetch and cache common customer data to Hive
  - [ ] Periodically refresh cache (every 30 minutes)

### 3C CHECKPOINT
- [ ] App detects offline mode and shows indicator
- [ ] Invoices can be created offline
- [ ] PDF generation works offline
- [ ] Share sheet works offline
- [ ] When online returns, pending invoices sync automatically
- [ ] Product catalog is available offline
- [ ] Customer lookup works offline (from cache)
- [ ] **Commit:** "feat: offline mode with Hive caching and background sync"

---

## Sub-Phase 3D: Phase 3 Integration Testing

- [ ] Full loyalty flow: earn → accumulate → redeem → verify balance
- [ ] Points expiry works on old transactions
- [ ] Return via QR scan works end-to-end
- [ ] Return with Store Admin approval works
- [ ] Loyalty reversal on return is correct
- [ ] Offline invoice creation + sync works reliably
- [ ] Cached data is accurate and up to date
- [ ] **Commit:** "test: Phase 3 integration verified"
- [ ] **Tag:** `v0.3.0-engagement`

---

# ================================================================
# PHASE 4 — SCALE: INVENTORY + AUDIT + FUTURE FEATURES
# ================================================================

**Goal:** Advanced features for business scale. Inventory tracking, audit compliance, and foundation for future paid features.

---

## Sub-Phase 4A: Inventory Management

### 4A.1 — Backend Inventory Module

- [ ] Create NestJS module: `nest g module inventory`

- [ ] Endpoint: `GET /inventory/:storeId` (Store Admin, Super Admin)
  - [ ] Returns all products with their stock quantities for the store
  - [ ] Highlights low-stock items (quantity < threshold)

- [ ] Endpoint: `PATCH /inventory/:storeId/:productId` (Store Admin)
  - [ ] Manually adjust stock quantity (with reason: received, damaged, counted)

- [ ] Auto-decrement on invoice creation:
  - [ ] When an invoice item has a product_id, decrement store_inventory.quantity
  - [ ] Already partially handled — verify and complete

- [ ] Auto-increment on return approval:
  - [ ] When return is approved, increment stock back

- [ ] Low-stock alert trigger:
  - [ ] After each decrement, check if quantity < low_stock_threshold
  - [ ] If yes: send push notification to Store Admin

### 4A.2 — Flutter Inventory Screens

- [ ] **Store Admin Inventory Screen:**
  - [ ] Product list with: image, name, current stock, threshold, status (OK / LOW / OUT)
  - [ ] Color coding: green (OK), orange (LOW), red (OUT OF STOCK)
  - [ ] Tap to adjust stock manually
  - [ ] Filter: show only low-stock items

- [ ] **Super Admin Inventory Overview:**
  - [ ] Aggregated view across all stores
  - [ ] "Low stock alerts" section listing all products below threshold

### 4A CHECKPOINT
- [ ] Stock decrements on sale automatically
- [ ] Stock increments on return automatically
- [ ] Manual stock adjustment works
- [ ] Low-stock alerts fire correctly
- [ ] Inventory screen shows accurate data
- [ ] **Commit:** "feat: inventory management with auto-tracking and alerts"

---

## Sub-Phase 4B: Audit Logs and Compliance

### 4B.1 — Backend Audit Enhancement

- [ ] Verify all actions create audit_log entries:
  - [ ] Invoice created (already done)
  - [ ] Invoice voided / returned
  - [ ] Employee created / deactivated
  - [ ] Store created / deactivated
  - [ ] Product created / updated / deleted
  - [ ] Loyalty points adjusted
  - [ ] Store Admin approved / rejected / suspended
  - [ ] Stock manually adjusted

- [ ] Endpoint: `GET /audit-logs` (Super Admin only)
  - [ ] Query params: action, user_id, target_type, date_from, date_to, page, limit
  - [ ] Returns paginated audit log entries

- [ ] Endpoint: `GET /audit-logs/export` (Super Admin — Web Portal)
  - [ ] Returns CSV file of filtered audit logs

### 4B.2 — Flutter Audit Log Screen (Super Admin)

- [ ] **Audit Log Screen:**
  - [ ] Timeline view of system events
  - [ ] Each entry: icon (based on action type), description, user, timestamp
  - [ ] Filter by: action type, date range
  - [ ] Search by user name

### 4B CHECKPOINT
- [ ] All system actions generate audit logs
- [ ] Super Admin can view and filter audit logs
- [ ] CSV export works from web portal
- [ ] **Commit:** "feat: audit log system with compliance export"

---

## Sub-Phase 4C: Web Portal — Super Admin Data Export

- [ ] Build Super Admin section on web portal (requires admin auth):
  - [ ] Invoice export: CSV with all invoice data, filterable by date/store
  - [ ] Customer export: CSV with all customer data
  - [ ] Revenue report: Excel with daily/weekly/monthly breakdowns

### 4C CHECKPOINT
- [ ] Super Admin can export invoices as CSV from web
- [ ] Customer export works
- [ ] Revenue reports generate correctly
- [ ] **Commit:** "feat: Super Admin data export on web portal"

---

## Sub-Phase 4D: Performance Optimization and Polish

- [ ] Backend:
  - [ ] Add database indexes on frequently queried columns:
    - [ ] invoices: brand_id, store_id, customer_id, billing_id, created_at
    - [ ] customers: brand_id, phone
    - [ ] users: email, brand_id, store_id
    - [ ] products: brand_id, barcode
  - [ ] Verify Redis caching is effective (cache hit rate)
  - [ ] Add request compression (gzip)
  - [ ] Add rate limiting (prevent API abuse)

- [ ] Flutter:
  - [ ] Performance profiling: check for jank, unnecessary rebuilds
  - [ ] Image caching and lazy loading
  - [ ] Reduce app bundle size (tree-shake unused packages)
  - [ ] Test on low-end Android device

- [ ] Web Portal:
  - [ ] Page speed optimization
  - [ ] SSR for invoice pages (SEO + fast load)
  - [ ] Add meta tags for shared invoice links (Open Graph)

### 4D CHECKPOINT
- [ ] API response times < 200ms for common queries
- [ ] Flutter app is smooth on mid-range device
- [ ] Web portal loads invoice page in < 2 seconds
- [ ] **Commit:** "perf: optimization and polish across all components"

---

## Sub-Phase 4E: Phase 4 Integration Testing

- [ ] Inventory tracking is accurate after multiple sales and returns
- [ ] Low-stock alerts fire correctly
- [ ] Audit logs capture all system actions
- [ ] Data exports are accurate and complete
- [ ] Performance benchmarks are met
- [ ] **Commit:** "test: Phase 4 integration verified"
- [ ] **Tag:** `v0.4.0-scale`

---

# ================================================================
# PHASE 5 — DEPLOYMENT AND LAUNCH
# ================================================================

**Goal:** Deploy all three components to production. Configure domains. Launch!

---

## Sub-Phase 5A: Backend Deployment

- [ ] Choose hosting: Railway / AWS / Render
- [ ] Set up production PostgreSQL database (managed — Neon / Supabase / AWS RDS)
- [ ] Set up production Redis (managed — Upstash / AWS ElastiCache)
- [ ] Configure production environment variables
- [ ] Set up Dockerfile for backend
- [ ] Deploy backend API
- [ ] Verify API is accessible at production URL
- [ ] Set up SSL/HTTPS
- [ ] Run Prisma migrations on production database
- [ ] Seed Super Admin account in production

---

## Sub-Phase 5B: Web Portal Deployment

- [ ] Deploy Next.js to Vercel
- [ ] Configure custom domain: `bills.billpush.com`
- [ ] Set up environment variables (API URL)
- [ ] Verify all pages load correctly with production API
- [ ] Test invoice links work publicly

---

## Sub-Phase 5C: Mobile App Build

- [ ] Update API URL to production in Flutter config
- [ ] **Android:**
  - [ ] Generate signing key (`keytool`)
  - [ ] Configure `android/app/build.gradle` with signing config
  - [ ] Build release APK: `flutter build apk --release`
  - [ ] Build release App Bundle: `flutter build appbundle --release`
  - [ ] Test on physical Android device
  - [ ] Submit to Google Play Store (or distribute APK directly)
- [ ] **iOS (if applicable):**
  - [ ] Configure provisioning profiles and certificates
  - [ ] Build release: `flutter build ipa --release`
  - [ ] Test on physical iPhone
  - [ ] Submit to App Store

---

## Sub-Phase 5D: Production Testing

- [ ] Complete one full onboarding flow in production
- [ ] Complete one full billing flow in production
- [ ] Verify PDF generation with store branding
- [ ] Verify share sheet works on production build
- [ ] Verify web portal shows correct invoice
- [ ] Verify push notifications arrive on production

---

## Sub-Phase 5E: Launch Checklist

- [ ] Super Admin production account created
- [ ] First real Store Admin registered and approved
- [ ] First real store profile set up with logo
- [ ] First real employees created
- [ ] First real invoice generated and shared via WhatsApp
- [ ] Customer can look up invoice on web portal
- [ ] All monitoring/logging in place
- [ ] Backup strategy for production database
- [ ] **Tag:** `v1.0.0-launch`

---

# ================================================================
# FUTURE PHASES (DEFERRED — NOT IN CURRENT SCOPE)
# ================================================================

These features are documented but NOT being built right now. They require either paid API services or additional business decisions.

- [ ] **Meta WhatsApp Cloud API Integration** — Automated invoice delivery (requires paid API tier)
- [ ] **WhatsApp Chatbot** — Auto-reply to POINTS, HELP, STOP messages
- [ ] **WhatsApp Marketing Campaigns** — Bulk messaging with audience segmentation
- [ ] **Campaign Performance Dashboard** — Track delivery/read/redemption rates
- [ ] **Multi-Brand Support** — Multiple Super Admins on one platform
- [ ] **In-App Chat Support** — Customer to store communication
- [ ] **Payment Integration** — Digital payments via UPI/cards at POS
- [ ] **AI Win-Back Campaigns** — Automated re-engagement after 90 days inactivity
- [ ] **Web Admin Dashboard** — Full-featured admin panel on web (mirror of mobile)

---

## Summary: Version Tags

| Version | Phase | Milestone |
|---|---|---|
| `v0.1.0-mvp` | Phase 1 Complete | Auth + POS + Invoices + Share + Web Lookup |
| `v0.2.0-intelligence` | Phase 2 Complete | Analytics + Catalog + Barcode + Push |
| `v0.3.0-engagement` | Phase 3 Complete | Loyalty + Returns + Offline |
| `v0.4.0-scale` | Phase 4 Complete | Inventory + Audit + Optimization |
| `v1.0.0-launch` | Phase 5 Complete | Production Deployment |

---

*This MASTERPLAN is the single source of execution truth. Check off items as you complete them. Do not skip phases. Do not skip tests. Good luck building BillPush!*
