# BillPush — Complete Project Documentation
### Omni-Channel Digital Invoice & Retail CRM Platform

> **Version:** 1.0  
> **Last Updated:** 14 April 2026  
> **Author:** Project Architecture Team  

---

## Table of Contents

1. [What Is This Product?](#1-what-is-this-product)
2. [Who Is This For?](#2-who-is-this-for)
3. [The Platform Ecosystem — Three Applications, One Brain](#3-the-platform-ecosystem--three-applications-one-brain)
4. [User Roles — Detailed Breakdown](#4-user-roles--detailed-breakdown)
5. [Mobile Application — Screen-by-Screen Breakdown](#5-mobile-application--screen-by-screen-breakdown)
6. [Customer Web Portal — Screen-by-Screen Breakdown](#6-customer-web-portal--screen-by-screen-breakdown)
7. [WhatsApp Engine — How Messaging Works](#7-whatsapp-engine--how-messaging-works)
8. [Complete Operational Workflows (A → Z)](#8-complete-operational-workflows-a--z)
9. [Feature Modules — Every Feature Explained](#9-feature-modules--every-feature-explained)
10. [Database Architecture — Tables & Relationships](#10-database-architecture--tables--relationships)
11. [Technology Stack — What We Are Using & Why](#11-technology-stack--what-we-are-using--why)
12. [Security & Authentication](#12-security--authentication)
13. [Notifications System](#13-notifications-system)
14. [Edge Cases & Error Handling](#14-edge-cases--error-handling)
15. [Phased Roadmap](#15-phased-roadmap)

---

## 1. What Is This Product?

BillPush is a complete digital billing and customer relationship management platform designed for retail clothing brands that operate multiple stores, outlets, or franchise branches.

**The Problem It Solves:**
- Today, retail stores either give paper receipts (wasteful, easy to lose) or use outdated POS software that stores data only locally.
- The brand owner (Super Admin) has zero real-time visibility into what's happening across their stores.
- There is no unified customer database. If a customer shops at Branch A today and Branch B tomorrow, nobody connects the dots.
- Customers lose receipts and have no way to retrieve old bills for returns, warranties, or tax purposes.

**The Solution:**
- At checkout, the employee simply asks for the customer's Name and WhatsApp Number.
- The system generates a professional digital invoice and instantly sends it to the customer's WhatsApp.
- Simultaneously, the transaction is logged into a centralized cloud database, visible to the Store Admin and the Super Admin in real time.
- The customer can always retrieve any past bill from a branded web portal.

**Real-World Comparison:** This is the exact model used by Zudio, Zara, and other modern retail brands where the cashier says *"We'll send the bill to your WhatsApp"* and you walk out of the store.

---

## 2. Who Is This For?

| Stakeholder | Description |
|---|---|
| **The Super Admin** | Your friend — the brand owner. Owns the entire application. Owns all data. Has god-level access to every store, every employee, every invoice, every customer. |
| **The Store Admin** | A franchise owner or branch manager. Runs one (or more) physical store(s). Manages their own employees. Sees only their own store's data. |
| **The Employee** | A cashier or billing desk operator inside a specific store. Uses the mobile app to generate bills and send them to customers. Sees nothing beyond their own billing screen. |
| **The Customer** | The end consumer. Does not create an account. Does not download anything. Simply gives their phone number, gets their bill on WhatsApp, and can look up old bills on the website later. |

---

## 3. The Platform Ecosystem — Three Applications, One Brain

The entire product is composed of **three separate client applications** that all talk to **one centralized backend API and database**.

```
┌─────────────────────────────────────────────────────────────────────┐
│                       CENTRALIZED BACKEND API                       │
│                    (Node.js / NestJS + PostgreSQL)                   │
│                                                                     │
│  ┌──────────────┐   ┌──────────────┐   ┌────────────────────────┐  │
│  │  Auth Service │   │ Invoice Svc  │   │  WhatsApp Gateway Svc  │  │
│  └──────────────┘   └──────────────┘   └────────────────────────┘  │
│  ┌──────────────┐   ┌──────────────┐   ┌────────────────────────┐  │
│  │  Store Svc   │   │ Customer Svc │   │  Analytics Engine      │  │
│  └──────────────┘   └──────────────┘   └────────────────────────┘  │
└──────────┬──────────────────┬──────────────────────┬────────────────┘
           │                  │                      │
    ┌──────▼──────┐   ┌──────▼──────┐   ┌───────────▼───────────┐
    │ MOBILE APP  │   │  WEB PORTAL │   │   WHATSAPP MESSAGES   │
    │ (Flutter)   │   │  (React /   │   │   (Meta Cloud API)    │
    │             │   │   Next.js)   │   │                       │
    │             │   │ - Customer  │   │ - Invoice delivery    │
    │ - Super     │   │   bill      │   │ - Loyalty updates     │
    │   Admin     │   │   lookup    │   │ - Marketing promos    │
    │ - Store     │   │ - Purchase  │   │ - Chatbot replies     │
    │   Admin     │   │   history   │   │                       │
    │ - Employee  │   │ - Loyalty   │   │                       │
    │   (POS)     │   │   balance   │   │                       │
    └─────────────┘   └─────────────┘   └───────────────────────┘
```

### Application A: The Mobile App (Flutter — iOS & Android)
- **Who uses it:** Super Admin, Store Admins, and Employees.
- **What it does:** This is the primary working tool. All billing, analytics, employee management, and store operations happen here.
- **Why mobile:** The Super Admin explicitly requires this. Employees operate from their phones at the billing counter. Store Admins need to check performance on the go.

### Application B: The Customer Web Portal (React / Next.js)
- **Who uses it:** Customers (and optionally Super Admin for heavy-duty data exports).
- **What it does:** A publicly accessible branded website where customers can look up their past purchases, download invoices, and check loyalty balances.
- **Why web:** Customers should not be forced to download an app. A website URL sent via WhatsApp (e.g., `bills.yourbrand.com/lookup`) is frictionless.

### Application C: The WhatsApp Messaging Engine
- **Who uses it:** Runs automatically in the background. Nobody interacts with it directly.
- **What it does:** When an employee presses "Send Bill", this engine formats the invoice into a WhatsApp message template and fires it to the customer's number via the Meta WhatsApp Cloud API.

---

## 4. User Roles — Detailed Breakdown

### 4.1 Super Admin

| Aspect | Detail |
|---|---|
| **Login Method** | Email + Password + Optional 2FA |
| **How many exist?** | 1 (your friend). Could scale to a small team in the future. |
| **Primary device** | Mobile phone (Android/iOS) |
| **Secondary device** | Laptop/Desktop (Web Admin for heavy tasks) |

**What the Super Admin can DO on the Mobile App:**
- View a real-time global dashboard: total revenue today/this week/this month across ALL stores.
- View a ranked leaderboard of stores by revenue.
- View a geographic heatmap showing which regions/cities generate the most revenue.
- Drill down into any specific store and view that store's detailed analytics as if they were the Store Admin.
- Create a new Store by entering: Store Name, Address, City, GST Number, and assigning a Store Admin.
- Suspend or deactivate a Store (e.g., franchise agreement terminated).
- View the global customer database: every customer who has ever shopped at any branch, their total lifetime spend, their visit frequency.
- Configure loyalty program settings: how many points per ₹100 spent, minimum redemption threshold.
- Upload/manage the master product catalog (product names, SKUs, prices, categories).
- Push a catalog update to all stores simultaneously.
- View system audit logs: who did what, when.
- Send broadcast WhatsApp marketing campaigns to customer segments (e.g., "all customers who haven't visited in 90 days").

**What the Super Admin can DO on the Web Portal:**
- Everything above, but optimized for large screens.
- Export massive CSV/Excel reports of all invoices, customers, or revenue data for accounting/tax filing.
- Bulk-upload product catalogs via CSV.
- View and manage WhatsApp message template approvals.

---

### 4.2 Store Admin

| Aspect | Detail |
|---|---|
| **Login Method** | Email + Password (created by Super Admin) |
| **How many exist?** | One per store (potentially multiple if the same person manages 2-3 branches). |
| **Primary device** | Mobile phone |

**What the Store Admin can DO:**
- View their store's dashboard: today's revenue, number of bills generated, average bill value.
- View weekly/monthly trends: which days are busiest, which hours have peak traffic.
- Manage Employees: create new Employee profiles with a Name and a 4-digit PIN. Edit or deactivate employee access.
- View all invoices generated at their store. Search by date range, customer name, or phone number.
- Void/cancel an invoice (e.g., a customer returns an item). The system marks it as "Refunded" and adjusts the revenue figures.
- View the local customer database: customers who have visited their specific store, their visit count, and total spend at this branch.
- View inventory levels (if catalog/inventory module is active): how many units of each product remain.
- Receive push notifications: "Daily Summary: 47 bills generated, ₹1,23,400 revenue."

**What the Store Admin CANNOT do:**
- View data from any other store.
- Create or manage other Store Admins.
- Modify the product catalog or pricing (that's pushed down from Super Admin).
- Access system-level settings or audit logs.

---

### 4.3 Employee (Cashier / POS Operator)

| Aspect | Detail |
|---|---|
| **Login Method** | Select their name from a dropdown + enter 4-digit PIN |
| **How many exist?** | Multiple per store (typically 2–10 depending on store size). |
| **Primary device** | Store tablet or personal mobile phone |

**What the Employee can DO:**
- Access the POS (Point of Sale) billing screen and nothing else.
- Enter or scan items into the bill cart.
- Enter customer's Mobile Number and Name.
- Generate the invoice and trigger the WhatsApp delivery.
- View their own recent bills (current shift only) — useful if a customer comes back 5 minutes later asking "how much was it?"
- Apply discounts (if permitted by Store Admin settings).
- Apply loyalty point redemption (if the customer wants to use their points).

**What the Employee CANNOT do:**
- View the store's total revenue or analytics dashboard.
- View other employees' bills.
- Manage other employees or access any admin settings.
- Void/cancel an invoice (only Store Admin can do this).
- View the customer database beyond the current transaction.

---

### 4.4 Customer

| Aspect | Detail |
|---|---|
| **Login Method** | No login needed at the store. OTP-based on the Web Portal. |
| **Account creation** | Happens automatically when their phone number is first entered by any employee. |
| **Primary interface** | WhatsApp + Web Portal |

**What the Customer experiences:**
- At the store: gives their phone number, walks out, receives the bill on WhatsApp within seconds.
- On the Web Portal: enters their phone number → receives an OTP on WhatsApp → enters OTP → sees their full purchase history across all branches.
- Can download any past invoice as a PDF.
- Can view their loyalty points balance and transaction history.
- Can reply to the WhatsApp bill message with keywords like "POINTS" or "HELP" to interact with the brand's chatbot.

---

## 5. Mobile Application — Screen-by-Screen Breakdown

### 5.1 Common Screens (All Roles)

| Screen | Description |
|---|---|
| **Splash Screen** | Brand logo animation on app open. |
| **Login Screen** | Role-based login: Super Admin/Store Admin use email+password; Employees select name+PIN. |
| **Profile Screen** | View and edit personal details, change password/PIN. |

### 5.2 Super Admin Screens

| Screen | Description |
|---|---|
| **Global Dashboard** | Total revenue (today/week/month/year), total bills generated, total active stores, total unique customers. Animated charts and graphs. |
| **Store Leaderboard** | Ranked list of all stores by revenue, sortable by time period. Tap any store to drill in. |
| **Franchise Management** | List of all stores. "Add New Store" button → form: Store Name, Address, City, GST, Store Admin Email. |
| **Store Detail View** | Deep-dive into a specific store. Shows that store's dashboard, employees, invoices, and local customer list. |
| **Global Customer Database** | Searchable list of all customers. Each entry shows: Name, Phone, Total Visits, Total Spend, Last Visit Date, Favorite Store. |
| **Customer Detail View** | Tap a customer → see their full transaction history across all branches, loyalty points, and a timeline of visits. |
| **Product Catalog Manager** | List all products. Add new product (Name, SKU, Category, Price, Image). Edit/delete existing products. |
| **Catalog Push** | After editing the catalog, push updates to all stores or selected stores. |
| **Loyalty Program Settings** | Configure: Points per ₹100, minimum redemption threshold, point expiry duration. |
| **Marketing Campaigns** | Create a WhatsApp campaign → select audience segment → compose message using approved template → schedule or send immediately → track delivery/read stats. |
| **Audit Logs** | Scrollable timeline of system events: "Employee X at Store Y generated Invoice #5001", "Store Admin Z voided Invoice #4999". |
| **Settings** | App theme, notification preferences, account security. |

### 5.3 Store Admin Screens

| Screen | Description |
|---|---|
| **Store Dashboard** | Today's revenue, bill count, average bill value, comparison to yesterday. Weekly/monthly trend charts. |
| **Employee Management** | List of employees. "Add Employee" → Name + 4-digit PIN. Toggle active/inactive. |
| **Invoice List** | All invoices from this store. Filterable by date, employee, customer. Tap to see detail. |
| **Invoice Detail** | Full invoice: customer name, phone, items, amounts, taxes, date/time, employee who generated it. "Void Invoice" button. |
| **Local Customer List** | Customers who have visited this specific store. Tap for detail. |
| **Inventory View** | Current stock levels for each product. Low-stock alerts highlighted in red. |
| **Notifications** | Daily summary notifications, low-stock alerts, new employee added confirmations. |
| **Store Settings** | Store operating hours, GST details, discount permissions for employees. |

### 5.4 Employee Screens (POS Mode)

| Screen | Description |
|---|---|
| **POS Home** | Clean, large-button interface. Two options: "New Bill" and "Recent Bills". |
| **New Bill — Customer Entry** | Large input field for 10-digit mobile number. Auto-lookup: if found, shows "Welcome back, [Name]! Points: [X]". If new, shows a Name input field. |
| **New Bill — Cart** | Two modes: (a) **Scan Mode** — camera opens, scan barcode on clothing tag, item auto-adds to cart. (b) **Manual Mode** — search product by name or enter a custom item + amount. Running total shown at the bottom. |
| **New Bill — Review & Confirm** | Summary: Customer Name, Phone, Itemized List, Subtotal, Tax (GST), Discount (if any), Loyalty Points Redeemed, Grand Total. Big green button: **"Confirm & Send to WhatsApp"**. |
| **Bill Sent — Success** | Confirmation animation. Shows "Bill sent to [Customer Name] on WhatsApp ✓". Option to start a new bill immediately. |
| **Recent Bills** | List of bills generated by this employee in the current shift. Tap to view detail. |

---

## 6. Customer Web Portal — Screen-by-Screen Breakdown

| Screen | Description |
|---|---|
| **Landing Page** | Branded landing page with the company logo. Two options: "Look Up a Specific Bill" (enter Billing ID) OR "View My Purchase History" (enter phone number). |
| **Billing ID Lookup** | Single input field for the 16-character Billing ID printed on the digital receipt. Shows the specific invoice. No login required. |
| **Phone Number Login** | Enter 10-digit phone number → "Send OTP" → OTP arrives on WhatsApp → enter OTP → authenticated. |
| **Purchase History Dashboard** | Chronological list of all purchases across all stores. Each entry shows: Date, Store Name, Total Amount, Number of Items. Tap to expand. |
| **Invoice Detail View** | Full branded invoice: Company Logo, Store Address, Itemized List, Taxes, QR Code, Return Policy. "Download as PDF" button. |
| **Loyalty Points Page** | Current points balance, points earned per transaction, redemption history. |
| **Profile Page** | Customer can update their Name (phone number is fixed as it's the identifier). |

---

## 7. WhatsApp Engine — How Messaging Works

### 7.1 The Technical Flow
1. Employee clicks "Confirm & Send" on the POS screen.
2. The mobile app sends a POST request to the Backend API with the invoice data.
3. The Backend API saves the invoice to the PostgreSQL database.
4. The Backend API generates a unique short URL for the invoice (e.g., `bills.yourbrand.com/v/A1B2C3`).
5. The Backend API calls the **Meta WhatsApp Cloud API** with a pre-approved message template, inserting the customer's name, the total amount, and the invoice URL.
6. WhatsApp delivers the message to the customer's phone.
7. The Backend logs the delivery status (Sent → Delivered → Read) via webhook callbacks from Meta.

### 7.2 Message Templates

**Template 1 — Invoice Delivery (Triggered on every checkout):**
```
Hi {{customer_name}}! 👋

Thank you for shopping at {{store_name}}.

🧾 Your Bill: ₹{{total_amount}}
📅 Date: {{date}}

View your detailed invoice here:
{{invoice_url}}

Points Earned: +{{points_earned}} ⭐
Your Total Points: {{total_points}}

Thank you for choosing {{brand_name}}!
```

**Template 2 — Loyalty Milestone (Triggered when points cross a threshold):**
```
🎉 Congratulations, {{customer_name}}!

You've earned {{total_points}} {{brand_name}} Points!
That's ₹{{rupee_value}} in rewards waiting for you.

Visit any {{brand_name}} store to redeem.
```

**Template 3 — Win-Back Campaign (Triggered after 90 days of inactivity):**
```
We miss you, {{customer_name}}! 💙

It's been a while since your last visit to {{brand_name}}.
Here's a special 10% OFF on your next purchase!

Use code: {{promo_code}}
Valid until: {{expiry_date}}

Visit your nearest store today!
```

### 7.3 Chatbot Replies
When a customer replies to any of these messages:

| Customer Sends | System Replies With |
|---|---|
| `POINTS` or `BALANCE` | "Hi [Name]! Your current points balance is [X] points (₹[Y] value). Visit any store to redeem!" |
| `HELP` or `SUPPORT` | "We're here to help! Please describe your issue and our team will get back to you within 24 hours." |
| `CANCEL` or `STOP` | "You've been unsubscribed from promotional messages. You will still receive transaction receipts." |
| Anything else | "Thanks for your message! Reply POINTS to check your balance or HELP for support." |

---

## 8. Complete Operational Workflows (A → Z)

### Workflow A: Initial Platform Setup (Day 0)
1. Super Admin downloads the Mobile App from the App Store / Play Store.
2. Super Admin creates their account (email + password + 2FA).
3. Super Admin enters the brand details: Brand Name, Logo, Primary Color, GST Number.
4. Super Admin configures the WhatsApp Business API connection (links their official phone number).
5. Super Admin uploads the initial Product Catalog (either manually or via CSV on the Web Portal).
6. Super Admin sets Loyalty Program rules: 1 point per ₹100 spent, 100 points = ₹50 discount.
7. Platform is now ready to add stores.

### Workflow B: Onboarding a New Store
1. Super Admin opens the Mobile App → "Franchise Management" → "Add New Store".
2. Enters: Store Name ("Downtown Mall Branch"), Address, City, and the Store Admin's email address.
3. System sends an invitation email to the Store Admin.
4. Store Admin clicks the link, sets their password, and logs into the Mobile App.
5. Store Admin sees an empty dashboard. Goes to "Employee Management" → "Add Employee".
6. Creates employees: "Rahul" (PIN: 1234), "Priya" (PIN: 5678).
7. Store Admin tells Rahul and Priya their PINs. They download the app and log in.
8. Store is now fully operational.

### Workflow C: Daily Store Operations (Morning → Night)
1. **8:00 AM — Store Opens.** Rahul arrives, opens the Mobile App, selects his name, enters PIN 1234. The POS screen loads.
2. **8:05 AM — Internet Check.** The app checks connectivity. Green dot = online. If offline, it shows "Offline Mode — bills will sync when online."
3. **10:30 AM — First Customer.** A woman buys 2 shirts. Rahul taps "New Bill", enters her phone number (9876543210).
   - System checks the database. "New Customer." Shows a name input field. Rahul types "Anita".
   - Rahul scans the barcode on each shirt. Cart shows: "White Kurta ₹799, Blue Top ₹599. Total: ₹1,398."
   - Rahul taps "Confirm & Send". The invoice is saved. Anita gets a WhatsApp message within 3 seconds.
4. **11:00 AM — Returning Customer.** A man comes in. Rahul enters phone 9123456789.
   - System: "Welcome back, Vikram! Points: 230 ⭐". Name auto-fills.
   - Vikram says "I want to use my points." Rahul toggles the "Apply Points" switch. ₹115 is deducted from the total.
   - Bill is sent.
5. **2:00 PM — Shift Change.** Priya arrives. Rahul logs out (or session auto-times out after inactivity). Priya logs in with her PIN.
6. **6:00 PM — Return/Exchange.** A customer walks in with a WhatsApp bill on their phone. Priya opens the app → "Scan QR" → scans the QR code from the customer's phone → the original invoice loads.
   - The Store Admin (remotely or in-store) approves the void. The customer gets a refund.
7. **9:00 PM — Store Closes.** The Store Admin opens the app and views the "Daily Summary": 47 bills, ₹1,23,400 revenue, top-selling item: "White Kurta".
8. **9:05 PM — Super Admin Notification.** The Super Admin's phone buzzes: "Daily Summary — Downtown Mall: ₹1,23,400 | Airport Branch: ₹98,200 | Total: ₹2,21,600."

### Workflow D: Customer Looks Up an Old Bill (Web Portal)
1. Anita bought something 3 months ago. She needs the bill for a warranty claim.
2. She opens `bills.yourbrand.com` on her phone browser.
3. She clicks "View My Purchase History" and enters her phone number.
4. She receives an OTP on WhatsApp. She enters it.
5. She sees all her purchases. She finds the one from 3 months ago, taps it, and downloads the PDF.

### Workflow E: Super Admin Runs a Marketing Campaign
1. Super Admin opens the Mobile App → "Marketing Campaigns" → "Create Campaign".
2. Selects audience: "Customers who haven't visited in 90+ days" — system shows 1,200 matching customers.
3. Selects a pre-approved WhatsApp template: "Win-Back 10% Off".
4. Generates a unique promo code: `WELCOME10`.
5. Schedules it for tomorrow at 10 AM.
6. Next day, 1,200 customers get the WhatsApp message.
7. Super Admin tracks: 1,180 delivered, 920 read, 45 promo codes redeemed (tracked when employees enter the code at checkout).

---

## 9. Feature Modules — Every Feature Explained

### Module 1: Authentication & Access Control
- Role-based login: determines what screens a user sees.
- JWT tokens with refresh rotation for session security.
- 4-digit PIN for employees (fast, optimized for retail speed).
- Email + password + optional TOTP 2FA for Admins.
- Session timeout: employees auto-logged out after 30 minutes of inactivity.

### Module 2: Point of Sale (POS) Engine
- Optimized for touch screens and mobile devices.
- Camera-based barcode scanning using the phone's rear camera.
- Manual product search with autocomplete.
- Custom item entry (name + price) for items not in the catalog.
- Real-time GST/tax calculation based on product category and store state.
- Loyalty point application and redemption at checkout.
- Discount application (flat ₹ or percentage, configurable by Store Admin).
- Offline mode with local caching and background sync.

### Module 3: Invoice Generation
- Every invoice gets a unique Invoice Number (sequential per store, e.g., `DM-2026-00047`).
- Every invoice gets a unique 16-character alphanumeric Billing ID (for customer web lookup).
- Every invoice gets a unique QR code (encodes the Billing ID for rapid scanning).
- Invoice contains: Brand Logo, Store Details (Name, Address, GST), Customer Details, Itemized List (Product, Qty, Rate, Amount), Subtotal, Tax Breakdown (CGST + SGST or IGST), Discount, Loyalty Points Redeemed, Grand Total, Date/Time, Employee Name, QR Code, Return Policy.
- Invoice is rendered as a responsive web page (for the WhatsApp link) and downloadable as PDF.

### Module 4: Customer Management (CRM)
- Global customer database indexed by phone number (unique identifier).
- Automatic deduplication: if the same number is entered at different stores, it maps to the same customer profile.
- Customer profile contains: Name, Phone, First Visit Date, Total Visits (all stores), Total Lifetime Spend, Loyalty Points Balance, Store-wise Visit Breakdown.
- Searchable and filterable by name, phone, visit frequency, spend range, last visit date, or specific store.

### Module 5: Product Catalog & Inventory
- Central catalog managed by Super Admin.
- Each product: Name, SKU, Barcode Number, Category (Shirts, Pants, Accessories, etc.), Base Price, Tax Rate, Image.
- Catalog is pushed to all stores. Stores receive the catalog automatically.
- Inventory tracking per store: each store has its own stock count for each product.
- Low-stock alerts (configurable threshold) push notifications to Store Admin.
- Stock adjustment: Store Admin can manually adjust stock (e.g., damaged goods, theft).

### Module 6: Analytics & Reporting
- **Super Admin Analytics:** Global revenue trends, store comparison charts, customer acquisition rate, top-selling products across all stores, campaign ROI tracking.
- **Store Admin Analytics:** Daily/weekly/monthly revenue, peak hours heatmap, employee performance (bills per employee), top-selling products at this store, average bill value, customer return rate.
- **Export:** CSV and Excel export for all data (optimized on the Web Portal for large datasets).

### Module 7: Loyalty & Rewards Engine
- Points are earned automatically on every purchase.
- Points earning rate is configurable by Super Admin (e.g., 1 point per ₹100).
- Points are redeemable at any store across the chain (not locked to one branch).
- Minimum redemption threshold is configurable (e.g., minimum 100 points to redeem).
- Points can optionally expire after a configurable period (e.g., 12 months).
- Points balance is shown on: the WhatsApp bill message, the Customer Web Portal, and the Employee POS screen during checkout.

### Module 8: Returns & Exchanges
- Employee scans the QR code from the customer's digital receipt (on their phone screen).
- Original invoice loads. Employee selects which items are being returned.
- Store Admin approval required for refunds above a configurable threshold.
- Invoice is marked as "Partially Refunded" or "Fully Refunded".
- Revenue analytics are automatically adjusted.
- Loyalty points earned on the original purchase are deducted from the customer's balance.
- Refund notification is sent to the customer on WhatsApp.

### Module 9: WhatsApp Marketing Engine
- Campaign creation with audience segmentation: by last visit date, total spend, specific store, city, etc.
- Pre-approved WhatsApp message templates (must be approved by Meta before use).
- Unique promo code generation per campaign.
- Scheduled sending (send now or schedule for a future date/time).
- Delivery tracking: Sent → Delivered → Read → Promo Redeemed.
- Campaign performance dashboard: redemption rate, revenue attributed to campaign.
- Opt-out management: customers who reply "STOP" are removed from future campaigns.

### Module 10: Audit & Activity Logs
- Every significant action is logged: invoice created, invoice voided, employee added/removed, store created, catalog updated, campaign sent.
- Each log entry records: Timestamp, User (who), Action (what), Target (which invoice/store/employee), IP Address.
- Viewable by Super Admin only.
- Searchable and filterable.
- Exportable for compliance purposes.

---

## 10. Database Architecture — Tables & Relationships

### Entity Relationship Overview

```
┌──────────┐       ┌──────────┐       ┌──────────┐
│  BRANDS  │──1:N──│  STORES  │──1:N──│  USERS   │
│          │       │          │       │(Employees│
│          │       │          │       │& Admins) │
└──────────┘       └────┬─────┘       └────┬─────┘
                        │                  │
                   ┌────▼─────┐            │
                   │INVENTORY │            │
                   │(per store)│            │
                   └──────────┘            │
                                           │
┌──────────┐       ┌──────────┐            │
│CUSTOMERS │──1:N──│ INVOICES │──N:1───────┘
│          │       │          │
│          │       └────┬─────┘
│          │            │
│          │       ┌────▼─────┐
│          │       │ INVOICE  │
│          │       │  ITEMS   │
└──────┬───┘       └──────────┘
       │
  ┌────▼─────┐
  │ LOYALTY  │
  │  LEDGER  │
  └──────────┘
```

### Table Definitions

**`brands`** — The top-level entity representing the retail brand.
| Column | Type | Description |
|---|---|---|
| id | UUID | Primary Key |
| name | VARCHAR | Brand name |
| logo_url | VARCHAR | URL to the brand logo |
| primary_color | VARCHAR | Hex color code for branding |
| gst_number | VARCHAR | Brand's GST registration |
| whatsapp_phone_id | VARCHAR | Meta WhatsApp phone number ID |
| whatsapp_api_token | VARCHAR (encrypted) | Meta WhatsApp API token |
| loyalty_points_per_100 | INTEGER | Points earned per ₹100 |
| loyalty_min_redemption | INTEGER | Minimum points to redeem |
| loyalty_expiry_months | INTEGER | Months before points expire |
| created_at | TIMESTAMP | Record creation time |

**`stores`** — Each physical store/franchise/branch.
| Column | Type | Description |
|---|---|---|
| id | UUID | Primary Key |
| brand_id | UUID | FK → brands.id |
| name | VARCHAR | "Downtown Mall Branch" |
| address | TEXT | Full street address |
| city | VARCHAR | City name |
| state | VARCHAR | State (for GST calculation) |
| gst_number | VARCHAR | Store-specific GST number |
| is_active | BOOLEAN | Can be suspended by Super Admin |
| created_at | TIMESTAMP | When the store was onboarded |

**`users`** — All human users: Super Admins, Store Admins, and Employees.
| Column | Type | Description |
|---|---|---|
| id | UUID | Primary Key |
| brand_id | UUID | FK → brands.id |
| store_id | UUID (nullable) | FK → stores.id (null for Super Admin) |
| email | VARCHAR (nullable) | For Admin login (null for Employees) |
| password_hash | VARCHAR (nullable) | Hashed password (null for Employees) |
| name | VARCHAR | Full name |
| phone | VARCHAR | Contact number |
| pin | VARCHAR (nullable) | 4-digit PIN hash (for Employees) |
| role | ENUM | `SUPER_ADMIN`, `STORE_ADMIN`, `EMPLOYEE` |
| is_active | BOOLEAN | Can be deactivated |
| last_login_at | TIMESTAMP | Last login timestamp |
| created_at | TIMESTAMP | Account creation time |

**`customers`** — Every customer who has ever been billed.
| Column | Type | Description |
|---|---|---|
| id | UUID | Primary Key |
| brand_id | UUID | FK → brands.id |
| phone | VARCHAR | **UNIQUE** — the primary identifier |
| name | VARCHAR | Customer's name |
| total_visits | INTEGER | Incremented on every invoice |
| total_spend | DECIMAL | Sum of all invoice totals |
| loyalty_points | INTEGER | Current balance |
| first_visit_at | TIMESTAMP | First ever purchase date |
| last_visit_at | TIMESTAMP | Most recent purchase date |
| opted_out_marketing | BOOLEAN | If they replied STOP |
| created_at | TIMESTAMP | Record creation time |

**`products`** — The master product catalog.
| Column | Type | Description |
|---|---|---|
| id | UUID | Primary Key |
| brand_id | UUID | FK → brands.id |
| name | VARCHAR | "White Cotton Kurta" |
| sku | VARCHAR | Stock Keeping Unit code |
| barcode | VARCHAR | Barcode number for scanning |
| category | VARCHAR | "Shirts", "Pants", etc. |
| base_price | DECIMAL | MRP |
| tax_rate | DECIMAL | GST percentage |
| image_url | VARCHAR | Product image |
| is_active | BOOLEAN | Soft delete |
| created_at | TIMESTAMP | When product was added |

**`store_inventory`** — Stock levels per store per product.
| Column | Type | Description |
|---|---|---|
| id | UUID | Primary Key |
| store_id | UUID | FK → stores.id |
| product_id | UUID | FK → products.id |
| quantity | INTEGER | Current stock count |
| low_stock_threshold | INTEGER | Alert if quantity drops below |
| updated_at | TIMESTAMP | Last stock update |

**`invoices`** — Every bill ever generated.
| Column | Type | Description |
|---|---|---|
| id | UUID | Primary Key |
| invoice_number | VARCHAR | Sequential per store (e.g., `DM-2026-00047`) |
| billing_id | VARCHAR(16) | **UNIQUE** — random alphanumeric for customer lookup |
| brand_id | UUID | FK → brands.id |
| store_id | UUID | FK → stores.id |
| customer_id | UUID | FK → customers.id |
| employee_id | UUID | FK → users.id |
| subtotal | DECIMAL | Before tax and discounts |
| tax_amount | DECIMAL | Total tax (CGST+SGST) |
| discount_amount | DECIMAL | Discount applied |
| loyalty_points_redeemed | INTEGER | Points used |
| loyalty_discount | DECIMAL | ₹ value of points redeemed |
| grand_total | DECIMAL | Final amount |
| loyalty_points_earned | INTEGER | Points earned on this purchase |
| status | ENUM | `ACTIVE`, `PARTIALLY_REFUNDED`, `FULLY_REFUNDED` |
| whatsapp_status | ENUM | `PENDING`, `SENT`, `DELIVERED`, `READ`, `FAILED` |
| qr_code_url | VARCHAR | URL to the QR code image |
| created_at | TIMESTAMP | Bill generation time |

**`invoice_items`** — Line items within an invoice.
| Column | Type | Description |
|---|---|---|
| id | UUID | Primary Key |
| invoice_id | UUID | FK → invoices.id |
| product_id | UUID (nullable) | FK → products.id (null if custom item) |
| name | VARCHAR | Product name (denormalized for historical accuracy) |
| quantity | INTEGER | Number of units |
| unit_price | DECIMAL | Price per unit at time of sale |
| tax_rate | DECIMAL | Tax rate at time of sale |
| tax_amount | DECIMAL | Tax for this line item |
| total | DECIMAL | quantity × unit_price + tax |

**`loyalty_ledger`** — Every points transaction.
| Column | Type | Description |
|---|---|---|
| id | UUID | Primary Key |
| customer_id | UUID | FK → customers.id |
| invoice_id | UUID (nullable) | FK → invoices.id |
| type | ENUM | `EARNED`, `REDEEMED`, `EXPIRED`, `ADJUSTED` |
| points | INTEGER | Number of points (positive for earned, negative for redeemed) |
| description | VARCHAR | "Earned on Invoice #DM-2026-00047" |
| created_at | TIMESTAMP | Transaction timestamp |

**`campaigns`** — WhatsApp marketing campaigns.
| Column | Type | Description |
|---|---|---|
| id | UUID | Primary Key |
| brand_id | UUID | FK → brands.id |
| name | VARCHAR | Campaign name |
| template_name | VARCHAR | WhatsApp template name |
| audience_filter | JSONB | Filter criteria (e.g., {"inactive_days": 90}) |
| promo_code | VARCHAR | Generated promo code |
| scheduled_at | TIMESTAMP | When to send |
| status | ENUM | `DRAFT`, `SCHEDULED`, `SENDING`, `COMPLETED` |
| total_recipients | INTEGER | Count of recipients |
| delivered_count | INTEGER | Successfully delivered |
| read_count | INTEGER | Read receipts received |
| redeemed_count | INTEGER | Promo codes used |
| created_at | TIMESTAMP | Campaign creation time |

**`audit_logs`** — System-wide activity log.
| Column | Type | Description |
|---|---|---|
| id | UUID | Primary Key |
| brand_id | UUID | FK → brands.id |
| user_id | UUID | FK → users.id |
| action | VARCHAR | "INVOICE_CREATED", "INVOICE_VOIDED", etc. |
| target_type | VARCHAR | "INVOICE", "STORE", "EMPLOYEE" |
| target_id | UUID | ID of the affected record |
| metadata | JSONB | Additional context |
| ip_address | VARCHAR | IP address of the request |
| created_at | TIMESTAMP | When the action occurred |

---

## 11. Technology Stack — What We Are Using & Why

| Layer | Technology | Reason |
|---|---|---|
| **Mobile App** | Flutter (Dart) | Write once, deploy to iOS and Android. Flutter provides native camera access for barcode scanning, push notifications, local storage (Hive/SQLite), and stunning UI with its own rendering engine. |
| **Web Portal** | React (Next.js 15) | SEO-friendly server-side rendering for the customer-facing portal. Also serves the Web Admin dashboard. React is the user's preferred web framework. |
| **Backend API** | Node.js with NestJS | Modular, scalable, TypeScript-first framework. Handles all business logic and serves both the mobile app and the web portal. |
| **Database** | PostgreSQL 16 | Rock-solid relational database. Perfect for financial data, multi-tenant isolation, and complex analytical queries. |
| **ORM** | Prisma | Type-safe database access, automatic migrations, and excellent developer experience. |
| **Authentication** | JWT + Refresh Tokens | Stateless authentication. Short-lived access tokens (15 min) with long-lived refresh tokens (7 days). |
| **WhatsApp** | Meta WhatsApp Cloud API | Official API for automated server-to-server messaging. No personal WhatsApp needed. |
| **OTP Service** | WhatsApp OTP (via Meta API) | Sends verification codes to customers on the Web Portal via WhatsApp instead of SMS (cheaper and more reliable in India). |
| **File Storage** | AWS S3 / Cloudflare R2 | Stores product images, brand logos, and generated invoice PDFs. |
| **PDF Generation** | Puppeteer (server-side) / Flutter pdf package (in-app) | Generates downloadable invoice PDFs from the invoice web template or directly within the Flutter app. |
| **Push Notifications** | Firebase Cloud Messaging (FCM) | Push notifications to Store Admin and Super Admin mobile devices (daily summaries, alerts). |
| **Hosting** | AWS / Vercel / Railway | Vercel for the Next.js web portal, AWS/Railway for the NestJS backend and PostgreSQL. |
| **Caching** | Redis | Cache frequently accessed data (product catalogs, customer lookups) for POS speed. |

---

## 12. Security & Authentication

### Authentication Flows
- **Super Admin:** Email → Password → Optional TOTP 2FA → JWT issued.
- **Store Admin:** Email → Password → JWT issued (scoped to their store_id).
- **Employee:** Select Name from dropdown (filtered by store) → Enter 4-digit PIN → JWT issued (scoped to store_id + employee_id, with minimal permissions).
- **Customer (Web Portal):** Enter Phone Number → OTP sent to WhatsApp → Enter OTP → Temporary session token issued.

### Data Isolation (Row-Level Security)
- Every API request carries the user's JWT, which encodes their `role`, `brand_id`, and `store_id`.
- The API layer enforces that:
  - An **Employee** can only CREATE invoices for their own `store_id` and READ invoices they personally created.
  - A **Store Admin** can only READ/UPDATE data where `store_id` matches their own.
  - A **Super Admin** can READ all data within their `brand_id`.
  - No user can ever access data from a different `brand_id` (future multi-brand support).

### Sensitive Data
- Passwords are hashed with bcrypt (cost factor 12).
- Employee PINs are hashed (not stored in plain text).
- WhatsApp API tokens are encrypted at rest using AES-256.
- Customer phone numbers are stored in plain text (needed for WhatsApp delivery) but access is role-restricted.
- All API traffic is HTTPS only.

---

## 13. Notifications System

| Event | Recipient | Channel | Content |
|---|---|---|---|
| Invoice generated | Customer | WhatsApp | Invoice link + amount + loyalty points |
| Daily revenue summary | Store Admin, Super Admin | Push Notification | "Today: 47 bills, ₹1,23,400 revenue" |
| Low stock alert | Store Admin | Push Notification | "White Kurta (M) — only 3 left" |
| New employee added | Store Admin | In-App | "Employee 'Rahul' has been added" |
| Invoice voided | Store Admin, Super Admin | Push Notification | "Invoice #DM-2026-00047 voided by [Admin]" |
| Campaign completed | Super Admin | Push + In-App | "Campaign 'Win-Back Q2' delivered to 1,200 customers" |
| Loyalty milestone | Customer | WhatsApp | "You've earned 500 points! Redeem ₹250 on your next visit" |
| Employee session timeout | Employee | In-App | "Session expired — please re-enter your PIN" |

---

## 14. Edge Cases & Error Handling

| Scenario | How It's Handled |
|---|---|
| **Customer refuses to give phone number** | "Guest Checkout" mode — invoice is generated and stored in the DB, but no WhatsApp is sent. A QR code / Billing ID is shown on-screen for the customer to photograph if they want. |
| **Employee enters wrong phone number** | WhatsApp delivery may succeed (to the wrong person) or fail (invalid number). The Store Admin can void the invoice and recreate it with the correct number. |
| **Customer's number is not on WhatsApp** | Meta API returns a delivery failure. The system marks `whatsapp_status = FAILED`. The invoice still exists in the DB and is accessible via the Web Portal. |
| **Store loses internet (offline mode)** | The Flutter app caches new invoices locally using Hive/SQLite. A sync indicator shows "3 bills pending sync." When connectivity returns, the app syncs all pending invoices to the server and triggers the WhatsApp messages. |
| **Employee forgets to log out** | Auto-timeout after 30 minutes of no interaction. PIN re-entry required. |
| **Employee's phone is stolen** | Store Admin deactivates the employee's account immediately via the app. The session token is invalidated server-side. No sensitive data is stored locally on the device (all data is fetched from the API). |
| **Customer wants a return after 30 days** | Employee scans QR → original invoice loads → return is processed → refund amount is calculated → loyalty points earned on original purchase are deducted → WhatsApp refund confirmation is sent. |
| **Duplicate phone number at different stores** | By design, customers are global entities. The same phone number at any store maps to the same customer record. Their visit history spans all branches. |
| **Barcode not found in catalog** | Employee is prompted to switch to manual entry mode and type the item name + price. |
| **WhatsApp API rate limit exceeded** | Messages are queued in a background job queue (e.g., Bull/BullMQ with Redis). Failed messages are retried with exponential backoff. |
| **Super Admin wants to remove a store** | Store is soft-deleted (`is_active = false`). All historical data (invoices, customers) is preserved for accounting. No new bills can be generated. |

---

## 15. Phased Roadmap

### Phase 1 — Foundation (MVP)
- Backend API: Auth, Stores, Employees, Customers, Invoices.
- Mobile App: Login, POS screen (manual item entry), invoice generation.
- WhatsApp: Invoice delivery on checkout.
- Web Portal: Billing ID lookup (no login required).

### Phase 2 — Intelligence
- Analytics dashboards for Super Admin and Store Admin.
- Product catalog and barcode scanning.
- Customer Web Portal with OTP login and full purchase history.
- Push notifications (daily summaries, alerts).

### Phase 3 — Engagement
- Loyalty & rewards system (earn, redeem, check balance).
- QR code returns/exchanges.
- WhatsApp chatbot replies.
- Marketing campaigns with audience segmentation.

### Phase 4 — Scale
- Inventory management with low-stock alerts.
- Offline mode with sync.
- Audit logs and compliance exports.
- Multi-brand support (multiple Super Admins on one platform).

---

*This document serves as the single source of truth for the entire BillPush platform. Every feature, every screen, every workflow, every database table, and every edge case is documented here. Development should strictly follow this blueprint.*
