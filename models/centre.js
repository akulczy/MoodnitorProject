const Sequelize = require("sequelize");
const sequelize = require("../conn/db");

const Centre = sequelize.define("Centre", {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    email: {
        type: Sequelize.STRING,
        allowNull: false
    },
    name: {
        type: Sequelize.STRING,
        allowNull: false
    },
    verified: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        default: 0
    }
});

module.exports = Centre;