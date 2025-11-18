-- Fix StudentAbsence Foreign Key Constraint
-- The student_absence table has a FK pointing to referentiels.student
-- But we need it to reference auth.utilisateur instead

-- Step 1: Drop the existing foreign key constraint
ALTER TABLE referentiels.student_absence
DROP CONSTRAINT IF EXISTS student_absence_student_id_fkey;

-- Step 2: Add new foreign key pointing to auth.utilisateur
ALTER TABLE referentiels.student_absence
ADD CONSTRAINT student_absence_student_id_fkey 
FOREIGN KEY (student_id) 
REFERENCES auth.utilisateur(id)
ON DELETE CASCADE 
ON UPDATE CASCADE;

-- Verify the constraint was added
SELECT constraint_name, table_name, column_name, referenced_table_name, referenced_column_name
FROM information_schema.key_column_usage
WHERE table_name = 'student_absence' AND column_name = 'student_id' AND table_schema = 'referentiels';
