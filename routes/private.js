const express = require("express");
const router = express.Router();

const dashboard = require("../controllers/dashboard-functions");
const users = require("../controllers/users-management");

const specialistRoutes = require("./specialist-routes.js");
const userRoutes = require("./user-routes");

// USE - specialist paths
router.use("/specialist", specialistRoutes);

// USE - user paths
router.use("/user", userRoutes);

// GET - logout
router.get("/logout", dashboard.logoutUser);

// GET - account page
router.get("/account", dashboard.getAccountPage);

// GET - update account page
router.get("/account/update", dashboard.getUpdateAccountPage);

// POST - update account
router.post("/account/update", dashboard.updateUserDetails);

// USE - dashboard
router.use("/", dashboard.getDashboard);

module.exports = router;
