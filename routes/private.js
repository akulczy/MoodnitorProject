const express = require("express");
const router = express.Router();

const dashboard = require("../controllers/dashboard-functions");
const users = require("../controllers/users-management");

const specialistRoutes = require("./specialist-routes.js");
const userRoutes = require("./user-routes");

// Middleware
const specialistAccess = require("../middleware/specialist-only.js");
const userAccess = require("../middleware/user-only.js");
const generalAccess = require("../middleware/general-access.js");

// USE - specialist paths
router.use("/specialist", specialistAccess, specialistRoutes);

// USE - user paths
router.use("/user", userAccess, userRoutes);

// GET - logout
router.get("/logout", generalAccess, dashboard.logoutUser);

// GET - account page
router.get("/account", generalAccess, dashboard.getAccountPage);

// GET - update account page
router.get("/account/update", generalAccess, dashboard.getUpdateAccountPage);

// POST - update account
router.post("/account/update", generalAccess, dashboard.updateUserDetails);

// GET - get page where information about emotion classes are displayed
router.get("/emotions", generalAccess, dashboard.getMoreInfoPage);

// USE - dashboard
router.use("/", dashboard.getDashboard);

module.exports = router;
