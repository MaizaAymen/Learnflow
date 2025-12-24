# 📊 Data Migration Setup - Complete!

## ✅ What's Been Created

I've set up a complete data migration system for you to transfer your local database to production. Here's what's ready:

### 📁 New Files Created

1. **`migrate-data-to-production.js`** - Main migration script
   - Exports data from local database
   - Imports data to production database
   - Shows progress and summary
   - Handles all relationships properly

2. **`verify-migration.js`** - Verification script
   - Compares data counts
   - Ensures migration was successful
   - Provides detailed comparison report

3. **`DATA_MIGRATION_GUIDE.md`** - Comprehensive guide
   - Multiple migration methods
   - Step-by-step instructions
   - Troubleshooting tips
   - File migration guidance

4. **`MIGRATE_DATA.md`** - Quick reference
   - Quick commands
   - Common issues
   - Fast troubleshooting

### 🔧 Updated Files

- **`package.json`** - Added convenient npm scripts:
  ```json
  "migrate:data": "node migrate-data-to-production.js"
  "verify:data": "node verify-migration.js"
  ```

---

## 🚀 How to Use (Simple!)

### Step 1: Install Prisma (if not already)

```bash
npm install @prisma/client
npx prisma generate
```

### Step 2: Run Migration

```bash
npm run migrate:data
```

### Step 3: Verify It Worked

```bash
npm run verify:data
```

### Step 4: Test Your App

Visit your deployed application and check that all your data is there!

---

## 🎯 What You'll Need to Provide

When you run the migration script, it will ask for:

### 1. Local Database URL

This is where your current data is stored. Find it in one of these files:
- `.env`
- `.env.local`
- `backend/auth-service/.env`

Example format:
```
postgresql://postgres:password@localhost:5432/learnflow_local
```

### 2. Production Database URL (Already Known)

Your production database on Render:
```
postgresql://learnflow_db_user:2Bj20qXV9Gb4UenBJUSEGWO99t1neyr2@dpg-d55ckmeuk2gs73brvs10-a.oregon-postgres.render.com/learnflow_db
```

---

## 📊 What Will Be Migrated

| Category | Items | Description |
|----------|-------|-------------|
| 👥 Users | All accounts | Students, teachers, admins, department heads |
| 📅 Events | All events | Created events with all details |
| ✅ Registrations | All sign-ups | Who registered for which events |
| 💬 Conversations | All chats | Group conversations |
| 📨 Messages | All messages | Messages in conversations |
| 📬 Direct Messages | All DMs | Private messages between users |
| 🔔 Notifications | All alerts | User notifications |

**Total:** Everything in your database!

---

## ⚡ Quick Start Commands

```bash
# 1. Prepare Prisma
npx prisma generate

# 2. Migrate data to production
npm run migrate:data

# 3. Verify migration
npm run verify:data

# 4. View production data (optional)
$env:DATABASE_URL="postgresql://learnflow_db_user:2Bj20qXV9Gb4UenBJUSEGWO99t1neyr2@dpg-d55ckmeuk2gs73brvs10-a.oregon-postgres.render.com/learnflow_db"
npx prisma studio
```

---

## 🔍 Script Details

### Migration Script Flow

```
Start
  ↓
Ask for database URLs
  ↓
Connect to LOCAL database
  ↓
Export all data (users, events, messages, etc.)
  ↓
Connect to PRODUCTION database
  ↓
Import all data (with upsert for safety)
  ↓
Show summary report
  ↓
Done! ✅
```

### Safety Features

✅ **Non-destructive** - Uses `upsert` (update if exists, create if new)  
✅ **Progress tracking** - Shows what's being migrated  
✅ **Error handling** - Stops on errors with clear messages  
✅ **Verification** - Separate script to confirm success  
✅ **Backup recommended** - Always suggests backing up first  

---

## 📁 Handling Uploaded Files

Database migration handles records, but not physical files.

### Files to Consider

```
backend/uploads/                          # General uploads
backend/auth-service/uploads/             # User avatars
backend/Gestion des Événements/uploads/   # Event images
uploads/                                   # Other files
```

### Options for File Migration

**Option 1: Manual Upload**
- Copy files to your production server
- Use FTP/SFTP if Render supports it

**Option 2: Cloud Storage (Recommended)**
- Use AWS S3, Cloudinary, or similar
- Update your app to use cloud URLs
- More reliable for production

See [DATA_MIGRATION_GUIDE.md](DATA_MIGRATION_GUIDE.md) for detailed file migration steps.

---

## 🎨 Example Output

### Migration Script Output

