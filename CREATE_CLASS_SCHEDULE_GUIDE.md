# 🎓 Create Class Schedule - Simple Guide

## What You Can Do

You can now **create course planning for each class** and **see it in the calendar**! 🎉

## 🚀 How to Use (3 Easy Steps)

### Step 1: Go to Create Schedule Page
```
http://localhost:5173/calendar/create
```

Or click: **Dashboard → Calendar → ➕ Créer un Planning**

### Step 2: Fill the Form
1. **Select Class** (Classe) - e.g., G1, G2, etc.
2. **Select Subject** (Matière) - e.g., Mathématiques, Physique
3. **Select Time Slot** (Créneau) - e.g., Lundi 08:00-10:00
4. **Select Room** (Salle) - Optional
5. **Select Course Type**:
   - 📚 Cours (Lecture)
   - 📝 TD (Tutorial)
   - 🔬 TP (Lab Work)
   - 📋 Examen (Exam)
   - 🎓 Soutien (Support)
6. **Select Recurrence**:
   - 🔂 Une fois (One time)
   - 📅 Chaque semaine (Every week)
   - 📅 Toutes les 2 semaines (Every 2 weeks)
7. **Select Date Range** - When the course starts and ends
8. **Add Teacher ID** (Optional)
9. **Add Notes** (Optional)

### Step 3: Click "Créer le Planning"
Done! The course will appear in the calendar! 🎉

## 📅 View Your Schedules

### View Calendar
```
http://localhost:5173/calendar/events
```
You'll see all courses on a monthly calendar with colors!

### View by Class
```
http://localhost:5173/calendar/class-schedule
```
Select a class to see its weekly schedule.

## 🎨 Color Codes in Calendar

- 🔵 **Blue** = Cours (Lecture)
- 🟡 **Yellow** = TD (Tutorial)
- 🟢 **Green** = TP (Lab Work)
- 🔴 **Red** = Examen (Exam)
- ⚪ **Gray** = Soutien (Support)

## 📖 Example: Create a Math Course

1. **Class**: G1
2. **Subject**: Mathématiques
3. **Time Slot**: Lundi 08:00-10:00
4. **Room**: Amphi A
5. **Type**: Cours
6. **Recurrence**: Chaque semaine
7. **Period**: 2025-01-01 to 2025-06-30
8. **Teacher ID**: 42

Click "Créer le Planning" ✨

The Math course will now appear:
- Every Monday from 08:00 to 10:00
- From January to June 2025
- In blue color on the calendar
- For class G1

## ✨ Features

✅ Simple form - just fill and submit
✅ Select from existing classes, subjects, rooms
✅ Choose time slots by day and time
✅ Set recurrence (weekly, bi-weekly, one-time)
✅ Set date range
✅ Automatically appears in calendar
✅ Color-coded by course type
✅ Shows time, subject, and class name

## 🔄 Workflow

```
Create Schedule Form
    ↓
Fill Information
    ↓
Submit (POST to API)
    ↓
Saved in Database
    ↓
Appears in Calendar Automatically!
```

## 📝 What You Need First

Before creating schedules, make sure you have:
- ✅ Classes created (in Reference Management)
- ✅ Subjects created (Matières)
- ✅ Time slots created (run: `node backend/scripts/initCalendar.js`)
- ✅ Rooms created (Optional - Salles)

## 🎯 Quick Links

| Page | URL | Purpose |
|------|-----|---------|
| Create Schedule | `/calendar/create` | Create new course planning |
| View Calendar | `/calendar/events` | See all courses on calendar |
| Calendar Dashboard | `/calendar` | Main calendar menu |
| Class Schedule | `/calendar/class-schedule` | View by class |

## 🐛 Troubleshooting

### "No classes found"
→ Create classes in Reference Management first
```
http://localhost:5173/reference/classes
```

### "No time slots found"
→ Initialize time slots:
```bash
cd backend/scripts
node initCalendar.js
```

### "Schedule not appearing in calendar"
→ Check:
1. Backend running on port 3000
2. Date range includes today's date
3. Recurrence matches the day of week
4. Status is not "annule" (cancelled)

### "Conflict detected"
→ There's already a course at that time for:
- The same class, OR
- The same room, OR
- The same teacher

Choose a different time slot!

## 💡 Tips

- **Weekly courses**: Use "Chaque semaine" recurrence
- **One-time exam**: Use "Une fois" recurrence
- **Long semester**: Set date range from September to June
- **Multiple courses**: Create one schedule per course
- **Same course, different day**: Create separate schedules

## 🎓 Example Scenarios

### Scenario 1: Regular Weekly Course
- **Math every Monday at 8:00**
- Recurrence: Hebdomadaire
- Period: Full semester (6 months)

### Scenario 2: Lab Sessions
- **Physics TP on Wednesday 14:00**
- Type: TP
- Room: Lab 1
- Recurrence: Hebdomadaire

### Scenario 3: Final Exam
- **Math Exam on June 15**
- Type: Examen
- Recurrence: Unique (one time only)
- Period: Just one day

## 🚀 Next Features (Coming Soon)

- Edit existing schedules
- Delete schedules
- Bulk create for multiple classes
- Copy schedule to another class
- Import from Excel
- Conflict detection in form
- Available slots suggestion

---

**You're all set! Start creating your class schedules!** 🎉

**Quick Start**: Go to http://localhost:5173/calendar/create and create your first schedule!
