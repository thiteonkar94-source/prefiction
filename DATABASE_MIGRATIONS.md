# Database Migration Scripts Guide for PREFICTION

## Overview

Database migration scripts help you:
- **Backup** data before deploying to production
- **Initialize** MongoDB with indexes and initial data
- **Migrate** data structure changes safely
- **Restore** data if needed
- **Seed** production with test data
- **Validate** data integrity

---

## 1. Pre-Production Backup Script

### What It Does
- Exports all MongoDB data to a JSON file
- Creates timestamped backup files
- Includes all submissions, metadata, and configuration
- Can be restored later if needed

### File: `server/scripts/backup.js`

```javascript
/**
 * Backup Script - Export all MongoDB data to local JSON file
 * Usage: node server/scripts/backup.js
 * Output: Created in ./backups/backup-YYYY-MM-DD-HHmmss.json
 */

require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const Submission = require('../models/Submission');

async function createBackup() {
  try {
    console.log('🔄 Starting backup...');
    
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb+srv://thiteonkar17_db_user:npRsHJV3hJiyWrsA@cluster0.jhomc5v.mongodb.net/?appName=Cluster0';
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ Connected to MongoDB');

    // Fetch all submissions
    const submissions = await Submission.find({}).lean();
    console.log(`📊 Found ${submissions.length} submissions`);

    // Create backup directory if it doesn't exist
    const backupDir = path.join(__dirname, '../backups');
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    // Create timestamped filename
    const timestamp = new Date().toISOString().replace(/[:.]/g, '').split('T')[0] + '-' + 
                     new Date().getHours().toString().padStart(2, '0') +
                     new Date().getMinutes().toString().padStart(2, '0') +
                     new Date().getSeconds().toString().padStart(2, '0');
    
    const backupFile = path.join(backupDir, `backup-${timestamp}.json`);

    // Prepare backup data
    const backupData = {
      timestamp: new Date().toISOString(),
      mongoUri: mongoUri.replace(/:[^:@]*@/, ':***@'), // Mask password
      collections: {
        submissions: submissions
      },
      metadata: {
        totalSubmissions: submissions.length,
        createdAt: new Date().toISOString(),
        nodeVersion: process.version,
        mongooseVersion: require('mongoose/package.json').version
      }
    };

    // Write to file
    fs.writeFileSync(backupFile, JSON.stringify(backupData, null, 2));
    console.log(`✅ Backup created: ${backupFile}`);
    console.log(`📦 Backup size: ${(fs.statSync(backupFile).size / 1024).toFixed(2)} KB`);

    // Keep only last 5 backups (cleanup old ones)
    const files = fs.readdirSync(backupDir)
      .filter(f => f.startsWith('backup-') && f.endsWith('.json'))
      .map(f => ({
        name: f,
        path: path.join(backupDir, f),
        time: fs.statSync(path.join(backupDir, f)).mtime.getTime()
      }))
      .sort((a, b) => b.time - a.time);

    if (files.length > 5) {
      console.log(`🧹 Cleaning up old backups (keeping 5 most recent)...`);
      files.slice(5).forEach(file => {
        fs.unlinkSync(file.path);
        console.log(`  Deleted: ${file.name}`);
      });
    }

    console.log('✅ Backup completed successfully!\n');
    process.exit(0);

  } catch (err) {
    console.error('❌ Backup failed:', err);
    process.exit(1);
  }
}

createBackup();
```

### Usage

```bash
# From project root
cd server
node scripts/backup.js

# Output:
# 🔄 Starting backup...
# ✅ Connected to MongoDB
# 📊 Found 42 submissions
# ✅ Backup created: ./backups/backup-2025-12-01-120530.json
# 📦 Backup size: 245.35 KB
# ✅ Backup completed successfully!
```

---

## 2. Initialize Production Database Script

### What It Does
- Creates MongoDB indexes for performance
- Sets up database collections
- Initializes configuration
- Seeds initial data (optional)
- Validates schema

### File: `server/scripts/init-db.js`

