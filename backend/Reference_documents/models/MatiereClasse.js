const {DataTypes} = require('sequelize');
// Use the same sequelize instance as auth-service to enable cross-schema relationships
const sequelize = require('../../auth-service/config');

// Association table between Matiere and Classe
// Represents which Matières are taught to which Classes
const MatiereClasse = sequelize.define('MatiereClasse', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    matiereId: {
        type: DataTypes.INTEGER,
        allowNull: false
        // IMPORTANT: Removed 'references' field to avoid FK constraint at table creation
        // FK constraint will be added via belongsToMany() relationship
    },
    classeId: {
        type: DataTypes.INTEGER,
        allowNull: false
        // IMPORTANT: Removed 'references' field to avoid FK constraint at table creation
        // FK constraint will be added via belongsToMany() relationship
    },
    heures_semaine: {
        type: DataTypes.DECIMAL(4, 2),
        allowNull: true,
        comment: 'Number of hours per week for this matiere in this class',
        validate: {
            min: 0,
            max: 40
        }
    },
    coefficient: {
        type: DataTypes.DECIMAL(3, 2),
        allowNull: true,
        defaultValue: 1.0,
        comment: 'Coefficient for grade calculation',
        validate: {
            min: 0.5,
            max: 5.0
        }
    }
}, {
    schema: "referentiels",
    tableName: "matiere_classe",
    timestamps: true,
    indexes: [
        {
            unique: true,
            fields: ['matiereId', 'classeId'],
            name: 'unique_matiere_per_classe'
        }
    ]
});

// Many-to-Many relationships are defined here
const Matiere = require('./Matiére');
const Classe = require('./Classe');

Matiere.belongsToMany(Classe, {
    through: MatiereClasse,
    foreignKey: 'matiereId',
    otherKey: 'classeId',
    as: 'classes'
});

Classe.belongsToMany(Matiere, {
    through: MatiereClasse,
    foreignKey: 'classeId',
    otherKey: 'matiereId',
    as: 'matieres'
});

module.exports = MatiereClasse;