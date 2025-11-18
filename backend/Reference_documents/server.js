const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
// Use the shared sequelize instance from auth-service
const sequelize = require("../auth-service/config");

// ⭐ IMPORTANT: Require models BEFORE routes to establish relationships
const models = require("./models");
const {
  Departement,
  Specialite,
  Niveau,
  Classe,
  Salle,
  Matiere,
  Course,
  Schedule,
  TimeSlot,
  Booking,
  MatiereEnseignant,
  MatiereClasse,
  Absence,
  Rattrapage,
  Student,
  StudentAbsence,
  User
} = models;

const ReferenceRoutes = require("./routes/Reference");
const CalendarRoutes = require("./routes/Calendar");
const StudentsRoutes = require("./routes/Students");
const TeacherCalendarRoutes = require("./routes/TeacherCalendar");
const DirectorApprovalRoutes = require("./routes/DirectorApproval");

const app = express();
app.use(express.json());
app.use(cookieParser()); // Parse cookies

app.use(cors({ origin: "http://localhost:5173", 
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  credentials: true }));
app.use("/api/reference", ReferenceRoutes);
app.use("/api/calendar", CalendarRoutes);
app.use("/api/students", StudentsRoutes);
app.use("/api/student", StudentsRoutes);  // ✅ Alternative path for auth service compatibility
app.use("/api/teacher", TeacherCalendarRoutes);
app.use("/api/classes", TeacherCalendarRoutes);
app.use("/api/director", DirectorApprovalRoutes);

// Initialize database with proper sync order
async function initializeDatabase() {
  try {
    // Store models in app for access in routes
    app.set('models', models);
    
    // 1. Create schema first
    await sequelize.query('CREATE SCHEMA IF NOT EXISTS referentiels;');
    console.log("✅ Referentiels schema created/verified");

    // 2. Disable foreign key constraints during sync
    await sequelize.query('SET session_replication_role = replica;');
    
    // 3. Sync ALL models (order doesn't matter now, constraints are disabled)
    await sequelize.sync({ alter: false, force: false });
    console.log("✅ All models synced with DB");

    // 4. Re-enable foreign key constraints
    await sequelize.query('SET session_replication_role = DEFAULT;');
    console.log("✅ Foreign key constraints enabled");

    // 4.5. Fix StudentAbsence foreign key constraint
    // The table has a FK pointing to referentiels.student but should point to auth.utilisateur
    try {
      console.log("🔧 Fixing StudentAbsence foreign key constraint...");
      
      // Drop ALL existing FKs on student_id column (they might have numbered suffixes)
      const dropConstraints = `
        SELECT constraint_name 
        FROM information_schema.table_constraints 
        WHERE table_schema = 'referentiels' 
        AND table_name = 'student_absence' 
        AND constraint_type = 'FOREIGN KEY'
        AND constraint_name LIKE 'student_absence_student_id_fkey%'
      `;
      
      const constraints = await sequelize.query(dropConstraints, { raw: true });
      console.log("📋 Found constraints:", constraints[0].map(c => c.constraint_name));
      
      // Drop each constraint
      for (const constraint of constraints[0]) {
        try {
          await sequelize.query(`
            ALTER TABLE referentiels.student_absence
            DROP CONSTRAINT IF EXISTS "${constraint.constraint_name}"
          `);
          console.log(`✅ Dropped constraint: ${constraint.constraint_name}`);
        } catch (err) {
          console.warn(`⚠️  Could not drop ${constraint.constraint_name}:`, err.message);
        }
      }
      
      // Add correct FK pointing to auth.utilisateur
      await sequelize.query(`
        ALTER TABLE referentiels.student_absence
        ADD CONSTRAINT student_absence_student_id_fkey 
        FOREIGN KEY (student_id) 
        REFERENCES auth.utilisateur(id)
        ON DELETE CASCADE 
        ON UPDATE CASCADE
      `).catch(err => {
        if (!err.message.includes("already exists")) {
          console.warn("⚠️  Could not add StudentAbsence FK constraint:", err.message);
        }
      });
      
      console.log("✅ StudentAbsence foreign key constraint fixed");
    } catch (err) {
      console.warn("⚠️  Warning during FK constraint fix:", err.message);
    }

    // 5. Start server
    const server = app.listen(3000, () => {
      console.log("✅ Reference service running on port 3000");
    });
    
    // Handle graceful shutdown
    process.on('SIGTERM', async () => {
      console.log('SIGTERM signal received: closing HTTP server');
      server.close(async () => {
        console.log('HTTP server closed');
        await sequelize.close();
        process.exit(0);
      });
    });
    
    // Handle SIGINT (Ctrl+C)
    process.on('SIGINT', async () => {
      console.log('\nSIGINT signal received: closing HTTP server');
      server.close(async () => {
        console.log('HTTP server closed');
        await sequelize.close();
        process.exit(0);
      });
    });
    
    // Prevent process from exiting
    process.stdin.resume();
  } catch (err) {
    console.error("❌ Failed to setup database:", err);
    console.error("Error details:", err.message);
    
    // Try to provide helpful debugging info
    if (err.message.includes("n'existe pas") || err.message.includes("does not exist")) {
      console.error("💡 Hint: A referenced table doesn't exist. This might be a constraint issue.");
    }
    
    // Try to re-enable constraints if we failed
    try {
      await sequelize.query('SET session_replication_role = DEFAULT;');
    } catch (e) {
      // Ignore cleanup errors
    }
    
    process.exit(1);
  }
}

initializeDatabase();

