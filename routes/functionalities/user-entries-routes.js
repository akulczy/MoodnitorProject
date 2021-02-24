const express = require("express");
const router = express.Router();
const path = require("path");

const entries = require("../../controllers/user-entries");

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

// GET - get a page where users can add their entries
router.get("/add", entries.getAddEntryPage);

// POST - create new individual entry
router.post("/add", 
                upload.fields([{ name: 'addfiles', maxCount: 3 }]), 
                entries.addEntry
            );

// GET - page where entries can be reviewed
router.get("/review", entries.getReviewEntriesPage);

// POST - browsing by title
router.post("/browse/title", entries.browseByTitle);

// POST - browsing by date
router.post("/browse/date", entries.browseByDate);

// POST - browsing by date range
router.post("/browse/date/range", entries.browseByDateRange);

// PATCH - browsing by date range
router.patch("/disable", entries.disableEntry);

// GET - review archived entries page
router.get("/archive", entries.getDisabledEntriesPage);

// POST - browse disabled entries by date
router.post("/archive/browse", entries.browseDisabledByDate);

// PATCH - add aditional notes to an existing entry
router.patch("/add/notes", entries.addUserNotes);

module.exports = router;
