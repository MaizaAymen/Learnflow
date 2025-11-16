-- ============================================================================
-- Database Migration Script: Fix Relational Consistency
-- University Management Platform
-- ============================================================================
-- This script fixes all logical and relational inconsistencies in the database
-- Run this script AFTER backing up your database
-- ============================================================================

-- Set search path
SET search_path TO referentiels, auth, public;

-- ============================================================================
-- PHASE 1: ADD MISSING FOREIGN KEY COLUMNS
-- ============================================================================

-- Add niveauId to Matiere if not exists
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'referentiels' 
        AND table_name = 'matiere' 
        AND column_name = 'niveauId'
    ) THEN
        ALTER TABLE referentiels.matiere 
        ADD COLUMN "niveauId" INTEGER;
    END IF;
END $$;

-- Add specialiteId to Niveau if not exists
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'referentiels' 
        AND table_name = 'niveau' 
        AND column_name = 'specialiteId'
    ) THEN
        ALTER TABLE referentiels.niveau 
        ADD COLUMN "specialiteId" INTEGER;
    END IF;
END $$;

-- Add departementId to Specialite if not exists
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'referentiels' 
        AND table_name = 'specialite' 
        AND column_name = 'departementId'
    ) THEN
        ALTER TABLE referentiels.specialite 
        ADD COLUMN "departementId" INTEGER;
    END IF;
END $$;

-- Add departement_id to Salle if not exists
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'referentiels' 
        AND table_name = 'salle' 
        AND column_name = 'departement_id'
    ) THEN
        ALTER TABLE referentiels.salle 
        ADD COLUMN departement_id INTEGER;
    END IF;
END $$;

-- ============================================================================
-- PHASE 2: MIGRATE DATA (if needed)
-- ============================================================================

-- If Classe has departement_id and niveau_id, ensure consistency
-- Update any Classes where departement_id doesn't match niveau's departement
UPDATE referentiels.classe c
SET departement_id = (
    SELECT s.departementId 
    FROM referentiels.niveau n
    JOIN referentiels.specialite s ON n.specialiteId = s.id
    WHERE n.id = c.niveau_id
)
WHERE c.niveau_id IS NOT NULL 
AND EXISTS (
    SELECT 1 
    FROM referentiels.niveau n
    JOIN referentiels.specialite s ON n.specialiteId = s.id
    WHERE n.id = c.niveau_id
);

-- ============================================================================
-- PHASE 3: ADD FOREIGN KEY CONSTRAINTS
-- ============================================================================

-- Specialite → Departement
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_schema = 'referentiels' 
        AND table_name = 'specialite' 
        AND constraint_name = 'fk_specialite_departement'
    ) THEN
        ALTER TABLE referentiels.specialite 
        ADD CONSTRAINT fk_specialite_departement 
        FOREIGN KEY ("departementId") 
        REFERENCES referentiels.departement(id)
        ON DELETE RESTRICT 
        ON UPDATE CASCADE;
    END IF;
END $$;

-- Niveau → Specialite
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_schema = 'referentiels' 
        AND table_name = 'niveau' 
        AND constraint_name = 'fk_niveau_specialite'
    ) THEN
        ALTER TABLE referentiels.niveau 
        ADD CONSTRAINT fk_niveau_specialite 
        FOREIGN KEY ("specialiteId") 
        REFERENCES referentiels.specialite(id)
        ON DELETE RESTRICT 
        ON UPDATE CASCADE;
    END IF;
END $$;

-- Classe → Niveau
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_schema = 'referentiels' 
        AND table_name = 'classe' 
        AND constraint_name = 'fk_classe_niveau'
    ) THEN
        ALTER TABLE referentiels.classe 
        ADD CONSTRAINT fk_classe_niveau 
        FOREIGN KEY (niveau_id) 
        REFERENCES referentiels.niveau(id)
        ON DELETE RESTRICT 
        ON UPDATE CASCADE;
    END IF;
END $$;

-- Matiere → Niveau
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_schema = 'referentiels' 
        AND table_name = 'matiere' 
        AND constraint_name = 'fk_matiere_niveau'
    ) THEN
        ALTER TABLE referentiels.matiere 
        ADD CONSTRAINT fk_matiere_niveau 
        FOREIGN KEY ("niveauId") 
        REFERENCES referentiels.niveau(id)
        ON DELETE RESTRICT 
        ON UPDATE CASCADE;
    END IF;