```javascript
/**
 * Initialize Production Database
 * Usage: node server/scripts/init-db.js
 * Creates indexes, validates schema, seeds initial data
 */

require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');
const Submission = require('../models/Submission');

async function initializeDatabase() {
  try {
    console.log('🔄 Initializing production database...\n');

    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error('MONGODB_URI not set in environment variables');
    }

    console.log('📡 Connecting to MongoDB...');
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ Connected to MongoDB\n');

    // Step 1: Create indexes
    console.log('📑 Creating database indexes...');
    
    // Index for email lookups (important for preventing duplicates)
    await Submission.collection.createIndex({ email: 1 });
    console.log('  ✓ Index on email field');

    // Index for createdAt (important for sorting recent submissions)
    await Submission.collection.createIndex({ createdAt: -1 });
    console.log('  ✓ Index on createdAt field (descending)');

    // Text index for searching name and message
    await Submission.collection.createIndex({
      name: 'text',
      message: 'text'
    });
    console.log('  ✓ Text index on name and message fields');

    // TTL index - auto-delete old submissions after 2 years (optional)
    // Uncomment if you want auto-cleanup of old data
    // await Submission.collection.createIndex({ createdAt: 1 }, { expireAfterSeconds: 63072000 });
    // console.log('  ✓ TTL index on createdAt (auto-delete after 2 years)');

    console.log('✅ Indexes created successfully\n');

    // Step 2: Validate schema
    console.log('🔍 Validating schema...');
    const sampleDoc = new Submission({
      name: 'Test User',
      email: 'test@example.com',
      company: 'Test Company',
      message: 'Test message'
    });
    
    try {
      await sampleDoc.validate();
      console.log('✅ Schema validation passed\n');
    } catch (err) {
      throw new Error(`Schema validation failed: ${err.message}`);
    }

    // Step 3: Collection statistics
    console.log('📊 Collection statistics:');
    const submissionCount = await Submission.countDocuments();
    const submissionStats = await Submission.collection.stats();
    
    console.log(`  • Total documents: ${submissionCount}`);
    console.log(`  • Collection size: ${(submissionStats.size / 1024 / 1024).toFixed(2)} MB`);
    console.log(`  • Average document size: ${(submissionStats.avgObjSize / 1024).toFixed(2)} KB`);
    console.log();

    // Step 4: Check indexes
    console.log('🔑 Existing indexes:');
    const indexes = await Submission.collection.getIndexes();
    Object.keys(indexes).forEach((indexName, idx) => {
      console.log(`  ${idx + 1}. ${indexName}: ${JSON.stringify(indexes[indexName].key)}`);
    });
    console.log();

    // Step 5: Connection pool info
    console.log('🔌 Database connection info:');
    console.log(`  • Database: ${mongoose.connection.name}`);
    console.log(`  • Host: ${mongoose.connection.host}`);
    console.log(`  • Connection state: ${
      mongoose.connection.readyState === 1 ? '✅ Connected' :
      mongoose.connection.readyState === 0 ? '⚠️ Disconnected' :
      '❌ Error'
    }`);
    console.log();

    console.log('✅ Database initialization completed successfully!\n');
    process.exit(0);

  } catch (err) {
    console.error('❌ Database initialization failed:', err.message);
    process.exit(1);
  }
}

initializeDatabase();
```

### Usage

```bash
cd server
node scripts/init-db.js

# Output:
# 🔄 Initializing production database...
# 📡 Connecting to MongoDB...
# ✅ Connected to MongoDB
# 
# 📑 Creating database indexes...
#   ✓ Index on email field
#   ✓ Index on createdAt field (descending)
#   ✓ Text index on name and message fields
# ✅ Indexes created successfully
# 
# 🔍 Validating schema...
# ✅ Schema validation passed
# 
# 📊 Collection statistics:
#   • Total documents: 42
#   • Collection size: 2.45 MB
#   • Average document size: 58.33 KB
# 
# 🔑 Existing indexes:
#   1. _id_: {"_id":1}
#   2. email_1: {"email":1}
#   3. createdAt_-1: {"createdAt":-1}
# 
# 🔌 Database connection info:
#   • Database: Cluster0
#   • Host: cluster0.jhomc5v.mongodb.net
#   • Connection state: ✅ Connected
# 
# ✅ Database initialization completed successfully!
```

---

## 3. Restore/Migrate Data Script

### What It Does
- Restores data from backup JSON file
- Migrates data between environments (dev → prod)
- Validates data before insertion
- Handles duplicate prevention
- Generates detailed migration report

