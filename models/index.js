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
    name: 'user_id',
    allowNull: false
  },
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE'
});

Booking.belongsTo(User, {
  foreignKey: {
    name: 'user_id',
    allowNull: false
  }
});

Booking.hasMany(Slide, {
  foreignKey: {
    name: 'booking_id',
    allowNull: true
  },
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE'
});

Slide.belongsTo(Booking, {
  foreignKey: {
    name: 'booking_id',
    allowNull: true
  }
});

module.exports = {
  sequelize,
  User,
  Booking,
  Slide
};