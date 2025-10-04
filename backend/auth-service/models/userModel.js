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
  role: { type: DataTypes.ENUM('etudiant','enseignant','directeur','admin'), allowNull: false },
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
  adresse: { type: DataTypes.STRING, allowNull: true }, // pour les étudiants
  ville: { type: DataTypes.STRING, allowNull: true }, // pour les étudiants
  pays: { type: DataTypes.STRING, allowNull: true }, // pour les étudiants
  niveau_etude: { type: DataTypes.STRING, allowNull: true }, // pour les étudiants
  parcours: { type: DataTypes.STRING, allowNull: true }, // pour les étudiants


  //
  interets: { type: DataTypes.ARRAY(DataTypes.STRING), allowNull: true }, // pour les étudiants // hedi zidtha fi 7alit inha letudiant kan 3indah interets mo3ayana jima club 
  competences: { type: DataTypes.ARRAY(DataTypes.STRING), allowNull: true }, // pour les étudiants // hedi zidtha fi 7alit inha letudiant kan 3indah competences mo3ayana kima programmation wou 3indha relation m3a champ interets
  //


}, {
  schema: "auth",
  tableName: "utilisateur"
});

module.exports = User;