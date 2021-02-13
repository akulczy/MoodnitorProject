const Sequelize = require("sequelize");
const sequelize = require("../conn/db");

const IndividualUser = sequelize.define("IndividualUser", {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    name: {
        type: Sequelize.STRING,
        allowNull: false
    },
    surname: {
        type: Sequelize.STRING,
        allowNull: false
    },
    email: {
        type: Sequelize.STRING,
        allowNull: false
    },
    password: {
        type: Sequelize.STRING,
        allowNull: false
    },
    telephone: {
        type: Sequelize.STRING,
        allowNull: false
    }
});

module.exports = IndividualUser;