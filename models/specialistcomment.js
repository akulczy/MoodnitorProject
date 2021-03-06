const Sequelize = require("sequelize");
const sequelize = require("../conn/db");

const SpecialistComment = sequelize.define("SpecialistComment", {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    comment: {
        type: Sequelize.TEXT,
        allowNull: false
    }
});

module.exports = SpecialistComment;