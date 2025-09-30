const {DataTypes} = require('sequelize');
const sequelize = require('../config');
const departement = require('./Département');   


const specialite =sequelize.define('specialite',{
    id:{type: DataTypes.INTEGER,primaryKey:true,autoIncrement:true},
    name:{type:DataTypes.STRING,allowNull:false},
    description: { type: DataTypes.TEXT, allowNull: true },},{

        schema: "referentiels",
        tablename: "specialite",
    }
);
departement.hasMany(specialite,{foreignKey:'departementId'});
specialite.belongsTo(departement,{foreignKey:'departementId'});
