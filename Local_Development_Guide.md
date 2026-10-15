# Local Development Guide — AROMATICA CMS Platform

This guide outlines how to set up, run, test, and manage the **AROMATICA E-Commerce CMS Platform** locally on your machine before deploying to cPanel hosting.

---

## 1. System Requirements

- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher
- **PHP**: PHP 8.2 or PHP 8.3 with `pdo`, `pdo_mysql`, `pdo_sqlite`, `mbstring`, `json`, `fileinfo`
- **Database**: MariaDB / MySQL (or built-in local SQLite fallback)

---

## 2. Quick Local Setup Commands

### Step 1: Install Frontend Dependencies
```bash
npm install --legacy-peer-deps
```

### Step 2: Configure Environment Variables
Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Ensure `.env` contains:
```ini
VITE_API_BASE_URL=http://localhost:8000/api
APP_ENV=development
APP_SECRET=local_dev_secret_key_32_chars_long_12345
ALLOWED_ORIGIN=http://localhost:3000

# Database Configuration (Uses sqlite for zero-config local dev)
DB_DRIVER=sqlite
DB_FILE=database/aromatica.sqlite

# Media Uploads Configuration
UPLOAD_DIR=../uploads
MAX_UPLOAD_SIZE_MB=5
```

### Step 3: Initialize Database & Seed Content
Run the database seed script to build the schema, store settings, product catalog, decant sizes, and default admin user:

```bash
php database/seed.php
```

### Step 4: Create Initial Admin Account (Optional Custom Credentials)
```bash
php database/create_admin.php admin admin@example.com admin123
```

---

## 3. Running Local Servers

Run the local PHP backend server and Vite frontend dev server in separate terminal windows:

### Terminal 1: Start PHP REST API Server
```bash
php -S 127.0.0.1:8000
```

Verify backend health check at: [http://127.0.0.1:8000/api/health.php](http://127.0.0.1:8000/api/health.php)

### Terminal 2: Start React Vite Frontend Server
```bash
npm run dev
```

Open application in browser: [http://localhost:3000](http://localhost:3000)

---

## 4. Accessing Admin CMS Dashboard

1. Navigate to [http://localhost:3000#admin](http://localhost:3000#admin) or click the **ADMIN CMS** floating button at the bottom-left of the storefront.
2. Sign in with:
   - **Username**: `admin`
   - **Password**: `admin123`
3. Access Product Catalog, Decant Size Variants, Order Fulfillment, Printable Invoices, Customer Records, Homepage CMS Builder, Store Settings, and Media Library.

---

## 5. Local Verification & Testing Checklist

- [x] Create, edit, and archive products in Admin CMS; verify live updates on storefront.
- [x] Upload product image via Media Manager and verify persistence in `/uploads`.
- [x] Place customer order on storefront, verify server-side price/total calculations, delivery charge rules, and inventory stock deduction.
- [x] Update order status in Admin CMS, test order cancellation stock restoration.
- [x] Verify unauthenticated users are blocked from accessing `/api/admin/*` endpoints.
- [x] Run `npm run build` to confirm production compilation.
