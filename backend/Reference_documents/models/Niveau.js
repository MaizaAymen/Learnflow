const {DataTypes} = require('sequelize');
// Use the same sequelize instance as auth-service to enable cross-schema relationships
const sequelize = require('../../auth-service/config');

const niveau = sequelize.define('niveau', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING(100),
        allowNull: false,
        validate: {
            notEmpty: true,
            len: [2, 100]
        }
    },
    description: { 
        type: DataTypes.TEXT, 
        allowNull: true 
    },
    specialiteId: {
        type: DataTypes.INTEGER,
        allowNull: false
        // IMPORTANT: Removed 'references' field to avoid FK constraint at table creation
        // FK constraint will be added via belongsTo() relationship and models/index.js
    },
    ordre: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'Order/level within the specialite (e.g., 1st year, 2nd year)',
        validate: {
            min: 1,
            max: 10
        }
    }
}, {
    schema: "referentiels",
    tableName: "niveau",
    timestamps: true
});

// Relationships are defined in a separate file to avoid circular dependencies
// See models/index.js for relationship initialization

module.exports = niveau;
