/**
 * Fix Announcements table - Convert UUID columns to STRING
 * Run with: node fix_announcements_table.js
 */

const sequelize = require("../auth-service/config");

async function fixAnnouncementsTable() {
  try {
    console.log('🔧 Starting to fix announcements table...');

    // Drop and recreate the announcements table with correct column types
    await sequelize.query(`
      DROP TABLE IF EXISTS "auth"."announcements" CASCADE;
    `);
    console.log('✅ Dropped old announcements table');

    // Create the announcements table with STRING columns instead of UUID
    await sequelize.query(`
      CREATE TABLE "auth"."announcements" (
        "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "title" VARCHAR(255) NOT NULL,
        "content" TEXT NOT NULL,
        "type" VARCHAR(50) DEFAULT 'announcement',
        "authorId" VARCHAR(255) NOT NULL,
        "authorName" VARCHAR(255),
        "authorRole" VARCHAR(50),
        "department" VARCHAR(255),
        "departmentName" VARCHAR(255),
        "courseId" VARCHAR(255),
        "visibility" VARCHAR(50) DEFAULT 'all',
        "priority" VARCHAR(50) DEFAULT 'medium',
        "imageUrl" VARCHAR(255),
        "attachments" JSONB DEFAULT '[]',
        "tags" JSONB DEFAULT '[]',
        "isPinned" BOOLEAN DEFAULT false,
        "isPublished" BOOLEAN DEFAULT true,
        "publishedAt" TIMESTAMP DEFAULT NOW(),
        "expiresAt" TIMESTAMP,
        "viewCount" INTEGER DEFAULT 0,
        "commentCount" INTEGER DEFAULT 0,
        "createdAt" TIMESTAMP DEFAULT NOW(),
        "updatedAt" TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log('✅ Created new announcements table with correct column types');

    // Create indexes
    await sequelize.query(`
      CREATE INDEX idx_announcements_authorId ON "auth"."announcements"("authorId");
      CREATE INDEX idx_announcements_publishedAt ON "auth"."announcements"("publishedAt");
      CREATE INDEX idx_announcements_type ON "auth"."announcements"("type");
      CREATE INDEX idx_announcements_isPinned_publishedAt ON "auth"."announcements"("isPinned", "publishedAt");
    `);
    console.log('✅ Created indexes');

    console.log('✅ Announcements table successfully fixed!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error fixing announcements table:', error);
    process.exit(1);
  }
}

fixAnnouncementsTable();
