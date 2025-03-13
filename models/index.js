const { Sequelize } = require('sequelize');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD, {
  host: process.env.DB_HOST,
  dialect: 'mysql'
});

// Model definitions
const defineUser = require('./User');
const defineTemplate = require('./Template');
const defineInstance = require('./Instance');
const defineBooking = require('./Booking');

// Initialize models
const User = defineUser(sequelize);
const Template = defineTemplate(sequelize);
const Instance = defineInstance(sequelize);
const Booking = defineBooking(sequelize);

// Explicit associations
User.hasMany(Instance, { foreignKey: 'UserId' });
Instance.belongsTo(User, { foreignKey: 'UserId' });

Template.hasMany(Instance, { foreignKey: 'TemplateId' });
Instance.belongsTo(Template, { foreignKey: 'TemplateId' });

// Test connection
sequelize.authenticate()
  .then(() => console.log('Connected to MySQL!'))
  .catch(err => console.error('Connection failed:', err));

sequelize.sync();

module.exports = {
  sequelize,
  User,
  Template,
  Instance,
  Booking
};