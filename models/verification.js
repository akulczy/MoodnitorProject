const Sequelize = require('sequelize');
const sequelize = require("../conn/db");

const VerificationString = sequelize.define('VerificationString', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    token: {
        type: Sequelize.STRING,
        allowNull: false
    },
    archived: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: 0
    }
});

module.exports = VerificationString;