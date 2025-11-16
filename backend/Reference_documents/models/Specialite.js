const {DataTypes} = require('sequelize');
// Use the same sequelize instance as auth-service to enable cross-schema relationships
const sequelize = require('../../auth-service/config');

const specialite = sequelize.define('specialite', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING(150),
        allowNull: false,
        validate: {
            notEmpty: true,
            len: [2, 150]
        }
    },
    description: { 
        type: DataTypes.TEXT, 
        allowNull: true 
    },
    departementId: {
        type: DataTypes.INTEGER,
        allowNull: false
        // IMPORTANT: Removed 'references' field to avoid FK constraint at table creation
        // FK constraint will be added via belongsTo() relationship and models/index.js
    },
    code: {
        type: DataTypes.STRING(20),
        allowNull: true,
        unique: true,
        validate: {
            isUppercase: true
        }
    },
    duree_annees: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 3,
        comment: 'Duration of the specialization in years',
        validate: {
            min: 1,
            max: 7
        }
    }
}, {
    schema: "referentiels",
    tableName: "specialite",
    timestamps: true
});

// Relationships are defined in models/index.js to avoid circular dependencies

module.exports = specialite;
