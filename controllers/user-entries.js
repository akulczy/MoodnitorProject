const Centre = require("../models/centre");
const Specialist = require("../models/specialist");
const SystemUser = require("../models/patient");
const IndUser = require("../models/individualuser");
const IndEntry = require("../models/individualentry");

const moment = require("moment");
const { Op } = require("sequelize"); 
const axios = require("axios");

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

    let emotion_prediction = "";

    // Connecting to the Python API
    await axios.post('http://localhost:5000/predict', {
        emotion: entryContent
        })
        .then((response) => {
        emotion_prediction = emotion.pred;
        console.log(response);
        }, (error) => {
        console.log(error);
        });

    // TODO - File Handling

    // Entry created successfully - status 200
    return res.status(200).send({emotion: emotion_prediction});
}

// Method to render page where the entries can be reviewed by the user
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

// Method to browse entries by title
exports.browseByTitle = async (req, res) => {
    let entries = [];
    let titleVal = req.body.title;

    if(req.session.isIndUser) {
        try {
            entries = await IndEntry.findAll( 
                { where: { 
                    title: {[Op.like]: '%' + titleVal + '%'}, 
                    disabled: false,
                    IndividualUserId: req.session.userId 
                }, 
                order: [["createdAt", "DESC"]] 
            });
        } catch (error) {
            console.log(error);
            return res.sendStatus(400);
        }
    } else {

    }

    return res.status(200).send({entries: entries});
}

// Method to browse entries by date 
exports.browseByDate = async (req, res) => {
    let entries = [];
    let dateVal = req.body.date;

    if(req.session.isIndUser) {
        try {
            entries = await IndEntry.findAll( 
                { where: { 
                    date: dateVal, 
                    disabled: false,
                    IndividualUserId: req.session.userId 
                }, 
                order: [["createdAt", "DESC"]] 
            });
        } catch (error) {
            console.log(error);
            return res.sendStatus(400);
        }
    } else {

    }

    return res.status(200).send({entries: entries});
}

// Method to browse entries by date range
exports.browseByDateRange = async (req, res) => {
    let entries = [];
    let dateFrom = req.body.dateFrom;
    let dateTo = req.body.dateTo;
    let query = "";

    if(dateFrom != "" && dateTo != "") {
        query = { [Op.gte]: dateFrom, [Op.lte]: dateTo };      
    } else if (dateFrom == "" && dateTo != "") {
        query = { [Op.lte]: dateTo };
    } else if (dateFrom != "" && dateTo == "") {
        query = { [Op.gte]: dateFrom };
    }

    if(req.session.isIndUser) {
        try {
            entries = await IndEntry.findAll( 
                { where: { 
                    date: query, 
                    disabled: false,
                    IndividualUserId: req.session.userId 
                }, 
                order: [["createdAt", "DESC"]] 
            });
        } catch (error) {
            console.log(error);
            return res.sendStatus(400);
        }
    } else {

    }

    return res.status(200).send({entries: entries});
}

exports.disableEntry = async (req, res) => {
    let entry = null;
    let disabled = false;

    if(req.session.isIndUser) {
        // Retrieving the given entry from the database
        try {
            entry = await IndEntry.findOne({where: { id: req.body.entryId, IndividualUserId: req.session.userId }});
        } catch (error) {
            console.log(error);
            return res.sendStatus(400);
        }
    }

    if(entry == null) { return res.sendStatus(400); }

    // Set the entry as disabled or enabled
    try {
        if(entry.disabled) {
            entry.disabled = false;
        } else {
            entry.disabled = true;
            disabled = true;
        }

        await entry.save();
    } catch (error) {
        console.log(error);
        return res.sendStatus(400);
    }

    return res.status(200).send({disabled: disabled});
}