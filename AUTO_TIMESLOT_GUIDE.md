# ⚡ AUTO TIME SLOT GENERATOR - DONE!

## What It Does

Automatically generates time slots for the entire week with just one click! 🎉

## 🚀 How to Use

### Go to:
```
http://localhost:5173/calendar/timeslots/auto
```

Or: **Calendar Dashboard → ⚡ Créneaux Auto**

### Default Configuration:
- **Days**: Monday to Saturday (Lundi à Samedi)
- **Morning**: 08:30 - 13:30
- **Afternoon**: 14:30 - 17:30
- **Duration**: 2 hours (120 minutes) per session
- **Break**: 15 minutes between sessions

### Click "⚡ Générer Créneaux"
Done! All time slots are created automatically! ✨

## 📊 What Gets Created

### Morning Slots (08:30 - 13:30):
- **Séance 1**: 08:30 - 10:30
- **Séance 2**: 10:45 - 12:45

### Afternoon Slots (14:30 - 17:30):
- **Séance 3**: 14:30 - 16:30

### For Each Day:
- Lundi (Monday)
- Mardi (Tuesday)
- Mercredi (Wednesday)
- Jeudi (Thursday)
- Vendredi (Friday)
- Samedi (Saturday)

**Total**: ~18 time slots (3 per day × 6 days)

## ⚙️ Customizable

You can change:
- ✅ Morning start/end times
- ✅ Afternoon start/end times
- ✅ Session duration (30-300 minutes)
- ✅ Break time between sessions (0-60 minutes)

## 📋 Features

- ✅ Visual preview before generating
- ✅ Shows exactly what will be created
- ✅ Grouped by day
- ✅ One-click generation
- ✅ Auto-saves to database
- ✅ Customizable times and durations

## 📖 Example Configuration

### Short Sessions (1.5 hours):
- Duration: 90 minutes
- Break: 15 minutes
- Result: 4-5 sessions per day

### Long Sessions (3 hours):
- Duration: 180 minutes
- Break: 30 minutes
- Result: 2 sessions per day

### No Breaks:
- Duration: 120 minutes
- Break: 0 minutes
- Result: More sessions per day

## 🎯 Use Cases

### University Schedule:
- Morning: 08:00 - 12:00
- Afternoon: 14:00 - 18:00
- Duration: 120 minutes (2 hours)

### School Schedule:
- Morning: 08:30 - 12:30
- Afternoon: 13:30 - 16:30
- Duration: 60 minutes (1 hour)

### Training Center:
- Morning: 09:00 - 13:00
- Afternoon: 14:00 - 18:00
- Duration: 180 minutes (3 hours)

## ✅ Workflow

```
1. Go to /calendar/timeslots/auto
   ↓
2. Review/adjust configuration
   ↓
3. See preview of all slots
   ↓
4. Click "Générer"
   ↓
5. Time slots created automatically!
   ↓
6. Use them to create course schedules
```

## 💡 Tips

- **First time setup**: Use default configuration
- **Preview first**: Check the preview before generating
- **Adjust as needed**: Change times/durations if needed
- **One-time setup**: You only need to do this once!
- **Regenerate**: Can regenerate with different settings

## 🔗 Quick Links

| Action | URL |
|--------|-----|
| Auto Generate | `/calendar/timeslots/auto` |
| View Time Slots | `/calendar/timeslots` |
| Create Schedule | `/calendar/create` |
| View Calendar | `/calendar/events` |

## 🐛 Troubleshooting

### "Time slots already exist"
→ Backend might reject duplicates. Check existing slots first at `/calendar/timeslots`

### "Not enough time for slot"
→ Increase the end time or decrease session duration

### "No slots generated"
→ Check that end time > start time + duration

## 📊 Preview Example

**Lundi (Monday):**
- 08:30 - 10:30 | Séance 1 - Matinée
- 10:45 - 12:45 | Séance 2 - Matinée
- 14:30 - 16:30 | Séance 3 - Après-midi

**Mardi (Tuesday):**
- 08:30 - 10:30 | Séance 1 - Matinée
- 10:45 - 12:45 | Séance 2 - Matinée
- 14:30 - 16:30 | Séance 3 - Après-midi

...and so on for all days!

---

**Perfect for setting up your entire semester in one click!** ⚡

**Go to**: http://localhost:5173/calendar/timeslots/auto
