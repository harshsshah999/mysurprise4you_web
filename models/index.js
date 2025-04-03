const { Sequelize } = require('sequelize');
const { sequelize } = require('../config/database');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

// Import models
const User = require('./User');
const Booking = require('./Booking');
const Slide = require('./Slide');

// Define associations with cascade options
User.hasMany(Booking, {
  foreignKey: {
    name: 'userId',
    allowNull: false
  },
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE'
});

Booking.belongsTo(User, {
  foreignKey: {
    name: 'userId',
    allowNull: false
  }
});

Booking.hasMany(Slide, {
  foreignKey: {
    name: 'bookingId',
    allowNull: true
  },
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE'
});

Slide.belongsTo(Booking, {
  foreignKey: {
    name: 'bookingId',
    allowNull: true
  }
});

module.exports = {
  sequelize,
  User,
  Booking,
  Slide
};