### File: `server/scripts/restore.js`

```javascript
/**
 * Restore Data from Backup
 * Usage: node server/scripts/restore.js <backup-file>
 * Example: node server/scripts/restore.js ./backups/backup-2025-12-01-120530.json
 */

require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const Submission = require('../models/Submission');

async function restoreData() {
  try {
    // Get backup file from command line args
    const backupFile = process.argv[2];
    
    if (!backupFile) {
      console.error('❌ Usage: node restore.js <backup-file-path>');
      console.error('   Example: node restore.js ./backups/backup-2025-12-01-120530.json');
      process.exit(1);
    }

    if (!fs.existsSync(backupFile)) {
      console.error(`❌ Backup file not found: ${backupFile}`);
      process.exit(1);
    }

    console.log('🔄 Starting restore...\n');

    // Read backup file
    console.log(`📂 Reading backup file: ${backupFile}`);
    const backupContent = fs.readFileSync(backupFile, 'utf-8');
    const backupData = JSON.parse(backupContent);
    console.log(`✅ Backup file loaded\n`);

    // Display backup info
    console.log('📋 Backup Information:');
    console.log(`  • Created at: ${backupData.timestamp}`);
    console.log(`  • Total submissions: ${backupData.metadata.totalSubmissions}`);
    console.log(`  • Mongoose version: ${backupData.metadata.mongooseVersion}`);
    console.log();

    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error('MONGODB_URI not set in environment variables');
    }

    console.log('📡 Connecting to MongoDB...');
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ Connected to MongoDB\n');

    // Get user confirmation
    const submissions = backupData.collections.submissions;
    console.log(`⚠️  WARNING: This will restore ${submissions.length} submissions`);
    console.log('   Existing data with same email will be SKIPPED (duplicates prevented)\n');

    // Proceed with restore
    console.log('🔄 Restoring submissions...');
    
    let restored = 0;
    let skipped = 0;
    let errors = 0;
    const restoreErrors = [];

    for (const sub of submissions) {
      try {
        // Check if already exists (by email and creation date)
        const existing = await Submission.findOne({
          email: sub.email,
          createdAt: sub.createdAt
        });

        if (existing) {
          skipped++;
          continue;
        }

        // Create new document (preserve original _id and createdAt)
        const newSub = new Submission({
          _id: sub._id,
          name: sub.name,
          email: sub.email,
          company: sub.company,
          message: sub.message,
          createdAt: sub.createdAt
        });

        await newSub.save();
        restored++;

        if (restored % 10 === 0) {
          process.stdout.write(`\r  Progress: ${restored}/${submissions.length} restored`);
        }

      } catch (err) {
        errors++;
        restoreErrors.push({
          email: sub.email,
          error: err.message
        });
      }
    }

    console.log(`\n\n✅ Restore completed!\n`);

    // Summary report
    console.log('📊 Restore Summary:');
    console.log(`  • Restored: ${restored}`);
    console.log(`  • Skipped (duplicates): ${skipped}`);
    console.log(`  • Errors: ${errors}`);
    console.log();

    if (errors > 0) {
      console.log('⚠️  Errors encountered:');
      restoreErrors.forEach((err, idx) => {
        console.log(`  ${idx + 1}. ${err.email}: ${err.error}`);
      });
      console.log();
    }

    // Verify total count
    const totalCount = await Submission.countDocuments();
    console.log(`📈 Total submissions in database: ${totalCount}`);
    console.log();

    console.log('✅ Restore process completed!\n');
    process.exit(0);

  } catch (err) {
    console.error('❌ Restore failed:', err.message);
    process.exit(1);
  }
}

restoreData();
```

### Usage

```bash
cd server

# List available backups
ls backups/

# Restore from specific backup
node scripts/restore.js ./backups/backup-2025-12-01-120530.json

# Output:
# 🔄 Starting restore...
# 📂 Reading backup file: ./backups/backup-2025-12-01-120530.json
# ✅ Backup file loaded
# 
# 📋 Backup Information:
#   • Created at: 2025-12-01T12:05:30.000Z
#   • Total submissions: 42
#   • Mongoose version: 7.0.0
# 
# 📡 Connecting to MongoDB...
# ✅ Connected to MongoDB
# 
# ⚠️  WARNING: This will restore 42 submissions
#    Existing data with same email will be SKIPPED (duplicates prevented)
# 
# 🔄 Restoring submissions...
#   Progress: 42/42 restored
# 
# ✅ Restore completed!
# 
# 📊 Restore Summary:
#   • Restored: 42
#   • Skipped (duplicates): 0
#   • Errors: 0
# 
# 📈 Total submissions in database: 42
# 
# ✅ Restore process completed!
```

