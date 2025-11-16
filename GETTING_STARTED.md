# 🚀 GETTING STARTED - Timetable System

## Quick Start Guide (5 Minutes)

Follow these steps to get your timetable system up and running:

---

## ✅ Step 1: Install Dependencies

```bash
cd backend/Reference_documents
npm install
```

---

## ✅ Step 2: Run Database Migration (Optional but Recommended)

This ensures all foreign keys, indexes, and views are properly created:

```bash
# From the project root
psql -U your_postgres_user -d your_database_name -f database_timetable_constraints.sql
```

**Note**: Replace `your_postgres_user` and `your_database_name` with your actual values.

If you don't have `psql` command line, you can:
- Use pgAdmin and run the SQL file manually
- Use any PostgreSQL client tool
- Skip this step (models will create basic structure)

---

## ✅ Step 3: Setup Sample Data

This creates test departments, classes, rooms, teachers, and time slots:

```bash
cd backend/Reference_documents
node scripts/setupSampleData.js
```

You should see output like:
```
✅ Département: Informatique (ID: 1)
✅ Spécialité: Informatique Générale (ID: 1)
✅ Niveau: L1 (ID: 1)
...
✨ SAMPLE DATA SETUP COMPLETED SUCCESSFULLY!
```

---

## ✅ Step 4: Start the Server

```bash
cd backend/Reference_documents
node server.js
```

You should see:
```
Server running on port 5000
Database connected successfully
```

---

## ✅ Step 5: Test the API

### Option A: Run Automated Tests

```bash
cd backend/Reference_documents
node scripts/testTimetableSystem.js
```

This will run comprehensive tests for all conflict detection scenarios.

### Option B: Manual Test with cURL

#### Test 1: Get all time slots
```bash
curl http://localhost:5000/api/calendar/timeslots
```

#### Test 2: Create a valid schedule
```bash
curl -X POST http://localhost:5000/api/calendar/schedules \
  -H "Content-Type: application/json" \
  -d '{
    "time_slot_id": 1,
    "classe_id": 1,
    "matiere_id": 1,
    "salle_id": 1,
    "enseignant_id": 1,
    "date_debut": "2025-01-15",
    "date_fin": "2025-06-30",
    "type_cours": "Cours",
    "recurrence": "hebdomadaire"
  }'
```

**Expected**: Success response (201) with schedule details

#### Test 3: Try to create a conflicting schedule
```bash
curl -X POST http://localhost:5000/api/calendar/schedules \
  -H "Content-Type: application/json" \
  -d '{
    "time_slot_id": 1,
    "classe_id": 2,
    "matiere_id": 2,
    "salle_id": 1,
    "enseignant_id": 2,
    "date_debut": "2025-01-15",
    "type_cours": "TD"
  }'
```

**Expected**: Conflict response (409) with message: "La salle est déjà occupée..."

#### Test 4: Get class timetable
```bash
curl http://localhost:5000/api/calendar/timetable/classe/1
```

**Expected**: Complete timetable grouped by day of week

---

## 📝 Common Issues & Solutions

### Issue 1: "Database connection failed"

**Solution**: Check your database configuration in `backend/auth-service/config/index.js`

```javascript
// Make sure these match your PostgreSQL setup
const sequelize = new Sequelize('your_database', 'your_user', 'your_password', {
  host: 'localhost',
  dialect: 'postgres',
  // ...
});
```

### Issue 2: "Foreign key constraint violation"

**Solution**: Run the database migration script to ensure all constraints are properly set up:
```bash
psql -U your_user -d your_database -f database_timetable_constraints.sql
```

### Issue 3: "No sample data found"

**Solution**: Run the sample data setup script:
```bash
node scripts/setupSampleData.js
```

### Issue 4: "Port 5000 already in use"

**Solution**: Either stop the other process or change the port in `server.js`:
```javascript
const PORT = process.env.PORT || 5001; // Changed from 5000
```

### Issue 5: "fetch is not defined" (when running tests)

**Solution**: Use Node.js 18+ or install node-fetch:
```bash
npm install node-fetch
```

---

## 🎯 Next Steps

Once everything is working, you can:

### 1. **Integrate with Your Frontend**

