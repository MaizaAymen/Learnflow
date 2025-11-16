/**
 * Script to fix existing data in the database before applying new constraints
 * This script handles:
 * 1. Removing Classe.departement_id column
 * 2. Adding specialiteId to existing Niveau records
 * 3. Adding niveauId to existing Matiere records
 * 4. Adding departement_id to existing Salle records
 */

const { Sequelize } = require('sequelize');

// Database configuration - matching your config/index.js
const sequelize = new Sequelize('auth_service', 'postgres', 'aymen', {
  host: 'localhost',
  dialect: 'postgres',
  port: 5432,
  schema: 'referentiels',
  logging: console.log,
});

async function fixExistingData() {
  console.log('🔧 Starting data migration...\n');

  try {
    await sequelize.authenticate();
    console.log('✅ Database connection established.\n');

    // 1. Check and fix Niveau records without specialiteId
    console.log('📋 Checking Niveau records...');
    const [niveaux] = await sequelize.query(
      `SELECT id, name FROM referentiels.niveau WHERE "specialiteId" IS NULL`
    );
    
    if (niveaux.length > 0) {
      console.log(`⚠️  Found ${niveaux.length} Niveau records without specialiteId:`);
      niveaux.forEach(n => console.log(`   - ID: ${n.id}, Name: ${n.name}`));
      
      // Get first available specialite
      const [specialites] = await sequelize.query(
        `SELECT id, name FROM referentiels.specialite LIMIT 1`
      );
      
      if (specialites.length === 0) {
        console.log('\n❌ No Spécialité found! Creating a default one...');
        
        // Get first departement
        const [departements] = await sequelize.query(
          `SELECT id, name FROM referentiels.departement LIMIT 1`
        );
        
        if (departements.length === 0) {
          throw new Error('No Département found! Please create at least one Département first.');
        }
        
        // Create default specialite
        await sequelize.query(
          `INSERT INTO referentiels.specialite (name, description, "departementId", "createdAt", "updatedAt") 
           VALUES ('Spécialité Générale', 'Spécialité par défaut', ${departements[0].id}, NOW(), NOW())`
        );
        
        const [newSpecialite] = await sequelize.query(
          `SELECT id FROM referentiels.specialite WHERE name = 'Spécialité Générale' LIMIT 1`
        );
        
        // Update niveaux with the new specialite
        await sequelize.query(
          `UPDATE referentiels.niveau SET "specialiteId" = ${newSpecialite[0].id} WHERE "specialiteId" IS NULL`
        );
        
        console.log(`✅ Updated ${niveaux.length} Niveau records with default Spécialité\n`);
      } else {
        // Update niveaux with first available specialite
        await sequelize.query(
          `UPDATE referentiels.niveau SET "specialiteId" = ${specialites[0].id} WHERE "specialiteId" IS NULL`
        );
        console.log(`✅ Updated ${niveaux.length} Niveau records with Spécialité: ${specialites[0].name}\n`);
      }
    } else {
      console.log('✅ All Niveau records already have specialiteId\n');
    }

    // 2. Check and fix Matiere records without niveauId
    console.log('📋 Checking Matière records...');
    const [matieres] = await sequelize.query(
      `SELECT id, name FROM referentiels.matiere WHERE "niveauId" IS NULL`
    );
    
    if (matieres.length > 0) {
      console.log(`⚠️  Found ${matieres.length} Matière records without niveauId:`);
      matieres.forEach(m => console.log(`   - ID: ${m.id}, Name: ${m.name}`));
      
      // Get first available niveau
      const [niveauxAvailable] = await sequelize.query(
        `SELECT id, name FROM referentiels.niveau LIMIT 1`
      );
      
      if (niveauxAvailable.length === 0) {
        throw new Error('No Niveau found! Please fix Niveau records first.');
      }
      
      // Update matieres with first available niveau
      await sequelize.query(
        `UPDATE referentiels.matiere SET "niveauId" = ${niveauxAvailable[0].id} WHERE "niveauId" IS NULL`
      );
      console.log(`✅ Updated ${matieres.length} Matière records with Niveau: ${niveauxAvailable[0].name}\n`);
    } else {
      console.log('✅ All Matière records already have niveauId\n');
    }

    // 3. Check and fix Salle records without departement_id
    console.log('📋 Checking Salle records...');
    const [salles] = await sequelize.query(
      `SELECT id, nom FROM referentiels.salle WHERE departement_id IS NULL`
    );
    
    if (salles.length > 0) {
      console.log(`⚠️  Found ${salles.length} Salle records without departement_id:`);
      salles.forEach(s => console.log(`   - ID: ${s.id}, Name: ${s.nom}`));
      
      // Get first available departement
      const [departements] = await sequelize.query(
        `SELECT id, name FROM referentiels.departement LIMIT 1`
      );
      
      if (departements.length === 0) {
        throw new Error('No Département found! Please create at least one Département first.');
      }
      
      // Update salles with first available departement
      await sequelize.query(
        `UPDATE referentiels.salle SET departement_id = ${departements[0].id} WHERE departement_id IS NULL`
      );
      console.log(`✅ Updated ${salles.length} Salle records with Département: ${departements[0].name}\n`);
    } else {
      console.log('✅ All Salle records already have departement_id\n');
    }

    // 4. Remove departement_id from Classe table if it exists
    console.log('📋 Checking Classe table for departement_id column...');
    const [classeColumns] = await sequelize.query(
      `SELECT column_name 
       FROM information_schema.columns 
       WHERE table_schema = 'referentiels' 
       AND table_name = 'classe' 
       AND column_name = 'departement_id'`
    );
    
    if (classeColumns.length > 0) {
      console.log('⚠️  Found departement_id column in Classe table');
      
      // Check if there are foreign key constraints
      const [constraints] = await sequelize.query(
        `SELECT constraint_name 
         FROM information_schema.table_constraints 
         WHERE table_schema = 'referentiels' 
         AND table_name = 'classe' 
         AND constraint_type = 'FOREIGN KEY'
         AND constraint_name LIKE '%departement%'`
      );
      
      // Drop foreign key constraints first
      for (const constraint of constraints) {
        console.log(`   Dropping constraint: ${constraint.constraint_name}`);
        await sequelize.query(
          `ALTER TABLE referentiels.classe DROP CONSTRAINT IF EXISTS "${constraint.constraint_name}"`
        );
      }
      
      // Drop the column
      await sequelize.query(
        `ALTER TABLE referentiels.classe DROP COLUMN IF EXISTS departement_id`
      );
      console.log('✅ Removed departement_id column from Classe table\n');
    } else {
      console.log('✅ Classe table does not have departement_id column\n');
    }

    console.log('🎉 Data migration completed successfully!');
    console.log('\n📌 You can now restart your server to apply the new model constraints.\n');

  } catch (error) {
    console.error('❌ Error during migration:', error.message);
    console.error('\nFull error:', error);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

// Run the migration
fixExistingData();