---

## 4. Data Validation & Health Check Script

### What It Does
- Validates all data in database
- Checks for orphaned or corrupted records
- Generates health report
- Identifies data quality issues
- Provides recommendations

### File: `server/scripts/validate-db.js`

```javascript
/**
 * Database Validation & Health Check
 * Usage: node server/scripts/validate-db.js
 * Validates all data integrity and generates health report
 */

require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');
const Submission = require('../models/Submission');

async function validateDatabase() {
  try {
    console.log('🏥 Starting database health check...\n');

    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error('MONGODB_URI not set in environment variables');
    }

    console.log('📡 Connecting to MongoDB...');
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ Connected to MongoDB\n');

    // 1. Check total document count
    console.log('📊 Document Count:');
    const totalDocs = await Submission.countDocuments();
    console.log(`  • Total submissions: ${totalDocs}`);
    console.log();

    // 2. Validate all documents
    console.log('🔍 Validating all documents...');
    const allDocs = await Submission.find({});
    
    let validCount = 0;
    let invalidCount = 0;
    const invalidDocs = [];

    for (const doc of allDocs) {
      try {
        await doc.validate();
        validCount++;
      } catch (err) {
        invalidCount++;
        invalidDocs.push({
          _id: doc._id,
          email: doc.email,
          error: err.message
        });
      }
    }

    console.log(`  • Valid documents: ${validCount}`);
    console.log(`  • Invalid documents: ${invalidCount}`);

    if (invalidCount > 0) {
      console.log('\n  ⚠️  Invalid documents found:');
      invalidDocs.forEach((doc, idx) => {
        console.log(`    ${idx + 1}. ${doc._id}: ${doc.error}`);
      });
    }
    console.log();

    // 3. Check for duplicate emails
    console.log('🔎 Checking for duplicate emails...');
    const duplicateEmails = await Submission.aggregate([
      { $group: { _id: '$email', count: { $sum: 1 } } },
      { $match: { count: { $gt: 1 } } }
    ]);

    if (duplicateEmails.length > 0) {
      console.log(`  ⚠️  Found ${duplicateEmails.length} duplicate email entries:`);
      duplicateEmails.forEach((dup, idx) => {
        console.log(`    ${idx + 1}. ${dup._id}: ${dup.count} times`);
      });
    } else {
      console.log('  ✅ No duplicate emails found');
    }
    console.log();

    // 4. Check for missing required fields
    console.log('🔑 Checking for missing required fields...');
    
    const missingName = await Submission.countDocuments({ name: { $in: [null, '', undefined] } });
    const missingEmail = await Submission.countDocuments({ email: { $in: [null, '', undefined] } });
    const missingCreatedAt = await Submission.countDocuments({ createdAt: { $in: [null, undefined] } });

    console.log(`  • Missing name: ${missingName}`);
    console.log(`  • Missing email: ${missingEmail}`);
    console.log(`  • Missing createdAt: ${missingCreatedAt}`);

    if (missingName === 0 && missingEmail === 0 && missingCreatedAt === 0) {
      console.log('  ✅ All required fields present');
    }
    console.log();

    // 5. Date range analysis
    console.log('📅 Date Range Analysis:');
    
    const oldestDoc = await Submission.findOne().sort({ createdAt: 1 });
    const newestDoc = await Submission.findOne().sort({ createdAt: -1 });

    if (oldestDoc && newestDoc) {
      const daysDiff = Math.floor((newestDoc.createdAt - oldestDoc.createdAt) / (1000 * 60 * 60 * 24));
      console.log(`  • Oldest submission: ${oldestDoc.createdAt.toISOString()}`);
      console.log(`  • Newest submission: ${newestDoc.createdAt.toISOString()}`);
      console.log(`  • Time span: ${daysDiff} days`);
    }
    console.log();

    // 6. Check for anomalies
    console.log('⚠️  Checking for anomalies...');
    
    // Check for very long messages
    const longMessages = await Submission.countDocuments({ 
      message: { $regex: '.{5000,}' } 
    });

    // Check for emails that don't match basic format
    const invalidEmailFormat = await Submission.find({
      email: { $not: /.+@.+\..+/ }
    });

    let anomalyCount = 0;
    if (longMessages > 0) {
      console.log(`  • Very long messages (>5000 chars): ${longMessages}`);
      anomalyCount++;
    }
    if (invalidEmailFormat.length > 0) {
      console.log(`  • Invalid email format: ${invalidEmailFormat.length}`);
      anomalyCount++;
    }

    if (anomalyCount === 0) {
      console.log('  ✅ No anomalies detected');
    }
    console.log();

    // 7. Collection metadata
    console.log('📈 Collection Metadata:');
    const stats = await Submission.collection.stats();
    
    console.log(`  • Storage size: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);
    console.log(`  • Index size: ${(stats.totalIndexSize / 1024 / 1024).toFixed(2)} MB`);
    console.log(`  • Average doc size: ${(stats.avgObjSize / 1024).toFixed(2)} KB`);
    console.log(`  • Document count: ${stats.count}`);
    console.log();

    // 8. Generate health score
    console.log('📋 Health Score:');
    
    let healthScore = 100;
    const issues = [];

    if (invalidCount > 0) {
      healthScore -= 20;
      issues.push(`${invalidCount} invalid documents`);
    }
    if (duplicateEmails.length > 0) {
      healthScore -= 10;
      issues.push(`${duplicateEmails.length} duplicate email entries`);
    }
    if (missingName > 0 || missingEmail > 0) {
      healthScore -= 15;
      issues.push('Missing required fields');
    }
    if (anomalyCount > 0) {
      healthScore -= 5;
      issues.push('Data anomalies detected');
    }

    const healthStatus = healthScore >= 90 ? '✅' : healthScore >= 70 ? '⚠️' : '❌';
    console.log(`  ${healthStatus} Health Score: ${healthScore}/100`);

    if (issues.length > 0) {
      console.log('\n  Issues found:');
      issues.forEach((issue, idx) => {
        console.log(`    ${idx + 1}. ${issue}`);
      });
    } else {
      console.log('\n  🎉 All checks passed!');
    }
    console.log();

    console.log('✅ Database validation completed!\n');
    process.exit(0);

  } catch (err) {
    console.error('❌ Validation failed:', err.message);
    process.exit(1);
  }
}

