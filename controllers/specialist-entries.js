const Centre = require("../models/centre");
const Specialist = require("../models/specialist");
const SystemUser = require("../models/systemuser");
const UserEntry = require("../models/userentry");
const UserEntryFile = require("../models/userentryfile");
const SpecialistComment = require("../models/specialistcomment");

const moment = require("moment");
const { Op } = require("sequelize"); 
const axios = require("axios");
const fs = require("fs");

const aws = require('aws-sdk');

const S3_BUCKET = process.env.S3_BUCKET_NAME;
aws.config = {
    region: process.env.AWS_REGION,
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
};
const s3 = new aws.S3();


// Method to render page where the entries can be reviewed by the specialist
exports.getReviewEntriesPageSpecialist = async (req, res) => {
    let entries = [];

    // Retrieving all the assigned users' entries to display them on the page
    try {
        entries = await UserEntry.findAll( {
            where: {
                disabled: false 
            }, 
            order: [
                ["createdAt", "DESC"]
            ],                
            include: [{ 
                model: SystemUser, 
                where: { SpecialistId: req.session.userId, CentreId: req.session.centreId },
                attributes: ["id", "CentreId", "name", "surname"],
                required: true,
                include: [{ 
                    model: Specialist, 
                    where: { id: req.session.userId, CentreId: req.session.centreId },
                    attributes: ["id", "CentreId"],
                    required: true
                }]  
            },
            {
                model: SpecialistComment
            }]
        });
    } catch(error) {
        console.log(error);
        return res.redirect("/dashboard");
    }
    
    return res.render("entries/specialist/review-entries-specialist", {
        title: "Review users' entries",
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


// Method to render page where the entries of an individual user can be reviewed by the specialist
exports.getReviewEntriesOfIndUserPage = async (req, res) => {
    let entries = [];
    let user = null;

    // Finding the relevant user
    try {
        user = await SystemUser.findOne({where: {id: req.params.userId}, attributes: ["id", "name", "surname"]});
    } catch(error) {
        console.log(error);
        return res.redirect("/dashboard");
    }

    // Retrieving all the assigned users' entries to display them on the page
    try {
        entries = await UserEntry.findAll( {
            where: {
                disabled: false,
                SystemUserId: req.params.userId 
            }, 
            order: [
                ["createdAt", "DESC"]
            ],                
            include: [{ 
                model: SystemUser, 
                where: { SpecialistId: req.session.userId, CentreId: req.session.centreId },
                attributes: ["id", "CentreId", "name", "surname"],
                required: true,
                include: [{ 
                    model: Specialist, 
                    where: { id: req.session.userId, CentreId: req.session.centreId },
                    attributes: ["id", "CentreId"],
                    required: true
                }]  
            },
            {
                model: SpecialistComment
            }]
        });
    } catch(error) {
        console.log(error);
        return res.redirect("/dashboard");
    }
    
    return res.render("entries/specialist/ind-user-entries", {
        title: "Review users' entries",
        isAdmin: req.session.isAdmin,
        isSpecialist: req.session.isSpecialist,
        isSystemUser: req.session.isSystemUser,
        isIndUser: req.session.isIndUser,
        userName: req.session.name,
        userSurname: req.session.surname,
        titleToDisplay: "Review users' entries",
        entries: entries,
        user: user
    });
}

// Method to fetch the notes of a chosen user entry
exports.fetchNotesOfSystemUserEntry = async (req, res) => {
    let entry = null;
    let notes = "";

    try {
        entry = await UserEntry.findOne({where: {id: req.query.id, SystemUserId: req.query.userId}});
    } catch(error) {
        console.log(error);
        return res.sendStatus(400);
    }

    if(entry == null) { return res.sendStatus(404); }

    // If there are no notes associated with the entry, a relevant textual message will be displayed
    if(entry.usernotes == null || entry.usernotes == "") {
        notes = "There are no user's notes associated with this entry.";
    } else {
        notes = entry.usernotes;
    }

    return res.status(200).send({notes: notes});
}


// Method to fetch comments of an entry 
exports.getComments = async (req, res) => {
    let entry = null;
    let comments = null;

    // Retrieving entry by its ID
    try {
        entry = await UserEntry.findOne({where: {id: req.query.id, SystemUserId: req.query.userId}, attributes: ["id", "SystemUserId"]});
    } catch(error) {
        console.log(error);
        return res.sendStatus(400);
    }

    if(entry == null) { return res.sendStatus(404); }

    // Fetching comment recording
    try {
        comments = await SpecialistComment.findAll({where: {SpecialistId: req.session.userId, UserEntryId: entry.id}});
    } catch(error) {
        console.log(error);
        return res.sendStatus(400);
    }

    return res.status(200).send({comments: comments});
}

// Method to add a new comment to an entry 
exports.addNewComment = async (req, res) => {
    let entry = null;
    let comment = null;

    // Retrieving entry by its ID
    try {
        entry = await UserEntry.findOne({where: {id: req.body.id, SystemUserId: req.body.userId}, attributes: ["id", "SystemUserId"]});
    } catch(error) {
        console.log(error);
        return res.sendStatus(400);
    }

    if(entry == null) { return res.sendStatus(404); }

    // Creating new comment record
    try {
        comment = await SpecialistComment.create({
            comment: req.body.comment,
            UserEntryId: entry.id,
            SpecialistId: req.session.userId
        });
    } catch(error) {
        console.log(error);
        return res.sendStatus(400);
    }

    if(comment == null) { return res.sendStatus(400); }

    return res.status(200).send({comment: comment.comment});
}

// Method to update a comment regarding an entry
exports.updateComment = async (req, res) => {
    let comment = null;

    // Retrieving the chosen comment
    try {
        comment = await SpecialistComment.findOne({where: {id: req.body.comId, SpecialistId: req.session.userId, UserEntryId: req.body.EntryId}});
    } catch(error) {
        console.log(error);
        return res.sendStatus(400);
    }

    if(comment == null) { return res.sendStatus(404); }

    try {
        comment.comment = req.body.comment;
        await comment.save();
    } catch(error) {
        console.log(error);
        return res.sendStatus(400);
    }

    return res.status(200).send({comment: comment.comment});
}

// Method to browse entries of an individual user by title
exports.browseIndByTitle = async (req, res) => {
    let entries = [];
    let titleVal = req.body.title;

    try {
        entries = await UserEntry.findAll( {
            where: {
                SystemUserId: req.body.userId, 
                disabled: false,
                title: {[Op.like]: '%' + titleVal + '%'}, 
            }, 
            order: [
                ["createdAt", "DESC"]
            ],                
            include: [
                { 
                    model: SystemUser, 
                    where: { id: req.body.userId, SpecialistId: req.session.userId, CentreId: req.session.centreId },
                    attributes: ["id", "CentreId", "SpecialistId"] 
                },
                {
                    model: SpecialistComment
                }
            ]
        });
    } catch (error) {
        console.log(error);
        return res.sendStatus(400);
    }

    return res.status(200).send({entries: entries});
}

// Method to browse entries of individual users by date 
exports.browseIndByDate = async (req, res) => {
    let entries = [];
    let dateVal = req.body.date;

    try {
        entries = await UserEntry.findAll( {
            where: {
                SystemUserId: req.body.userId, 
                disabled: false,
                date: dateVal
            }, 
            order: [
                ["createdAt", "DESC"]
            ],                
            include: [
                { 
                    model: SystemUser, 
                    where: { id: req.body.userId, SpecialistId: req.session.userId, CentreId: req.session.centreId },
                    attributes: ["id", "CentreId", "SpecialistId"] 
                },
                {
                    model: SpecialistComment
                }
            ]
        });
    } catch (error) {
        console.log(error);
        return res.sendStatus(400);
    }

    return res.status(200).send({entries: entries});
}

// Method to browse entries of individual users by date range
exports.browseIndByDateRange = async (req, res) => {
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

    try {
        entries = await UserEntry.findAll( {
            where: {
                SystemUserId: req.body.userId, 
                disabled: false,
                date: query
            }, 
            order: [
                ["createdAt", "DESC"]
            ],                
            include: [
                { 
                    model: SystemUser, 
                    where: { id: req.body.userId, SpecialistId: req.session.userId, CentreId: req.session.centreId },
                    attributes: ["id", "CentreId", "SpecialistId"] 
                },
                {
                    model: SpecialistComment
                }
            ]
        });
    } catch (error) {
        console.log(error);
        return res.sendStatus(400);
    }

    return res.status(200).send({entries: entries});
}


// Method to browse entries of assigned users by title
exports.browseByTitle = async (req, res) => {
    let entries = [];
    let titleVal = req.body.title;

    try {
        entries = await UserEntry.findAll( {
            where: {
                disabled: false,
                title: {[Op.like]: '%' + titleVal + '%'}, 
            }, 
            order: [
                ["createdAt", "DESC"]
            ],                
            include: [
                { 
                    model: SystemUser, 
                    where: { SpecialistId: req.session.userId, CentreId: req.session.centreId },
                    attributes: ["id", "CentreId", "SpecialistId", "name", "surname"] 
                },
                {
                    model: SpecialistComment
                }
            ]
        });
    } catch (error) {
        console.log(error);
        return res.sendStatus(400);
    }

    return res.status(200).send({entries: entries});
}

// Method to browse entries of assigned users by date 
exports.browseByDate = async (req, res) => {
    let entries = [];
    let dateVal = req.body.date;

    try {
        entries = await UserEntry.findAll( {
            where: {
                disabled: false,
                date: dateVal
            }, 
            order: [
                ["createdAt", "DESC"]
            ],                
            include: [
                { 
                    model: SystemUser, 
                    where: { SpecialistId: req.session.userId, CentreId: req.session.centreId },
                    attributes: ["id", "CentreId", "SpecialistId", "name", "surname"] 
                },
                {
                    model: SpecialistComment
                }
            ]
        });
    } catch (error) {
        console.log(error);
        return res.sendStatus(400);
    }

    return res.status(200).send({entries: entries});
}

// Method to browse entries of assigned users by date range
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

    try {
        entries = await UserEntry.findAll( {
            where: {
                disabled: false,
                date: query
            }, 
            order: [
                ["createdAt", "DESC"]
            ],                
            include: [
                { 
                    model: SystemUser, 
                    where: { SpecialistId: req.session.userId, CentreId: req.session.centreId },
                    attributes: ["id", "CentreId", "SpecialistId", "name", "surname"] 
                },
                {
                    model: SpecialistComment
                }
            ]
        });
    } catch (error) {
        console.log(error);
        return res.sendStatus(400);
    }

    return res.status(200).send({entries: entries});
}