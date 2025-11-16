-- ============================================================================
-- TIMETABLE SYSTEM - DATABASE MIGRATION SCRIPT
-- Ensures all foreign keys, constraints, and indexes are properly configured
-- ============================================================================

-- This script should be run after the initial model creation to ensure
-- all database constraints are properly set up for the timetable system

-- ============================================================================
-- 1. ADD MISSING FOREIGN KEY CONSTRAINTS
-- ============================================================================

-- Specialite -> Departement
ALTER TABLE referentiels.specialite
DROP CONSTRAINT IF EXISTS fk_specialite_departement;

ALTER TABLE referentiels.specialite
ADD CONSTRAINT fk_specialite_departement
FOREIGN KEY ("departementId")
REFERENCES referentiels.departement(id)
ON UPDATE CASCADE
ON DELETE RESTRICT;

-- Niveau -> Specialite
ALTER TABLE referentiels.niveau
DROP CONSTRAINT IF EXISTS fk_niveau_specialite;

ALTER TABLE referentiels.niveau
ADD CONSTRAINT fk_niveau_specialite
FOREIGN KEY ("specialiteId")
REFERENCES referentiels.specialite(id)
ON UPDATE CASCADE
ON DELETE RESTRICT;

-- Classe -> Niveau
ALTER TABLE referentiels.classe
DROP CONSTRAINT IF EXISTS fk_classe_niveau;

ALTER TABLE referentiels.classe
ADD CONSTRAINT fk_classe_niveau
FOREIGN KEY (niveau_id)
REFERENCES referentiels.niveau(id)
ON UPDATE CASCADE
ON DELETE RESTRICT;

-- Matiere -> Niveau
ALTER TABLE referentiels.matiere
DROP CONSTRAINT IF EXISTS fk_matiere_niveau;

ALTER TABLE referentiels.matiere
ADD CONSTRAINT fk_matiere_niveau
FOREIGN KEY ("niveauId")
REFERENCES referentiels.niveau(id)
ON UPDATE CASCADE
ON DELETE RESTRICT;

-- Salle -> Departement
ALTER TABLE referentiels.salle
DROP CONSTRAINT IF EXISTS fk_salle_departement;

ALTER TABLE referentiels.salle
ADD CONSTRAINT fk_salle_departement
FOREIGN KEY (departement_id)
REFERENCES referentiels.departement(id)
ON UPDATE CASCADE
ON DELETE RESTRICT;

-- ============================================================================
-- 2. SCHEDULE FOREIGN KEY CONSTRAINTS
-- ============================================================================

-- Schedule -> TimeSlot
ALTER TABLE referentiels.schedule
DROP CONSTRAINT IF EXISTS fk_schedule_timeslot;

ALTER TABLE referentiels.schedule
ADD CONSTRAINT fk_schedule_timeslot
FOREIGN KEY (time_slot_id)
REFERENCES referentiels.time_slot(id)
ON UPDATE CASCADE
ON DELETE RESTRICT;

-- Schedule -> Classe
ALTER TABLE referentiels.schedule
DROP CONSTRAINT IF EXISTS fk_schedule_classe;

ALTER TABLE referentiels.schedule
ADD CONSTRAINT fk_schedule_classe
FOREIGN KEY (classe_id)
REFERENCES referentiels.classe(id)
ON UPDATE CASCADE
ON DELETE CASCADE;

-- Schedule -> Matiere
ALTER TABLE referentiels.schedule
DROP CONSTRAINT IF EXISTS fk_schedule_matiere;

ALTER TABLE referentiels.schedule
ADD CONSTRAINT fk_schedule_matiere
FOREIGN KEY (matiere_id)
REFERENCES referentiels.matiere(id)
ON UPDATE CASCADE
ON DELETE RESTRICT;

-- Schedule -> Salle (nullable)
ALTER TABLE referentiels.schedule
DROP CONSTRAINT IF EXISTS fk_schedule_salle;

ALTER TABLE referentiels.schedule
ADD CONSTRAINT fk_schedule_salle
FOREIGN KEY (salle_id)
REFERENCES referentiels.salle(id)
ON UPDATE CASCADE
ON DELETE SET NULL;

