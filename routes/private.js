const express = require("express");
const router = express.Router();

const dashboard = require("../controllers/dashboard-functions");
const users = require("../controllers/users-management");

const specialistRoutes = require("./users-management-routes.js");

// USE - all users-management paths
router.use("/specialist", specialistRoutes);

// GET - logout
router.get("/logout", dashboard.logoutUser);

// USE - dashboard
router.use("/", dashboard.getSpecialistDashboard);

module.exports = router;
