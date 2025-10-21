const {DataTypes}=require('sequelize');
// Use the same sequelize instance as auth-service to enable cross-schema relationships
const sequelize=require('../../auth-service/config');
const specialite=require('./Specialite');


const niveau=sequelize.define('niveau',{
    id:{
        type:DataTypes.INTEGER,
        primaryKey:true,autoIncrement:true},
    name:{type:DataTypes.STRING,allowNull:true},
    description: { type: DataTypes.TEXT, allowNull: true },
},{
    schema: "referentiels",
    tableName: "niveau",
});

specialite.hasMany(niveau,{foreignKey:'specialiteId'});
niveau.belongsTo(specialite,{foreignKey:'specialiteId'});

module.exports=niveau;
