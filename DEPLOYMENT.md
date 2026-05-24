# 🚀 DEPLOYMENT GUIDE - Rescue 1122 HRM

This comprehensive guide will help you deploy the Rescue 1122 HRM system from local development to production.

---

## 📋 Table of Contents

1. [Pre-Deployment Checklist](#pre-deployment-checklist)
2. [Deployment Strategies](#deployment-strategies)
3. [Deploy to Shared Hosting](#deploy-to-shared-hosting)
4. [Deploy to VPS (cPanel/Plesk)](#deploy-to-vps-cpanelplesk)
5. [Deploy to Docker](#deploy-to-docker)
6. [Deploy to Cloud Platforms](#deploy-to-cloud-platforms)
7. [Security Hardening](#security-hardening)
8. [Performance Optimization](#performance-optimization)
9. [Monitoring & Maintenance](#monitoring--maintenance)
10. [Troubleshooting](#troubleshooting)
11. [Rollback Procedures](#rollback-procedures)

---

## ✅ Pre-Deployment Checklist

Before deploying, ensure:

### Code & Dependencies
- [ ] All code is committed and pushed to Git
- [ ] No sensitive data in `.env` files
- [ ] Dependencies are installed (`composer install --no-dev`)
- [ ] Frontend dependencies are built (if applicable)
- [ ] Tests pass locally: `php artisan test`
- [ ] No debug output left in code
- [ ] All environment variables are documented

### Database
- [ ] Database backup created
- [ ] Migrations tested locally: `php artisan migrate:refresh --seed`
- [ ] Database indexes are optimized
- [ ] Large tables have proper indexing

### Security
- [ ] HTTPS certificate ready (SSL/TLS)
- [ ] API keys and secrets generated
- [ ] CORS settings configured
- [ ] Rate limiting enabled
- [ ] Password hashing configured
- [ ] File permissions set correctly
- [ ] Unnecessary files/folders removed

### Frontend
- [ ] All links point to production domain
- [ ] API URLs updated to production
- [ ] Console has no errors (F12)
- [ ] Responsive design tested on mobile
- [ ] Cross-browser compatibility verified

### Performance
- [ ] Assets are optimized/minified
- [ ] Images are compressed
- [ ] Caching headers configured
- [ ] Database queries are optimized
- [ ] No N+1 query problems

### Documentation
- [ ] Deployment steps documented
- [ ] Rollback procedures documented
- [ ] Emergency contacts listed
- [ ] Server credentials secured
- [ ] Backup procedures documented

---

## 🎯 Deployment Strategies

### Strategy 1: Direct Upload (Simple, Suitable for Small Projects)
- Upload files via FTP/SFTP
- **Pros:** Simple, no extra tools needed
- **Cons:** Slow, error-prone, no version control
- **Risk Level:** ⚠️ Medium

### Strategy 2: Git-based Deployment (Recommended for Most Projects)
- Clone repository on server
- Pull latest changes
- **Pros:** Easy updates, version control, fast
- **Cons:** Requires Git on server
- **Risk Level:** 🟢 Low

### Strategy 3: Docker Containers (Best for Modern Infrastructure)
- Build Docker image
- Run in containers
- **Pros:** Consistent environment, scalable
- **Cons:** Requires Docker knowledge
- **Risk Level:** 🟢 Low

### Strategy 4: CI/CD Pipeline (Best for Teams)
- GitHub Actions / GitLab CI
- Automated testing & deployment
- **Pros:** Automated, reliable, auditable
- **Cons:** Complex setup
- **Risk Level:** 🟢 Low

---

## 🌐 Deploy to Shared Hosting

### Step 1: Purchase & Setup

1. **Buy a domain** (e.g., hrm.yourdomain.com)
2. **Choose shared hosting** (GoDaddy, Bluehost, HostGator, etc.)
3. **Verify requirements:**
   - PHP 8.1+ with: bcmath, ctype, json, Mbstring, OpenSSL, PDO, Tokenizer, XML
   - MySQL 8.0+
   - Composer installed
   - SSH access
   - Enough storage (minimum 500MB)

### Step 2: Connect via SSH

```bash
# On your local machine, connect to server
ssh username@your-domain.com

# Or use WinSCP / FileZilla on Windows
```

### Step 3: Clone Repository

```bash
# Navigate to public_html or www directory
cd public_html

# Clone your repository
git clone https://github.com/gamezarham760-hash/abc.git hrm

# Navigate to project
cd hrm
```

### Step 4: Install Backend Dependencies

```bash
# Install PHP dependencies
composer install --no-dev --optimize-autoloader

# This installs packages from composer.lock
```

### Step 5: Setup Environment

```bash
# Create .env file from template
cp .env.example .env

# Generate app key
php artisan key:generate

# Edit .env with production values
nano .env
```

**Update these in .env:**
```env
APP_ENV=production
APP_DEBUG=false
APP_URL=https://your-domain.com

# Database (provided by hosting)
DB_HOST=your-db-host
DB_DATABASE=your-db-name
DB_USERNAME=your-db-user
DB_PASSWORD=your-secure-password

# API Configuration
FRONTEND_API_BASE=https://your-domain.com/api
FRONTEND_PHOTO_BASE=https://your-domain.com/storage/uploads/

# Security
FORCE_HTTPS=true
SESSION_SECURE_COOKIES=true
CORS_ALLOWED_ORIGINS=https://your-domain.com
```

### Step 6: Database Setup

```bash
# Run migrations
php artisan migrate --force

# Seed default data (if needed)
php artisan db:seed --class=AdminUserSeeder

# Clear cache
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

### Step 7: Set Permissions

```bash
# Make storage writable
chmod -R 775 storage/
chmod -R 775 bootstrap/cache/

# Make public storage writable
chmod -R 775 public/storage/

# Create storage link
php artisan storage:link
```

### Step 8: Create .htaccess (Apache)

**public/.htaccess** (usually auto-generated):
```apache
<IfModule mod_rewrite.c>
    <IfModule mod_negotiation.c>
        Options -MultiViews -Indexes
    </IfModule>

    RewriteEngine On

    RewriteCond %{HTTP:Authorization} .
    RewriteRule ^(.*)$ - [E=HTTP_AUTHORIZATION:%{HTTP:Authorization}]

    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteCond %{REQUEST_FILENAME} !-f
    RewriteRule ^ index.php [L]
</IfModule>
```

### Step 9: Configure HTTPS

```bash
# Most hosting provides free SSL via AutoSSL
# Activate it in your hosting control panel

# Or use Let's Encrypt (if SSH available)
# Ask hosting provider for their setup instructions
```

### Step 10: Update Frontend Configuration

Edit `employee-profile/config.js`:

```javascript
// Change from:
const API_BASE = 'http://127.0.0.1:8000/api';

// To:
const API_BASE = 'https://your-domain.com/api';
const PHOTO_BASE = 'https://your-domain.com/storage/uploads/';
```

### Step 11: Test

Visit your domain:
```
https://your-domain.com/employee-profile/
```

**Expected:**
- Login page loads
- Server status shows online
- No console errors (F12)

---

## 🏢 Deploy to VPS (cPanel/Plesk)

### Step 1: Setup VPS with cPanel

```bash
# SSH into VPS
ssh root@your-vps-ip

# Create addon domain in cPanel
# Or via command line:
/scripts/addaddon your-domain.com hrm

# This creates:
# /home/username/public_html/hrm/
```

### Step 2: Install Required Packages

```bash
# Update system
yum update -y

# Install PHP extensions
yum install php80-bcmath php80-xml php80-json -y

# Install Composer globally
curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer
```

### Step 3: Clone & Setup

```bash
cd /home/username/public_html/hrm

# Clone repo
git clone https://github.com/gamezarham760-hash/abc.git .

# Install dependencies
composer install --no-dev --optimize-autoloader

# Copy env
cp .env.example .env
php artisan key:generate

# Edit env file
nano .env
```

### Step 4: Database in cPanel

```bash
# Create database via cPanel -> MySQL Databases

# Or via command line:
mysql -u root -p
CREATE DATABASE abc_hrm;
CREATE USER 'hrm_user'@'localhost' IDENTIFIED BY 'strong_password';
GRANT ALL PRIVILEGES ON abc_hrm.* TO 'hrm_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### Step 5: Run Migrations

```bash
php artisan migrate --force
php artisan db:seed --class=AdminUserSeeder
```

### Step 6: Set Permissions (cPanel)

```bash
# cPanel user permissions (important!)
chown -R username:username /home/username/public_html/hrm/

# Storage permissions
chmod -R 775 storage/ bootstrap/cache/
chmod -R 775 public/storage/
```

### Step 7: Setup SSL (cPanel)

```bash
# In cPanel:
# 1. Go to AutoSSL
# 2. Select your domain
# 3. Click "Check for Certificate"

# Or use Let's Encrypt:
/scripts/install_lets_ssl_certificate --domain your-domain.com
```

### Step 8: Configure PHP

In cPanel -> PHP Configuration:
- PHP Version: 8.1 or higher
- Max Execution Time: 300
- Max Upload Size: 100MB
- Memory Limit: 256MB

---

## 🐳 Deploy to Docker

### Step 1: Create Dockerfile

**Dockerfile** (in project root):
```dockerfile
FROM php:8.1-fpm

# Install extensions
RUN apt-get update && apt-get install -y \
    libpng-dev \
    libjpeg-dev \
    libfreetype6-dev \
    git \
    zip \
    unzip \
    && docker-php-ext-configure gd \
    && docker-php-ext-install gd pdo pdo_mysql \
    && rm -rf /var/lib/apt/lists/*

# Install Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Set working directory
WORKDIR /var/www

# Copy project
COPY . .

# Install dependencies
RUN composer install --no-dev --optimize-autoloader

# Create storage symlink
RUN php artisan storage:link

# Change permissions
RUN chown -R www-data:www-data /var/www/storage /var/www/bootstrap/cache

EXPOSE 9000

CMD ["php-fpm"]
```

### Step 2: Create docker-compose.yml

**docker-compose.yml**:
```yaml
version: '3.8'

services:
  app:
    build: .
    container_name: hrm-app
    working_dir: /var/www
    volumes:
      - ./:/var/www
    networks:
      - hrm-network

  nginx:
    image: nginx:alpine
    container_name: hrm-nginx
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./:/var/www
      - ./docker/nginx/conf.d:/etc/nginx/conf.d
      - ./docker/nginx/ssl:/etc/nginx/ssl
    depends_on:
      - app
    networks:
      - hrm-network

  db:
    image: mysql:8.0
    container_name: hrm-db
    environment:
      MYSQL_ROOT_PASSWORD: root_password
      MYSQL_DATABASE: hrm_db
      MYSQL_USER: hrm_user
      MYSQL_PASSWORD: user_password
    volumes:
      - mysql_data:/var/lib/mysql
    ports:
      - "3306:3306"
    networks:
      - hrm-network

volumes:
  mysql_data:

networks:
  hrm-network:
    driver: bridge
```

### Step 3: Deploy to Production

```bash
# Build images
docker-compose build

# Start services
docker-compose up -d

# Run migrations
docker-compose exec app php artisan migrate --force

# Check logs
docker-compose logs -f

# Access container shell
docker-compose exec app bash
```

---

## ☁️ Deploy to Cloud Platforms

### Heroku Deployment

```bash
# Install Heroku CLI
# https://devcenter.heroku.com/articles/heroku-cli

# Login
heroku login

# Create app
heroku create your-hrm-app

# Add buildpack
heroku buildpacks:set heroku/php

# Set config variables
heroku config:set APP_ENV=production
heroku config:set APP_DEBUG=false
heroku config:set APP_KEY=<your-app-key>

# Push code
git push heroku main

# Run migrations
heroku run php artisan migrate --force
```

### AWS Deployment (Elastic Beanstalk)

```bash
# Install EB CLI
pip install awsebcli

# Initialize
eb init -p "PHP 8.1 running on 64bit Amazon Linux 2" hrm-app

# Create environment
eb create hrm-prod

# Deploy
git push

# Check health
eb health

# View logs
eb logs
```

### DigitalOcean App Platform

1. Connect GitHub repository
2. Select `rescue1122-api` as build directory
3. Set environment variables in dashboard
4. Deploy automatically on push

---

## 🔒 Security Hardening

### 1. Update All Passwords

```bash
# Database password
# Admin user password (run in app)
php artisan tinker
> User::find(1)->update(['password' => Hash::make('new-secure-password')]);
> exit
```

### 2. Configure HTTPS/SSL

```bash
# Force HTTPS in .env
FORCE_HTTPS=true

# In Laravel (app/Http/Middleware/TrustProxies.php):
protected $proxies = '*';
protected $headers = Request::HEADER_X_FORWARDED_ALL;
```

### 3. Setup Security Headers

**nginx.conf or .htaccess:**
```nginx
# Strict Transport Security
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

# Content Security Policy
add_header Content-Security-Policy "default-src 'self'; style-src 'self' 'unsafe-inline' fonts.googleapis.com; font-src fonts.gstatic.com;" always;

# X-Frame-Options
add_header X-Frame-Options "SAMEORIGIN" always;

# X-Content-Type-Options
add_header X-Content-Type-Options "nosniff" always;
```

### 4. Disable Directory Listing

```apache
<Directory /var/www/html>
    Options -Indexes
</Directory>
```

### 5. Setup Rate Limiting

**Laravel config/rate-limit.php:**
```php
return [
    'api' => '60,1',  // 60 requests per minute
    'login' => '5,1', // 5 login attempts per minute
];
```

### 6. Setup Web Application Firewall (WAF)

- Enable ModSecurity (Apache)
- Use Cloudflare DDoS protection
- Configure firewall rules for SQL injection, XSS, etc.

### 7. Regular Security Updates

```bash
# Weekly: Update packages
composer update

# Monthly: Run security audit
composer audit

# Check for vulnerabilities
composer require roave/security-advisories --dev
```

---

## ⚡ Performance Optimization

### 1. Enable Caching

```bash
# Config caching
php artisan config:cache

# Route caching
php artisan route:cache

# View caching
php artisan view:cache

# Combined
php artisan optimize
```

### 2. Database Optimization

```bash
# Add indexes
php artisan db:seed --class=IndexSeeder

# Run query optimization
php artisan tinker
> DB::statement('OPTIMIZE TABLE employees');
> DB::statement('OPTIMIZE TABLE attendance');
```

### 3. Nginx Performance

```nginx
# nginx.conf
http {
    gzip on;
    gzip_types text/plain text/css application/json application/javascript;
    gzip_vary on;
    
    # Caching
    expires 30d;
    add_header Cache-Control "public, immutable";
}
```

### 4. CDN Setup

```javascript
// In config.js, use CDN for static assets
const PHOTO_BASE = 'https://cdn.your-domain.com/photos/';
```

### 5. Database Connection Pooling

```env
# Use persistent connections
DB_POOL=20
```

---

## 📊 Monitoring & Maintenance

### 1. Setup Error Logging

```env
# .env
LOG_CHANNEL=daily
LOG_LEVEL=error
SENTRY_DSN=https://your-sentry-dsn@sentry.io/project
```

### 2. Monitor Server Health

```bash
# Check disk space
df -h

# Check memory
free -m

# Check CPU
top

# Check logs
tail -f /var/log/apache2/error.log
tail -f /var/log/nginx/error.log
```

### 3. Database Backups

```bash
# Daily automated backup
0 2 * * * mysqldump -u root -p[password] abc_hrm > /backups/hrm-$(date +\%Y\%m\%d).sql

# Or use Laravel backup
php artisan backup:run
```

### 4. Monitor API Uptime

Use services like:
- **Pingdom** - Uptime monitoring
- **UptimeRobot** - Status page
- **New Relic** - Performance monitoring
- **Sentry** - Error tracking

### 5. Setup Alerts

```bash
# Email alerts on errors
# Configure in .env
MAIL_DRIVER=smtp
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-app-password
```

---

## 🐛 Troubleshooting

### Issue: 500 Internal Server Error

```bash
# Check Laravel logs
tail -f storage/logs/laravel.log

# Clear caches
php artisan cache:clear
php artisan route:clear
php artisan config:clear
php artisan view:clear

# Check permissions
chmod -R 775 storage/
```

### Issue: Database Connection Refused

```bash
# Verify credentials
php artisan tinker
> DB::connection()->getPdo();

# Check if MySQL is running
mysql -u root -p

# Check connection string in .env
```

### Issue: CORS Errors

```php
// config/cors.php
return [
    'paths' => ['api/*'],
    'allowed_methods' => ['*'],
    'allowed_origins' => [env('FRONTEND_URL')],
    'allowed_origins_patterns' => [],
    'allowed_headers' => ['*'],
    'exposed_headers' => [],
    'max_age' => 0,
    'supports_credentials' => false,
];
```

### Issue: Slow Performance

```bash
# Analyze slow queries
php artisan tinker
> DB::enableQueryLog();
> // Run query
> dd(DB::getQueryLog());

# Add indexes
php artisan migrate:rollback
php artisan migrate
```

### Issue: File Upload Errors

```bash
# Check permissions
ls -la public/storage/

# Create symlink
php artisan storage:link

# Check PHP settings
php -i | grep upload_max_filesize
php -i | grep post_max_size
```

---

## 🔄 Rollback Procedures

### Rollback to Previous Version

```bash
# Show recent commits
git log --oneline -10

# Revert to previous commit
git revert <commit-hash>
git push origin main

# Or rollback database
php artisan migrate:rollback
```

### Zero-Downtime Deployment

```bash
# 1. Deploy code to new release
rsync -avz . /releases/hrm-v2/

# 2. Run migrations
php /releases/hrm-v2/artisan migrate --force

# 3. Switch symlink
rm /current
ln -s /releases/hrm-v2 /current

# 4. If issue, switch back
rm /current
ln -s /releases/hrm-v1 /current
```

### Database Rollback

```bash
# Backup before migration
mysqldump -u root -p abc_hrm > backup-before-migration.sql

# Rollback if needed
mysql -u root -p abc_hrm < backup-before-migration.sql

# Or use Laravel rollback
php artisan migrate:rollback --step=1
```

---

## 📞 Support & Help

- **Documentation:** Check README.md
- **Issues:** GitHub issues page
- **Community:** Stack Overflow tag: `rescue-1122-hrm`
- **Email:** support@rescue1122.com

---

## ✅ Post-Deployment Checklist

After deployment:

- [ ] Login works with production credentials
- [ ] All pages load without errors
- [ ] Employee data displays correctly
- [ ] File uploads work
- [ ] Reports generate successfully
- [ ] Backups are scheduled
- [ ] Monitoring is active
- [ ] SSL certificate is valid
- [ ] Redirects work (http → https)
- [ ] Performance is acceptable (<2s load time)
- [ ] Mobile responsive
- [ ] Email notifications work
- [ ] Admin dashboard displays stats
- [ ] No console errors
- [ ] Database backups confirmed

---

**Deployment Date:** _______________
**Deployed By:** _______________
**Version:** _______________
**Status:** ✅ Production Live

---

*Last Updated: May 24, 2026*
*For updates, visit: https://github.com/gamezarham760-hash/abc/blob/main/DEPLOYMENT.md*
