# 🔧 SETUP GUIDE - Local Development

Complete step-by-step guide to set up the Rescue 1122 HRM system on your local machine for development.

---

## 📋 Table of Contents

1. [System Requirements](#system-requirements)
2. [Installation Steps](#installation-steps)
3. [Database Setup](#database-setup)
4. [Running the Application](#running-the-application)
5. [Development Workflow](#development-workflow)
6. [Useful Commands](#useful-commands)
7. [Troubleshooting](#troubleshooting)

---

## 💻 System Requirements

### Hardware
- **Processor:** Intel/AMD dual-core or better
- **RAM:** Minimum 4GB (8GB recommended)
- **Storage:** 2GB free space

### Software
- **OS:** Windows 10+, macOS 10.14+, or Linux (Ubuntu 20.04+)
- **PHP:** 8.1 or higher
- **MySQL:** 8.0 or higher
- **Composer:** 2.0 or higher
- **Git:** 2.30 or higher
- **Node.js:** 16+ (optional, for build tools)

### Browser
- Chrome 90+, Firefox 88+, Safari 14+, Edge 90+

---

## ⬇️ Installation Steps

### Step 1: Install XAMPP

XAMPP provides Apache, MySQL, and PHP in one package.

**Windows:**
1. Download: https://www.apachefriends.org/
2. Run installer: `xampp-windows-x64-8.0.0-installer.exe`
3. Choose installation location (e.g., `C:\xampp`)
4. Install components: Apache, MySQL, PHP, phpMyAdmin

**macOS:**
```bash
# Using Homebrew
brew install xampp

# Or download from https://www.apachefriends.org/
```

**Linux (Ubuntu):**
```bash
wget https://www.apachefriends.org/xampp-linux-x64.run
chmod +x xampp-linux-x64.run
sudo ./xampp-linux-x64.run
```

### Step 2: Verify PHP & MySQL

```bash
# Check PHP version
php -v

# Should output: PHP 8.1.0 or higher

# Check MySQL
mysql --version

# Should output: mysql Ver 8.0 or higher
```

### Step 3: Install Composer

Download from: https://getcomposer.org/

**Verify installation:**
```bash
composer --version

# Should output: Composer version 2.x.x
```

### Step 4: Install Git

Download from: https://git-scm.com/

**Verify installation:**
```bash
git --version

# Should output: git version 2.x.x
```

### Step 5: Clone Repository

```bash
# Navigate to XAMPP htdocs
cd C:\xampp\htdocs  # Windows
cd /Applications/XAMPP/htdocs  # macOS
cd /opt/lampp/htdocs  # Linux

# Clone the repository
git clone https://github.com/gamezarham760-hash/abc.git abc

# Navigate into project
cd abc
```

### Step 6: Install Backend Dependencies

```bash
# Navigate to API folder
cd rescue1122-api

# Install PHP dependencies
composer install

# This will create vendor/ folder with all dependencies
```

### Step 7: Setup Environment Files

**Backend (.env):**
```bash
# Copy environment template
cp .env.example .env

# Generate application key
php artisan key:generate
```

**Frontend (.env):**
```bash
# Frontend uses config.js
# No .env needed, but verify config.js:
cd ../employee-profile
cat config.js  # Check API_BASE and PHOTO_BASE
```

---

## 🗄️ Database Setup

### Step 1: Start MySQL

**Windows (XAMPP Control Panel):**
1. Open XAMPP Control Panel
2. Click "Start" next to MySQL

**Or via command line:**
```bash
# Windows
C:\xampp\mysql_start.bat

# macOS
sudo /Applications/XAMPP/xamppfiles/bin/mysqld_safe

# Linux
sudo /opt/lampp/bin/mysqld_safe
```

### Step 2: Create Database

**Option A: Via Command Line**
```bash
# Login to MySQL
mysql -u root -p

# Press Enter (no password by default)

# Create database
CREATE DATABASE hrm_db;

# Create user
CREATE USER 'hrm_user'@'localhost' IDENTIFIED BY 'password123';

# Grant privileges
GRANT ALL PRIVILEGES ON hrm_db.* TO 'hrm_user'@'localhost';

# Flush privileges
FLUSH PRIVILEGES;

# Exit
EXIT;
```

**Option B: Via phpMyAdmin**
1. Open http://localhost/phpmyadmin
2. Click "New" in left sidebar
3. Enter database name: `hrm_db`
4. Click "Create"

### Step 3: Update .env

Edit `rescue1122-api/.env`:
```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=hrm_db
DB_USERNAME=hrm_user
DB_PASSWORD=password123
```

### Step 4: Run Migrations

```bash
cd rescue1122-api

# Run database migrations
php artisan migrate

# Seed default data
php artisan db:seed

# You should see:
# Database seeding completed successfully.
```

### Step 5: Verify Database

```bash
# Login to MySQL
mysql -u hrm_user -p hrm_db

# List tables
SHOW TABLES;

# Should show: employees, users, attendance, etc.

# Exit
EXIT;
```

---

## ▶️ Running the Application

### Step 1: Start Services

**Terminal 1 - Start Laravel API:**
```bash
cd C:\xampp\htdocs\abc\rescue1122-api
php artisan serve
```

**Output should be:**
```
Laravel development server started: http://127.0.0.1:8000
```

**Terminal 2 - Start Apache & MySQL:**

**Windows (XAMPP):**
1. Open XAMPP Control Panel
2. Click "Start" next to Apache
3. Click "Start" next to MySQL

**Or command line:**
```bash
C:\xampp\apache_start.bat
C:\xampp\mysql_start.bat
```

### Step 2: Access the Application

Open your browser and go to:
```
http://localhost/abc/employee-profile/
```

You should see the **Login Page** with:
- Rescue 1122 logo
- Login form
- "Server online" status

### Step 3: Login

Default credentials:
- **Username:** `admin`
- **Password:** `admin123`

After login, you should see the **Admin Dashboard**.

---

## 🔄 Development Workflow

### Making Changes to Frontend

```bash
# 1. Edit HTML/JavaScript
nano employee-profile/employee_list.html

# 2. Save file
# (Changes apply immediately - no build needed)

# 3. Refresh browser
# (F5 or Ctrl+R)

# 4. Check console for errors
# (F12 -> Console tab)
```

### Making Changes to Backend

```bash
# 1. Edit Laravel files
nano rescue1122-api/app/Models/Employee.php

# 2. Laravel development server auto-reloads
# (No need to restart)

# 3. Test the endpoint
curl http://127.0.0.1:8000/api/employees \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Creating New Pages

```bash
# 1. Create HTML file
touch employee-profile/new_feature.html

# 2. Add to config.js imports
# (Include config.js in script tag)

# 3. Add to navigation
nano employee-profile/admin.html

# 4. Test in browser
```

### Database Migrations

```bash
cd rescue1122-api

# Create new migration
php artisan make:migration create_new_table

# Edit migration file
nano database/migrations/2026_05_24_create_new_table.php

# Run migration
php artisan migrate

# Rollback if needed
php artisan migrate:rollback
```

---

## 🛠️ Useful Commands

### Laravel Commands

```bash
cd rescue1122-api

# Start development server
php artisan serve

# Run migrations
php artisan migrate

# Rollback migrations
php artisan migrate:rollback

# Seed database
php artisan db:seed

# Clear all caches
php artisan cache:clear
php artisan config:clear
php artisan route:clear
php artisan view:clear

# Create model with migration
php artisan make:model Employee -m

# Create controller
php artisan make:controller EmployeeController

# Create API resource
php artisan make:resource EmployeeResource

# Run tests
php artisan test

# Tinker (interactive shell)
php artisan tinker
```

### Composer Commands

```bash
# Install dependencies
composer install

# Update dependencies
composer update

# Require new package
composer require package-name

# Remove package
composer remove package-name

# Optimize autoloader
composer dump-autoload --optimize

# Check for vulnerabilities
composer audit
```

### Git Commands

```bash
# Check status
git status

# Add changes
git add .

# Commit changes
git commit -m "Describe your changes"

# Push to GitHub
git push origin main

# Pull latest changes
git pull origin main

# Create new branch
git checkout -b feature/new-feature

# Switch branch
git checkout main

# View commit history
git log --oneline
```

### MySQL Commands

```bash
# Login to MySQL
mysql -u root -p

# Show databases
SHOW DATABASES;

# Use database
USE hrm_db;

# Show tables
SHOW TABLES;

# Show table structure
DESCRIBE employees;

# Run query
SELECT * FROM employees;

# Exit
EXIT;
```

---

## 🐛 Troubleshooting

### "Cannot connect to server"

**Problem:** Login page shows "Server offline"

**Solution:**
```bash
# Check if Laravel API is running
# Terminal should show: "Laravel development server started"

# If not running, start it:
cd rescue1122-api
php artisan serve

# Verify on browser:
# Open http://127.0.0.1:8000/api/health
# Should return 200 OK
```

### "SQLSTATE[HY000]: General error: 15 'no such table'"

**Problem:** Migrations not run

**Solution:**
```bash
cd rescue1122-api

# Run migrations
php artisan migrate

# Seed default data
php artisan db:seed
```

### "Class not found" error

**Problem:** Composer dependencies not installed

**Solution:**
```bash
cd rescue1122-api

# Install dependencies
composer install

# Or update autoloader
composer dump-autoload
```

### "Port 8000 already in use"

**Problem:** Another process is using port 8000

**Solution:**
```bash
# Use different port
php artisan serve --port=8001

# Update config.js
const API_BASE = 'http://127.0.0.1:8001/api';
```

### "Access denied for user 'root'@'localhost'"

**Problem:** MySQL password is set

**Solution:**
```bash
# If you set a password during XAMPP installation
mysql -u root -p

# Enter your password

# Or reset root password:
# 1. Stop MySQL
# 2. Start with: mysqld --skip-grant-tables
# 3. Update password in database
```

### "localhost/abc/employee-profile shows 404"

**Problem:** XAMPP Apache not started

**Solution:**
```bash
# Start Apache via XAMPP Control Panel
# Or command line:
C:\xampp\apache_start.bat

# Verify Apache is running
# Open http://localhost/
# Should show XAMPP welcome page
```

### Form data not saving

**Problem:** API not receiving data

**Solution:**
1. Check browser console (F12)
2. Check API logs: `tail -f rescue1122-api/storage/logs/laravel.log`
3. Verify CSRF token is sent
4. Check API is running: `http://127.0.0.1:8000/api/health`

### "Undefined variable" in console

**Problem:** JavaScript error in config.js

**Solution:**
```bash
# Verify config.js is included in HTML
# Check: <script src="config.js"></script>

# Check API_BASE is defined
# In browser console: console.log(API_BASE)

# Reload page: Ctrl+F5 (hard refresh)
```

---

## 📚 Additional Resources

- **Laravel Documentation:** https://laravel.com/docs
- **PHP Documentation:** https://www.php.net/docs.php
- **MySQL Documentation:** https://dev.mysql.com/doc/
- **JavaScript MDN:** https://developer.mozilla.org/en-US/docs/Web/JavaScript
- **REST API Guide:** https://restfulapi.net/

---

## ✅ Quick Checklist

- [ ] XAMPP installed with PHP 8.1+
- [ ] Composer installed
- [ ] Git installed
- [ ] Repository cloned to htdocs
- [ ] Composer dependencies installed
- [ ] .env files created
- [ ] Database created and configured
- [ ] Migrations run successfully
- [ ] Apache & MySQL running
- [ ] Laravel API server running
- [ ] Login page accessible at localhost/abc/employee-profile/
- [ ] Can login with admin/admin123
- [ ] Dashboard loads without errors
- [ ] Console has no errors (F12)

---

## 🎉 You're Ready!

Your development environment is now set up! Start developing:

```bash
# Make changes
cd rescue1122-api
nano app/Models/Employee.php

# Test changes
php artisan serve

# Commit changes
git add .
git commit -m "Add new feature"
git push origin main
```

Happy coding! 🚀

---

*Last Updated: May 24, 2026*
*Questions? Check the README.md or DEPLOYMENT.md files*
