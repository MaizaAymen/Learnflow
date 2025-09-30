const {DataTypes} = require('sequelize');
const sequelize = require('../config');
const niveau=require('./Niveau');
const matiere =sequelize.define('matiere',{
    id:{type: DataTypes.INTEGER,primaryKey:true,autoIncrement:true},
    name:{type:DataTypes.STRING,allowNull:false},
    description: { type: DataTypes.TEXT, allowNull: true },
    code :{type:DataTypes.STRING,allowNull:true,unique:true},
    credits:{type:DataTypes.INTEGER,allowNull:true},

},{
    schema: "referentiels",
    tableName: "matiere",


})

niveau.hasMany(matiere,{foreignKey:'niveauId'});
matiere.belongsTo(niveau,{foreignKey:'niveauId'});
module.exports = matiere;