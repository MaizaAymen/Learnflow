/**
 * Migration Script: Add Student Management Fields to User Table
 * 
 * This script adds the necessary fields to the 'auth.utilisateur' table
 * to support student management functionality (CSV import, group assignment, etc.)
 */

const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('auth_service', 'postgres', 'aymen', {
  host: 'localhost',
  dialect: 'postgres',
  port: 5432
});

async function migrate() {
  try {
    console.log('🔄 Starting migration: Add student management fields to User table...\n');

    await sequelize.authenticate();
    console.log('✅ Database connection established\n');

    // Add numero_etudiant column
    console.log('📝 Adding numero_etudiant column...');
    await sequelize.query(`
      ALTER TABLE auth.utilisateur 
      ADD COLUMN IF NOT EXISTS numero_etudiant VARCHAR(50) UNIQUE;
    `);
    console.log('✅ numero_etudiant added\n');

    // Add classe_id column
    console.log('📝 Adding classe_id column...');
    await sequelize.query(`
      ALTER TABLE auth.utilisateur 
      ADD COLUMN IF NOT EXISTS classe_id INTEGER;
    `);
    console.log('✅ classe_id added\n');

    // Add niveau_id column
    console.log('📝 Adding niveau_id column...');
    await sequelize.query(`
      ALTER TABLE auth.utilisateur 
      ADD COLUMN IF NOT EXISTS niveau_id INTEGER;
    `);
    console.log('✅ niveau_id added\n');

    // Add statut column
    console.log('📝 Adding statut column...');
    await sequelize.query(`
      DO $$ BEGIN
        CREATE TYPE auth.user_statut AS ENUM ('actif', 'inactif', 'diplome', 'abandonne');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);
    await sequelize.query(`
      ALTER TABLE auth.utilisateur 
      ADD COLUMN IF NOT EXISTS statut auth.user_statut DEFAULT 'actif';
    `);
    console.log('✅ statut added\n');

    // Add notes column
    console.log('📝 Adding notes column...');
    await sequelize.query(`
      ALTER TABLE auth.utilisateur 
      ADD COLUMN IF NOT EXISTS notes TEXT;
    `);
    console.log('✅ notes added\n');

    // Add is_temporary column
    console.log('📝 Adding is_temporary column...');
    await sequelize.query(`
      ALTER TABLE auth.utilisateur 
      ADD COLUMN IF NOT EXISTS is_temporary BOOLEAN DEFAULT false;
    `);
    console.log('✅ is_temporary added\n');

    // Add import_batch_id column
    console.log('📝 Adding import_batch_id column...');
    await sequelize.query(`
      ALTER TABLE auth.utilisateur 
      ADD COLUMN IF NOT EXISTS import_batch_id UUID;
    `);
    console.log('✅ import_batch_id added\n');

    // Add foreign key constraints
    console.log('📝 Adding foreign key constraints...');
    
    // Check if foreign keys already exist before adding
    const fkExists = await sequelize.query(`
      SELECT constraint_name 
      FROM information_schema.table_constraints 
      WHERE table_schema = 'auth' 
      AND table_name = 'utilisateur' 
      AND constraint_name IN ('utilisateur_classe_id_fkey', 'utilisateur_niveau_id_fkey');
    `, { type: Sequelize.QueryTypes.SELECT });

    if (fkExists.length === 0) {
      await sequelize.query(`
        ALTER TABLE auth.utilisateur 
        ADD CONSTRAINT utilisateur_classe_id_fkey 
        FOREIGN KEY (classe_id) 
        REFERENCES referentiels.classe(id) 
        ON DELETE SET NULL;
      `);
      console.log('✅ Foreign key to classe added');

      await sequelize.query(`
        ALTER TABLE auth.utilisateur 
        ADD CONSTRAINT utilisateur_niveau_id_fkey 
        FOREIGN KEY (niveau_id) 
        REFERENCES referentiels.niveau(id) 
        ON DELETE SET NULL;
      `);
      console.log('✅ Foreign key to niveau added\n');
    } else {
      console.log('ℹ️  Foreign keys already exist\n');
    }

    // Add indexes
    console.log('📝 Adding indexes...');
    
    await sequelize.query(`
      CREATE INDEX IF NOT EXISTS idx_utilisateur_classe_id 
      ON auth.utilisateur(classe_id);
    `);
    console.log('✅ Index on classe_id added');

    await sequelize.query(`
      CREATE INDEX IF NOT EXISTS idx_utilisateur_niveau_id 
      ON auth.utilisateur(niveau_id);
    `);
    console.log('✅ Index on niveau_id added');

    await sequelize.query(`
      CREATE INDEX IF NOT EXISTS idx_utilisateur_import_batch_id 
      ON auth.utilisateur(import_batch_id);
    `);
    console.log('✅ Index on import_batch_id added');

    await sequelize.query(`
      CREATE INDEX IF NOT EXISTS idx_utilisateur_numero_etudiant 
      ON auth.utilisateur(numero_etudiant);
    `);
    console.log('✅ Index on numero_etudiant added\n');

    console.log('✅ Migration completed successfully!\n');
    console.log('📊 Summary:');
    console.log('   - Added 7 new columns to auth.utilisateur');
    console.log('   - Added 2 foreign key constraints');
    console.log('   - Added 4 indexes');
    console.log('   - Students can now be managed using the User model with role="etudiant"\n');

    await sequelize.close();
    process.exit(0);

  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.error(error);
    await sequelize.close();
    process.exit(1);
  }
}

migrate();