END $$;

-- Salle → Departement
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_schema = 'referentiels' 
        AND table_name = 'salle' 
        AND constraint_name = 'fk_salle_departement'
    ) THEN
        ALTER TABLE referentiels.salle 
        ADD CONSTRAINT fk_salle_departement 
        FOREIGN KEY (departement_id) 
        REFERENCES referentiels.departement(id)
        ON DELETE RESTRICT 
        ON UPDATE CASCADE;
    END IF;
END $$;

-- Schedule → Enseignant (User)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_schema = 'referentiels' 
        AND table_name = 'schedule' 
        AND constraint_name = 'fk_schedule_enseignant'
    ) THEN
        ALTER TABLE referentiels.schedule 
        ADD CONSTRAINT fk_schedule_enseignant 
        FOREIGN KEY (enseignant_id) 
        REFERENCES auth.utilisateur(id)
        ON DELETE RESTRICT 
        ON UPDATE CASCADE;
    END IF;
END $$;

-- Booking → User
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_schema = 'referentiels' 
        AND table_name = 'booking' 
        AND constraint_name = 'fk_booking_user'
    ) THEN
        ALTER TABLE referentiels.booking 
        ADD CONSTRAINT fk_booking_user 
        FOREIGN KEY (user_id) 
        REFERENCES auth.utilisateur(id)
        ON DELETE CASCADE 
        ON UPDATE CASCADE;
    END IF;
END $$;

-- Course → User (Enseignant)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_schema = 'referentiels' 
        AND table_name = 'courses' 
        AND constraint_name = 'fk_course_enseignant'
    ) THEN
        ALTER TABLE referentiels.courses 
        ADD CONSTRAINT fk_course_enseignant 
        FOREIGN KEY ("userId") 
        REFERENCES auth.utilisateur(id)
        ON DELETE SET NULL 
        ON UPDATE CASCADE;
    END IF;
END $$;

-- ============================================================================
-- PHASE 4: SET NOT NULL CONSTRAINTS
-- ============================================================================
-- WARNING: Only run after ensuring all data is properly populated

-- Specialite.departementId NOT NULL
-- ALTER TABLE referentiels.specialite 
-- ALTER COLUMN "departementId" SET NOT NULL;

-- Niveau.specialiteId NOT NULL
-- ALTER TABLE referentiels.niveau 
-- ALTER COLUMN "specialiteId" SET NOT NULL;

-- Classe.niveau_id NOT NULL
-- ALTER TABLE referentiels.classe 
-- ALTER COLUMN niveau_id SET NOT NULL;

-- Matiere.niveauId NOT NULL
-- ALTER TABLE referentiels.matiere 
-- ALTER COLUMN "niveauId" SET NOT NULL;

-- Salle.departement_id NOT NULL (if all salles have department)
-- ALTER TABLE referentiels.salle 
-- ALTER COLUMN departement_id SET NOT NULL;

-- ============================================================================
-- PHASE 5: REMOVE REDUNDANT COLUMNS (OPTIONAL - CAREFUL!)
-- ============================================================================
-- WARNING: This will permanently delete data. Backup first!
-- Only uncomment if you're sure Classe.departement_id is redundant

-- Remove departement_id from Classe (it's derivable from Niveau)
-- ALTER TABLE referentiels.classe 
-- DROP COLUMN IF EXISTS departement_id;

-- ============================================================================
-- PHASE 6: ADD UNIQUE CONSTRAINTS
-- ============================================================================

-- Unique: Matiere code
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_schema = 'referentiels' 
        AND table_name = 'matiere' 
        AND constraint_name = 'uq_matiere_code'
    ) THEN
        ALTER TABLE referentiels.matiere 
        ADD CONSTRAINT uq_matiere_code UNIQUE (code);
    END IF;
END $$;

-- Unique: Specialite code
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_schema = 'referentiels' 
        AND table_name = 'specialite' 
        AND constraint_name = 'uq_specialite_code'
    ) THEN
        ALTER TABLE referentiels.specialite 
        ADD CONSTRAINT uq_specialite_code UNIQUE (code);
    END IF;
END $$;