```
🚀 LEARNFLOW DATA MIGRATION TO PRODUCTION

This script will:
  1. Connect to your LOCAL database
  2. Export all data
  3. Connect to your PRODUCTION database
  4. Import all data

⚠️  IMPORTANT: Make sure you have backup of your production database!

Do you want to proceed? (yes/no): yes

📤 STEP 1: Exporting data from LOCAL database...

ℹ Exporting users...
✓ Exported 45 users
ℹ Exporting events...
✓ Exported 12 events
ℹ Exporting event registrations...
✓ Exported 78 event registrations
...

📥 STEP 2: Importing data to PRODUCTION database...

ℹ Importing users...
✓ Imported 45 users
ℹ Importing events...
✓ Imported 12 events
...

🎉 MIGRATION COMPLETED SUCCESSFULLY!

Summary:
  👥 Users: 45
  📅 Events: 12
  ✅ Registrations: 78
  💬 Conversations: 8
  📨 Messages: 234
  📬 Direct Messages: 56
  🔔 Notifications: 123

✅ All data has been migrated to production!
```

### Verification Script Output

```
🔍 LEARNFLOW DATA VERIFICATION

📊 Counting records in LOCAL database...
  👥 Users: 45
  📅 Events: 12
  ✅ Event Registrations: 78
  ...

📊 Counting records in PRODUCTION database...
  👥 Users: 45
  📅 Events: 12
  ✅ Event Registrations: 78
  ...

🔍 COMPARISON RESULTS

Table                     | Local      | Production   | Status
----------------------------------------------------------------------
👥 Users                  | 45         | 45           | ✓ Match
📅 Events                 | 12         | 12           | ✓ Match
✅ Event Registrations    | 78         | 78           | ✓ Match
...
----------------------------------------------------------------------

✓ 🎉 SUCCESS! All data counts match perfectly!
✓ Total records migrated: 568

✅ VERIFICATION COMPLETE - MIGRATION SUCCESSFUL!
```

---

## 🐛 Common Issues & Solutions

### Issue: "Cannot find module '@prisma/client'"

**Solution:**
```bash
npm install @prisma/client
npx prisma generate
```

### Issue: "Connection timeout"

**Solution:**
- Check your internet connection
- Verify database URLs are correct
- Ensure databases are accessible

### Issue: "Schema mismatch"

**Solution:**
```bash
# Deploy latest schema to production
$env:DATABASE_URL="your_production_url"
npx prisma migrate deploy
```

### Issue: "Data already exists - unique constraint"

**Solution:**
The script uses `upsert` which should handle this. If it still fails, you can:
1. Reset production database (⚠️ DELETES ALL DATA):
   ```bash
   npx prisma migrate reset
   ```
2. Or modify the script to skip existing records

---

## ✅ Final Checklist

Before you start:
- [ ] Have your local database URL ready
- [ ] Confirmed production database URL
- [ ] Backed up production database (optional but recommended)
- [ ] Prisma is installed and generated
- [ ] Network connection is stable

After migration:
- [ ] Run verification script
- [ ] Check data counts match
- [ ] Test login on deployed app
- [ ] Verify events display
- [ ] Check messages work
- [ ] Test all major features

---

## 🎯 Ready to Migrate?

### Quick Commands

```bash
# One command to rule them all!
npm run migrate:data
```

Or if you want more control:

```bash
# 1. Generate Prisma client
npx prisma generate

# 2. Migrate data
node migrate-data-to-production.js

# 3. Verify
node verify-migration.js

# 4. View production data
$env:DATABASE_URL="postgresql://learnflow_db_user:2Bj20qXV9Gb4UenBJUSEGWO99t1neyr2@dpg-d55ckmeuk2gs73brvs10-a.oregon-postgres.render.com/learnflow_db"
npx prisma studio
```

---

## 📚 Documentation Files

| File | Purpose |
|------|---------|
| [MIGRATE_DATA.md](MIGRATE_DATA.md) | Quick reference and commands |
| [DATA_MIGRATION_GUIDE.md](DATA_MIGRATION_GUIDE.md) | Complete guide with all methods |
| `migrate-data-to-production.js` | Main migration script |
| `verify-migration.js` | Verification script |

---

## 🎉 You're All Set!

Everything is ready for you to migrate your local data to production. 

**Next steps:**
1. Run `npm run migrate:data`
2. Provide your database URLs when prompted
3. Wait for migration to complete
4. Run `npm run verify:data` to confirm
5. Test your deployed application!

**Questions?** Check the guides or review the script code - everything is well-commented!

---

**Happy Migrating! 🚀**
