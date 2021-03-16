const Sequelize = require("sequelize");
const sequelize = require("../conn/db");

const IndividualEntrySentence = sequelize.define("IndividualEntrySentence", {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    sentenceNo: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    sentence: {
        type: Sequelize.TEXT,
        allowNull: false
    },
    predictions: {
        type: Sequelize.JSON,
        allowNull: true
    },
    emotion: {
        type: Sequelize.STRING,
        allowNull: false
    }
});

module.exports = IndividualEntrySentence;