const express = require("express");
const router = express.Router();

const users = require("../../controllers/users-management");

// GET - view a list of users
router.get("/list", users.getUsersListView);

// GET - get a page to add a new user
router.get("/add", users.getAddUserView);

// POST - add new user
router.post("/create", users.addUser);

// PATCH - disable or enable user
router.patch("/disable", users.disableUser);

// GET - edit user page
router.get("/edit/:userId", users.getEditUserPage);

// PUT - update user's details
router.post("/update", users.editUserDetails);

module.exports = router;