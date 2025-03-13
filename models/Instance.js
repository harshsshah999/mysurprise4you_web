const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define('Instance', {
    data: {
      type: DataTypes.JSON,
      allowNull: false
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    }
  });
};