-- Schedule -> Enseignant (nullable)
ALTER TABLE referentiels.schedule
DROP CONSTRAINT IF EXISTS fk_schedule_enseignant;

ALTER TABLE referentiels.schedule
ADD CONSTRAINT fk_schedule_enseignant
FOREIGN KEY (enseignant_id)
REFERENCES auth.utilisateur(id)
ON UPDATE CASCADE
ON DELETE RESTRICT;

-- ============================================================================
-- 3. JUNCTION TABLES FOREIGN KEY CONSTRAINTS
-- ============================================================================

-- MatiereClasse -> Matiere
ALTER TABLE referentiels.matiere_classe
DROP CONSTRAINT IF EXISTS fk_matiereclasse_matiere;

ALTER TABLE referentiels.matiere_classe
ADD CONSTRAINT fk_matiereclasse_matiere
FOREIGN KEY ("matiereId")
REFERENCES referentiels.matiere(id)
ON UPDATE CASCADE
ON DELETE CASCADE;

-- MatiereClasse -> Classe
ALTER TABLE referentiels.matiere_classe
DROP CONSTRAINT IF EXISTS fk_matiereclasse_classe;

ALTER TABLE referentiels.matiere_classe
ADD CONSTRAINT fk_matiereclasse_classe
FOREIGN KEY ("classeId")
REFERENCES referentiels.classe(id)
ON UPDATE CASCADE
ON DELETE CASCADE;

-- MatiereEnseignant -> Matiere
ALTER TABLE referentiels.matiere_enseignant
DROP CONSTRAINT IF EXISTS fk_matiereenseignant_matiere;

ALTER TABLE referentiels.matiere_enseignant
ADD CONSTRAINT fk_matiereenseignant_matiere
FOREIGN KEY (matiere_id)
REFERENCES referentiels.matiere(id)
ON UPDATE CASCADE
ON DELETE CASCADE;

-- MatiereEnseignant -> Enseignant
ALTER TABLE referentiels.matiere_enseignant
DROP CONSTRAINT IF EXISTS fk_matiereenseignant_enseignant;

ALTER TABLE referentiels.matiere_enseignant
ADD CONSTRAINT fk_matiereenseignant_enseignant
FOREIGN KEY (enseignant_id)
REFERENCES auth.utilisateur(id)
ON UPDATE CASCADE
ON DELETE CASCADE;

-- ============================================================================
-- 4. BOOKING FOREIGN KEY CONSTRAINTS
-- ============================================================================

-- Booking -> Schedule
ALTER TABLE referentiels.booking
DROP CONSTRAINT IF EXISTS fk_booking_schedule;

ALTER TABLE referentiels.booking
ADD CONSTRAINT fk_booking_schedule
FOREIGN KEY (schedule_id)
REFERENCES referentiels.schedule(id)
ON UPDATE CASCADE
ON DELETE CASCADE;

-- Booking -> User
ALTER TABLE referentiels.booking
DROP CONSTRAINT IF EXISTS fk_booking_user;

ALTER TABLE referentiels.booking
ADD CONSTRAINT fk_booking_user
FOREIGN KEY (user_id)
REFERENCES auth.utilisateur(id)
ON UPDATE CASCADE
ON DELETE CASCADE;

-- ============================================================================
-- 5. STUDENT FOREIGN KEY CONSTRAINTS (auth.utilisateur)
-- ============================================================================

-- User (Student) -> Niveau
ALTER TABLE auth.utilisateur
DROP CONSTRAINT IF EXISTS fk_user_niveau;

ALTER TABLE auth.utilisateur
ADD CONSTRAINT fk_user_niveau
FOREIGN KEY (niveau_id)
REFERENCES referentiels.niveau(id)
ON UPDATE CASCADE
ON DELETE SET NULL;

-- User (Student) -> Classe
ALTER TABLE auth.utilisateur
DROP CONSTRAINT IF EXISTS fk_user_classe;

ALTER TABLE auth.utilisateur
ADD CONSTRAINT fk_user_classe
FOREIGN KEY (classe_id)
REFERENCES referentiels.classe(id)
ON UPDATE CASCADE
ON DELETE SET NULL;

-- ============================================================================
-- 6. ADD USEFUL INDEXES FOR PERFORMANCE
-- ============================================================================

