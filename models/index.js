const { Sequelize } = require('sequelize');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

// Initialize Sequelize
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD, {
  host: process.env.DB_HOST,
  dialect: 'mysql'
});

// Test the connection
sequelize.authenticate()
  .then(() => console.log('Connected to MySQL!'))
  .catch(err => console.error('Failed to connect to MySQL:', err));

// Export Sequelize instance
module.exports = sequelize;