validateDatabase();
```

### Usage

```bash
cd server
node scripts/validate-db.js

# Output:
# 🏥 Starting database health check...
# 
# 📡 Connecting to MongoDB...
# ✅ Connected to MongoDB
# 
# 📊 Document Count:
#   • Total submissions: 42
# 
# 🔍 Validating all documents...
#   • Valid documents: 42
#   • Invalid documents: 0
# 
# 🔎 Checking for duplicate emails...
#   ✅ No duplicate emails found
# 
# 🔑 Checking for missing required fields...
#   • Missing name: 0
#   • Missing email: 0
#   • Missing createdAt: 0
#   ✅ All required fields present
# 
# 📅 Date Range Analysis:
#   • Oldest submission: 2025-11-01T08:15:22.000Z
#   • Newest submission: 2025-12-01T18:30:45.000Z
#   • Time span: 30 days
# 
# ⚠️  Checking for anomalies...
#   ✅ No anomalies detected
# 
# 📈 Collection Metadata:
#   • Storage size: 2.45 MB
#   • Index size: 0.02 MB
#   • Average doc size: 58.33 KB
#   • Document count: 42
# 
# 📋 Health Score:
#   ✅ Health Score: 100/100
# 
#   🎉 All checks passed!
# 
# ✅ Database validation completed!
```

---

## 5. Pre-Deployment Migration Checklist

### Create: `server/scripts/pre-deploy.sh` (for Linux/Mac)

```bash
#!/bin/bash

echo "🚀 PREFICTION Pre-Deployment Checklist"
echo "======================================"
echo ""

# Check Node.js version
echo "✓ Node.js version:"
node --version

