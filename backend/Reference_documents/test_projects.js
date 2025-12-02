const sequelize = require('../auth-service/config');

(async () => {
  try {
    const result = await sequelize.query('SELECT "studentId" FROM "auth"."projects" WHERE "studentId" IS NOT NULL LIMIT 5');
    console.log('Sample projects.studentId values:');
    result[0].forEach(row => {
      console.log('  -', row.studentId);
    });
    
    // Try the conversion again
    console.log('\nAttempting conversion...');
    await sequelize.query(`
      UPDATE "auth"."projects" 
      SET "studentId" = CAST(SUBSTRING(CAST("studentId" AS TEXT), 1, POSITION('-' IN CAST("studentId" AS TEXT))-1) AS INTEGER)
      WHERE "studentId" IS NOT NULL;
    `);
    console.log('✅ Conversion successful');
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
  process.exit(0);
})();
