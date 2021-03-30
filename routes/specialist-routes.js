const express = require("express");
const router = express.Router();

const assignedUserManagementRoutes = require("./functionalities/assigned-users-routes");
const userManagementRoutes = require("./functionalities/users-management-routes");
const entriesRoutes = require("./functionalities/specialist-entries-routes");
const contactRoutes = require("./functionalities/specialist-contact-routes");

router.use("/entries", entriesRoutes);

router.use("/users", userManagementRoutes);

router.use("/assigned", assignedUserManagementRoutes);

router.use("/contact", contactRoutes);

module.exports = router;
