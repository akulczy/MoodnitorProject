const express = require("express");
const router = express.Router();

const contact = require("../../controllers/contact");

// GET - get the contact page for users
router.get("/email", contact.getContactPage);

// POST - send an email to the specialist
router.post("/mail/send", contact.sendMailToSpecialist);

// POST - send an email to the support
router.post("/mail/send/support", contact.sendMailToSupport);

module.exports = router;