const express = require("express");
const router = express.Router();

const userManagementRoutes = require("./functionalities/users-management-routes");
const entriesRoutes = require("./functionalities/specialist-entries-routes");

router.use("/entries", entriesRoutes);

router.use("/users", userManagementRoutes);

module.exports = router;
