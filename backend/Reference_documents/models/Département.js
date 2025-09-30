const {DataTypes} = require('sequelize');
const sequelize = require('../config');


const departement =sequelize.define('departement',{
    id:{
        type:DataTypes.INTEGER,
        primaryKey:true,
        autoIncrement:true
    },
    name:{
        type:DataTypes.STRING,allowNull:false},
    description: { type: DataTypes.TEXT, allowNull: true },
    
},{
  schema: "referentiels",
  tableName: "departement",
});

module.exports = departement;
