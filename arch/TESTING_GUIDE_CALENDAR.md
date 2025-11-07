# 🧪 TESTING GUIDE - Calendar CRUD System

## 📋 Complete Testing Checklist

### Phase 1: Setup & Infrastructure (5 min)

#### Backend Setup
- [ ] Node.js installed
- [ ] PostgreSQL running
- [ ] Backend dependencies installed: `npm install`
- [ ] Backend server running: `npm start`
- [ ] Server running on `http://localhost:3000`
- [ ] No errors in console

#### Frontend Setup
- [ ] Node.js installed
- [ ] Frontend dependencies installed: `npm install`
- [ ] Frontend running: `npm run dev`
- [ ] App accessible on `http://localhost:5173`
- [ ] No errors in browser console (F12)

#### API Connectivity
- [ ] Open browser console (F12)
- [ ] Go to `/admin/calendar/timeslots`
- [ ] Check Network tab - should see API calls succeed
- [ ] No 404 errors
- [ ] No CORS errors

---

### Phase 2: Time Slots CRUD (15 min)

#### Test 2.1: Create Time Slot
**Steps**:
1. Navigate to `/admin/calendar/timeslots`
2. Click "➕ Nouveau Planning"
3. Fill form:
   - Day: Select "Lundi"
   - Start time: 08:00
   - End time: 10:00
   - Description: "Morning 2h"
   - Active: Toggle ON
4. Click "✓ Créer"

**Expected Results**:
- ✅ Form should submit
- ✅ Success message appears
- ✅ Form clears
- ✅ Table updates with new slot
- ✅ Button changes to "✕ Fermer"

**Failure Recovery**:
- ❌ If 404 error: Check backend server is running
- ❌ If validation error: Check all required fields filled
- ❌ If network error: Check localhost:3000 accessible

---

#### Test 2.2: View Time Slots
**Steps**:
1. Scroll down the page
2. Look for table with all time slots

**Expected Results**:
- ✅ Table visible with columns: Start, End, Day, Status, Actions
- ✅ New slot appears in table
- ✅ Slots grouped by day
- ✅ Sorted by time
- ✅ Statistics show total count increased

**Verify Data**:
- Check slot appears for Monday
- Check time shows as "08:00 - 10:00"
- Check "Active" status shows

---

#### Test 2.3: Create Multiple Slots
**Steps**:
1. Create 3-4 more time slots:
   - Monday 10:15-12:15
   - Monday 13:00-15:00
   - Tuesday 08:00-10:00
   - Tuesday 13:00-15:00

**Expected Results**:
- ✅ All slots created successfully
- ✅ Table shows all slots
- ✅ Grouped correctly by day
- ✅ Statistics updated (Total should be 4+)

---

#### Test 2.4: Edit Time Slot
**Steps**:
1. Find a time slot in table
2. Click ✏️ button
3. Change details:
   - Change end time: 11:00 (instead of 10:00)
   - Change description: "Morning 3h"
4. Click "✓ Mettre à jour"

**Expected Results**:
- ✅ Form populates with existing data
- ✅ Form changes reflected
- ✅ Update button visible
- ✅ Update submits successfully
- ✅ Table updates with new values
- ✅ Success message shown

**Verify Changes**:
- Slot should show "08:00 - 11:00" (not 10:00)
- Description should show "Morning 3h"

---

#### Test 2.5: Delete Time Slot
**Steps**:
1. Find a time slot in table
2. Click 🗑️ button
3. Confirm deletion in popup

**Expected Results**:
- ✅ Confirmation dialog appears
- ✅ Upon confirmation, slot deleted
- ✅ Table updates
- ✅ Success message shown
- ✅ Statistics count decreases

**Verify Deletion**:
- Slot should no longer appear in table
- Total count should decrease by 1

---

#### Test 2.6: Validation
**Steps**:
1. Click "➕ Nouveau Planning"
2. Try creating slot with:
   - Start time: 10:00
   - End time: 08:00 (BEFORE start time)
3. Try submitting

**Expected Results**:
- ✅ Error message appears
- ✅ Form doesn't submit
- ✅ Shows helpful error text

---

### Phase 3: Schedules CRUD (20 min)

#### Test 3.1: Navigate to Schedules
**Steps**:
1. Navigate to `/admin/calendar/schedules`

