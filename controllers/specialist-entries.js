const Centre = require("../models/centre");
const Specialist = require("../models/specialist");
const SystemUser = require("../models/systemuser");
const UserEntry = require("../models/userentry");
const UserEntryFile = require("../models/userentryfile");
const SpecialistComment = require("../models/specialistcomment");
const UserEntryResult = require("../models/userentryresult");
const UserEntrySentence = require("../models/userentrysentence");

const moment = require("moment");
const { Op } = require("sequelize"); 
const axios = require("axios");
const fs = require("fs");
const path = require("path");
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
    let today = moment().format("YYYY-MM-DD");
    let monthBefore = moment().subtract(30, "days");

    // Retrieving all the assigned users' entries to display them on the page
    try {
        entries = await UserEntry.findAll( {
            where: {
                disabled: false,
                date: {
                    [Op.gte]: monthBefore,
                    [Op.lte]: today
                } 
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
    let today = moment().format("YYYY-MM-DD");
    let monthBefore = moment().subtract(30, "days");

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
                SystemUserId: req.params.userId,
                date: {
                    [Op.gte]: monthBefore,
                    [Op.lte]: today
                }  
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

// Method to download files attached to an entry
exports.downloadEntryFile = async (req, res) => {
    let fileId = req.body.fileid;
    let file = null;

    try {
        file = await UserEntryFile.findOne({where: {id: fileId}});
    } catch (error) {
        console.log(error);
        return res.redirect('back');
    }

    if(file == null) { return res.redirect('back'); }

    let fileName = file.fileId.replace(/\//g, '_');
    let timedFileName = fileName.slice(0, fileName.indexOf(".")) + `_${Date.now()}` + fileName.slice(fileName.indexOf("."));
    let newPath = path.join(__basedir, "public", "temp", timedFileName);

    let fileStream = fs.createWriteStream(newPath);
    let s3Stream = s3.getObject({Bucket: S3_BUCKET, Key: file.fileId}).createReadStream();

    s3Stream.on('error', function(error) {
        console.error(error);
        return res.redirect("back");
    });
    
    s3Stream.pipe(fileStream).on('error', function(error) {
        console.error('File Stream:', error);
        return res.redirect("back");
    }).on('close', function() {
        return res.download(newPath, fileName, (error) => {
            if(error) { console.log(error); }

            try {
                fs.unlink(newPath, (error) => {
                    if(error) {
                      console.error(error);
                    };
                });
            } catch(error) {} 
        });
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
    let comment = null;

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
        comment = await SpecialistComment.findOne({where: {SpecialistId: req.session.userId, UserEntryId: entry.id}});
    } catch(error) {
        console.log(error);
        return res.sendStatus(400);
    }

    return res.status(200).send({comment: comment});
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
    let dateVal = new Date(req.body.date);

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
    let dateFrom = new Date(req.body.dateFrom);
    let dateTo = new Date(req.body.dateTo);
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
    let dateVal = new Date(req.body.date);

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
    let dateFrom = new Date(req.body.dateFrom);
    let dateTo = new Date(req.body.dateTo);
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

// Method to review summary of entry
exports.getEntrySummaryPage = async (req, res) => {
    let entry = null;

    try {
        entry = await UserEntry.findOne({
            where: {
                id: req.params.entryId
            },
            include: [
                {
                    model: SystemUser,
                    attributes: ["id", "name", "surname", "SpecialistId", "CentreId"],
                    required: true,
                    where: {SpecialistId: req.session.userId}
                },
                {
                    model: UserEntryResult,
                    required: true,
                    include: {
                        model: UserEntrySentence,
                        required: true
                    }
                },
                {
                    model: UserEntryFile
                },
                {
                    model: SpecialistComment
                }
            ]
        });
    } catch(error) {
        console.log(error);
        return res.redirect("/dashboard");
    }

    if(entry == null) { console.log("Not found"); return res.redirect("/dashboard"); }
    const renderView = (entryFiles) => {
        res.render("entries/specialist/entry-summary-spec", {
            title: "Entry Summary",
            isAdmin: req.session.isAdmin,
            isSpecialist: req.session.isSpecialist,
            isSystemUser: req.session.isSystemUser,
            isIndUser: req.session.isIndUser,
            userName: req.session.name,
            userSurname: req.session.surname,
            titleToDisplay: "Entry Summary",
            entry: entry,
            mpred: entry.UserEntryResult.predictions,
            mainpredictions: JSON.stringify(entry.UserEntryResult.predictions),
            sentencespredictions: JSON.stringify(entry.UserEntryResult.UserEntrySentences),
            files: JSON.stringify(entryFiles),
            filesLength: filesLength
        });
    }

    let filesLength = 0;
    if((entry.UserEntryFiles).length > 0) {
        let files = [];
        let promises = [];
        for(let f of entry.UserEntryFiles) {
            promises.push(new Promise((resolve, reject) => {
                let fileName = f.fileId.replace(/\//g, '_');
                let fileStream = fs.createWriteStream(path.join(__dirname, '..', 'public', 'temp', fileName));
                let s3Stream = s3.getObject({Bucket: S3_BUCKET, Key: f.fileId}).createReadStream();

                s3Stream.on('error', function(err) {
                    console.error(err);
                    return renderView("");
                });
                
                s3Stream.pipe(fileStream).on('error', function(err) {
                    console.error('File Stream:', err);
                    return renderView("");
                }).on('close',  () => {
                
                    files.push(fileName);
                    resolve(true);
                });
            
            }));
        }

        await Promise.all(promises)
        .then("Finished.")
        .catch(error => { console.log(error) })

        filesLength = files.length;
        return renderView(files);

    } else {
        return renderView("");
    }
}

// Fetching entries for the excel spreadsheet
exports.fetchEntries = async (req, res) => {
    let today = moment().format("YYYY-MM-DD");
    let monthBefore = moment().subtract(30, "days");
    monthBefore = monthBefore.format("YYYY-MM-DD");
    let entries = [];
    let query = "";

    if(req.query.entryDate != "") {
        query = {date: req.query.entryDate, disabled: false};
    } else if (req.query.dateFrom != "" || req.query.dateTo != "") {
        let dateFrom = req.query.dateFrom;
        let dateTo = req.query.dateTo;
        if(dateFrom != "" && dateTo != "") {
            query = { date: {[Op.gte]: dateFrom, [Op.lte]: dateTo}, disabled: false };      
        } else if (dateFrom == "" && dateTo != "") {
            query = { date: {[Op.lte]: dateTo}, disabled: false };
        } else if (dateFrom != "" && dateTo == "") {
            query = { date: {[Op.gte]: dateFrom}, disabled: false };
        }
    } else if (req.query.entryTitle != "") {
        query = {title: {[Op.like]: '%' + req.query.entryTitle + '%'}, disabled: false}
    } else {
        query = { date: {[Op.gte]: monthBefore, [Op.lte]: today}, disabled: false };    
    }

    try {
        entries = await UserEntry.findAll(
            {
                where: query,
                include: [
                    {
                        model: SystemUser,
                        attributes: ["name", "surname"],
                        where: {SpecialistId: req.session.userId, CentreId: req.session.centreId}
                    },
                    {
                        model: UserEntryResult
                    }
                ]
            }
        );
    } catch (error) {
        console.log(error);
        return res.sendStatus(400);
    }

    let entriesobj = [];
    for(let entry of entries) {
        entriesobj.push(
            {
                "Title": entry.title,
                "Date": entry.date,
                "Time": entry.time,
                "Added by": `${entry.SystemUser.name} ${entry.SystemUser.surname}`,
                "Main Emotion": entry.UserEntryResult.emotion,
                "Joy [%]": entry.UserEntryResult.predictions[0].percentage, 
                "Fear [%]": entry.UserEntryResult.predictions[1].percentage, 
                "Anger [%]": entry.UserEntryResult.predictions[2].percentage, 
                "Sadness [%]": entry.UserEntryResult.predictions[3].percentage, 
                "Neutral [%]": entry.UserEntryResult.predictions[4].percentage
            }
        )
    }

    return res.status(200).send({entries: entriesobj});
}

// Fetching entries of individual users for the excel spreadsheet
exports.fetchEntriesInd = async (req, res) => {
    let today = moment().format("YYYY-MM-DD");
    let monthBefore = moment().subtract(30, "days");
    monthBefore = monthBefore.format("YYYY-MM-DD");
    let entries = [];
    let query = "";
    let userId = req.query.id;

    if(req.query.entryDate != "") {
        query = {date: req.query.entryDate, disabled: false, SystemUserId: userId};
    } else if (req.query.dateFrom != "" || req.query.dateTo != "") {
        let dateFrom = req.query.dateFrom;
        let dateTo = req.query.dateTo;
        if(dateFrom != "" && dateTo != "") {
            query = { date: {[Op.gte]: dateFrom, [Op.lte]: dateTo}, disabled: false, SystemUserId: userId };      
        } else if (dateFrom == "" && dateTo != "") {
            query = { date: {[Op.lte]: dateTo}, disabled: false, SystemUserId: userId };
        } else if (dateFrom != "" && dateTo == "") {
            query = { date: {[Op.gte]: dateFrom}, disabled: false, SystemUserId: userId };
        }
    } else if (req.query.entryTitle != "") {
        query = {title: {[Op.like]: '%' + req.query.entryTitle + '%'}, disabled: false, SystemUserId: userId}
    } else {
        query = { date: {[Op.gte]: monthBefore, [Op.lte]: today}, disabled: false, SystemUserId: userId };    
    }

    try {
        entries = await UserEntry.findAll(
            {
                where: query,
                include: [
                    {
                        model: SystemUser,
                        attributes: ["name", "surname"],
                        where: {SpecialistId: req.session.userId, CentreId: req.session.centreId}
                    },
                    {
                        model: UserEntryResult
                    }
                ]
            }
        );
    } catch (error) {
        console.log(error);
        return res.sendStatus(400);
    }

    let entriesobj = [];
    for(let entry of entries) {
        entriesobj.push(
            {
                "Title": entry.title,
                "Date": entry.date,
                "Time": entry.time,
                "Added by": `${entry.SystemUser.name} ${entry.SystemUser.surname}`,
                "Main Emotion": entry.UserEntryResult.emotion,
                "Joy [%]": entry.UserEntryResult.predictions[0].percentage, 
                "Fear [%]": entry.UserEntryResult.predictions[1].percentage, 
                "Anger [%]": entry.UserEntryResult.predictions[2].percentage, 
                "Sadness [%]": entry.UserEntryResult.predictions[3].percentage, 
                "Neutral [%]": entry.UserEntryResult.predictions[4].percentage
            }
        )
    }

    return res.status(200).send({entries: entriesobj});
}

exports.fetchEntryWithResults = async (req, res) => {
    let entry = null;

    try {
        entry = await UserEntry.findOne({
            where: {
                id: req.params.entryId,
                SystemUserId: req.params.userId
            },
            include: [
                {
                    model: UserEntryResult,
                    include: {
                        model: UserEntrySentence
                    }
                }, 
                {
                    model: SystemUser,
                    where: {
                        id: req.params.userId,
                        SpecialistId: req.session.userId
                    }
                }
            ]
        });
    } catch (error) {
        console.log(error);
        return res.sendStatus(400);
    }

    if (entry == null) { return res.sendStatus(404); }

    return res.status(200).send({ entry: entry });
}

// Render default page for reports regarding users
exports.getDefaultReportsPage = async (req, res) => {
    let users = null;

    try {
        users = await SystemUser.findAll({where: {SpecialistId: req.session.userId, CentreId: req.session.centreId, disabled: false}, attributes: ["id", "name", "surname", "disabled", "CentreId", "SpecialistId"]});
    } catch (error) {
        console.log(error);
        return res.redirect("/dashboard");
    }

    res.render("entries/specialist/reports-default", {
        title: "Users' Reports",
        isAdmin: req.session.isAdmin,
        isSpecialist: req.session.isSpecialist,
        isSystemUser: req.session.isSystemUser,
        isIndUser: req.session.isIndUser,
        userName: req.session.name,
        userSurname: req.session.surname,
        titleToDisplay: "Users' Reports",
        users: users
    });
}

// Render page with report's result
exports.getReportPage = async (req, res) => {
    let entries = [];
    let user = null;
    let startDate = req.body.dateFrom;
    let endDate = req.body.dateTo;
    let startMoment = moment(startDate);
    let endMoment = moment(endDate);
    let userId = req.body.userSelect;

    let noOfDays = endMoment.diff(startMoment, "days") + 1;

    try {
        user = await SystemUser.findOne({where: {id: userId, SpecialistId: req.session.userId, CentreId: req.session.centreId}, attributes: ["id", "name", "surname", "SpecialistId", "CentreId"]});
    } catch (error) {
        console.log(error);
        return res.redirect("/dashboard");
    }

    try {
        entries = await UserEntry.findAll({
            where: {
                date: {
                    [Op.gte]: startDate,
                    [Op.lte]: endDate
                },
                SystemUserId: userId
            }, 
            include: [
                {
                    model: SystemUser,
                    where: {id: userId, SpecialistId: req.session.userId, CentreId: req.session.centreId},
                    attributes: ["id", "name", "surname", "SpecialistId", "CentreId"]
                },
                {
                    model: UserEntryResult
                }
            ],
            order: [["date", "ASC"]]
        });
    } catch (error) {
        console.log(error);
        return res.redirect("/dashboard");
    }

    let dates = groupByDate(entries, 'DD-MM');
    let entriesNo = 0;
    let daysMissed = 0;

    // Calculating all dates within a chosen period of time
    let timeperiod = [];
    let start = new Date(startDate);
    let end = new Date(endDate);

    while(start <= end){
        timeperiod.push(moment(start).format('DD-MM'));
        let newDate = start.setDate(start.getDate() + 1);
        start = new Date(newDate);  
    }

    // Dataset to store information about emotions predicted at given days
    let dataset = [];
    let emotions = [];

    // Frequencyset to store information about user activity (how many entries at each day of the time period)
    let frequencyset = [];

    for(let p of timeperiod) {
        let entryFound = false;
        for (let [key, values] of Object.entries(dates)) {
            if(p == key) {
                let emotion = "";  
                // i - to count the number of values   
                let i = 0;    
                for(let val of values) {
                    // To count the total number of entries
                    entriesNo++;
                    // To get the detected emotion from the entry record
                    emotion = val.UserEntryResult.emotion;

                    // Pushing all the emotion to be able to find the most frequently occurring one 
                    emotions.push(emotion);
                    dataset.push({
                        x : key,
                        y : emotion
                    });
                    i++;
                }                

                entryFound = true;

                // Frequency set - to show users' activity on a line chart
                frequencyset.push({
                    x: key,
                    y: i
                });
            }             
        }
                    
        if(!entryFound) {
            daysMissed++;
            dataset.push({
                x : p,
                y : "None"
            });

            frequencyset.push({
                x: p,
                y: 0
            });
        }
    } 

    let daysActive = noOfDays - daysMissed;
    let mainEmotions = evaluateMainEmotion(emotions);
    let average = parseFloat((entriesNo/noOfDays).toFixed(2));

    // Render the page
    return res.render("entries/specialist/reports-user", {
        title: "User's Activity Report",
        isAdmin: req.session.isAdmin,
        isSpecialist: req.session.isSpecialist,
        isSystemUser: req.session.isSystemUser,
        isIndUser: req.session.isIndUser,
        userName: req.session.name,
        userSurname: req.session.surname,
        titleToDisplay: "User's Activity Report",
        mainTitle: "User's Activity Report",
        dataset: JSON.stringify(dataset),
        labels: JSON.stringify(timeperiod),
        dateFrom: startDate,
        dateTo: endDate,
        entriesNo: entriesNo,
        daysActive: daysActive,
        mainEmotions: mainEmotions,
        mainEmo: JSON.stringify(mainEmotions),
        average: average,
        frequencyset: JSON.stringify(frequencyset),
        user: user
    });
}

const groupByDate = (dates, token) => {
    return dates.reduce(function(val, obj) {
        let comp = moment(obj.date, 'YYYY-MM-DD').format(token);
        (val[comp] = val[comp] || []).push(obj);
        return val;
    }, {});
}

const evaluateMainEmotion = (data) => {
    let neutral = {"emotion": "Neutral", "times": 0};
    let joy = {"emotion": "Joy", "times": 0};
    let sadness = {"emotion": "Sadness", "times": 0};
    let anger = {"emotion": "Anger", "times": 0};
    let fear = {"emotion": "Fear", "times": 0};
    for (let d of data) {
        switch(d) {
            case "Joy":
                joy.times++;
                break;
            case "Fear":
                fear.times++;
                break;
            case "Sadness":
                sadness.times++;
                break;
            case "Neutral":
                neutral.times++;
                break;
            case "Anger":
                anger.times++;
                break;
            default:
                //        
        }
    }

    let maxVal = 0;
    for (let i of [joy, fear, sadness, neutral, fear]) {
        if(i.times > maxVal) {
            maxVal = i.times;
        }
    }

    let mainemotions = [];
    for (let j of [joy, fear, sadness, neutral, fear]) {
        if(j.times == maxVal && j.times != 0) {
            mainemotions.push(j);
        }
    }

    return mainemotions;
}
