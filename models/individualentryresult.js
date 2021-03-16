const Sequelize = require("sequelize");
const sequelize = require("../conn/db");

const IndividualEntryResult = sequelize.define("IndividualEntryResult", {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    predictions: {
        type: Sequelize.JSON,
        allowNull: true
    },
    emotion: {
        type: Sequelize.STRING,
        allowNull: false
    },
    maxVal: {
        type: Sequelize.DOUBLE,
        allowNull: true
    }
});

module.exports = IndividualEntryResult;