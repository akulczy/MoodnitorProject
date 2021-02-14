const Centre = require("../models/centre");
const Specialist = require("../models/specialist");
const SystemUser = require("../models/patient");
const IndUser = require("../models/individualuser");
const IndEntry = require("../models/individualentry");

const moment = require("moment");

// Method to display the page where entry can be created
exports.getAddEntryPage = (req, res) => {
    let dateToday =  moment(new Date()).format("DD/MM/YYYY");

    res.render("entries/add-entry", {
        title: "Add New Entry",
        isAdmin: req.session.isAdmin,
        isSpecialist: req.session.isSpecialist,
        isSystemUser: req.session.isSystemUser,
        isIndUser: req.session.isIndUser,
        userName: req.session.name,
        userSurname: req.session.surname,
        titleToDisplay: "Add New Entry",
        dateToday: dateToday
    });
}

// Method to process and insert entry record of an individualuser
exports.addIndividualEntry = async (req, res) => {
    let dateToday =  moment(new Date()).format("YYYY-MM-DD");
    let timeNow =  moment(new Date()).format("HH:mm:ss");
    let entryContent = req.body.entryContent;
    let entryHtmlContent = req.body.entryHtmlContent;
    let entryTitle = "";
    let entry = null;

    if(req.body.entryTitle == "") {
        entryTitle = "Entry - " + dateToday;
    } else {
        entryTitle = req.body.entryTitle;
    }

    // Create new entry record
    try {
        entry = await IndEntry.create({
            title: entryTitle,
            content: entryContent,
            contentHtml: entryHtmlContent,
            date: dateToday,
            time: timeNow,
            disabled: false,
            IndividualUserId: req.session.userId
        });
    } catch(error) {
        console.log(error);
        return res.sendStatus(400);
    }

    // Sending status 400 in case the entry had not been created successfully
    if(entry == null) { return res.sendStatus(400); }

    // TODO - File Handling

    // Entry created successfully - status 200
    return res.sendStatus(200);
}

exports.getReviewEntriesPage = async (req, res) => {
    let entries = [];

    // Retrieving all the users' entries to display them on the page
    if(req.session.isIndUser) {
        try {
            entries = await IndEntry.findAll( {where: {IndividualUserId: req.session.userId, disabled: false }, order: [["createdAt", "DESC"]] } );
        } catch(error) {
            console.log(error);
            return res.redirect("/dashboard");
        }
    } else if (req.session.isSystemUser) {

    }

    return res.render("entries/review-entries-user", {
        title: "Review your entries",
        isAdmin: req.session.isAdmin,
        isSpecialist: req.session.isSpecialist,
        isSystemUser: req.session.isSystemUser,
        isIndUser: req.session.isIndUser,
        userName: req.session.name,
        userSurname: req.session.surname,
        titleToDisplay: "Review Entries",
        entries: entries
    });
}