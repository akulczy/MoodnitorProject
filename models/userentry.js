const Sequelize = require("sequelize");
const sequelize = require("../conn/db");

const UserEntry = sequelize.define("UserEntry", {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    title: {
        type: Sequelize.STRING,
        allowNull: false
    },
    content: {
        type: Sequelize.TEXT,
        allowNull: false
    },
    contentHtml: {
        type: Sequelize.TEXT,
        allowNull: false
    },
    date: {
        type: Sequelize.DATE,
        allowNull: false
    },
    time: {
        type: Sequelize.TIME,
        allowNull: false
    },
    disabled: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: 0
    },
    usernotes: {
        type: Sequelize.TEXT,
        allowNull: true
    }
});

module.exports = UserEntry;