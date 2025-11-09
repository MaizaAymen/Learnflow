// Model initialization file to avoid circular dependencies
// All models should be required first, then relationships are defined here

const Niveau = require('./Niveau');
const Classe = require('./Classe');
const Specialite = require('./Specialite');
const Departement = require('./Département');
const Salle = require('./Salle');
const Matiere = require('./Matiére');
const Course = require('./Course');

// Define relationships after all models are loaded
Departement.hasMany(Specialite, {
  foreignKey: 'departementId',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE'
});
Specialite.belongsTo(Departement, { foreignKey: 'departementId' });

// Departement → Classe
Departement.hasMany(Classe, {
  foreignKey: 'departement_id',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE'
});
Classe.belongsTo(Departement, { foreignKey: 'departement_id' });

// Specialite → Niveau
Specialite.hasMany(Niveau, {
  foreignKey: 'specialiteId',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE'
});
Niveau.belongsTo(Specialite, { foreignKey: 'specialiteId' });

// Niveau → Classe
Niveau.hasMany(Classe, {
  foreignKey: 'niveau_id',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE'
});
Classe.belongsTo(Niveau, { foreignKey: 'niveau_id' });

// Departement → Salle
Departement.hasMany(Salle, {
  foreignKey: 'departement_id',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE'
});
Salle.belongsTo(Departement, { foreignKey: 'departement_id' });

// Course → Matiere
Course.belongsTo(Matiere, { foreignKey: 'matiereId', as: 'matieree' });
Matiere.hasMany(Course, { foreignKey: 'matiereId', as: 'coursese' });

module.exports = {
  Niveau,
  Classe,
  Specialite,
  Departement,
  Salle,
  Matiere,
  Course,
};