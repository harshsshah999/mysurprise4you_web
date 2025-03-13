const { DataTypes } = require('sequelize');
const sequelize = require('./index');

const Booking = sequelize.define('Booking', {
  date: { type: DataTypes.DATEONLY, allowNull: false, unique: true },
  recipientName: { type: DataTypes.STRING, allowNull: false },
  hirerName: { type: DataTypes.STRING, allowNull: false }
});

module.exports = Booking;