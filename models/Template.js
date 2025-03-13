const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Template = sequelize.define('Template', {
    name: { type: DataTypes.STRING, allowNull: false },
    html: { type: DataTypes.TEXT, allowNull: false },
    css: { type: DataTypes.TEXT, allowNull: false }
  });

  return Template;
};