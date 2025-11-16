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
app.use("/api/teacher", TeacherCalendarRoutes);
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

    // 5. Start server
    app.listen(3000, () => console.log("✅ Reference service running on port 3000"));
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

