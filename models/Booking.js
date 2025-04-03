const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Booking = sequelize.define('Booking', {
  startDate: { 
    type: DataTypes.DATE, 
    allowNull: false 
  },
  endDate: { 
    type: DataTypes.DATE, 
    allowNull: false 
  },
  recipientName: { 
    type: DataTypes.STRING, 
    allowNull: false 
  },
  hirerName: { 
    type: DataTypes.STRING, 
    allowNull: false 
  },
  status: {
    type: DataTypes.ENUM('pending', 'active', 'completed'),
    defaultValue: 'pending'
  }
});

module.exports = Booking;