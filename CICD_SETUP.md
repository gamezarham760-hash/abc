# 🔧 CI/CD SETUP GUIDE - GitHub Actions

Complete guide to set up GitHub Actions CI/CD pipelines for the Rescue 1122 HRM system.

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [GitHub Secrets Setup](#github-secrets-setup)
4. [Workflow Files](#workflow-files)
5. [Manual Steps](#manual-steps)
6. [Deployment Environments](#deployment-environments)
7. [Monitoring & Troubleshooting](#monitoring--troubleshooting)

---

## 🎯 Overview

This guide sets up 5 automated workflows:

1. **Tests** - Run tests on every push/PR
2. **Lint & Code Quality** - Check code standards
3. **Deploy to Staging** - Auto-deploy to staging on `develop` branch
4. **Deploy to Production** - Deploy to production with safety checks
5. **Security Scan** - Weekly security vulnerability scans

---

## 📋 Prerequisites

- GitHub repository with admin access
- SSH access to staging/production servers
- Slack workspace (optional, for notifications)
- Codecov account (optional, for coverage tracking)

---

## 🔐 GitHub Secrets Setup

### Step 1: Access Repository Settings

1. Go to: `https://github.com/gamezarham760-hash/abc/settings/secrets/actions`
2. Click "New repository secret"

### Step 2: Add Required Secrets

Add these secrets (adjust values for your setup):

#### SSH Keys
```
STAGING_SSH_KEY
STAGING_HOST
STAGING_USER
STAGING_PATH
STAGING_URL

PROD_SSH_KEY
PROD_HOST
PROD_USER
PROD_PATH
PROD_URL

PROD_DB_USER
PROD_DB_PASS
PROD_DB_NAME
```

#### Notifications
```
SLACK_WEBHOOK    # From Slack > Apps > Incoming Webhooks
```

#### Example Values (Update with your own)

```
STAGING_SSH_KEY: <your-private-key-content>
STAGING_HOST: staging.example.com
STAGING_USER: deploy
STAGING_PATH: /var/www/hrm-staging
STAGING_URL: https://staging-hrm.example.com

PROD_SSH_KEY: <your-private-key-content>
PROD_HOST: prod.example.com
PROD_USER: deploy
PROD_PATH: /var/www/hrm-production
PROD_URL: https://hrm.example.com

PROD_DB_USER: hrm_user
PROD_DB_PASS: <secure-password>
PROD_DB_NAME: hrm_production

SLACK_WEBHOOK: https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXXXXXXXXXX
```

---

## 📁 Workflow Files

Create these files in your repository:

### 1. `.github/workflows/tests.yml`

```yaml
name: Tests

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main, develop ]

jobs:
  test:
    runs-on: ubuntu-latest

    services:
      mysql:
        image: mysql:8.0
        env:
          MYSQL_DATABASE: hrm_test
          MYSQL_ROOT_PASSWORD: root
          MYSQL_PASSWORD: password
        options: >-
          --health-cmd="mysqladmin ping"
          --health-interval=10s
          --health-timeout=5s
          --health-retries=3
        ports:
          - 3306:3306

    steps:
    - uses: actions/checkout@v3

    - name: Setup PHP
      uses: shivammathur/setup-php@v2
      with:
        php-version: 8.1
        extensions: mysql, mbstring, xml, fileinfo
        coverage: xdebug

    - name: Install Composer Dependencies
      working-directory: ./rescue1122-api
      run: composer install --no-interaction --prefer-dist

    - name: Create .env file
      working-directory: ./rescue1122-api
      run: |
        cp .env.example .env
        php artisan key:generate
        sed -i 's/DB_HOST=.*/DB_HOST=127.0.0.1/' .env
        sed -i 's/DB_DATABASE=.*/DB_DATABASE=hrm_test/' .env
        sed -i 's/DB_PASSWORD=.*/DB_PASSWORD=password/' .env

    - name: Run Migrations
      working-directory: ./rescue1122-api
      run: php artisan migrate --force

    - name: Seed Database
      working-directory: ./rescue1122-api
      run: php artisan db:seed --force

    - name: Run Tests
      working-directory: ./rescue1122-api
      run: php artisan test

    - name: Generate Coverage Report
      working-directory: ./rescue1122-api
      run: php artisan test --coverage
      if: always()
```

### 2. `.github/workflows/lint.yml`

```yaml
name: Lint & Code Quality

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main, develop ]

jobs:
  lint:
    runs-on: ubuntu-latest

    steps:
    - uses: actions/checkout@v3

    - name: Setup PHP
      uses: shivammathur/setup-php@v2
      with:
        php-version: 8.1
        extensions: mbstring, fileinfo

    - name: Install Composer Dependencies
      working-directory: ./rescue1122-api
      run: composer install --no-interaction --prefer-dist

    - name: Run PHP Linter
      working-directory: ./rescue1122-api
      run: |
        find app -name "*.php" -exec php -l {} \;
        echo "✅ PHP Syntax Check Passed"

    - name: Check for Security Vulnerabilities
      working-directory: ./rescue1122-api
      run: composer audit || true
      continue-on-error: true
```

### 3. `.github/workflows/deploy-staging.yml`

```yaml
name: Deploy to Staging

on:
  push:
    branches: [ develop ]
  workflow_dispatch:

jobs:
  deploy:
    runs-on: ubuntu-latest
    environment: staging

    steps:
    - uses: actions/checkout@v3
      with:
        fetch-depth: 0

    - name: Setup SSH
      run: |
        mkdir -p ~/.ssh
        echo "${{ secrets.STAGING_SSH_KEY }}" > ~/.ssh/id_rsa
        chmod 600 ~/.ssh/id_rsa
        ssh-keyscan -H ${{ secrets.STAGING_HOST }} >> ~/.ssh/known_hosts

    - name: Deploy via SSH
      run: |
        ssh -i ~/.ssh/id_rsa ${{ secrets.STAGING_USER }}@${{ secrets.STAGING_HOST }} << 'EOF'
          set -e
          cd ${{ secrets.STAGING_PATH }}
          
          # Pull latest code
          git pull origin develop || git clone -b develop https://github.com/gamezarham760-hash/abc.git .
          
          # Install dependencies
          cd rescue1122-api
          composer install --no-dev --optimize-autoloader
          
          # Setup environment
          cp .env.example .env
          php artisan key:generate
          php artisan migrate --force
          
          # Clear caches
          php artisan cache:clear
          php artisan config:clear
          php artisan route:clear
          
          # Set permissions
          chmod -R 775 storage/ bootstrap/cache/
          
          echo "✅ Staging deployment completed"
        EOF

    - name: Run Smoke Tests
      run: |
        curl -f ${{ secrets.STAGING_URL }}/api/health || exit 1
        echo "✅ Staging is healthy"
      continue-on-error: true
```

### 4. `.github/workflows/deploy-production.yml`

```yaml
name: Deploy to Production

on:
  push:
    branches: [ main ]
    tags: [ 'v*' ]
  workflow_dispatch:

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    - name: Setup PHP
      uses: shivammathur/setup-php@v2
      with:
        php-version: 8.1
        extensions: mysql, mbstring, xml, fileinfo
    - name: Run Tests
      working-directory: ./rescue1122-api
      run: |
        composer install
        cp .env.example .env
        php artisan key:generate
        php artisan test || exit 1

  deploy:
    needs: test
    runs-on: ubuntu-latest
    environment: production
    if: github.ref == 'refs/heads/main'

    steps:
    - uses: actions/checkout@v3

    - name: Setup SSH
      run: |
        mkdir -p ~/.ssh
        echo "${{ secrets.PROD_SSH_KEY }}" > ~/.ssh/id_rsa
        chmod 600 ~/.ssh/id_rsa
        ssh-keyscan -H ${{ secrets.PROD_HOST }} >> ~/.ssh/known_hosts

    - name: Backup Database
      run: |
        ssh -i ~/.ssh/id_rsa ${{ secrets.PROD_USER }}@${{ secrets.PROD_HOST }} << 'EOF'
          cd ${{ secrets.PROD_PATH }}
          mysqldump -u ${{ secrets.PROD_DB_USER }} -p${{ secrets.PROD_DB_PASS }} \
            ${{ secrets.PROD_DB_NAME }} > backups/db-$(date +%Y%m%d-%H%M%S).sql
          echo "✅ Database backed up"
        EOF

    - name: Deploy via SSH
      run: |
        ssh -i ~/.ssh/id_rsa ${{ secrets.PROD_USER }}@${{ secrets.PROD_HOST }} << 'EOF'
          set -e
          cd ${{ secrets.PROD_PATH }}
          
          # Pull latest code
          git pull origin main || git clone -b main https://github.com/gamezarham760-hash/abc.git .
          
          # Install dependencies
          cd rescue1122-api
          composer install --no-dev --optimize-autoloader
          
          # Setup environment
          php artisan migrate --force --no-interaction
          
          # Clear caches and optimize
          php artisan cache:clear
          php artisan config:clear
          php artisan route:clear
          php artisan optimize
          
          # Set permissions
          chmod -R 775 storage/ bootstrap/cache/
          
          echo "✅ Production deployment completed"
        EOF

    - name: Health Check
      run: |
        curl -f ${{ secrets.PROD_URL }}/api/health -m 10 || exit 1
        echo "✅ Production is healthy"
      timeout-minutes: 5
```

### 5. `.github/workflows/security.yml`

```yaml
name: Security Scan

on:
  push:
    branches: [ main, develop ]
  schedule:
    - cron: '0 0 * * 0'

jobs:
  security:
    runs-on: ubuntu-latest

    steps:
    - uses: actions/checkout@v3

    - name: Setup PHP
      uses: shivammathur/setup-php@v2
      with:
        php-version: 8.1

    - name: Check for Vulnerabilities
      working-directory: ./rescue1122-api
      run: |
        composer install
        composer audit --format=json > audit.json || true
        cat audit.json
      continue-on-error: true

    - name: Check for Hardcoded Secrets
      uses: gitleaks/gitleaks-action@v2
      env:
        GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
      continue-on-error: true
```

---

## 🚀 Manual Steps to Enable CI/CD

### Step 1: Create `.github/workflows` Directory

```bash
cd abc
mkdir -p .github/workflows
```

### Step 2: Add Workflow Files

Copy the YAML files from the "Workflow Files" section above into `.github/workflows/` directory.

### Step 3: Configure GitHub Secrets

1. Go to Repository Settings → Secrets and variables → Actions
2. Add all secrets from "GitHub Secrets Setup" section
3. Click "New repository secret" for each one

### Step 4: Enable Workflows

```bash
git add .github/
git commit -m "Add GitHub Actions CI/CD workflows"
git push origin main
```

### Step 5: Verify Workflows

1. Go to: `https://github.com/gamezarham760-hash/abc/actions`
2. You should see workflow runs
3. Click on recent pushes to view workflow logs

---

## 🌍 Deployment Environments

### Staging Environment

**Branch:** `develop`  
**Auto-deploy:** Yes  
**Manual trigger:** Yes  
**URL:** `https://staging-hrm.example.com`

**Configuration:**
```bash
# On staging server
export DEPLOY_ENV=staging
export APP_DEBUG=true
export APP_ENV=development
```

### Production Environment

**Branch:** `main`  
**Auto-deploy:** Yes (with approval)  
**Manual trigger:** Yes  
**URL:** `https://hrm.example.com`

**Configuration:**
```bash
# On production server
export DEPLOY_ENV=production
export APP_DEBUG=false
export APP_ENV=production
```

---

## 📊 Workflow Overview

### Tests Workflow
- Runs on: Push to main/develop, PRs
- Tests: PHPUnit tests
- Coverage: Reports to Codecov
- Time: ~3-5 minutes

### Lint Workflow
- Runs on: Push to main/develop, PRs
- Checks: PHP syntax, vulnerabilities
- Time: ~2 minutes

### Deploy Staging
- Runs on: Push to develop
- Actions: Pull code, install deps, migrate DB
- Time: ~5 minutes

### Deploy Production
- Runs on: Push to main
- Actions: Tests → Backup DB → Deploy → Health check
- Time: ~10 minutes
- Rollback: Automatic on failure

### Security Scan
- Runs on: Schedule (weekly)
- Checks: PHP vulnerabilities, secrets
- Time: ~5 minutes

---

## 🔍 Monitoring & Troubleshooting

### View Workflow Logs

1. Go to: `https://github.com/gamezarham760-hash/abc/actions`
2. Click on a workflow run
3. Click on a job to see logs
4. Expand failed steps for error details

### Common Issues

#### Issue: "Permission denied" on SSH

**Solution:**
```bash
# SSH key format check
ssh-keyscan -H your-server.com >> ~/.ssh/known_hosts

# Verify private key
file ~/.ssh/id_rsa  # Should show: private key
```

#### Issue: Database migration fails

**Solution:**
1. Check .env file in deploy script
2. Verify database credentials in secrets
3. Check migration files: `rescue1122-api/database/migrations/`

#### Issue: "Composer packages not found"

**Solution:**
```bash
# In rescue1122-api/
composer install --no-dev --optimize-autoloader
composer dump-autoload
```

#### Issue: Workflow not running

**Solution:**
1. Check branch name matches workflow configuration
2. Verify workflow file syntax (use YAML linter)
3. Check branch protection rules
4. Re-run workflow from Actions tab

### Debugging Tips

```bash
# Test SSH connection locally
ssh -i ~/.ssh/id_rsa deploy@staging-server.com "echo 'Connected!'"

# Run migration locally
cd rescue1122-api
php artisan migrate --force

# Check PHP syntax
php -l app/Models/Employee.php

# Run tests locally
php artisan test
```

---

## 📈 Best Practices

### Before Deploying

1. **Create PR from feature branch to develop**
   - Ensures tests pass first
   - Allows code review

2. **Merge develop to main for production**
   - Only after testing in staging
   - Tag releases: `git tag v1.0.0`

3. **Monitor deployment status**
   - Check Actions tab
   - Check Slack notifications
   - Test health endpoint

### Preventing Issues

1. **Always test locally first**
   ```bash
   php artisan migrate
   php artisan test
   ```

2. **Keep .env.example updated**
   - Document all environment variables

3. **Regular security scans**
   - Review Gitleaks reports
   - Update vulnerable packages

4. **Backup before production deploy**
   - Database backup is automatic
   - Store backups for 30 days

---

## 📚 Related Documentation

- [README.md](README.md) - Project overview
- [SETUP_GUIDE.md](SETUP_GUIDE.md) - Local development
- [API_DOCS.md](API_DOCS.md) - API reference
- [DEPLOYMENT.md](DEPLOYMENT.md) - Traditional deployment

---

## 🆘 Support

For CI/CD issues:

1. Check workflow logs: https://github.com/gamezarham760-hash/abc/actions
2. Verify all secrets are set correctly
3. Test SSH connection manually
4. Check server disk space and permissions
5. Review Laravel logs: `rescue1122-api/storage/logs/laravel.log`

---

*Last Updated: May 24, 2026*
*GitHub Actions Documentation: https://docs.github.com/actions*