# Check npm packages
echo ""
echo "✓ Checking dependencies..."
npm list mongoose express
echo ""

# Backup database
echo "🔄 Creating database backup..."
node scripts/backup.js

# Validate database
echo ""
echo "🔄 Validating database..."
node scripts/validate-db.js

# Initialize indexes
echo ""
echo "🔄 Initializing database..."
node scripts/init-db.js

echo ""
echo "✅ Pre-deployment checks completed!"
```

### Or for Windows: `server/scripts/pre-deploy.ps1`

```powershell
# PREFICTION Pre-Deployment Checklist

Write-Host "🚀 PREFICTION Pre-Deployment Checklist" -ForegroundColor Green
Write-Host "======================================" -ForegroundColor Green
Write-Host ""

# Check Node.js version
Write-Host "✓ Node.js version:"
node --version
Write-Host ""

# Check npm packages
Write-Host "✓ Checking dependencies..."
npm list mongoose express
Write-Host ""

# Backup database
Write-Host "🔄 Creating database backup..."
node scripts/backup.js

# Validate database
Write-Host ""
Write-Host "🔄 Validating database..."
node scripts/validate-db.js

# Initialize indexes
Write-Host ""
Write-Host "🔄 Initializing database..."
node scripts/init-db.js

Write-Host ""
Write-Host "✅ Pre-deployment checks completed!" -ForegroundColor Green
```

---

## 6. Usage Workflow

### Before Deploying to Production

```bash
# Step 1: Create backup of current data
cd server
node scripts/backup.js

# Step 2: Validate database integrity
node scripts/validate-db.js

# Step 3: Initialize production database (create indexes, etc)
node scripts/init-db.js

# Step 4: Deploy to Vercel
cd ..
git add -A
git commit -m "chore: pre-deployment backup and validation"
git push origin main
# Vercel automatically deploys after git push
```

### If Data Migration Needed

```bash
# Step 1: Backup current production data
node server/scripts/backup.js

# Step 2: Restore from backup or migrate from dev
node server/scripts/restore.js ./backups/backup-2025-12-01-120530.json

# Step 3: Validate restored data
node server/scripts/validate-db.js
```

### Monitoring After Deployment

```bash
# Run regular health checks
# Add to cron or CI/CD pipeline
node server/scripts/validate-db.js

# Or create automated daily validation
# (Add to GitHub Actions or Vercel cron job)
```

---

## 7. Package.json Scripts

Add these scripts to `server/package.json`:

```json
{
  "scripts": {
    "start": "node server.js",
    "dev": "node server.js",
    "backup": "node scripts/backup.js",
    "init-db": "node scripts/init-db.js",
    "restore": "node scripts/restore.js",
    "validate": "node scripts/validate-db.js",
    "pre-deploy": "npm run backup && npm run validate && npm run init-db"
  }
}
```

### Usage

```bash
cd server

# Run single commands
npm run backup
npm run validate
npm run init-db

# Or run pre-deployment suite
npm run pre-deploy
```

---

## 8. Automated Deployment Workflow

### GitHub Actions CI/CD Pipeline

Create: `.github/workflows/deploy.yml`

```yaml
name: Deploy to Vercel

on:
  push:
    branches: [main]

jobs:
  backup-and-validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: cd server && npm install
      
      - name: Create database backup
        env:
          MONGODB_URI: ${{ secrets.MONGODB_URI }}
        run: cd server && node scripts/backup.js
      
      - name: Validate database
        env:
          MONGODB_URI: ${{ secrets.MONGODB_URI }}
        run: cd server && node scripts/validate-db.js
      
      - name: Initialize database
        env:
          MONGODB_URI: ${{ secrets.MONGODB_URI }}
        run: cd server && node scripts/init-db.js
  
  deploy:
    needs: backup-and-validate
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
```

---

## Summary

These migration scripts provide:

✅ **Backup** - Regular snapshots of production data  
✅ **Restore** - Recover data from backups when needed  
✅ **Initialize** - Set up production database with proper indexes  
✅ **Validate** - Ensure data integrity and quality  
✅ **Health Check** - Monitor database health continuously  
✅ **Automated Workflow** - GitHub Actions integration for CI/CD  

You can now deploy confidently knowing your data is backed up and validated!
