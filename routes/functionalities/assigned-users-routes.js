const express = require("express");
const router = express.Router();

const users = require("../../controllers/users-management");

// GET - view a list of assigned users
router.get("/users", users.getAssignedUsersListView);

module.exports = router;