-- Unique: Salle nom
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_schema = 'referentiels' 
        AND table_name = 'salle' 
        AND constraint_name = 'uq_salle_nom'
    ) THEN
        ALTER TABLE referentiels.salle 
        ADD CONSTRAINT uq_salle_nom UNIQUE (nom);
    END IF;
END $$;

-- Unique: MatiereClasse (matiereId, classeId)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_schema = 'referentiels' 
        AND table_name = 'matiere_classe' 
        AND constraint_name = 'uq_matiere_classe'
    ) THEN
        ALTER TABLE referentiels.matiere_classe 
        ADD CONSTRAINT uq_matiere_classe UNIQUE ("matiereId", "classeId");
    END IF;
END $$;

-- Unique: MatiereEnseignant (matiere_id, enseignant_id)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_schema = 'referentiels' 
        AND table_name = 'matiere_enseignant' 
        AND constraint_name = 'uq_matiere_enseignant'
    ) THEN
        ALTER TABLE referentiels.matiere_enseignant 
        ADD CONSTRAINT uq_matiere_enseignant UNIQUE (matiere_id, enseignant_id);
    END IF;
END $$;

-- Unique: Booking (schedule_id, user_id)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_schema = 'referentiels' 
        AND table_name = 'booking' 
        AND constraint_name = 'uq_booking_schedule_user'
    ) THEN
        ALTER TABLE referentiels.booking 
        ADD CONSTRAINT uq_booking_schedule_user UNIQUE (schedule_id, user_id);
    END IF;
END $$;

-- ============================================================================
-- PHASE 7: ADD NEW COLUMNS (from enhanced models)
-- ============================================================================

-- Specialite: duree_annees
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'referentiels' 
        AND table_name = 'specialite' 
        AND column_name = 'duree_annees'
    ) THEN
        ALTER TABLE referentiels.specialite 
        ADD COLUMN duree_annees INTEGER DEFAULT 3 
        CHECK (duree_annees BETWEEN 1 AND 7);
    END IF;
END $$;

-- Niveau: ordre
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'referentiels' 
        AND table_name = 'niveau' 
        AND column_name = 'ordre'
    ) THEN
        ALTER TABLE referentiels.niveau 
        ADD COLUMN ordre INTEGER 
        CHECK (ordre BETWEEN 1 AND 10);
    END IF;
END $$;

-- Classe: annee_scolaire
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'referentiels' 
        AND table_name = 'classe' 
        AND column_name = 'annee_scolaire'
    ) THEN
        ALTER TABLE referentiels.classe 
        ADD COLUMN annee_scolaire VARCHAR(20);
    END IF;
END $$;

-- Salle: statut
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'referentiels' 
        AND table_name = 'salle' 
        AND column_name = 'statut'
    ) THEN
        ALTER TABLE referentiels.salle 
        ADD COLUMN statut VARCHAR(20) DEFAULT 'disponible'
        CHECK (statut IN ('disponible', 'maintenance', 'hors_service'));
    END IF;
END $$;

-- Salle: equipements (JSON)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'referentiels' 
        AND table_name = 'salle' 
        AND column_name = 'equipements'
    ) THEN
        ALTER TABLE referentiels.salle 
        ADD COLUMN equipements JSONB;
    END IF;
END $$;

-- Schedule: couleur
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'referentiels' 
        AND table_name = 'schedule' 
        AND column_name = 'couleur'
    ) THEN
        ALTER TABLE referentiels.schedule 
        ADD COLUMN couleur VARCHAR(7) 
        CHECK (couleur ~* '^#[0-9A-F]{6}$');
    END IF;
END $$;

-- MatiereClasse: heures_semaine, coefficient
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'referentiels' 
        AND table_name = 'matiere_classe' 
        AND column_name = 'heures_semaine'
    ) THEN
        ALTER TABLE referentiels.matiere_classe 
        ADD COLUMN heures_semaine DECIMAL(4,2) 
        CHECK (heures_semaine BETWEEN 0 AND 40);
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'referentiels' 
        AND table_name = 'matiere_classe' 
        AND column_name = 'coefficient'
    ) THEN
        ALTER TABLE referentiels.matiere_classe 
        ADD COLUMN coefficient DECIMAL(3,2) DEFAULT 1.0 
        CHECK (coefficient BETWEEN 0.5 AND 5.0);
    END IF;
END $$;

