const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Book = sequelize.define('Book', {
    id: {
      type: DataTypes.UUID,
      defaultValue: sequelize.literal('gen_random_uuid()'),
      primaryKey: true,
    },
    titre: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    auteur: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    isbn: {
      type: DataTypes.STRING(20),
      allowNull: true,
      unique: true,
    },
    categorie: {
      type: DataTypes.ENUM('informatique', 'mecanique', 'electrique', 'civil', 'general'),
      defaultValue: 'general',
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    nombreCopies: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
      allowNull: false,
    },
    copiesDisponibles: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
      allowNull: false,
    },
    statut: {
      type: DataTypes.ENUM('available', 'unavailable', 'deleted'),
      defaultValue: 'available',
    },
    editeur: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    anneePublication: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    langue: {
      type: DataTypes.STRING(50),
      defaultValue: 'Français',
    },
    nombrePages: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    dateAjout: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      allowNull: false,
    },
    updatedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      allowNull: false,
    },
  }, {
    tableName: 'books',
    schema: 'auth',
    timestamps: false,
  });

  return Book;
};
