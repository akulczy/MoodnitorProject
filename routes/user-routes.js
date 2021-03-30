const express = require("express");
const router = express.Router();

const entriesRoutes = require("./functionalities/user-entries-routes");
const contactRoutes = require("./functionalities/user-contact-routes");

router.use("/entries", entriesRoutes);

router.use("/contact", contactRoutes);

module.exports = router;
