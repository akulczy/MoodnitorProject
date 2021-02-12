const Sequelize = require("sequelize");
const sequelizedb = new Sequelize(process.env.CLEARDB_NAME, process.env.CLEARDB_LOGIN,  process.env.CLEARDB_PASS, {
    dialect: "mysql",
    host: process.env.CLEARDB_HOST
});
module.exports = sequelizedb;