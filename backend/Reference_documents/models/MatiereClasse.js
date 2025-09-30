const {DataTypes} = require('sequelize');
const sequelize = require('../config');
const niveau=require('./Niveau');
const matiere=require('./Matiere');
const Classe = require('./Classe');

//classe d'Associations
const matiereClasse =sequelize.define('matiere_classe',{},{
    schema: "referentiels",
    tableName: "matiere_classe",
});
matiere.belongsToMany(Classe,{through:matiereClasse,foreignKey:'matiereId'});
Classe.belongsToMany(matiere,{through:matiereClasse,foreignKey:'classeId'});


module.exports = matiereClasse;