const express = require("express");
const router = express.Router();

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
router.post("/add/ind", 
                upload.fields([{ name: 'addfiles', maxCount: 5 }]), 
                entries.addIndividualEntry
            );

// GET - page where entries can be reviewed
router.get("/review", entries.getReviewEntriesPage);

module.exports = router;
