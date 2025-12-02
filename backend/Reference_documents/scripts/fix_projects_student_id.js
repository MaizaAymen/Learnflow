const sequelize = require('../../auth-service/config');

async function fixProjectsStudentId() {
  try {
    console.log('🔨 Fixing projects.studentId with NULL values...');
    
    // First check for NULL values
    const nullCount = await sequelize.query(`
      SELECT COUNT(*) as count FROM "auth"."projects" WHERE "studentId" IS NULL;
    `);
    console.log(`Found ${nullCount[0][0].count} NULL values in projects.studentId`);
    
    if (nullCount[0][0].count > 0) {
      // Convert non-NULL values first
      await sequelize.query(`
        ALTER TABLE "auth"."projects" ALTER COLUMN "studentId" TYPE INTEGER 
        USING CASE 
          WHEN "studentId" IS NULL THEN NULL
          ELSE CAST(SUBSTRING(CAST("studentId" AS TEXT), 1, POSITION('-' IN CAST("studentId" AS TEXT))-1) AS INTEGER)
        END;
      `);
      console.log('✅ projects.studentId successfully converted');
    } else {
      console.log('✅ No NULL values found');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

fixProjectsStudentId();
