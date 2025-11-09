const {DataTypes} = require('sequelize');
// Use the same sequelize instance as auth-service to enable cross-schema relationships
const sequelize = require('../../auth-service/config');
const departement = require('./Département');   


const specialite =sequelize.define('specialite',{
    id:{type: DataTypes.INTEGER,primaryKey:true,autoIncrement:true},
    name:{type:DataTypes.STRING,allowNull:true},
    description: { type: DataTypes.TEXT, allowNull: true },},{

        schema: "referentiels",
        tablename: "specialite",
    }
);

// Relationships are defined in models/index.js to avoid circular dependencies

module.exports = specialite;
