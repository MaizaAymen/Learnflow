const {DataTypes} = require('sequelize');
// Use the same sequelize instance as auth-service to enable cross-schema relationships
const sequelize = require('../../auth-service/config');
const niveau=require('./Niveau');
const matiere=require('./Matiére');
const Classe = require('./Classe');

//classe d'Associations
const matiereClasse =sequelize.define('matiere_classe',{},{
    schema: "referentiels",
    tableName: "matiere_classe",
});
matiere.belongsToMany(Classe,{through:matiereClasse,foreignKey:'matiereId'});
Classe.belongsToMany(matiere,{through:matiereClasse,foreignKey:'classeId'});


module.exports = matiereClasse;