-- MatiereEnseignant: is_principal, date_debut, date_fin, specialisation
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'referentiels' 
        AND table_name = 'matiere_enseignant' 
        AND column_name = 'is_principal'
    ) THEN
        ALTER TABLE referentiels.matiere_enseignant 
        ADD COLUMN is_principal BOOLEAN DEFAULT FALSE;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'referentiels' 
        AND table_name = 'matiere_enseignant' 
        AND column_name = 'date_debut'
    ) THEN
        ALTER TABLE referentiels.matiere_enseignant 
        ADD COLUMN date_debut TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'referentiels' 
        AND table_name = 'matiere_enseignant' 
        AND column_name = 'date_fin'
    ) THEN
        ALTER TABLE referentiels.matiere_enseignant 
        ADD COLUMN date_fin TIMESTAMP;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'referentiels' 
        AND table_name = 'matiere_enseignant' 
        AND column_name = 'specialisation'
    ) THEN
        ALTER TABLE referentiels.matiere_enseignant 
        ADD COLUMN specialisation VARCHAR(255);
    END IF;
END $$;

-- Booking: heure_arrivee
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'referentiels' 
        AND table_name = 'booking' 
        AND column_name = 'heure_arrivee'
    ) THEN
        ALTER TABLE referentiels.booking 
        ADD COLUMN heure_arrivee TIME;
    END IF;
END $$;

-- ============================================================================
-- PHASE 8: CREATE INDEXES FOR PERFORMANCE
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_specialite_departement 
ON referentiels.specialite("departementId");

CREATE INDEX IF NOT EXISTS idx_niveau_specialite 
ON referentiels.niveau("specialiteId");

CREATE INDEX IF NOT EXISTS idx_classe_niveau 
ON referentiels.classe(niveau_id);

CREATE INDEX IF NOT EXISTS idx_matiere_niveau 
ON referentiels.matiere("niveauId");

CREATE INDEX IF NOT EXISTS idx_schedule_classe 
ON referentiels.schedule(classe_id);

CREATE INDEX IF NOT EXISTS idx_schedule_matiere 
ON referentiels.schedule(matiere_id);

CREATE INDEX IF NOT EXISTS idx_schedule_enseignant 
ON referentiels.schedule(enseignant_id);

CREATE INDEX IF NOT EXISTS idx_booking_user 
ON referentiels.booking(user_id);

CREATE INDEX IF NOT EXISTS idx_booking_schedule 
ON referentiels.booking(schedule_id);

-- ============================================================================
-- PHASE 9: VERIFICATION QUERIES
-- ============================================================================

-- Check orphaned records (records without valid parent)
SELECT 'ORPHANED SPECIALITES' as issue, COUNT(*) as count
FROM referentiels.specialite s
LEFT JOIN referentiels.departement d ON s.departementId = d.id
WHERE s.departementId IS NOT NULL AND d.id IS NULL;

SELECT 'ORPHANED NIVEAUX' as issue, COUNT(*) as count
FROM referentiels.niveau n
LEFT JOIN referentiels.specialite s ON n.specialiteId = s.id
WHERE n.specialiteId IS NOT NULL AND s.id IS NULL;

SELECT 'ORPHANED CLASSES' as issue, COUNT(*) as count
FROM referentiels.classe c
LEFT JOIN referentiels.niveau n ON c.niveau_id = n.id
WHERE c.niveau_id IS NOT NULL AND n.id IS NULL;

SELECT 'ORPHANED MATIERES' as issue, COUNT(*) as count
FROM referentiels.matiere m
LEFT JOIN referentiels.niveau n ON m."niveauId" = n.id
WHERE m."niveauId" IS NOT NULL AND n.id IS NULL;

-- ============================================================================
-- COMPLETION MESSAGE
-- ============================================================================

DO $$ 
BEGIN 
    RAISE NOTICE '============================================';
    RAISE NOTICE 'Database migration completed successfully!';
    RAISE NOTICE '============================================';
    RAISE NOTICE 'Next steps:';
    RAISE NOTICE '1. Review verification queries above';
    RAISE NOTICE '2. Test application functionality';
    RAISE NOTICE '3. Uncomment Phase 4 to set NOT NULL constraints';
    RAISE NOTICE '4. Uncomment Phase 5 to remove redundant columns';
    RAISE NOTICE '============================================';
END $$;
