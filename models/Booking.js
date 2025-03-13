const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Booking = sequelize.define('Booking', {
    date: { type: DataTypes.DATEONLY, allowNull: false, unique: true },
    recipientName: { type: DataTypes.STRING, allowNull: false },
    hirerName: { type: DataTypes.STRING, allowNull: false }
  });

  return Booking;
};