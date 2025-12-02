const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const BookBorrowing = sequelize.define('BookBorrowing', {
    id: {
      type: DataTypes.UUID,
      defaultValue: sequelize.literal('gen_random_uuid()'),
      primaryKey: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    bookId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    dateEmprunt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    dateRetourPrevue: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    dateRetourEffective: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    statut: {
      type: DataTypes.ENUM('emprunte', 'retourne', 'perdu', 'endommage'),
      defaultValue: 'emprunte',
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
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
    tableName: 'book_borrowings',
    schema: 'auth',
    timestamps: false,
  });

  return BookBorrowing;
};
