const sequelize = require('../../auth-service/config');

async function fixUserIdTypes() {
  try {
    console.log('🔨 Starting to fix user ID types from UUID to INTEGER...');

    // First, let's disable foreign key constraints temporarily
    await sequelize.query('SET session_replication_role = replica;');
    
    // List of ALTER statements with USING clause to handle UUID->INTEGER conversion
    const alterStatements = [
      'ALTER TABLE "auth"."feedbacks" ALTER COLUMN "userId" TYPE INTEGER USING (CAST(SUBSTRING(CAST("userId" AS TEXT), 1, POSITION(\'-\' IN CAST("userId" AS TEXT))-1) AS INTEGER));',
      'ALTER TABLE "auth"."help_desks" ALTER COLUMN "userId" TYPE INTEGER USING (CAST(SUBSTRING(CAST("userId" AS TEXT), 1, POSITION(\'-\' IN CAST("userId" AS TEXT))-1) AS INTEGER));',
      'ALTER TABLE "auth"."help_desk_messages" ALTER COLUMN "userId" TYPE INTEGER USING (CAST(SUBSTRING(CAST("userId" AS TEXT), 1, POSITION(\'-\' IN CAST("userId" AS TEXT))-1) AS INTEGER));',
      'ALTER TABLE "auth"."survey_responses" ALTER COLUMN "userId" TYPE INTEGER USING (CAST(SUBSTRING(CAST("userId" AS TEXT), 1, POSITION(\'-\' IN CAST("userId" AS TEXT))-1) AS INTEGER));',
      'ALTER TABLE "auth"."grades" ALTER COLUMN "studentId" TYPE INTEGER USING (CAST(SUBSTRING(CAST("studentId" AS TEXT), 1, POSITION(\'-\' IN CAST("studentId" AS TEXT))-1) AS INTEGER));',
      'ALTER TABLE "auth"."grades" ALTER COLUMN "createdBy" TYPE INTEGER USING (CAST(SUBSTRING(CAST("createdBy" AS TEXT), 1, POSITION(\'-\' IN CAST("createdBy" AS TEXT))-1) AS INTEGER));',
      'ALTER TABLE "auth"."grade_history" ALTER COLUMN "studentId" TYPE INTEGER USING (CAST(SUBSTRING(CAST("studentId" AS TEXT), 1, POSITION(\'-\' IN CAST("studentId" AS TEXT))-1) AS INTEGER));',
      'ALTER TABLE "auth"."grade_history" ALTER COLUMN "modifiedBy" TYPE INTEGER USING (CAST(SUBSTRING(CAST("modifiedBy" AS TEXT), 1, POSITION(\'-\' IN CAST("modifiedBy" AS TEXT))-1) AS INTEGER));',
      'ALTER TABLE "auth"."faqs" ALTER COLUMN "createdBy" TYPE INTEGER USING (CAST(SUBSTRING(CAST("createdBy" AS TEXT), 1, POSITION(\'-\' IN CAST("createdBy" AS TEXT))-1) AS INTEGER));',
      'ALTER TABLE "auth"."surveys" ALTER COLUMN "createdBy" TYPE INTEGER USING (CAST(SUBSTRING(CAST("createdBy" AS TEXT), 1, POSITION(\'-\' IN CAST("createdBy" AS TEXT))-1) AS INTEGER));',
      'ALTER TABLE "auth"."projects" ALTER COLUMN "studentId" TYPE INTEGER USING (CAST(SUBSTRING(CAST("studentId" AS TEXT), 1, POSITION(\'-\' IN CAST("studentId" AS TEXT))-1) AS INTEGER));',
      'ALTER TABLE "auth"."projects" ALTER COLUMN "supervisorId" TYPE INTEGER USING (CAST(SUBSTRING(CAST("supervisorId" AS TEXT), 1, POSITION(\'-\' IN CAST("supervisorId" AS TEXT))-1) AS INTEGER));',
      'ALTER TABLE "auth"."projects" ALTER COLUMN "approvedBy" TYPE INTEGER USING (CAST(SUBSTRING(CAST("approvedBy" AS TEXT), 1, POSITION(\'-\' IN CAST("approvedBy" AS TEXT))-1) AS INTEGER));',
      'ALTER TABLE "auth"."student_requests" ALTER COLUMN "studentId" TYPE INTEGER USING (CAST(SUBSTRING(CAST("studentId" AS TEXT), 1, POSITION(\'-\' IN CAST("studentId" AS TEXT))-1) AS INTEGER));',
      'ALTER TABLE "auth"."student_requests" ALTER COLUMN "assignedTo" TYPE INTEGER USING (CAST(SUBSTRING(CAST("assignedTo" AS TEXT), 1, POSITION(\'-\' IN CAST("assignedTo" AS TEXT))-1) AS INTEGER));',
      'ALTER TABLE "auth"."internships" ALTER COLUMN "studentId" TYPE INTEGER USING (CAST(SUBSTRING(CAST("studentId" AS TEXT), 1, POSITION(\'-\' IN CAST("studentId" AS TEXT))-1) AS INTEGER));',
      'ALTER TABLE "auth"."internships" ALTER COLUMN "assignedTeacher" TYPE INTEGER USING (CAST(SUBSTRING(CAST("assignedTeacher" AS TEXT), 1, POSITION(\'-\' IN CAST("assignedTeacher" AS TEXT))-1) AS INTEGER));',
      'ALTER TABLE "auth"."internships" ALTER COLUMN "evaluatedBy" TYPE INTEGER USING (CAST(SUBSTRING(CAST("evaluatedBy" AS TEXT), 1, POSITION(\'-\' IN CAST("evaluatedBy" AS TEXT))-1) AS INTEGER));',
      'ALTER TABLE "auth"."internships" ALTER COLUMN "approvedBy" TYPE INTEGER USING (CAST(SUBSTRING(CAST("approvedBy" AS TEXT), 1, POSITION(\'-\' IN CAST("approvedBy" AS TEXT))-1) AS INTEGER));',
      'ALTER TABLE "auth"."documents" ALTER COLUMN "uploadedBy" TYPE INTEGER USING (CAST(SUBSTRING(CAST("uploadedBy" AS TEXT), 1, POSITION(\'-\' IN CAST("uploadedBy" AS TEXT))-1) AS INTEGER));',
      'ALTER TABLE "auth"."book_borrowings" ALTER COLUMN "userId" TYPE INTEGER USING (CAST(SUBSTRING(CAST("userId" AS TEXT), 1, POSITION(\'-\' IN CAST("userId" AS TEXT))-1) AS INTEGER));',
      'ALTER TABLE "auth"."book_reservations" ALTER COLUMN "userId" TYPE INTEGER USING (CAST(SUBSTRING(CAST("userId" AS TEXT), 1, POSITION(\'-\' IN CAST("userId" AS TEXT))-1) AS INTEGER));'
    ];

    for (const stmt of alterStatements) {
      try {
        const tableName = stmt.match(/"([^"]+)"/)[1];
        const columnName = stmt.match(/"([^"]+)"\s+TYPE/)[1];
        console.log(`🔄 Converting ${tableName}.${columnName}...`);
        await sequelize.query(stmt);
        console.log(`✅ Successfully converted ${tableName}.${columnName}`);
      } catch (error) {
        if (error.message.includes('does not exist')) {
          console.log(`⚠️  Table or column does not exist, skipping...`);
        } else {
          console.error(`❌ Error:`, error.message);
        }
      }
    }

    // Re-enable foreign key constraints
    await sequelize.query('SET session_replication_role = DEFAULT;');
    
    console.log('\n✅ User ID type conversion completed!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during conversion:', error);
    process.exit(1);
  }
}

fixUserIdTypes();
