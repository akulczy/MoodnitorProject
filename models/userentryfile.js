const Sequelize = require("sequelize");
const sequelize = require("../conn/db");

const UserEntryFile = sequelize.define("UserEntryFile", {
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

module.exports = UserEntryFile;