const express = require("express");
const router = express.Router();

const entriesRoutes = require("./functionalities/user-entries-routes");

router.use("/entries", entriesRoutes);

module.exports = router;
