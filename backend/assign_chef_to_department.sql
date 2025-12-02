-- SQL Script to Assign Chef to Department
-- This assigns user ID 4 (Marwa Trabelsi) as chef of a department

-- Option 1: If a department already exists, update it to set Marwa as chef
UPDATE "referentiels"."departement" 
SET "chef_departement_id" = 4
WHERE "id" = 1
LIMIT 1;

-- Option 2: Create a new department with Marwa as chef (if no department exists)
INSERT INTO "referentiels"."departement" (
  "id",
  "name", 
  "code",
  "description",
  "chef_departement_id",
  "budget",
  "statut",
  "localisation",
  "telephone",
  "email",
  "capacite_max",
  "createdAt",
  "updatedAt"
) VALUES (
  1,
  'Informatique',
  'INFO',
  'Département d''Informatique',
  4,
  100000.00,
  'actif',
  'Campus Principal',
  '+216 XX XXX XXX',
  'info@institution.edu',
  500,
  NOW(),
  NOW()
)
ON CONFLICT ("id") DO UPDATE SET
  "chef_departement_id" = 4,
  "updatedAt" = NOW();

-- Verify the update
SELECT id, name, code, chef_departement_id FROM "referentiels"."departement" WHERE "id" = 1;
