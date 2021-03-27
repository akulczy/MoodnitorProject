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

// GET - page where individual users entries can be reviewed
router.get("/review/:userId", entries.getReviewEntriesOfIndUserPage);

// GET - get notes of an entry
router.get("/ind/notes", entries.fetchNotesOfSystemUserEntry);

// POST - add new specialist comment to an entry
router.post("/comments/add", entries.addNewComment);

// GET - get comments regarding an entry
router.get("/comments", entries.getComments);

// PUT - update comment
router.put("/comments/update", entries.updateComment);

// POST - browse entries of an individual user by date
router.post("/ind/browse/date", entries.browseIndByDate);

// POST - browse entries of an individual user by date range
router.post("/ind/browse/date/range", entries.browseIndByDateRange);

// POST - browse entries of an individual user by title
router.post("/ind/browse/title", entries.browseIndByTitle);

// POST - browse entries of an individual user by date
router.post("/browse/date", entries.browseByDate);

// POST - browse entries of an individual user by date range
router.post("/browse/date/range", entries.browseByDateRange);

// POST - browse entries of an individual user by title
router.post("/browse/title", entries.browseByTitle);

// GET - review summary of an entry
router.get("/summary/:entryId", entries.getEntrySummaryPage);

// POST - download file of an entry
router.post("/file", entries.downloadEntryFile);

// GET - fetch entries according to parameters passed in the body
router.get("/fetch", entries.fetchEntries);

// GET - fetch entries of an individual user
router.get("/fetch/ind", entries.fetchEntriesInd);

// GET - fetch individual entry with results
router.get("/fetch/:userId/:entryId", entries.fetchEntryWithResults);

// GET - default reports page
router.get("/reports", entries.getDefaultReportsPage);

// POST - rendering report
router.post("/report", entries.getReportPage);

module.exports = router;
