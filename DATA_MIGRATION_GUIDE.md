# 🚀 Data Migration Guide: Local → Production

This guide explains how to migrate your local database data to your production deployment on Render.

---

## 📋 Prerequisites

✅ Local database with data you want to migrate  
✅ Production database on Render (already configured)  
✅ Prisma installed (`@prisma/client`)  
✅ PostgreSQL client tools (pg_dump/pg_restore)

---

## 🎯 Method 1: Using the Migration Script (Recommended)

### Step 1: Install Dependencies

```bash
npm install @prisma/client
npx prisma generate
```

### Step 2: Find Your Local Database URL

Check where your local data is stored. Common locations:
- `.env`
- `.env.local`
- `backend/auth-service/.env`

Your local DATABASE_URL might look like:
```
postgresql://user:password@localhost:5432/learnflow_local
```

### Step 3: Get Your Production Database URL

From your deployment credentials:
```
postgresql://learnflow_db_user:2Bj20qXV9Gb4UenBJUSEGWO99t1neyr2@dpg-d55ckmeuk2gs73brvs10-a.oregon-postgres.render.com/learnflow_db
```

### Step 4: Run the Migration Script

```bash
node migrate-data-to-production.js
```

The script will:
1. Ask for your LOCAL database URL
2. Ask for your PRODUCTION database URL  
3. Export all data from local
4. Import all data to production
5. Show a summary of migrated data

**Example interaction:**
```
📍 LOCAL Database URL: postgresql://postgres:password@localhost:5432/learnflow
🌍 PRODUCTION Database URL: postgresql://learnflow_db_user:2Bj20qXV9Gb4UenBJUSEGWO99t1neyr2@dpg-d55ckmeuk2gs73brvs10-a.oregon-postgres.render.com/learnflow_db
```

---

## 🔧 Method 2: Using PostgreSQL Tools (Alternative)

### Option A: Using pg_dump and pg_restore

#### Step 1: Export Local Database

```bash
# Export to SQL file
pg_dump -h localhost -U your_user -d learnflow_local -f local_backup.sql

# Or export with data only (no schema)
pg_dump -h localhost -U your_user -d learnflow_local --data-only -f local_data.sql
```

#### Step 2: Import to Production

```bash
# Method 1: Direct restore
psql -h dpg-d55ckmeuk2gs73brvs10-a.oregon-postgres.render.com -U learnflow_db_user -d learnflow_db -f local_data.sql

# Method 2: Using pg_restore (if you exported as custom format)
pg_restore -h dpg-d55ckmeuk2gs73brvs10-a.oregon-postgres.render.com -U learnflow_db_user -d learnflow_db local_backup.dump
```

**Password:** `2Bj20qXV9Gb4UenBJUSEGWO99t1neyr2`

### Option B: Using pgAdmin

1. Open pgAdmin
2. Connect to your LOCAL database
3. Right-click database → Backup
4. Save the backup file
5. Connect to your PRODUCTION database (Render)
6. Right-click database → Restore
7. Select your backup file

---

## 🎨 Method 3: Using Prisma Studio (For Small Datasets)

### Step 1: Open Local Database in Prisma Studio

```bash
# Set local database URL
$env:DATABASE_URL="postgresql://localhost:5432/learnflow_local"

# Open Prisma Studio
npx prisma studio
```

### Step 2: Open Production Database in Another Browser Tab

```bash
# In a new terminal, set production URL
$env:DATABASE_URL="postgresql://learnflow_db_user:2Bj20qXV9Gb4UenBJUSEGWO99t1neyr2@dpg-d55ckmeuk2gs73brvs10-a.oregon-postgres.render.com/learnflow_db"

# Open Prisma Studio on different port
npx prisma studio --port 5556
```

### Step 3: Manually Copy Data

Copy records from local (port 5555) to production (port 5556) using the UI.

**Note:** This method is only practical for small amounts of data.

---

## 📊 What Data Will Be Migrated?

The migration includes ALL your data:

- ✅ **Users** (students, teachers, admins, department heads)
- ✅ **Events** (all created events)
- ✅ **Event Registrations** (who registered for what)
- ✅ **Conversations** (messaging data)
- ✅ **Messages** (all messages)
- ✅ **Direct Messages** (private messages)
- ✅ **Notifications** (all notifications)
- ✅ **Uploaded Files** (avatars, attachments) - see note below

