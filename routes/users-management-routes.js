const express = require("express");
const router = express.Router();

const users = require("../controllers/users-management");

// GET - view a list of users
router.get("/users/list", users.getUsersListView);

// GET - get a page to add a new user
router.get("/users/add", users.getAddUserView);

// POST - add new user
router.post("/users/create", users.addUser);

module.exports = router;