**Expected Results**:
- ✅ Page loads
- ✅ Shows empty state (no schedules yet)
- ✅ Two tabs visible: "📋 Liste" and "📅 Calendrier"
- ✅ "➕ Nouveau Planning" button visible
- ✅ References loading (Classes, Subjects, Rooms)

---

#### Test 3.2: Create Schedule
**Steps**:
1. Click "➕ Nouveau Planning"
2. Fill required fields:
   - Créneau: Select "Lundi 08:00-10:00"
   - Classe: Select any class
   - Matière: Select any subject
3. Fill optional fields (optional):
   - Salle: Select a room
   - Type de Cours: "Cours"
   - Statut: "planifie"
   - Notes: "Mathematics class"
4. Click "✓ Créer le Planning"

**Expected Results**:
- ✅ Form displays correctly
- ✅ Dropdown options load
- ✅ Form submits
- ✅ Success message shows
- ✅ Form clears/closes
- ✅ List view updates

**Verify Creation**:
- Schedule appears in table
- Shows correct time slot
- Shows correct class
- Shows correct subject

---

#### Test 3.3: Create Multiple Schedules
**Steps**:
1. Create 3-4 more schedules using different time slots and classes

**Expected Results**:
- ✅ All schedules created
- ✅ Table shows all schedules
- ✅ Statistics updated at bottom

---

#### Test 3.4: View Schedules in List
**Steps**:
1. Ensure "📋 Liste" tab is active
2. Look at table

**Expected Results**:
- ✅ Table shows all columns: Créneau, Classe, Matière, Salle, Type, Dates, Statut, Actions
- ✅ All data displays correctly
- ✅ Status badges show with colors:
  - 🟡 Yellow for "planifié"
  - 🟢 Green for "confirmé"
  - 🔴 Red for "annulé"
  - 🔵 Cyan for "terminé"

---

#### Test 3.5: Switch to Calendar View
**Steps**:
1. Click "📅 Calendrier" tab

**Expected Results**:
- ✅ Calendar view loads
- ✅ Shows class schedule grid
- ✅ Shows courses as cards
- ✅ Each card shows:
  - Time range (e.g., "08:00 - 10:00")
  - Subject name
  - Course type badge
  - Status badge

---

#### Test 3.6: Drag & Drop in Calendar
**Prerequisites**:
- Must be in Calendar tab
- Must have multiple schedules

**Steps**:
1. Find a course card
2. Click and hold on it
3. Drag to another day column
4. Release mouse

**Expected Results**:
- ✅ Card becomes semi-transparent while dragging
- ✅ Target day highlights
- ✅ Card moves to target day
- ✅ System finds available time slot
- ✅ Success notification shows
- ✅ Calendar refreshes
- ✅ Course now appears on new day

**Verify Move**:
- Course no longer on original day
- Course appears on target day
- Time might change (if moved to different slot)

---

#### Test 3.7: Edit Schedule
**Steps**:
1. In List tab, find a schedule
2. Click ✏️ button
3. Modify:
   - Change "Type de Cours" to "TD"
   - Change "Statut" to "confirmé"
   - Add notes: "Moved for testing"
4. Click "✓ Mettre à jour"

**Expected Results**:
- ✅ Form populates with existing data
- ✅ Changes are reflected
- ✅ Update submits
- ✅ Success message shows
- ✅ Table updates with new values

**Verify Changes**:
- Schedule shows new type "TD"
- Status badge changed to green "confirmé"
- Notes visible when hovering

---

#### Test 3.8: Delete Schedule
**Steps**:
1. Find a schedule in table
2. Click 🗑️ button
3. Confirm deletion

**Expected Results**:
- ✅ Confirmation dialog appears
- ✅ Upon confirmation, schedule deleted
- ✅ Table updates
- ✅ Success message shown
- ✅ Statistics updated

---

#### Test 3.9: Status Management
**Steps**:
1. Create a schedule with status "planifie" (yellow)
2. Edit it and change status to "confirmé" (green)
3. Edit again and change to "annulé" (red)
4. Edit again and change to "terminé" (blue)

**Expected Results**:
- ✅ Status badge color changes each time
- ✅ Cancelled schedules show as struck-through (optional)
- ✅ All statuses display correctly

---

### Phase 4: Advanced Features (15 min)

#### Test 4.1: Reference Data Loading
**Steps**:
1. Open create schedule form
2. Click "Classe" dropdown

