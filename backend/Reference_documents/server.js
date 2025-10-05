const express = require("express");
 const cors = require("cors");
// Use the shared sequelize instance from auth-service
const sequelize = require("../auth-service/config");
const ReferenceRoutes = require("./routes/Reference");
const app = express();
app.use(express.json());



app.use(cors({ origin: "http://localhost:5173", 
  credentials: true }));
app.use("/api/reference", ReferenceRoutes);


sequelize.sync({ alter: true }).then(async () => {
  // Create the referentiels schema if it doesn't exist
  await sequelize.query('CREATE SCHEMA IF NOT EXISTS referentiels;');
  console.log("✅ Referentiels schema created/verified");
  console.log("✅ Models synced with DB");
  app.listen(3000, () => console.log("Reference service running on port 3000"));
}).catch(async (error) => {
  console.log("Schema might not exist, creating it...");
  try {
    // Create the referentiels schema first
    await sequelize.query('CREATE SCHEMA IF NOT EXISTS referentiels;');
    console.log("✅ Referentiels schema created");
    
    // Then sync the models
    await sequelize.sync({ alter: true });
    console.log("✅ Models synced with DB");
    app.listen(3000, () => console.log("Reference service running on port 3000"));
  } catch (err) {
    console.error("❌ Failed to setup database:", err);
  }
});

