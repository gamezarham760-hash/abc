# Rescue 1122 - Human Resource Management System (HRM)

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![Status](https://img.shields.io/badge/status-Under%20Development-yellow)
![License](https://img.shields.io/badge/license-MIT-green)

## 📋 Table of Contents
- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the Project](#running-the-project)
- [Project Structure](#project-structure)
- [API Documentation](#api-documentation)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)
- [License](#license)

---

## 🎯 Overview

**Rescue 1122 HRM** is a comprehensive Human Resource Management System designed specifically for **Rescue 1122** organization. It provides an all-in-one solution to manage employees, track attendance, handle payroll, manage transfers/postings, and generate reports.

The system consists of:
- **Frontend:** Responsive HTML/JavaScript with modern UI
- **Backend:** Laravel REST API with secure authentication
- **Database:** MySQL for data persistence

---

## ✨ Features

### Core Features
- ✅ **Employee Management** - Add, edit, view, and delete employee records
- ✅ **Attendance Tracking** - Track daily attendance with reports
- ✅ **Payroll Management** - Calculate salaries, manage deductions
- ✅ **Transfer/Posting** - Track employee transfers and postings
- ✅ **Leave Management** - Manage employee leave requests and approvals
- ✅ **Field Management** - Customize employee fields dynamically
- ✅ **Bulk Import** - Import employees from CSV/Excel files
- ✅ **Reporting** - Export to Excel, PDF, and Print
- ✅ **Authentication** - Secure login with token-based auth
- ✅ **Dashboard** - Real-time analytics and overview
- ✅ **Role-Based Access** - Admin and employee roles

### Technical Features
- 🔒 Bearer Token Authentication
- 📱 Responsive Design (Desktop, Tablet, Mobile)
- 🔄 REST API Integration
- 📊 Real-time Data Sync
- 🗂️ File Upload Support (Employee Photos)
- 📥 Bulk Data Import
- 📤 Export to Multiple Formats

---

## 🛠️ Tech Stack

### Frontend
- **HTML5** - Markup
- **CSS3** - Styling (Custom + Responsive)
- **JavaScript (Vanilla)** - No frameworks, pure JS
- **Font Awesome 6.4** - Icons
- **Google Fonts** - Typography

### Backend
- **Laravel 10+** - PHP Framework
- **MySQL 8.0** - Database
- **PHP 8.1+** - Language
- **Composer** - Dependency Manager

### Development Environment
- **XAMPP** - Local server stack (Apache + MySQL + PHP)
- **Git** - Version control

---

## 📋 Prerequisites

Before you start, ensure you have:

1. **XAMPP** (Apache, MySQL, PHP)
   - Download: https://www.apachefriends.org/
   - Version: 8.0 or higher

2. **Git**
   - Download: https://git-scm.com/
   - Version: 2.30 or higher

3. **Composer**
   - Download: https://getcomposer.org/
   - Version: 2.0 or higher

4. **Node.js** (Optional, for build tools)
   - Download: https://nodejs.org/
   - Version: 16 or higher

5. **Text Editor/IDE**
   - VS Code (Recommended): https://code.visualstudio.com/
   - Or any editor of your choice

---

## 🚀 Installation

### Step 1: Clone the Repository

```bash
# Navigate to XAMPP htdocs directory
cd C:\xampp\htdocs

# Clone the repository
git clone https://github.com/gamezarham760-hash/abc.git

# Navigate into project
cd abc
```

### Step 2: Set Up Backend (Laravel API)

```bash
# Navigate to API folder
cd rescue1122-api

# Install PHP dependencies
composer install

# Copy environment file
cp .env.example .env

# Generate application key
php artisan key:generate

# Create database and run migrations
php artisan migrate

# Seed default admin user
php artisan db:seed

# Create storage symlink for file uploads
php artisan storage:link

# Navigate back to root
cd ..
```

### Step 3: Start the Local Server

**Terminal 1 - Start Laravel API:**
```bash
cd rescue1122-api
php artisan serve
```
This will start the API at: `http://127.0.0.1:8000`

**Terminal 2 - Start XAMPP:**
```bash
# Start XAMPP from Control Panel or command line
# Navigate to XAMPP folder and run:
apache_start.bat
mysql_start.bat
```

### Step 4: Access the Application

Open your browser and go to:
```
http://localhost/abc/employee-profile/
```

**Default Credentials:**
- Username: `admin`
- Password: `admin123`

---

## ⚙️ Configuration

### Frontend Configuration

Edit `employee-profile/config.js` to set your API endpoints:

```javascript
// Development (Local)
const API_BASE = 'http://127.0.0.1:8000/api';
const PHOTO_BASE = 'http://127.0.0.1:8000/storage/uploads/';

// Production (Change these for production)
// const API_BASE = 'https://your-domain.com/api';
// const PHOTO_BASE = 'https://your-domain.com/storage/uploads/';
```

### Backend Configuration

Edit `rescue1122-api/.env`:

```env
# Application
APP_NAME=Rescue1122HRM
APP_ENV=local
APP_DEBUG=true
APP_KEY=base64:...
APP_URL=http://127.0.0.1:8000

# Database
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=hrm_db
DB_USERNAME=root
DB_PASSWORD=

# API Settings
API_PORT=8000
FRONTEND_URL=http://localhost/abc/employee-profile/

# File Upload
UPLOAD_DIR=storage/uploads/
MAX_FILE_SIZE=5242880
```

---

## 🏃 Running the Project

### Full Startup Guide

1. **Start XAMPP Services**
   ```bash
   # Windows
   C:\xampp\apache_start.bat
   C:\xampp\mysql_start.bat
   
   # Or use XAMPP Control Panel
   ```

2. **Start Laravel API** (New Terminal)
   ```bash
   cd C:\xampp\htdocs\abc\rescue1122-api
   php artisan serve
   ```

3. **Open Browser**
   ```
   http://localhost/abc/employee-profile/
   ```

4. **Login**
   - Username: `admin`
   - Password: `admin123`

### Stopping Services

```bash
# Stop Laravel API
# Press Ctrl + C in the terminal

# Stop XAMPP
# Use XAMPP Control Panel or:
C:\xampp\apache_stop.bat
C:\xampp\mysql_stop.bat
```

---

## 📁 Project Structure

```
abc/
├── README.md                      # This file
├── .env.example                   # Environment template
├── .gitignore                     # Git ignore rules
├── index.php                      # Root redirect
├── applications.html              # XAMPP default page
├── bitnami.css                    # XAMPP styling
├── favicon.ico                    # Browser icon
│
├── employee-profile/              # Frontend Application
│   ├── index.html                # Login page
│   ├── admin.html                # Admin dashboard
│   ├── employee_list.html        # View employees
│   ├── add_employee_1122.html    # Add employee
│   ├── edit_employee.html        # Edit employee
│   ├── view_employee.html        # View employee details
│   ├── attendance.html           # Attendance tracking
│   ├── payroll.html              # Payroll management
│   ├── leave_management.html     # Leave management
│   ├── transfer_history.html     # Transfer/posting
│   ├── field_manager.html        # Custom fields
│   ├── bulk_import.html          # Bulk import
│   ├── config.js                 # API configuration
│   └── [language folders]/       # i18n support (de, es, fr, etc.)
│
├── dashboard/                     # XAMPP Documentation
│   └── [various docs]
│
├── img/                           # Images/Assets
│   ├── module_table_top.png
│   └── module_table_bottom.png
│
└── rescue1122-api/               # Laravel Backend API
    ├── app/                      # Application code
    │   ├── Models/
    │   ├── Controllers/
    │   ├── Requests/
    │   └── Exceptions/
    ├── database/                 # Database migrations & seeders
    │   ├── migrations/
    │   └── seeders/
    ├── routes/                   # API routes
    │   └── api.php
    ├── public/                   # Public files
    │   └── storage/              # Employee photos
    ├── storage/                  # Laravel storage
    ├── .env                      # Environment variables
    ├── .env.example              # Environment template
    ├── artisan                   # Laravel CLI
    ├── composer.json             # PHP dependencies
    └── README.md                 # Laravel setup guide
```

---

## 📚 API Documentation

### Authentication Endpoints

#### Login
```http
POST /api/login
Content-Type: application/json

{
  "username": "admin",
  "password": "admin123"
}

Response:
{
  "success": true,
  "token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "user": {
    "id": 1,
    "name": "Administrator",
    "username": "admin",
    "role": "admin"
  }
}
```

#### Logout
```http
POST /api/logout
Authorization: Bearer {token}
```

### Employee Endpoints

#### Get All Employees
```http
GET /api/employees
Authorization: Bearer {token}
```

#### Get Single Employee
```http
GET /api/employees/{id}
Authorization: Bearer {token}
```

#### Create Employee
```http
POST /api/employees
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "03001234567",
  "designation": "Officer",
  "department": "Operations"
}
```

#### Update Employee
```http
PUT /api/employees/{id}
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "John Doe Updated",
  "designation": "Senior Officer"
}
```

#### Delete Employee
```http
DELETE /api/employees/{id}
Authorization: Bearer {token}
```

### Attendance Endpoints

#### Record Attendance
```http
POST /api/attendance
Authorization: Bearer {token}
Content-Type: application/json

{
  "employee_id": 1,
  "date": "2026-05-24",
  "status": "present"
}
```

#### Get Attendance Records
```http
GET /api/attendance?employee_id=1&month=05&year=2026
Authorization: Bearer {token}
```

For complete API documentation, check `rescue1122-api/API_DOCS.md`

---

## 🌐 Deployment

### Deployment Checklist

- [ ] Ensure all environment variables are set
- [ ] Database is backed up
- [ ] All Laravel migrations are run
- [ ] Static assets are optimized
- [ ] Error logging is configured
- [ ] Security headers are set
- [ ] HTTPS is enabled
- [ ] API rate limiting is configured

### Deploy to Shared Hosting

#### 1. Prepare Files

```bash
# Clone repository on server
git clone https://github.com/gamezarham760-hash/abc.git

# Navigate to API
cd rescue1122-api

# Install dependencies
composer install --no-dev

# Create .env file
cp .env.example .env
php artisan key:generate
```

#### 2. Configure Database

```bash
# Update .env with database credentials
nano .env

# Run migrations
php artisan migrate --force
```

#### 3. Set Permissions

```bash
# Make storage writable
chmod -R 775 storage/
chmod -R 775 bootstrap/cache/

# Make public writable for uploads
chmod -R 775 public/storage/
```

#### 4. Configure Web Server

**Apache .htaccess** (usually auto-created):
```apache
<IfModule mod_rewrite.c>
    <IfModule mod_negotiation.c>
        Options -MultiViews
    </IfModule>

    RewriteEngine On

    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteCond %{REQUEST_FILENAME} !-f
    RewriteRule ^ index.php [QSA,L]
</IfModule>
```

**Nginx Configuration:**
```nginx
location / {
    try_files $uri $uri/ /index.php?$query_string;
}
```

#### 5. Update Frontend Configuration

Edit `employee-profile/config.js`:
```javascript
const API_BASE = 'https://your-domain.com/api';
const PHOTO_BASE = 'https://your-domain.com/storage/uploads/';
```

#### 6. Enable HTTPS

```bash
# Use Let's Encrypt (free SSL)
# Install Certbot
sudo apt-get install certbot python3-certbot-apache

# Generate certificate
sudo certbot certonly --apache -d your-domain.com
```

#### 7. Configure Security

**Update .env:**
```env
APP_ENV=production
APP_DEBUG=false
FORCE_HTTPS=true
SESSION_SECURE_COOKIES=true
```

### Deploy to Docker (Optional)

See `rescue1122-api/Dockerfile` for containerized deployment.

---

## 🐛 Troubleshooting

### Issue: "Cannot connect to server"

**Solution:**
1. Ensure Laravel API is running: `php artisan serve`
2. Check if MySQL is running
3. Verify `API_BASE` in `config.js` matches your API URL
4. Check browser console for errors (F12)

### Issue: Login fails with invalid credentials

**Solution:**
1. Ensure database migrations are run: `php artisan migrate`
2. Seed default user: `php artisan db:seed`
3. Check database connection in `.env`

### Issue: File uploads not working

**Solution:**
1. Create storage symlink: `php artisan storage:link`
2. Check folder permissions: `chmod -R 775 storage/`
3. Check `MAX_FILE_SIZE` in `.env`

### Issue: CORS errors

**Solution:**
Add to `rescue1122-api/config/cors.php`:
```php
'allowed_origins' => ['http://localhost', 'http://localhost/abc'],
```

### Issue: Database connection refused

**Solution:**
1. Check MySQL is running
2. Verify credentials in `.env`
3. Ensure database exists: `php artisan migrate`

### Issue: Port 8000 already in use

**Solution:**
```bash
# Use different port
php artisan serve --port=8001

# Update config.js
const API_BASE = 'http://127.0.0.1:8001/api';
```

---

## 📖 Additional Resources

- [Laravel Documentation](https://laravel.com/docs)
- [REST API Best Practices](https://restfulapi.net/)
- [Security Best Practices](https://owasp.org/)
- [HTML/CSS/JS Tutorials](https://www.w3schools.com/)

---

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Commit changes: `git commit -m "Add new feature"`
4. Push to branch: `git push origin feature/new-feature`
5. Submit a Pull Request

---

## 📝 License

This project is licensed under the MIT License - see LICENSE file for details.

---

## 👨‍💻 Author

**Gamez Arham**
- GitHub: [@gamezarham760-hash](https://github.com/gamezarham760-hash)
- Email: gamezarham@example.com

---

## 🎉 Acknowledgments

Special thanks to:
- Rescue 1122 organization for the requirements
- The Laravel and JavaScript communities
- All contributors and testers

---

## 📞 Support

For issues, questions, or suggestions:
1. Check the Troubleshooting section
2. Search existing GitHub issues
3. Create a new GitHub issue with detailed description
4. Contact the development team

---

**Last Updated:** May 24, 2026  
**Status:** Under Development  
**Version:** 1.0.0-beta
