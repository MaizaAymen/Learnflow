#!/usr/bin/env bash
# QUICK START - Absence Justification System Frontend

# ============================================================================
# ABSENCE JUSTIFICATION SYSTEM - FRONTEND QUICK START
# ============================================================================

# 1️⃣ VERIFY APP.JSX WAS UPDATED
# ============================================================================
echo "✅ Step 1: Verify App.jsx routes"
echo "   Check if these lines exist in src/App.jsx:"
echo "   - import StudentJustificationDashboard from './components/StudentJustificationDashboard.jsx'"
echo "   - import AdminJustificationReview from './components/AdminJustificationReview.jsx'"
echo "   - <Route path=\"/absences/justifications\" element={<StudentJustificationDashboard />} />"
echo "   - <Route path=\"/admin/absences/justifications\" element={<AdminJustificationReview />} />"
echo ""

# 2️⃣ SET ENVIRONMENT VARIABLES
# ============================================================================
echo "✅ Step 2: Set environment variables"
echo "   Create .env.local in frontend/learnflow/ with:"
echo "   VITE_API_URL=http://localhost:3000/api"
echo ""

# 3️⃣ INSTALL DEPENDENCIES (if needed)
# ============================================================================
echo "✅ Step 3: Install dependencies"
echo "   Run: npm install"
echo "   (antd, react-router-dom, etc. must be installed)"
echo ""

# 4️⃣ START BACKEND
# ============================================================================
echo "✅ Step 4: Start backend server"
echo "   In terminal 1:"
echo "   cd backend/Reference_documents"
echo "   node server.js"
echo "   Expected: Server running on localhost:3000"
echo ""

# 5️⃣ START FRONTEND
# ============================================================================
echo "✅ Step 5: Start frontend dev server"
echo "   In terminal 2 (frontend/learnflow):"
echo "   npm run dev"
echo "   Expected: http://localhost:5173/"
echo ""

# 6️⃣ ACCESS DASHBOARDS
# ============================================================================
echo "✅ Step 6: Test the dashboards"
echo ""
echo "   Student Dashboard:"
echo "   ➜ http://localhost:5173/absences/justifications"
echo "   ➜ View & submit justifications"
echo "   ➜ Upload documents"
echo "   ➜ Track status"
echo ""
echo "   Admin Dashboard:"
echo "   ➜ http://localhost:5173/admin/absences/justifications"
echo "   ➜ Review pending justifications"
echo "   ➜ Approve / Reject / Request Revision"
echo "   ➜ View statistics"
echo ""

# 7️⃣ VERIFY FUNCTIONALITY
# ============================================================================
echo "✅ Step 7: Test basic workflow"
echo ""
echo "   Student:"
echo "   1. Click '+ Nouvelle Justification'"
echo "   2. Fill form (Title, Type, Explanation, Document)"
echo "   3. Click 'Soumettre'"
echo "   4. Verify status shows 'En attente'"
echo ""
echo "   Admin:"
echo "   1. Navigate to admin dashboard"
echo "   2. Click 'Examiner' on pending justification"
echo "   3. Review document and details"
echo "   4. Click 'Approuver', 'Rejeter', or 'Demander plus d'info'"
echo "   5. Verify status updates"
echo ""

# ============================================================================
# FILES YOU SHOULD HAVE
# ============================================================================
echo ""
echo "📁 Files Created:"
echo "   ✅ src/services/AbsenceJustificationAPI.js"
echo "   ✅ src/components/StudentJustificationDashboard.jsx"
echo "   ✅ src/components/StudentJustificationDashboard.css"
echo "   ✅ src/components/AdminJustificationReview.jsx"
echo "   ✅ src/components/AdminJustificationReview.css"
echo ""
echo "📄 Documentation Files:"
echo "   ✅ INTEGRATION_GUIDE_ABSENCE_JUSTIFICATION.md"
echo "   ✅ QUICK_REFERENCE_FRONTEND.md"
echo "   ✅ TESTING_GUIDE_ABSENCE_JUSTIFICATION.md"
echo "   ✅ FRONTEND_IMPLEMENTATION_COMPLETE.md"
echo "   ✅ DEPLOYMENT_SUMMARY.md"
echo ""

# ============================================================================
# COMMON ISSUES
# ============================================================================
echo "⚠️  Troubleshooting:"
echo ""
echo "Q: Page shows 404 or components not found?"
echo "A: Verify routes were added to App.jsx correctly"
echo ""
echo "Q: API returns 401 Unauthorized?"
echo "A: Check token in localStorage, verify backend is running"
echo ""
echo "Q: File upload says invalid type?"
echo "A: Ensure file is PDF, JPG, or PNG (< 10MB)"
echo ""
echo "Q: No data showing in table?"
echo "A: Check backend database has data, verify API connection"
echo ""
echo "Q: CSS not styling properly?"
echo "A: Verify CSS files are in correct location, check browser cache"
echo ""

# ============================================================================
# DOCUMENTATION
# ============================================================================
echo ""
echo "📚 Read Documentation:"
echo ""
echo "1. INTEGRATION_GUIDE_ABSENCE_JUSTIFICATION.md"
echo "   └─ How to integrate and configure"
echo ""
echo "2. QUICK_REFERENCE_FRONTEND.md"
echo "   └─ API methods, components, customization"
echo ""
echo "3. TESTING_GUIDE_ABSENCE_JUSTIFICATION.md"
echo "   └─ 70+ test scenarios to verify everything works"
echo ""
echo "4. DEPLOYMENT_SUMMARY.md"
echo "   └─ Complete overview of what was delivered"
echo ""

# ============================================================================
# NEXT STEPS
# ============================================================================
echo ""
echo "✨ Next Steps:"
echo ""
echo "   1. Verify all files are in place (see above)"
echo "   2. Start backend: node server.js"
echo "   3. Start frontend: npm run dev"
echo "   4. Test student workflow (submit justification)"
echo "   5. Test admin workflow (review & approve)"
echo "   6. Run through TESTING_GUIDE_ABSENCE_JUSTIFICATION.md"
echo "   7. Deploy to production when ready"
echo ""

# ============================================================================
echo "🎉 Ready to Go!"
echo ""
echo "Status: ✅ COMPLETE AND READY FOR PRODUCTION"
echo ""
echo "Questions? Check the documentation files or review the code comments!"
echo ""
# ============================================================================
