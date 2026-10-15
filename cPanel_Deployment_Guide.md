# cPanel Shared Hosting Deployment Guide — AROMATICA CMS Platform

This guide provides a comprehensive, step-by-step procedure for deploying the **AROMATICA E-Commerce CMS Platform** to BDIX shared hosting running cPanel with MariaDB/MySQL and PHP 8.2+.

---

## 1. Hosting Compatibility & Prerequisites

Before deploying, verify that your cPanel shared hosting account supports:

- **PHP Version**: PHP 8.2 or 8.3 (Selectable in cPanel via *Select PHP Version* or *MultiPHP Manager*).
- **PHP Extensions**: `pdo`, `pdo_mysql`, `mbstring`, `json`, `gd`, `fileinfo`, `curl`.
- **Database**: MariaDB 10.4+ or MySQL 5.7/8.0+.
- **Web Server**: Apache with `mod_rewrite` enabled.
- **SSL Certificate**: Active HTTPS (Free AutoSSL or Let's Encrypt in cPanel).

---

## 2. Step 1: Create MariaDB Database & User in cPanel

1. Log into your **cPanel Dashboard**.
2. Open **MySQL® Databases** (or **MySQL® Database Wizard**).
3. **Create Database**:
   - Database Name: `username_aromatica` (e.g. `aroma_shopdb`).
4. **Create Database User**:
   - Username: `username_dbuser` (e.g. `aroma_dbuser`).
   - Password: Use a strong 20+ character random password.
5. **Add User to Database**:
   - Select `username_dbuser` and `username_aromatica`.
   - Grant **ALL PRIVILEGES** and click **Make Changes**.

---

## 3. Step 2: Import Database Schema & Initial Seed Data

1. In cPanel, open **phpMyAdmin**.
2. Select your newly created database (`username_aromatica`).
3. Click the **Import** tab.
4. Upload `database/schema.sql` and click **Go**.
5. Once schema tables are created, click **Import** again and upload `database/seed.sql` (or run `php database/seed.php` via cPanel Terminal / SSH) to populate default store settings, initial product catalog, decant sizes, and homepage sections.

---

## 4. Step 3: Configure Private Production Environment

Keep private credentials safe by placing configuration variables outside the publicly accessible `public_html` web root or using a protected `.env` file.

1. On your local machine or server, prepare the production `.env` file:

```ini
# Production Environment Configuration
APP_ENV=production
APP_SECRET=replace_with_a_random_64_char_secret_string_here
ALLOWED_ORIGIN=https://aromatica.com.bd

# Production MariaDB Credentials
DB_DRIVER=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_NAME=username_aromatica
DB_USER=username_dbuser
DB_PASS=your_strong_mysql_password_here

# Media Storage Directory (Relative to app root)
UPLOAD_DIR=../uploads
MAX_UPLOAD_SIZE_MB=5
```

2. Upload `.env` to your application directory on cPanel.

---

## 5. Step 4: Build & Deploy Frontend & Backend Files

### A. Build the Frontend Locally
Run the production build on your development machine:

```bash
npm run build
```

This compiles all React components, TypeScript code, and Tailwind CSS into the `dist/` directory.

### B. Directory Structure on cPanel
Organize your application on cPanel as follows:

```
/home/username/
├── aromatica_app/            <-- App root (outside public_html for security)
│   ├── .env
│   ├── api/                  <-- PHP REST API endpoints
│   ├── database/             <-- SQL schemas & migrations
│   └── uploads/              <-- Persistent media storage directory (chmod 755)
└── public_html/              <-- Public Web Root
    ├── index.html            <-- From local dist/index.html
    ├── assets/               <-- From local dist/assets/
    ├── api -> ../aromatica_app/api
    ├── uploads -> ../aromatica_app/uploads
    └── .htaccess             <-- Apache Rewrite rules
```

### C. Create `.htaccess` in `public_html`

Create a `.htaccess` file inside `public_html` to handle React client-side routing, API routing, and file access:

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /

  # Secure sensitive file extensions
  <FilesMatch "\.(env|log|sql|sqlite|md)$">
    Order allow,deny
    Deny from all
  </FilesMatch>

  # Prevent script execution in uploads directory
  RewriteRule ^uploads/.*\.php$ - [F,L]

  # Route API requests to PHP backend
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteCond %{REQUEST_URI} ^/api/ [NC]
  RewriteRule ^api/(.*)$ api/$1 [QSA,L]

  # Route React storefront routes to index.html
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule ^ index.html [L]
</IfModule>
```

---

## 6. Step 5: Secure Initial Administrator Account

In cPanel Terminal (or SSH):

```bash
cd /home/username/aromatica_app
php database/create_admin.php superadmin admin@aromatica.com.bd YourSecureAdminPassword123!
```

This generates a secure bcrypt password hash (`password_hash`) and inserts/updates the administrator record in the production database.

---

## 7. Step 6: File Permissions & Security Hardening

In cPanel **File Manager**:

- Directories: `755` (`rwxr-xr-x`)
- PHP files: `644` (`rw-r--r--`)
- `.env` file: `600` (`rw-------`)
- `uploads/` folder: `755` (Ensure PHP process can write uploaded image files)

---

## 8. Step 7: Database & Upload Backup Procedures

### Automatic Database Backup via cPanel Cron Job
Set up a daily cPanel Cron Job to back up your database:

```bash
mysqldump -u username_dbuser -p'your_password' username_aromatica | gzip > /home/username/backups/db_backup_$(date +\%F).sql.gz
```

### File Uploads Backup
Compress the persistent `/uploads` directory periodically:

```bash
tar -czf /home/username/backups/uploads_backup_$(date +\%F).tar.gz /home/username/aromatica_app/uploads
```

---

## 9. Updating the Application Without Losing Customer Data

When deploying code updates:

1. Rebuild frontend (`npm run build`) and upload new static files in `dist/assets/`.
2. Replace files in `api/` directory with updated PHP files.
3. **NEVER** delete or replace the production `.env` file, MariaDB database, or the `/uploads` folder.