-- Indexes on Schedule for common queries
CREATE INDEX IF NOT EXISTS idx_schedule_timeslot ON referentiels.schedule(time_slot_id);
CREATE INDEX IF NOT EXISTS idx_schedule_classe ON referentiels.schedule(classe_id);
CREATE INDEX IF NOT EXISTS idx_schedule_matiere ON referentiels.schedule(matiere_id);
CREATE INDEX IF NOT EXISTS idx_schedule_salle ON referentiels.schedule(salle_id);
CREATE INDEX IF NOT EXISTS idx_schedule_enseignant ON referentiels.schedule(enseignant_id);
CREATE INDEX IF NOT EXISTS idx_schedule_dates ON referentiels.schedule(date_debut, date_fin);
CREATE INDEX IF NOT EXISTS idx_schedule_statut ON referentiels.schedule(statut);

-- Indexes on TimeSlot
CREATE INDEX IF NOT EXISTS idx_timeslot_day ON referentiels.time_slot(day_of_week);
CREATE INDEX IF NOT EXISTS idx_timeslot_active ON referentiels.time_slot(is_active);

-- Indexes on Salle
CREATE INDEX IF NOT EXISTS idx_salle_departement ON referentiels.salle(departement_id);
CREATE INDEX IF NOT EXISTS idx_salle_type ON referentiels.salle(type);
CREATE INDEX IF NOT EXISTS idx_salle_statut ON referentiels.salle(statut);

-- Indexes on Classe
CREATE INDEX IF NOT EXISTS idx_classe_niveau ON referentiels.classe(niveau_id);

-- Indexes on Matiere
CREATE INDEX IF NOT EXISTS idx_matiere_niveau ON referentiels.matiere("niveauId");
CREATE INDEX IF NOT EXISTS idx_matiere_code ON referentiels.matiere(code);

-- Indexes on User for student/teacher queries
CREATE INDEX IF NOT EXISTS idx_user_role ON auth.utilisateur(role);
CREATE INDEX IF NOT EXISTS idx_user_classe ON auth.utilisateur(classe_id);
CREATE INDEX IF NOT EXISTS idx_user_niveau ON auth.utilisateur(niveau_id);

-- Indexes on junction tables
CREATE INDEX IF NOT EXISTS idx_matiereclasse_matiere ON referentiels.matiere_classe("matiereId");
CREATE INDEX IF NOT EXISTS idx_matiereclasse_classe ON referentiels.matiere_classe("classeId");
CREATE INDEX IF NOT EXISTS idx_matiereenseignant_matiere ON referentiels.matiere_enseignant(matiere_id);
CREATE INDEX IF NOT EXISTS idx_matiereenseignant_enseignant ON referentiels.matiere_enseignant(enseignant_id);

-- Indexes on Booking
CREATE INDEX IF NOT EXISTS idx_booking_schedule ON referentiels.booking(schedule_id);
CREATE INDEX IF NOT EXISTS idx_booking_user ON referentiels.booking(user_id);
CREATE INDEX IF NOT EXISTS idx_booking_statut ON referentiels.booking(statut);

-- ============================================================================
-- 7. ADD CHECK CONSTRAINTS FOR DATA VALIDATION
-- ============================================================================

-- Salle capacity must be positive
ALTER TABLE referentiels.salle
DROP CONSTRAINT IF EXISTS chk_salle_capacite_positive;

ALTER TABLE referentiels.salle
ADD CONSTRAINT chk_salle_capacite_positive
CHECK (capacite > 0 AND capacite <= 1000);

-- Classe effectif must be non-negative
ALTER TABLE referentiels.classe
DROP CONSTRAINT IF EXISTS chk_classe_effectif_positive;

ALTER TABLE referentiels.classe
ADD CONSTRAINT chk_classe_effectif_positive
CHECK (effectif >= 0 AND effectif <= 500);

-- Matiere credits must be positive
ALTER TABLE referentiels.matiere
DROP CONSTRAINT IF EXISTS chk_matiere_credits_positive;

ALTER TABLE referentiels.matiere
ADD CONSTRAINT chk_matiere_credits_positive
CHECK (credits > 0 AND credits <= 10);

-- Schedule date_fin must be after or equal to date_debut
ALTER TABLE referentiels.schedule
DROP CONSTRAINT IF EXISTS chk_schedule_dates_valid;

