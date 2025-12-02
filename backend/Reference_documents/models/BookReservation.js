const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const BookReservation = sequelize.define('BookReservation', {
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
    dateReservation: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    positionQueue: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    statut: {
      type: DataTypes.ENUM('en_attente', 'disponible', 'annulee'),
      defaultValue: 'en_attente',
    },
    dateDisponibilite: {
      type: DataTypes.DATE,
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
    tableName: 'book_reservations',
    schema: 'auth',
    timestamps: false,
  });

  return BookReservation;
};