**Expected Results**:
- ✅ Dropdown loads with classes
- ✅ Multiple options available
- ✅ Can select any class
- ✅ Same for Matière and Salle dropdowns

**Troubleshooting**:
- ❌ If dropdowns empty: Create classes in ReferenceManagement first

---

#### Test 4.2: Time Slot Integration
**Steps**:
1. Create a schedule
2. In "Créneau" dropdown, verify all created time slots appear

**Expected Results**:
- ✅ All time slots visible in dropdown
- ✅ Format shows: "Lundi 08:00 - 10:00"
- ✅ Can select any slot

---

#### Test 4.3: Statistics Display
**Steps**:
1. Create schedules with different statuses
2. Scroll to bottom of page

**Expected Results**:
- ✅ Statistics show:
  - "Total: X plannings"
  - "Planifiés: X"
  - "Confirmés: X"
  - "Annulés: X"
- ✅ Numbers update when schedules added/deleted

---

#### Test 4.4: Error Handling
**Steps**:
1. Try creating schedule without required fields
2. Try deleting schedule (confirm cancellation to skip)
3. Stop backend server and try API call

**Expected Results**:
- ✅ Missing fields show error: "Le créneau, la classe et la matière sont requis"
- ✅ Deletion cancellation doesn't delete
- ✅ Backend error shows: "Erreur lors du chargement..."
- ✅ Can recover by restarting server

---

### Phase 5: Mobile Responsiveness (10 min)

#### Test 5.1: Mobile View
**Steps**:
1. Open browser DevTools (F12)
2. Click "Device Toolbar" or Ctrl+Shift+M
3. Select iPhone 12 or similar
4. Navigate to calendar pages

**Expected Results**:
- ✅ Layout stacks vertically
- ✅ Table converts to card view (on mobile)
- ✅ Buttons remain clickable
- ✅ Forms remain usable
- ✅ No horizontal scroll needed

---

#### Test 5.2: Touch Interactions (on mobile device)
**Steps**:
1. On actual mobile device or emulator
2. Try creating/editing schedules
3. Try drag & drop

**Expected Results**:
- ✅ Forms usable with touch
- ✅ Buttons clickable
- ✅ Dropdowns work
- ✅ Drag might not work on all mobile browsers (expected)

---

### Phase 6: Browser Compatibility (10 min)

#### Test 6.1: Chrome/Edge
**Steps**:
1. Use Chrome or Edge browser
2. Test all functionality

**Expected**:
- ✅ Everything works

---

#### Test 6.2: Firefox
**Steps**:
1. Switch to Firefox browser
2. Test all functionality

**Expected**:
- ✅ Everything works
- ✅ Might be slightly slower

---

#### Test 6.3: Safari
**Steps**:
1. Switch to Safari browser
2. Test all functionality

**Expected**:
- ✅ Everything works
- ✅ Animations smooth

---

### Phase 7: Performance Testing (10 min)

#### Test 7.1: Load Time
**Steps**:
1. Open DevTools (F12) → Network tab
2. Navigate to `/admin/calendar/schedules`
3. Measure time to fully load

**Expected**:
- ✅ Page loads in < 2 seconds
- ✅ Data appears quickly

---

#### Test 7.2: Large Dataset
**Steps**:
1. Create 100 schedules
2. Navigate to list view
3. Try scrolling and interacting

**Expected**:
- ✅ Page still responsive
- ✅ No major slowdown
- ✅ Scrolling smooth

---

### Phase 8: Edge Cases (10 min)

#### Test 8.1: Duplicate Time Slots
**Steps**:
1. Create Monday 08:00-10:00 twice

**Expected**:
- ✅ Both allowed to exist
- ✅ No error

---

#### Test 8.2: Overlapping Schedules
**Steps**:
1. Create Schedule A: Monday 08:00-10:00
2. Create Schedule B: Monday 09:00-11:00

**Expected**:
- ✅ Both allowed
- ✅ No conflict warning (optional feature)

---

#### Test 8.3: Concurrent Operations
**Steps**:
1. Open two browser windows
2. In window 1: Create a schedule
3. In window 2: Create a schedule simultaneously

**Expected**:
- ✅ Both created successfully
- ✅ No data loss

---

#### Test 8.4: Rapid Clicking
**Steps**:
1. Click "Créer" button multiple times rapidly

**Expected**:
- ✅ Only one schedule created (button disabled)
- ✅ Loading state shows
- ✅ No duplicate entries