ALTER TABLE referentiels.schedule
ADD CONSTRAINT chk_schedule_dates_valid
CHECK (date_fin IS NULL OR date_fin >= date_debut);

-- MatiereClasse heures_semaine must be positive
ALTER TABLE referentiels.matiere_classe
DROP CONSTRAINT IF EXISTS chk_matiereclasse_heures_positive;

ALTER TABLE referentiels.matiere_classe
ADD CONSTRAINT chk_matiereclasse_heures_positive
CHECK (heures_semaine IS NULL OR (heures_semaine >= 0 AND heures_semaine <= 40));

-- MatiereClasse coefficient must be positive
ALTER TABLE referentiels.matiere_classe
DROP CONSTRAINT IF EXISTS chk_matiereclasse_coefficient_positive;

ALTER TABLE referentiels.matiere_classe
ADD CONSTRAINT chk_matiereclasse_coefficient_positive
CHECK (coefficient IS NULL OR (coefficient >= 0.5 AND coefficient <= 5.0));

-- ============================================================================
-- 8. CREATE VIEWS FOR COMMON QUERIES
-- ============================================================================

-- View: Complete timetable with all details
CREATE OR REPLACE VIEW referentiels.v_timetable_complete AS
SELECT 
    s.id AS schedule_id,
    s.date_debut,
    s.date_fin,
    s.type_cours,
    s.recurrence,
    s.statut,
    s.notes,
    s.couleur,
    
    ts.day_of_week,
    ts.start_time,
    ts.end_time,
    
    c.id AS classe_id,
    c.nom AS classe_nom,
    c.effectif AS classe_effectif,
    
    n.id AS niveau_id,
    n.name AS niveau_name,
    
    sp.id AS specialite_id,
    sp.name AS specialite_name,
    
    d.id AS departement_id,
    d.name AS departement_name,
    
    m.id AS matiere_id,
    m.name AS matiere_name,
    m.code AS matiere_code,
    m.credits AS matiere_credits,
    
    sa.id AS salle_id,
    sa.nom AS salle_nom,
    sa.type AS salle_type,
    sa.capacite AS salle_capacite,
    sa.localisation AS salle_localisation,
    sa.statut AS salle_statut,
    
    u.id AS enseignant_id,
    u.nom AS enseignant_nom,
    u.prenom AS enseignant_prenom,
    u.email AS enseignant_email
    
FROM referentiels.schedule s
INNER JOIN referentiels.time_slot ts ON s.time_slot_id = ts.id
INNER JOIN referentiels.classe c ON s.classe_id = c.id
INNER JOIN referentiels.niveau n ON c.niveau_id = n.id
INNER JOIN referentiels.specialite sp ON n."specialiteId" = sp.id
INNER JOIN referentiels.departement d ON sp."departementId" = d.id
INNER JOIN referentiels.matiere m ON s.matiere_id = m.id
LEFT JOIN referentiels.salle sa ON s.salle_id = sa.id
LEFT JOIN auth.utilisateur u ON s.enseignant_id = u.id
WHERE s.statut != 'annule'
ORDER BY ts.day_of_week, ts.start_time;

-- View: Current week schedules (active only)
CREATE OR REPLACE VIEW referentiels.v_current_week_schedules AS
SELECT *
FROM referentiels.v_timetable_complete
WHERE date_debut <= CURRENT_DATE
  AND (date_fin IS NULL OR date_fin >= CURRENT_DATE)
  AND statut IN ('planifie', 'confirme');

-- View: Class occupancy (number of students vs room capacity)
CREATE OR REPLACE VIEW referentiels.v_class_room_occupancy AS
SELECT 
    s.id AS schedule_id,
    c.nom AS classe_nom,
    c.effectif AS nb_students,
    sa.nom AS salle_nom,
    sa.capacite AS salle_capacite,
    sa.capacite - c.effectif AS places_disponibles,
    ROUND((c.effectif::numeric / sa.capacite::numeric) * 100, 2) AS taux_occupation
FROM referentiels.schedule s
INNER JOIN referentiels.classe c ON s.classe_id = c.id
LEFT JOIN referentiels.salle sa ON s.salle_id = sa.id
WHERE sa.id IS NOT NULL
  AND s.statut != 'annule'
