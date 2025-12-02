const {DataTypes} = require('sequelize');
const sequelize = require('../config');

const User =sequelize.define('User',{
    id:{
        type:DataTypes.INTEGER,
        primaryKey:true,
        autoIncrement:true},
   nom: { type: DataTypes.STRING, allowNull: false },
  prenom: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, allowNull: false, unique: true },
  login: { type: DataTypes.STRING, allowNull: true, unique: true },
  mdp_hash: { type: DataTypes.TEXT, allowNull: false },
  role: { type: DataTypes.ENUM('etudiant','enseignant','directeur','admin','chef_de_department'), allowNull: false },
  is_department_head: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false }, // Flag to mark department heads
  image: { type: DataTypes.STRING, allowNull: true }, // url ou chemin
  phone: { type: DataTypes.STRING, allowNull: true },
  bio: { type: DataTypes.TEXT, allowNull: true },
  cin:{type: DataTypes.STRING, allowNull: true},
  certification:{type: DataTypes.STRING, allowNull: true},
  date_naissance: { type: DataTypes.DATE, allowNull: true },

  // pour les enseignants
  classes: { type: DataTypes.ARRAY(DataTypes.STRING), allowNull: true }, // pour les enseignants //les classes qu'il enseigne eli 3indah
  specialite: { type: DataTypes.ENUM('informatique', 'mecanique', 'electrique', 'civil'), allowNull: true }, // pour les enseignants
  departement: { type: DataTypes.STRING, allowNull: true }, // pour les enseignants
  etablissement: { type: DataTypes.STRING, allowNull: true }, // pour les enseignants //momken austad jay min bara y9ri fi tozeur   


  // Informations spécifiques aux étudiants
  numero_etudiant: { type: DataTypes.STRING(50), allowNull: true, unique: true }, // Numéro unique de l'étudiant
  adresse: { type: DataTypes.TEXT, allowNull: true }, // pour les étudiants
  ville: { type: DataTypes.STRING, allowNull: true }, // pour les étudiants
  pays: { type: DataTypes.STRING, allowNull: true }, // pour les étudiants
  niveau_etude: { type: DataTypes.STRING, allowNull: true }, // pour les étudiants
  parcours: { type: DataTypes.STRING, allowNull: true }, // pour les étudiants
  niveau_id: { type: DataTypes.INTEGER, allowNull: true }, // Foreign key vers referentiels.niveau
  classe_id: { type: DataTypes.INTEGER, allowNull: true }, // Foreign key vers referentiels.classe
  statut: { type: DataTypes.STRING, allowNull: true, defaultValue: 'actif' }, // Statut de l'étudiant (uses auth.user_statut ENUM in DB)
  notes: { type: DataTypes.TEXT, allowNull: true }, // Notes supplémentaires sur l'étudiant
  is_temporary: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false }, // Indicateur pour import CSV temporaire
  import_batch_id: { type: DataTypes.UUID, allowNull: true }, // ID du batch d'import CSV

  //
  interets: { type: DataTypes.ARRAY(DataTypes.STRING), allowNull: true }, // pour les étudiants // hedi zidtha fi 7alit inha letudiant kan 3indah interets mo3ayana jima club 
  competences: { type: DataTypes.ARRAY(DataTypes.STRING), allowNull: true }, // pour les étudiants // hedi zidtha fi 7alit inha letudiant kan 3indah competences mo3ayana kima programmation wou 3indha relation m3a champ interets
  //
  
  // Profile completion tracking
  profile_completed: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false }, // Whether user has completed their profile with photo
  profile_completed_at: { type: DataTypes.DATE, allowNull: true }, // Timestamp when profile was completed


}, {
  schema: "auth",
  tableName: "utilisateur"
});

module.exports = User;