---

### Phase 9: Data Integrity (10 min)

#### Test 9.1: Persistence After Refresh
**Steps**:
1. Create a schedule
2. Press F5 to refresh page
3. Check if schedule still exists

**Expected**:
- ✅ Schedule still there
- ✅ All data intact
- ✅ No data lost

---

#### Test 9.2: Edit and Verify
**Steps**:
1. Create schedule
2. Edit it
3. Refresh page
4. Edit again and verify changes saved

**Expected**:
- ✅ Changes persist
- ✅ All edits saved to database

---

#### Test 9.3: Delete and Verify
**Steps**:
1. Create schedule
2. Delete it
3. Refresh page
4. Verify it's gone

**Expected**:
- ✅ Deletion persists
- ✅ Schedule gone after refresh

---

### Phase 10: API Endpoint Testing (15 min)

#### Test 10.1: GET All Schedules
**Command**:
```bash
curl http://localhost:3000/api/calendar/schedules
```

**Expected**:
- ✅ Returns JSON array
- ✅ Contains all schedules
- ✅ Status 200

---

#### Test 10.2: CREATE Schedule
**Command**:
```bash
curl -X POST http://localhost:3000/api/calendar/schedules \
  -H "Content-Type: application/json" \
  -d '{
    "time_slot_id": 1,
    "classe_id": 1,
    "matiere_id": 1,
    "date_debut": "2024-01-15",
    "statut": "planifie"
  }'
```

**Expected**:
- ✅ Returns 201 Created
- ✅ Returns created schedule with ID

---

#### Test 10.3: UPDATE Schedule
**Command**:
```bash
curl -X PUT http://localhost:3000/api/calendar/schedules/1 \
  -H "Content-Type: application/json" \
  -d '{"statut": "confirmé"}'
```

**Expected**:
- ✅ Returns 200 OK
- ✅ Schedule updated

---

#### Test 10.4: DELETE Schedule
**Command**:
```bash
curl -X DELETE http://localhost:3000/api/calendar/schedules/1
```

**Expected**:
- ✅ Returns 200 OK
- ✅ Schedule deleted

---

## 📊 Test Results Summary

### Functional Tests
- [ ] Time Slots: Create, Read, Update, Delete
- [ ] Schedules: Create, Read, Update, Delete
- [ ] Drag & Drop: Move between days
- [ ] Calendar View: Display with times
- [ ] Statistics: Count and display
- [ ] Form Validation: Required fields
- [ ] Error Handling: User-friendly messages

### Integration Tests
- [ ] API Connectivity: Backend responding
- [ ] Data Persistence: Changes saved to DB
- [ ] Reference Loading: Classes, Subjects, Rooms
- [ ] State Management: UI updates correctly
- [ ] Routing: Navigation works

### UI Tests
- [ ] Responsive Design: Mobile & Desktop
- [ ] Accessibility: Readable by screen readers
- [ ] Navigation: Tabs and buttons work
- [ ] Forms: Input fields functional
- [ ] Loading States: Shown correctly

### Performance Tests
- [ ] Load Time: < 2 seconds
- [ ] API Response: < 1 second
- [ ] Drag & Drop: Smooth (60fps)
- [ ] Large Dataset: Responsive

### Browser Tests
- [ ] Chrome: ✅
- [ ] Firefox: ✅
- [ ] Safari: ✅
- [ ] Edge: ✅
- [ ] Mobile: ✅

---

## 🐛 Bug Tracking Template

If you find an issue:

```markdown
### Bug: [Title]

**Steps to Reproduce**:
1. ...
2. ...
3. ...

**Expected Result**:
...

**Actual Result**:
...

**Error Message**:
...

**Browser**: 
- Chrome 120 on Windows 10

**Reproducible**: 
- [ ] Always
- [ ] Sometimes
- [ ] Can't reproduce
```

---

## ✅ Final Verification

Before marking as complete:

- [ ] All CRUD operations work
- [ ] No console errors
- [ ] No 404 errors
- [ ] Mobile responsive
- [ ] Data persists
- [ ] Error messages display correctly
- [ ] Performance acceptable
- [ ] Documentation accurate

---

**🎉 Congratulations!** 

If all tests pass, your calendar system is ready for production use!

---

*Testing Guide: Complete*  
*Test Coverage: Comprehensive*  
*Status: Ready for QA ✅*