Update your React components to use the new API endpoints. Example:

```javascript
// Check for conflicts before creating
const checkConflicts = async (scheduleData) => {
  const response = await fetch('http://localhost:5000/api/calendar/schedules/check-conflicts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(scheduleData)
  });
  
  const result = await response.json();
  
  if (result.hasConflicts) {
    // Show conflicts to user
    alert(result.conflicts[0].message);
    return false;
  }
  
  return true;
};

// Create schedule only if no conflicts
const createSchedule = async (scheduleData) => {
  const hasNoConflicts = await checkConflicts(scheduleData);
  
  if (hasNoConflicts) {
    const response = await fetch('http://localhost:5000/api/calendar/schedules', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(scheduleData)
    });
    
    const result = await response.json();
    
    if (result.success) {
      alert('Schedule created successfully!');
    }
  }
};
```

### 2. **Customize Conflict Messages**

Edit `services/conflictDetection.js` to customize the conflict messages for your users.

### 3. **Add More Features**

- Email notifications when schedules change
- Export to PDF/Excel
- Statistics dashboard
- Mobile app integration

### 4. **Configure Production Settings**

Before deploying to production:

1. Change database credentials
2. Enable HTTPS
3. Add rate limiting
4. Configure CORS properly
5. Set up logging
6. Add authentication middleware

---

## 📚 Documentation Reference

| Document | Purpose |
|----------|---------|
| `TIMETABLE_SYSTEM_COMPLETE.md` | Complete system documentation with all details |
| `TIMETABLE_IMPLEMENTATION_SUMMARY.md` | Summary of what was implemented |
| `TIMETABLE_API_QUICK_REFERENCE.md` | Quick API reference card |
| `GETTING_STARTED.md` | This file - getting started guide |

---

## 🧪 Testing Checklist

Before going to production, verify:

- [ ] Sample data loads successfully
- [ ] Server starts without errors
- [ ] All time slots are created
- [ ] Room conflict is detected
- [ ] Teacher conflict is detected
- [ ] Class conflict is detected
- [ ] Matière-niveau compatibility works
- [ ] Room capacity validation works
- [ ] Timetable retrieval works
- [ ] Bulk operations work
- [ ] Drag & drop update works
- [ ] Database constraints are active

Run the test suite to verify all:
```bash
node scripts/testTimetableSystem.js
```

---

## 💡 Development Tips

### Use the Check Conflicts Endpoint First

Before showing a schedule creation form, always check what's available:

```javascript
// 1. Get available time slots
const timeSlots = await fetch('/api/calendar/timeslots?is_active=true');

// 2. For each time slot, check availability
const availability = await fetch(`/api/calendar/availability/${timeSlotId}?date=${date}`);

// 3. Show only available rooms/teachers in dropdowns
// 4. When user submits, check conflicts one more time
const conflicts = await checkConflicts(formData);
```

### Use Bulk Operations for Semester Planning

Instead of creating schedules one by one:

```javascript
const semesterSchedules = generateSemesterSchedules(); // Your logic

const response = await fetch('/api/calendar/schedules/bulk', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ schedules: semesterSchedules })
});

const result = await response.json();

console.log(`Created: ${result.summary.created}`);
console.log(`Conflicts: ${result.summary.conflicts}`);
console.log(`Errors: ${result.summary.errors}`);

// Handle conflicts manually or show to admin
```

### Cache Frequently Used Data

Cache these on the frontend to reduce API calls:
- Time slots (rarely change)
- Departments, specialties, levels
- Room list
- Teacher list

Only fetch schedules when needed.

---

## 🎉 You're All Set!

Your timetable system is now ready to use. You have:

✅ A complete backend with conflict detection  
✅ Sample data for testing  
✅ Comprehensive test suite  
✅ Complete documentation  
✅ Quick reference guides  

Start building your frontend or integrate with your existing UI!

---

## 📞 Need Help?

1. **Check the documentation** in the files mentioned above
2. **Run the tests** to see working examples
3. **Review the sample data setup** to understand the data structure
4. **Check the API quick reference** for endpoint details

---

**Happy Coding! 🚀**

Last Updated: November 13, 2025
