# 🚀 Quick Start Guide - Drag & Drop Calendar

## ⚡ 5-Minute Setup

### Step 1: Copy Files
The following files have been created/modified:

#### Frontend Files (Copy to your project):
```
frontend/learnflow/src/components/DragDropSchedule.jsx       ✅ NEW
frontend/learnflow/src/components/DragDropSchedule.css       ✅ NEW
frontend/learnflow/src/services/CalendarAPI.js              ✅ UPDATED
```

#### Backend Files (Already updated):
```
backend/Reference_documents/routes/Calendar.js               ✅ UPDATED
```

### Step 2: Import the Component

Replace your existing `WeeklySchedule` import:

```jsx
// ❌ OLD
import WeeklySchedule from './components/WeeklySchedule';

// ✅ NEW
import DragDropSchedule from './components/DragDropSchedule';
```

### Step 3: Use the Component

```jsx
<DragDropSchedule 
  classeId={1} 
  className="Classe 1A" 
/>
```

### Step 4: Test It!

```bash
# Frontend
npm run dev

# Backend (if not already running)
npm start
```

---

## 🎯 What You Get

✅ **Drag & Drop** - Move courses between days  
✅ **Conflict Detection** - Prevents double-booking  
✅ **Real-time Notifications** - Visual feedback  
✅ **Responsive Design** - Works on all devices  
✅ **Smooth Animations** - Professional feel  
✅ **Error Handling** - Graceful error messages  
✅ **No New Dependencies** - Uses existing tech stack  

---

## 📱 Features at a Glance

| Feature | How to Use |
|---------|-----------|
| **Move Course** | Drag & drop to another day |
| **See Conflicts** | Error message appears |
| **Refresh Schedule** | Click refresh button |
| **View Status** | Color-coded badges |
| **Mobile Friendly** | Works on phones/tablets |

---

## 🔧 Customization (Optional)

### Change Colors

Edit `DragDropSchedule.css`:

```css
/* Change header gradient */
.day-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  /* Change to your colors */
}
```

### Add More Days

Edit `DragDropSchedule.jsx`:

```javascript
const days = [
  'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 
  'Vendredi', 'Samedi', 'Dimanche' // Add Dimanche
];
```

### Disable Drag for Certain Status

Edit `DragDropSchedule.jsx`:

```javascript
if (schedule.statut === 'annule') {
  // Show read-only card instead
  return <ScheduleCard schedule={schedule} />;
}
```

---

## 🧪 Quick Test Scenarios

### Test 1: Basic Drag
1. Open calendar
2. Click and hold a course
3. Drag to another day
4. Release
5. ✅ Course should move

### Test 2: Conflict Detection
1. Try dragging a course to a day where:
   - Same class already has a course at that time
2. ✅ Error message should appear
3. ✅ Course should stay in original position

### Test 3: Mobile
1. Open on phone/tablet
2. Try drag & drop
3. ✅ Should work smoothly

### Test 4: Refresh
1. Move a course
2. Refresh page (F5)
3. ✅ Course should still be in new position

---

## 🆘 Troubleshooting

### Problem: "Can't drag courses"
**Solution:** Ensure CSS is properly imported
```jsx
import './DragDropSchedule.css';
```

### Problem: "Drop not working"
**Solution:** Check browser console for errors
```javascript
// Open DevTools (F12)
// Check Console tab for error messages
```

### Problem: "Conflicts not showing"
**Solution:** Verify backend is running
```bash
# Test backend endpoint
curl http://localhost:3000/api/calendar/schedules
```

### Problem: "Styles look wrong"
**Solution:** Clear browser cache
```bash
# Hard refresh in browser
Ctrl + Shift + R (Windows)
Cmd + Shift + R (Mac)
```

---

## 📊 Performance Tips

1. **Large Calendars**: Use pagination
2. **Mobile**: Consider lazy loading
3. **Frequent Updates**: Implement caching

---

## 🔐 Production Checklist

- [ ] Test all drag & drop scenarios
- [ ] Test on mobile devices
- [ ] Test conflict detection
- [ ] Verify notifications display
- [ ] Check error handling
- [ ] Test rapid operations
- [ ] Verify data persistence
- [ ] Check browser compatibility

---

## 📚 Need More Info?

- **Full Guide**: See `DRAGDROP_CALENDAR_GUIDE.md`
- **Examples**: See `DRAGDROP_CALENDAR_EXAMPLES.js`
- **API Docs**: Check backend `Calendar.js` comments

---

## ✅ Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| Drag not starting | Check `draggable` attribute on card |
| Drop not working | Verify `onDrop` handler attached |
| Data not saving | Check network tab in DevTools |
| Styling broken | Check CSS file is imported |
| Slow performance | Clear cache, rebuild project |

---

## 🎉 You're Ready!

Your drag-and-drop calendar is ready to use. Start by integrating the component into your existing page and test the features!

**Questions?** Check the guide file or see examples file.

---

**Version**: 1.0  
**Last Updated**: November 5, 2025  
**Status**: ✅ Production Ready
