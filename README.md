<div align="center">
  <img src="landing/assets/logo.png" alt="BillPush Logo" width="120" />

  # BillPush
  
  **Omni-Channel Digital Invoice & Retail CRM Platform**

  <p>
    <img src="https://img.shields.io/badge/Flutter-02569B?style=for-the-badge&logo=flutter&logoColor=white" />
    <img src="https://img.shields.io/badge/NestJS-ea2845?style=for-the-badge&logo=nestjs&logoColor=white" />
    <img src="https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white" />
    <img src="https://img.shields.io/badge/Prisma-3982CE?style=for-the-badge&logo=Prisma&logoColor=white" />
  </p>

  <p>
    BillPush is a complete point-of-sale system for Android. Manage inventory, track staff, generate invoices, and view real-time analytics — all from a single app.
  </p>
</div>

---

## 📱 Application Screenshots

<table align="center">
  <tr>
    <td><img src="docs/screenshots/1.jpg" width="220" alt="App Screenshot 1"></td>
    <td><img src="docs/screenshots/2.jpg" width="220" alt="App Screenshot 2"></td>
    <td><img src="docs/screenshots/3.jpg" width="220" alt="App Screenshot 3"></td>
    <td><img src="docs/screenshots/4.jpg" width="220" alt="App Screenshot 4"></td>
  </tr>
  <tr>
    <td><img src="docs/screenshots/5.jpg" width="220" alt="App Screenshot 5"></td>
    <td><img src="docs/screenshots/6.jpg" width="220" alt="App Screenshot 6"></td>
    <td><img src="docs/screenshots/7.jpg" width="220" alt="App Screenshot 7"></td>
    <td><img src="docs/screenshots/8.jpg" width="220" alt="App Screenshot 8"></td>
  </tr>
  <tr>
    <td colspan="2" align="center"><img src="docs/screenshots/9.jpg" width="220" alt="App Screenshot 9"></td>
    <td colspan="2" align="center"><img src="docs/screenshots/10.jpg" width="220" alt="App Screenshot 10"></td>
  </tr>
</table>

---

## 📖 About The Project

Traditional retail billing systems are often tied to clunky desktop hardware, expensive licenses, and offline data. **BillPush** changes that. 

It is a complete **Omni-Channel Point-of-Sale (POS) and CRM platform** designed for the modern, mobile-first small business owner. Whether you run a single retail store or manage multiple branches, BillPush allows your staff to ring up sales, manage inventory, and generate GST-compliant invoices directly from their Android smartphones. 

All data is instantly synced to the cloud via Supabase, allowing owners to view real-time live analytics and stock alerts from anywhere in the world.

---

## ✨ Key Features

- **⚡ Lightning Fast POS**: Ring up customers in seconds. Search products, apply discounts, and generate invoices effortlessly.
- **☁️ Real-time Cloud Sync**: Every sale and stock update is instantly synced across all employee devices. 
- **👥 Advanced Staff Roles**: Restrict access using secure role-based PINs (Admin, Cashier, Manager).
- **📦 Smart Inventory**: Track stock levels in real-time, get automatic low-stock alerts, and manage product variations.
- **📄 Digital Invoicing**: Generate professional invoices and share them instantly via WhatsApp, email, or print to Bluetooth thermal printers.
- **📈 Live Analytics Dashboard**: Monitor revenue trends, identify top-selling products, and track staff performance.

---

## 🏗️ Architecture & Tech Stack

BillPush is a full-stack monorepo consisting of three distinct applications:

### 1. Mobile App (`/mobile`)
The core POS interface used by cashiers and store owners.
- **Framework**: Flutter (Dart)
- **State Management**: Riverpod
- **Local Storage**: Hive (for offline caching) & SharedPreferences
- **Routing**: GoRouter

### 2. Backend API (`/backend`)
The high-performance central server handling business logic, authentication, and database interactions.
- **Framework**: NestJS (TypeScript)
- **Database**: PostgreSQL (Managed via Supabase)
- **ORM**: Prisma
- **Auth & Caching**: JWT tokens with Managed Redis
- **Storage**: AWS S3 for product media uploads

### 3. Landing Page (`/landing`)
The marketing website to showcase the app and distribute the APK.
- **Stack**: HTML5, CSS3, Vanilla JS (Zero heavy frameworks)

---

## 🚀 Getting Started Locally

To run the full BillPush ecosystem locally, you will need **Node.js**, the **Flutter SDK**, and access to a **PostgreSQL** database.

### Step 1: Clone the Repository
```bash
git clone https://github.com/FarhanSayed16/billing-app.git
cd billing-app
```

### Step 2: Run the Backend
You will need a `.env` file in the `/backend` directory containing your `DATABASE_URL`, `DIRECT_URL`, `REDIS_URL`, and `JWT_SECRET`.
```bash
cd backend
npm install
npx prisma generate
npx prisma db push
npm run start:dev
```
*The backend will now be running on `http://localhost:3000`.*

### Step 3: Run the Mobile App
Open a new terminal window. You need an Android emulator running or a physical device connected via USB.
```bash
cd mobile
flutter pub get
```
*Note: Ensure you update `lib/config/constants.dart` to point to your local machine's IP address (e.g., `192.168.x.x:3000`) so the phone can communicate with the local NestJS backend.*
```bash
flutter run
```

### Step 4: Run the Landing Page
You can serve the landing page using any simple static server, or simply use the VS Code Live Server extension.
```bash
npx serve landing
```



---

<div align="center">
  <h3>Built by Farhan Sayed</h3>
  <p>AI & Full Stack Engineer specializing in modern scalable systems.</p>
  <p>
    🌐 <a href="https://farhanbuilds.in">farhanbuilds.in</a> | 
    ✉️ <a href="mailto:farhanbuilds16@gmail.com">farhanbuilds16@gmail.com</a> | 
    🐙 <a href="https://github.com/FarhanSayed16">GitHub</a>
  </p>
</div>