---

## 📁 Migrating Uploaded Files

The database migration script handles database records, but uploaded files need separate handling:

### Step 1: Locate Your Local Uploads

```
backend/uploads/
backend/auth-service/uploads/
backend/Gestion des Événements/uploads/
uploads/
```

### Step 2: Upload to Production Storage

**Option A: Use Render's Disk Storage (if available)**

Upload files via SFTP or Render's file manager.

**Option B: Use Cloud Storage (Recommended for Production)**

Consider using:
- AWS S3
- Cloudinary
- Azure Blob Storage
- Google Cloud Storage

This ensures files persist across deployments.

### Step 3: Update File URLs

If file URLs change, you may need to update database records to point to new locations.

---

## ⚠️ Important Notes

### Before Migration

1. **Backup Production Database**
   ```bash
   # Create backup of production DB first!
   pg_dump -h dpg-d55ckmeuk2gs73brvs10-a.oregon-postgres.render.com -U learnflow_db_user -d learnflow_db -f prod_backup_$(date +%Y%m%d).sql
   ```

2. **Check Schema Compatibility**
   ```bash
   # Make sure production has latest schema
   npx prisma migrate deploy
   ```

3. **Test Connection**
   ```bash
   node test-db-connection.js
   ```

### During Migration

- ⏱️ Migration time depends on data size (typically 1-5 minutes for small-medium datasets)
- 🔒 Don't interrupt the process
- 📊 Monitor the console for progress

### After Migration

1. **Verify Data in Production**
   ```bash
   # Set production URL
   $env:DATABASE_URL="postgresql://learnflow_db_user:2Bj20qXV9Gb4UenBJUSEGWO99t1neyr2@dpg-d55ckmeuk2gs73brvs10-a.oregon-postgres.render.com/learnflow_db"
   
   # Open Prisma Studio to verify
   npx prisma studio
   ```

2. **Test Your Application**
   - Login with existing accounts
   - Check events display correctly
   - Verify messages are present
   - Test all features

3. **Update Frontend Configuration**
   Make sure your frontend points to production:
   ```env
   VITE_API_URL=https://your-production-backend.vercel.app/api
   ```

---

## 🐛 Troubleshooting

### Error: "Connection timeout"

**Solution:** Check your network connection and database URL

```bash
# Test connection first
node test-db-connection.js
```

### Error: "Unique constraint violation"

**Solution:** Production already has data with same IDs. Options:

1. **Clean production database first:**
   ```bash
   npx prisma migrate reset
   ```

2. **Merge data instead of replace:**
   Edit the migration script to handle conflicts

### Error: "Schema mismatch"

**Solution:** Update production schema

```bash
# Deploy latest migrations to production
$env:DATABASE_URL="your_production_url"
npx prisma migrate deploy
```

### Error: "Permission denied"

**Solution:** Verify database credentials and permissions

---

## 🎯 Quick Start (TL;DR)

```bash
# 1. Install dependencies
npm install @prisma/client
npx prisma generate

# 2. Run migration script
node migrate-data-to-production.js

# 3. When prompted, enter:
#    - Local DB URL: postgresql://localhost:5432/learnflow_local
#    - Production DB URL: postgresql://learnflow_db_user:2Bj20qXV9Gb4UenBJUSEGWO99t1neyr2@dpg-d55ckmeuk2gs73brvs10-a.oregon-postgres.render.com/learnflow_db

# 4. Verify data
$env:DATABASE_URL="postgresql://learnflow_db_user:2Bj20qXV9Gb4UenBJUSEGWO99t1neyr2@dpg-d55ckmeuk2gs73brvs10-a.oregon-postgres.render.com/learnflow_db"
npx prisma studio
```

---

## 📞 Need Help?

If you encounter issues:

1. Check the error message carefully
2. Verify database URLs are correct
3. Ensure both databases are accessible
4. Check schema is up to date on both databases
5. Make sure you have network access to both databases

---

**✅ Ready to migrate? Run:**

```bash
node migrate-data-to-production.js
```
