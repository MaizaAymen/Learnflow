# 🚀 Quick Data Migration Reference

## 📝 What You Need

1. **Local Database URL** - Where your current data is
2. **Production Database URL** - Your Render database:
   ```
   postgresql://learnflow_db_user:2Bj20qXV9Gb4UenBJUSEGWO99t1neyr2@dpg-d55ckmeuk2gs73brvs10-a.oregon-postgres.render.com/learnflow_db
   ```

## ⚡ Quick Commands

### Option 1: Using npm scripts (Easiest)

```bash
# Migrate data from local to production
npm run migrate:data

# Verify migration was successful
npm run verify:data
```

### Option 2: Run scripts directly

```bash
# Install dependencies first
npm install @prisma/client
npx prisma generate

# Migrate data
node migrate-data-to-production.js

# Verify data
node verify-migration.js
```

## 📋 Step-by-Step Process

### 1️⃣ Prepare

```bash
# Make sure Prisma is ready
npx prisma generate
```

### 2️⃣ Migrate

```bash
npm run migrate:data
```

When prompted:
- **LOCAL Database URL**: Your local database connection string
- **PRODUCTION Database URL**: Use the one from above

### 3️⃣ Verify

```bash
npm run verify:data
```

Check that all counts match between local and production.

### 4️⃣ Test

Open your deployed application and verify:
- ✅ You can login with existing accounts
- ✅ Events are displayed
- ✅ Messages are present
- ✅ All features work

## 🔍 Finding Your Local Database URL

Your local database URL might be in:

**Check these files:**
- `.env`
- `.env.local`
- `backend/.env`
- `backend/auth-service/.env`

**Common formats:**
```
# PostgreSQL (Local)
postgresql://postgres:password@localhost:5432/learnflow

# PostgreSQL (Docker)
postgresql://postgres:password@localhost:5433/learnflow

# SQLite
file:./dev.db
```

**Can't find it?** Check how you're running your backend:
```bash
# Look for DATABASE_URL in your terminal startup
npm run dev
```

## 🆘 Troubleshooting

### "Cannot find local database"

```bash
# Check if you have Prisma configured
cat prisma/schema.prisma

# Check environment variables
cat .env
```

### "Connection refused"

Make sure your local database is running:
```bash
# PostgreSQL
pg_isready

# Or check if Docker container is running
docker ps
```

### "Schema mismatch"

Sync your production schema:
```bash
# Set production URL
$env:DATABASE_URL="postgresql://learnflow_db_user:2Bj20qXV9Gb4UenBJUSEGWO99t1neyr2@dpg-d55ckmeuk2gs73brvs10-a.oregon-postgres.render.com/learnflow_db"

# Deploy migrations
npx prisma migrate deploy
```

### "Data already exists"

The script uses `upsert` which updates existing records. If you want a clean migration:

```bash
# WARNING: This deletes all production data!
npx prisma migrate reset

# Then run migration again
npm run migrate:data
```

## 📊 What Gets Migrated?

| Data Type | Included |
|-----------|----------|
| 👥 Users | ✅ |
| 📅 Events | ✅ |
| ✅ Event Registrations | ✅ |
| 💬 Conversations | ✅ |
| 📨 Messages | ✅ |
| 📬 Direct Messages | ✅ |
| 🔔 Notifications | ✅ |
| 📁 Uploaded Files | ❌ (Manual) |

**Note:** Uploaded files need to be copied separately. See [DATA_MIGRATION_GUIDE.md](DATA_MIGRATION_GUIDE.md) for details.

## ⏱️ How Long Does It Take?

| Data Size | Time |
|-----------|------|
| Small (< 100 records) | ~30 seconds |
| Medium (100-1000 records) | ~1-2 minutes |
| Large (> 1000 records) | ~3-5 minutes |

## 🎯 Final Checklist

After migration, verify:

- [ ] Run verification script: `npm run verify:data`
- [ ] All counts match between local and production
- [ ] Login works with existing accounts
- [ ] Events display correctly
- [ ] Messages are accessible
- [ ] Notifications appear
- [ ] User profiles show correct information
- [ ] File uploads work (if you migrated files)

## 📞 Still Need Help?

**Check the detailed guide:**
```bash
# Open the full migration guide
cat DATA_MIGRATION_GUIDE.md
```

**Or review the scripts:**
- `migrate-data-to-production.js` - Migration script
- `verify-migration.js` - Verification script

---

✅ **Ready to migrate? Just run:**

```bash
npm run migrate:data
```
