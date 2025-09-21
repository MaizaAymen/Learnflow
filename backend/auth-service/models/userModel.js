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
  login: { type: DataTypes.STRING, allowNull: false, unique: true },
  mdp_hash: { type: DataTypes.TEXT, allowNull: false },
  role: { type: DataTypes.ENUM('etudiant','enseignant','directeur','admin'), allowNull: false },
  image: { type: DataTypes.STRING, allowNull: true }, // url ou chemin
  phone: { type: DataTypes.STRING, allowNull: true },
  bio: { type: DataTypes.TEXT, allowNull: true }
}, {
  schema: "auth",
  tableName: "utilisateur"
});

module.exports = User;