const sequelize = require('../../auth-service/config');
const { QueryTypes } = require('sequelize');

async function fixCourseIdType() {
  try {
    console.log('🔧 Starting migration: Drop and recreate projects table with correct schema...');

    // 1. Check if table exists
    const tableCheck = await sequelize.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'auth' 
        AND table_name = 'projects'
      );
    `, { type: QueryTypes.SELECT });

    if (!tableCheck[0].exists) {
      console.log('❌ Projects table not found');
      return;
    }

    console.log('📋 Backing up existing data...');
    // 2. Backup existing data
    await sequelize.query(`
      CREATE TABLE "auth"."projects_backup" AS
      SELECT * FROM "auth"."projects";
    `);
    console.log('✅ Backup created');

    // 3. Drop the old table
    console.log('🗑️  Dropping old projects table...');
    await sequelize.query(`
      DROP TABLE IF EXISTS "auth"."projects" CASCADE;
    `);
    console.log('✅ Old table dropped');

    // 4. Create new table with correct schema
    console.log('🔨 Creating new projects table with INTEGER courseId...');
    await sequelize.query(`
      CREATE TABLE "auth"."projects" (
        "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "title" VARCHAR(255) NOT NULL,
        "description" TEXT,
        "courseId" INTEGER NOT NULL,
        "projectType" VARCHAR(50) NOT NULL,
        "studentId" UUID,
        "studentGroup" JSONB DEFAULT '[]'::jsonb,
        "topic" TEXT NOT NULL,
        "description_detailed" TEXT,
        "objectives" JSONB DEFAULT '[]'::jsonb,
        "status" VARCHAR(50) DEFAULT 'draft',
        "submissionDate" TIMESTAMP,
        "approvedBy" UUID,
        "approvedAt" TIMESTAMP,
        "supervisorId" UUID,
        "juries" JSONB DEFAULT '[]'::jsonb,
        "reportPath" VARCHAR(500),
        "reportSubmittedAt" TIMESTAMP,
        "presentationDate" TIMESTAMP,
        "presentationLocation" VARCHAR(255),
        "evaluationScore" DECIMAL(5,2),
        "evaluationFeedback" TEXT,
        "meetings" JSONB DEFAULT '[]'::jsonb,
        "tags" JSONB DEFAULT '[]'::jsonb,
        "createdAt" TIMESTAMP DEFAULT NOW(),
        "updatedAt" TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log('✅ New projects table created');

    // 5. Restore data (only compatible columns)
    console.log('📥 Restoring data...');
    await sequelize.query(`
      INSERT INTO "auth"."projects" (
        "id", "title", "description", "courseId", "projectType", "studentId", 
        "studentGroup", "topic", "description_detailed", "objectives", "status",
        "submissionDate", "approvedBy", "approvedAt", "supervisorId", "juries",
        "reportPath", "reportSubmittedAt", "presentationDate", "presentationLocation",
        "evaluationScore", "evaluationFeedback", "meetings", "tags", "createdAt", "updatedAt"
      )
      SELECT 
        "id", "title", "description", CAST(CAST("courseId" AS TEXT) AS INTEGER), 
        "projectType", "studentId", "studentGroup", "topic", "description_detailed", 
        "objectives", "status", "submissionDate", "approvedBy", "approvedAt", 
        "supervisorId", "juries", "reportPath", "reportSubmittedAt", "presentationDate", 
        "presentationLocation", "evaluationScore", "evaluationFeedback", "meetings", 
        "tags", "createdAt", "updatedAt"
      FROM "auth"."projects_backup"
      WHERE "courseId" IS NOT NULL;
    `);
    console.log('✅ Data restored');

    // 6. Drop backup table
    console.log('🗑️  Cleaning up backup...');
    await sequelize.query(`
      DROP TABLE "auth"."projects_backup";
    `);
    console.log('✅ Backup cleaned up');

    // 7. Verify the change
    const verify = await sequelize.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_schema = 'auth' AND table_name = 'projects' AND column_name = 'courseId'
    `, { type: QueryTypes.SELECT });

    console.log('✅ Verified courseId type:', verify[0]);
    console.log('✅✅ Migration completed successfully!');

  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.error('🔙 Rolling back...');
    try {
      await sequelize.query(`
        DROP TABLE IF EXISTS "auth"."projects";
      `);
      await sequelize.query(`
        ALTER TABLE "auth"."projects_backup" RENAME TO "projects";
      `);
      console.log('✅ Rollback successful');
    } catch (rollbackError) {
      console.error('❌ Rollback failed:', rollbackError.message);
    }
  } finally {
    await sequelize.close();
  }
}

fixCourseIdType();