ORDER BY taux_occupation DESC;

-- View: Teacher workload (number of hours per teacher)
CREATE OR REPLACE VIEW referentiels.v_teacher_workload AS
SELECT 
    u.id AS enseignant_id,
    u.nom,
    u.prenom,
    u.email,
    COUNT(DISTINCT s.id) AS nb_schedules,
    COUNT(DISTINCT s.classe_id) AS nb_classes,
    COUNT(DISTINCT s.matiere_id) AS nb_matieres,
    STRING_AGG(DISTINCT m.name, ', ') AS matieres_enseignees
FROM auth.utilisateur u
LEFT JOIN referentiels.schedule s ON u.id = s.enseignant_id AND s.statut != 'annule'
LEFT JOIN referentiels.matiere m ON s.matiere_id = m.id
WHERE u.role = 'enseignant'
GROUP BY u.id, u.nom, u.prenom, u.email
ORDER BY nb_schedules DESC;

-- ============================================================================
-- 9. CREATE HELPER FUNCTIONS
-- ============================================================================

-- Function to get available rooms for a specific time slot and date
CREATE OR REPLACE FUNCTION referentiels.get_available_rooms(
    p_time_slot_id INT,
    p_date DATE,
    p_min_capacity INT DEFAULT 0
)
RETURNS TABLE (
    salle_id INT,
    salle_nom VARCHAR,
    salle_type VARCHAR,
    capacite INT,
    localisation VARCHAR
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        sa.id,
        sa.nom,
        sa.type::VARCHAR,
        sa.capacite,
        sa.localisation
    FROM referentiels.salle sa
    WHERE sa.statut = 'disponible'
      AND sa.capacite >= p_min_capacity
      AND sa.id NOT IN (
          SELECT s.salle_id
          FROM referentiels.schedule s
          WHERE s.time_slot_id = p_time_slot_id
            AND s.date_debut <= p_date
            AND (s.date_fin IS NULL OR s.date_fin >= p_date)
            AND s.statut != 'annule'
            AND s.salle_id IS NOT NULL
      )
    ORDER BY sa.nom;
END;
$$ LANGUAGE plpgsql;

-- Function to check if a teacher is available
CREATE OR REPLACE FUNCTION referentiels.is_teacher_available(
    p_enseignant_id INT,
    p_time_slot_id INT,
    p_date DATE,
    p_exclude_schedule_id INT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
    v_conflict_count INT;
BEGIN
    SELECT COUNT(*)
    INTO v_conflict_count
    FROM referentiels.schedule
    WHERE enseignant_id = p_enseignant_id
      AND time_slot_id = p_time_slot_id
      AND date_debut <= p_date
      AND (date_fin IS NULL OR date_fin >= p_date)
      AND statut != 'annule'
      AND (p_exclude_schedule_id IS NULL OR id != p_exclude_schedule_id);
    
    RETURN v_conflict_count = 0;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 10. GRANT PERMISSIONS (adjust as needed)
-- ============================================================================

-- Grant permissions on tables
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA referentiels TO PUBLIC;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA auth TO PUBLIC;

-- Grant permissions on sequences
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA referentiels TO PUBLIC;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA auth TO PUBLIC;

-- Grant permissions on views
GRANT SELECT ON ALL TABLES IN SCHEMA referentiels TO PUBLIC;

-- Grant execute on functions
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA referentiels TO PUBLIC;

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================

-- Verification queries
SELECT 'Migration completed successfully!' AS status;

-- Check foreign keys
SELECT 
    tc.table_schema, 
    tc.table_name, 
    tc.constraint_name, 
    tc.constraint_type
FROM information_schema.table_constraints tc
WHERE tc.table_schema IN ('referentiels', 'auth')
  AND tc.constraint_type = 'FOREIGN KEY'
ORDER BY tc.table_schema, tc.table_name;

-- Check indexes
SELECT 
    schemaname,
    tablename,
    indexname
FROM pg_indexes
WHERE schemaname IN ('referentiels', 'auth')
ORDER BY schemaname, tablename;

-- Check views
SELECT 
    table_schema,
    table_name AS view_name
FROM information_schema.views
WHERE table_schema = 'referentiels'
ORDER BY table_name;
