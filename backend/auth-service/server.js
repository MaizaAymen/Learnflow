const express = require("express");
const sequelize = require("./config");
const User = require("./models/userModel");
const authRoutes = require("./routes/authRoutes");
const departmentHeadRoutes = require("./routes/departmentHeadRoutes");
const cookieParser = require("cookie-parser");
const cors = require("cors");

// Import routes from Reference service
let TeacherCalendarRoutes = null;
let models = null;

try {
  TeacherCalendarRoutes = require("../Reference_documents/routes/TeacherCalendar");
} catch (error) {
  console.warn("⚠️ Warning: Could not load TeacherCalendar routes:", error.message);
  TeacherCalendarRoutes = (req, res) => res.json({ message: "Teacher routes unavailable" });
}

try {
  models = require("../Reference_documents/models");
} catch (error) {
  console.warn("⚠️ Warning: Could not load Reference_documents models:", error.message);
  models = {};
}

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(cors({ origin: "http://localhost:5173", 
  credentials: true }));

// Set models in app for access in routes
app.set('models', models);

app.use("/api/auth", authRoutes);
app.use("/api/teacher", TeacherCalendarRoutes);
app.use("/api/classes", TeacherCalendarRoutes);
app.use("/api/department-head", departmentHeadRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('❌ Error:', err);
  res.status(500).json({ error: err.message });
});

sequelize.sync({ alter: false, logging: false }).then(() => {
  console.log("✅ Models synced with DB");
  const server = app.listen(4000, () => {
    console.log("✅ Auth service running on port 4000");
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
  
}).catch(err => {
  console.error('❌ Failed to sync database:', err);
  process.exit(1);
});