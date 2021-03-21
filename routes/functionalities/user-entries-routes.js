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

// POST - create a new entry
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

// GET - fetch user notes assigned to an entry
router.get("/get/notes", entries.fetchUserNotes);

// GET - get page to review summary of an entry - system user
router.get("/sys/:entryId", entries.getSystemUserEntrySummaryPage);

// POST - download file - system user
router.post("/sys/file", entries.downloadSystemUserEntryFile);

// GET - get page to review summary of an entry - individual user
router.get("/ind/:entryId", entries.getIndividualUserEntrySummaryPage);

// POST - download file - individual user
router.post("/ind/file", entries.downloadIndividualUserEntryFile);

// GET - fetch entries according to parameters passed in the body
router.get("/fetch", entries.fetchEntries);

// GET - fetch individual entry with results
router.get("/fetch/:entryId", entries.fetchEntryWithResults);

// GET - view with user journey
router.get("/journey", entries.getDefaultUserJourneyPage);

module.exports = router;
