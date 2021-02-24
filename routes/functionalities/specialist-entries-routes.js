const express = require("express");
const router = express.Router();
const path = require("path");

const entries = require("../../controllers/specialist-entries");

let multer  = require('multer');
let storage = multer.diskStorage({
    destination: (req, file, cb) => {
        let newPath = path.join(__basedir, "uploads");
        cb(null, newPath);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + "_" + file.originalname);
    }
});

let upload = multer({ storage: storage });

// GET - page where entries can be reviewed
router.get("/review", entries.getReviewEntriesPageSpecialist);

module.exports = router;
