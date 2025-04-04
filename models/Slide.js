const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Slide = sequelize.define('Slide', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  title: { 
    type: DataTypes.STRING, 
    allowNull: false 
  },
  description: { 
    type: DataTypes.TEXT 
  },
  background_type: { 
    type: DataTypes.STRING, 
    allowNull: false 
  }, // gradient, image, solid
  background_value: { 
    type: DataTypes.STRING, 
    allowNull: false 
  }, // color code or image URL
  booking_id: { 
    type: DataTypes.INTEGER, 
    allowNull: true 
  }, // null for default slides
  order: { 
    type: DataTypes.INTEGER, 
    defaultValue: 0 
  }, // for slide ordering
  is_active: { 
    type: DataTypes.BOOLEAN, 
    defaultValue: true 
  }
}, {
  tableName: 'slides',
  underscored: true,
  paranoid: true,
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  deletedAt: 'deleted_at'
});

module.exports = Slide;