// config/database.js
const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
  process.env.DB_NAME || 'mysurprise4u',
  process.env.DB_USER || 'root',
  process.env.DB_PASSWORD || '', {
  host: process.env.DB_HOST || 'localhost',
  dialect: 'mysql',
  logging: console.log,  // Enable logging to see SQL queries
  port: 3306,  // XAMPP's default MySQL port
  define: {
    // Add these options for proper foreign key handling
    timestamps: true,
    underscored: true,
    paranoid: true // This enables soft deletes
  }
});

module.exports = { sequelize };