const sequelize = require('../auth-service/config');

(async () => {
  try {
    const result = await sequelize.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_schema = 'auth' AND table_name = 'book_borrowings'
      ORDER BY column_name;
    `);
    console.log('✅ Book Borrowings Schema:');
    result[0].forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type}`);
    });
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
  process.exit(0);
})();
