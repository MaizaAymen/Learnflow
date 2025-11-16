const {DataTypes} = require('sequelize');
// Use the same sequelize instance as auth-service to enable cross-schema relationships
const sequelize = require('../../auth-service/config');

const matiere = sequelize.define('matiere', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notEmpty: true,
            len: [2, 255]
        }
    },
    description: { 
        type: DataTypes.TEXT, 
        allowNull: true 
    },
    code: {
        type: DataTypes.STRING(20),
        allowNull: false,
        unique: true,
        validate: {
            notEmpty: true,
            isUppercase: true
        }
    },
    credits: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 3,
        validate: {
            min: 1,
            max: 10
        }
    },
    niveauId: {
        type: DataTypes.INTEGER,
        allowNull: false
        // IMPORTANT: Removed 'references' field to avoid FK constraint at table creation
        // FK constraint will be added via belongsTo() relationship and models/index.js
    }
}, {
    schema: "referentiels",
    tableName: "matiere",
    timestamps: true
});

// Relationships are defined in models/index.js to avoid circular dependencies

module.exports = matiere;