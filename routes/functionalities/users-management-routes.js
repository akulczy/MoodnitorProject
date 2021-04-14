const express = require("express");
const router = express.Router();

const users = require("../../controllers/users-management");

// Middleware
const adminAccess = require("../../middleware/admin-only.js");

// GET - view a list of users
router.get("/list", adminAccess, users.getUsersListView);

// GET - view a list of specialists and administrators
router.get("/list/specialists", adminAccess, users.getSpecialistsListView);

// GET - get a page to add a new user
router.get("/add", adminAccess, users.getAddUserView);

// POST - add new user
router.post("/create", adminAccess, users.addUser);

// PATCH - disable or enable user
router.patch("/disable", adminAccess, users.disableUser);

// GET - edit user page
router.get("/edit/:userId", adminAccess, users.getEditUserPage);

// POST - update user's details
router.post("/update", adminAccess, users.editUserDetails);

// PATCH - disable or enable specialist
router.patch("/spec/disable", adminAccess, users.disableSpecialist);

// GET - edit user page
router.get("/edit/spec/:userId", adminAccess, users.getEditSpecialistPage);

// POST - update user's details
router.post("/spec/update", adminAccess, users.editSpecialistDetails);

module.exports = router;
