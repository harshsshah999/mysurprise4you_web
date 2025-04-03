const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Slide = sequelize.define('Slide', {
  title: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.TEXT },
  backgroundType: { type: DataTypes.STRING, allowNull: false }, // gradient, image, solid
  backgroundValue: { type: DataTypes.STRING, allowNull: false }, // color code or image URL
  bookingId: { type: DataTypes.INTEGER, allowNull: true }, // null for default slides
  order: { type: DataTypes.INTEGER, defaultValue: 0 }, // for slide ordering
  isActive: { type: DataTypes.BOOLEAN, defaultValue: true }
});

module.exports = Slide;