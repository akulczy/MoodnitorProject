const Sequelize = require("sequelize");
const sequelize = require("../conn/db");

const IndividualEntryFile = sequelize.define("IndividualEntryFile", {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    fileId: {
        type: Sequelize.TEXT,
        allowNull: false
    }
});

module.exports = IndividualEntryFile;