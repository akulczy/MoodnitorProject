const express = require("express");
const router = express.Router();

const contact = require("../../controllers/contact");

// GET - get the contact page for specialist
router.get("/email", contact.getContactPageSpecialist);

// POST - send an email to the user
router.post("/mail/send", contact.sendMailToSpecialist);

module.exports = router;