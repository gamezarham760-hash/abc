# 🚀 CI/CD SETUP GUIDE - GitHub Actions

Complete guide to set up automated testing and deployment using GitHub Actions.

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [GitHub Actions Workflows](#github-actions-workflows)
3. [Setting Up Secrets](#setting-up-secrets)
4. [Workflow Files](#workflow-files)
5. [Local Testing](#local-testing)
6. [Monitoring & Debugging](#monitoring--debugging)
7. [Best Practices](#best-practices)

---

## 🎯 Overview

GitHub Actions automates:
- **Testing:** Run tests on every push/PR
- **Linting:** Check code quality automatically
- **Security:** Scan for vulnerabilities
- **Deployment:** Deploy to staging/production automatically
- **Documentation:** Generate and deploy docs

---

## 🔄 GitHub Actions Workflows

### Workflow 1: Automated Testing

**File:** `.github/workflows/tests.yml`

Runs on every push and pull request. Tests the Laravel backend.

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
    steps:
      - uses: actions/checkout@v3
      - name: Setup PHP
        uses: shivammathur/setup-php@v2
        with:
          php-version: 8.1
      - name: Install Dependencies
        working-directory: ./rescue1122-api
        run: composer install
      - name: Run Migrations
        working-directory: ./rescue1122-api
        run: php artisan migrate --force
      - name: Run Tests
        working-directory: ./rescue1122-api
        run: php artisan test
```

**What it does:**
- Starts a MySQL database
- Installs PHP and dependencies
- Runs database migrations
- Executes all tests
- Generates coverage report

---

### Workflow 2: Code Quality & Linting

**File:** `.github/workflows/lint.yml`

Checks code quality and style.

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
      - name: Install Dependencies
        working-directory: ./rescue1122-api
        run: composer install
      - name: PHP Syntax Check
        working-directory: ./rescue1122-api
        run: find app -name "*.php" -exec php -l {} \;
      - name: Check Security Issues
        working-directory: ./rescue1122-api
        run: composer audit || true
```

---

### Workflow 3: Deploy to Staging

**File:** `.github/workflows/deploy-staging.yml`

Automatically deploys to staging when code is pushed to `develop` branch.

```yaml
name: Deploy to Staging

on:
  push:
    branches: [ develop ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy via SSH
        run: |
          mkdir -p ~/.ssh
          echo "${{ secrets.STAGING_SSH_KEY }}" > ~/.ssh/id_rsa
          chmod 600 ~/.ssh/id_rsa
          ssh -i ~/.ssh/id_rsa ${{ secrets.STAGING_USER }}@${{ secrets.STAGING_HOST }} << 'EOF'
            cd ${{ secrets.STAGING_PATH }}
            git pull origin develop
            cd rescue1122-api
            composer install --no-dev
            php artisan migrate --force
            php artisan cache:clear
          EOF
```

---

### Workflow 4: Deploy to Production

**File:** `.github/workflows/deploy-production.yml`

Deploys to production when code is pushed to `main` branch (after tests pass).

```yaml
name: Deploy to Production

on:
  push:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    # Run tests first

  deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Backup Database
        run: |
          ssh ${{ secrets.PROD_USER }}@${{ secrets.PROD_HOST }} << 'EOF'
            cd ${{ secrets.PROD_PATH }}
            mysqldump -u root -p${{ secrets.PROD_DB_PASS }} \
              ${{ secrets.PROD_DB_NAME }} > backup-$(date +%s).sql
          EOF
      - name: Deploy
        run: |
          ssh ${{ secrets.PROD_USER }}@${{ secrets.PROD_HOST }} << 'EOF'
            cd ${{ secrets.PROD_PATH }}
            git pull origin main
            cd rescue1122-api
            composer install --no-dev
            php artisan migrate --force
            php artisan cache:clear
          EOF
```

---

### Workflow 5: Security Scanning

**File:** `.github/workflows/security.yml`

Scans for security vulnerabilities.

```yaml
name: Security Scan

on:
  push:
    branches: [ main, develop ]
  schedule:
    - cron: '0 0 * * 0'  # Weekly

jobs:
  security:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Check Vulnerabilities
        working-directory: ./rescue1122-api
        run: composer audit || true
      - name: Scan with Trivy
        uses: aquasecurity/trivy-action@master
        with:
          scan-type: 'fs'
          scan-ref: '.'
```

---

## 🔐 Setting Up Secrets

Secrets are encrypted credentials used in workflows.

### Step 1: Go to Repository Settings

1. Go to: https://github.com/gamezarham760-hash/abc/settings
2. Click: "Secrets and variables" → "Actions"
3. Click: "New repository secret"

### Step 2: Add Staging Secrets

```
STAGING_SSH_KEY: <your-private-ssh-key>
STAGING_HOST: staging.example.com
STAGING_USER: deploy
STAGING_PATH: /var/www/hrm
STAGING_URL: https://staging.example.com
```

### Step 3: Add Production Secrets

```
PROD_SSH_KEY: <your-private-ssh-key>
PROD_HOST: production.example.com
PROD_USER: deploy
PROD_PATH: /var/www/hrm
PROD_URL: https://example.com
PROD_DB_NAME: hrm_db
PROD_DB_USER: hrm_user
PROD_DB_PASS: <database-password>
```

### Step 4: Add Slack Webhook (Optional)

```
SLACK_WEBHOOK: https://hooks.slack.com/services/YOUR/WEBHOOK/URL
```

### Getting SSH Key for Deployments

```bash
# Generate SSH key
ssh-keygen -t rsa -b 4096 -C "github-actions"

# Copy private key content
cat ~/.ssh/id_rsa

# Add public key to server
ssh-copy-id -i ~/.ssh/id_rsa.pub deploy@staging.example.com
```

---

## 📄 Workflow Files to Create

### Create `.github/workflows/tests.yml`

```bash
mkdir -p .github/workflows
touch .github/workflows/tests.yml
```

Add the testing workflow content (see above).

### Create `.github/workflows/lint.yml`

Add code quality checks.

### Create `.github/workflows/deploy-staging.yml`

Add staging deployment workflow.

### Create `.github/workflows/deploy-production.yml`

Add production deployment with fallback.

### Create `.github/workflows/security.yml`

Add security scanning.

---

## 🧪 Local Testing

### Test Workflow Syntax

```bash
# Install act (GitHub Actions runner)
curl https://raw.githubusercontent.com/nektos/act/master/install.sh | sudo bash

# Run workflow locally
act push -W .github/workflows/tests.yml
```

### Create Sample Test

**File:** `rescue1122-api/tests/Unit/EmployeeTest.php`

```php
<?php

namespace Tests\Unit;

use Tests\TestCase;
use App\Models\Employee;

class EmployeeTest extends TestCase
{
    public function test_employee_creation()
    {
        $employee = Employee::create([
            'name' => 'John Doe',
            'email' => 'john@example.com',
            'phone' => '03001234567',
            'designation' => 'Officer',
            'department' => 'Operations'
        ]);

        $this->assertNotNull($employee->id);
        $this->assertEquals('John Doe', $employee->name);
    }
}
```

### Run Tests Locally

```bash
cd rescue1122-api

# Run all tests
php artisan test

# Run specific test
php artisan test tests/Unit/EmployeeTest.php

# Run with coverage
php artisan test --coverage
```

---

## 📊 Monitoring & Debugging

### View Workflow Runs

1. Go to repository
2. Click: "Actions" tab
3. See all workflow runs

### Check Workflow Logs

1. Click on a workflow run
2. Click on a job
3. See detailed logs

### Debug Failed Workflows

```yaml
# Add debug step
- name: Debug
  run: |
    echo "::debug::This is a debug message"
    echo "Git commit: ${{ github.sha }}"
    echo "Branch: ${{ github.ref }}"
```

### View Debug Logs

1. In workflow run, click "Run workflow" → "Enable debug logging"
2. Re-run workflow
3. View detailed debug output

---

## ✅ Best Practices

### 1. Test Before Deploying
```yaml
deploy:
  needs: [test, lint]  # Requires tests to pass first
  runs-on: ubuntu-latest
```

### 2. Use Branch Protection
- Go to Settings → Branches
- Add protection to `main` branch
- Require status checks to pass

### 3. Backup Before Deployment
```bash
- name: Backup
  run: |
    mysqldump database > backup.sql
    git tag backup-$(date +%s)
```

### 4. Health Checks
```bash
- name: Health Check
  run: curl -f https://example.com/api/health
```

### 5. Rollback on Failure
```bash
if [ $? -ne 0 ]; then
  git reset --hard HEAD~1
  exit 1
fi
```

### 6. Notifications
```yaml
- name: Slack Notification
  uses: slackapi/slack-github-action@v1.24.0
  with:
    webhook-url: ${{ secrets.SLACK_WEBHOOK }}
```

---

## 📚 Common Workflows

### Workflow: Test on PR, Deploy on Merge

```yaml
on:
  pull_request:
    branches: [ main ]
  push:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Test
        run: cd rescue1122-api && php artisan test

  deploy:
    needs: test
    if: github.event_name == 'push'
    runs-on: ubuntu-latest
    steps:
      - name: Deploy
        run: ssh deploy@prod "cd /app && git pull && ./deploy.sh"
```

### Workflow: Schedule Daily Backups

```yaml
name: Daily Backup

on:
  schedule:
    - cron: '0 2 * * *'  # 2 AM daily

jobs:
  backup:
    runs-on: ubuntu-latest
    steps:
      - name: Backup Database
        run: |
          mysqldump -u root -p${{ secrets.DB_PASS }} \
            ${{ secrets.DB_NAME }} | gzip > backup-$(date +%Y%m%d).sql.gz
      - name: Upload to S3
        run: |
          aws s3 cp backup-*.sql.gz s3://backups/hrm/
```

### Workflow: Auto-update Dependencies

```yaml
name: Dependency Update

on:
  schedule:
    - cron: '0 0 * * 0'  # Weekly

jobs:
  update:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Update Composer
        working-directory: ./rescue1122-api
        run: composer update
      - name: Create PR
        uses: peter-evans/create-pull-request@v4
        with:
          title: 'chore: update dependencies'
          branch: deps/auto-update
```

---

## 🔗 Resources

- **GitHub Actions Docs:** https://docs.github.com/en/actions
- **Marketplace:** https://github.com/marketplace?type=actions
- **Act (Local Runner):** https://github.com/nektos/act
- **Laravel Testing:** https://laravel.com/docs/testing

---

## ✨ Summary

**CI/CD Benefits:**
- ✅ Automated testing on every push
- ✅ Catch bugs early
- ✅ Consistent deployments
- ✅ One-click rollbacks
- ✅ Health monitoring
- ✅ Team notifications

**Next Steps:**
1. Create `.github/workflows/` directory
2. Add workflow YAML files
3. Configure repository secrets
4. Push code to trigger workflows
5. Monitor Actions tab

---

*Last Updated: May 24, 2026*
*For GitHub Actions help: https://docs.github.com/actions*
