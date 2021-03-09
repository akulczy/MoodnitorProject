const Centre = require("../models/centre");
const Specialist = require("../models/specialist");
const SystemUser = require("../models/systemuser");
const UserEntry = require("../models/userentry");
const UserEntryFile = require("../models/userentryfile");

const IndUser = require("../models/individualuser");
const IndEntry = require("../models/individualentry");
const IndEntryFile = require("../models/individualentryfile");

const moment = require("moment");
const { Op } = require("sequelize"); 
const axios = require("axios");
const fs = require("fs");

const aws = require('aws-sdk');
const IndividualEntryFile = require("../models/individualentryfile");
const S3_BUCKET = process.env.S3_BUCKET_NAME;
aws.config = {
    region: process.env.AWS_REGION,
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
};
const s3 = new aws.S3();

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
exports.addEntry = async (req, res) => {
    let dateToday =  moment(new Date()).format("YYYY-MM-DD");
    let timeNow =  moment(new Date()).format("HH:mm:ss");
    let entryContent = req.body.entryContent;
    let entryHtmlContent = req.body.entryHtmlContent;
    let entryTitle = "";
    let entry = null;
    let entryFiles = null;

    if(req.body.entryTitle == "") {
        entryTitle = "Entry - " + dateToday;
    } else {
        entryTitle = req.body.entryTitle;
    }

    if(req.files["addfiles"]) {
        entryFiles = req.files["addfiles"];
    }

    // Create new entry record - individual or within an organisation, depending on the user type
    if(req.session.isIndUser) {
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
    } else if (req.session.isSystemUser) {
        try {
            entry = await UserEntry.create({
                title: entryTitle,
                content: entryContent,
                contentHtml: entryHtmlContent,
                date: dateToday,
                time: timeNow,
                disabled: false,
                SystemUserId: req.session.userId
            });
        } catch(error) {
            console.log(error);
            return res.sendStatus(400);
        }
    }

    // Sending status 400 in case the entry had not been created successfully
    if(entry == null) { return res.sendStatus(400); }

    let emotionPrediction = "";
    let emotionPredictionAdj = "";

    // Connecting to the Python API
    await axios.post('http://localhost:5000/predict', {
            emotion: entryContent
        })
        .then((response) => {
            emotionPrediction = response.data.pred;
            emotionPredictionAdj = emotionPrediction.charAt(0).toUpperCase() + emotionPrediction.slice(1);
        }, 
        (error) => {
            console.log(error);
        });

    // File Handling
    if(entryFiles != null) {
        if(req.session.isIndUser) {
            for(let image of entryFiles) {
                const FileKeyName = "IndividualEntry/" + entry.id + "/" + image.filename;
                const imgFileContent =  fs.readFileSync(image.path, null);
    
                const imgAWS = {
                    Bucket: S3_BUCKET,
                    Key: FileKeyName,
                    Body: imgFileContent
                };
    
                s3.upload(imgAWS, async (error, data) => {
                    if(error) { throw error; };
    
                    try {
                        await IndividualEntryFile.create({
                            fileId: FileKeyName,
                            IndividualEntryId: entry.id
                        });
                    } catch (error) { console.log(error); }
    
                    try {
                        fs.unlink(image.path, (error) => {
                            if(error) { console.error(error); };
                        });
                    } catch(error) { console.log(error); } 
                })
            }
        } else if (req.session.isSystemUser) {
            for(let image of entryFiles) {
                const FileKeyName = "UserEntry/" + entry.id + "/" + image.filename;
                const imgFileContent =  fs.readFileSync(image.path, null);
    
                const imgAWS = {
                    Bucket: S3_BUCKET,
                    Key: FileKeyName,
                    Body: imgFileContent
                };
    
                s3.upload(imgAWS, async (error, data) => {
                    if(error) { throw error; };
    
                    try {
                        await UserEntryFile.create({
                            fileId: FileKeyName,
                            UserEntryId: entry.id
                        });
                    } catch (error) { console.log(error); }
    
                    try {
                        fs.unlink(image.path, (error) => {
                            if(error) { console.error(error); };
                        });
                    } catch(error) { console.log(error); } 
                })
            }
        }
    }

    // Entry created successfully - status 200
    return res.status(200).json({emotion: emotionPredictionAdj, id: entry.id});
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
        try {
            entries = await UserEntry.findAll( {
                where: {
                    SystemUserId: req.session.userId, 
                    disabled: false 
                }, 
                order: [
                    ["createdAt", "DESC"]
                ] ,                
                include: [{ 
                    model: SystemUser, 
                    where: { id: req.session.userId, CentreId: req.session.centreId },
                    attributes: ["id", "CentreId"] 
                }]
            });
        } catch(error) {
            console.log(error);
            return res.redirect("/dashboard");
        }
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
    } else if (req.session.isSystemUser) {
        entries = await UserEntry.findAll( {
            where: {
                SystemUserId: req.session.userId, 
                disabled: false,
                title: {[Op.like]: '%' + titleVal + '%'} 
            }, 
            order: [
                ["createdAt", "DESC"]
            ] ,                
            include: [{ 
                model: SystemUser, 
                where: { id: req.session.userId, CentreId: req.session.centreId },
                attributes: ["id", "CentreId"] 
            }]
        });
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
    } else if (req.session.isSystemUser) {
        entries = await UserEntry.findAll( {
            where: {
                SystemUserId: req.session.userId, 
                disabled: false,
                date: dateVal
            }, 
            order: [
                ["createdAt", "DESC"]
            ] ,                
            include: [{ 
                model: SystemUser, 
                where: { id: req.session.userId, CentreId: req.session.centreId },
                attributes: ["id", "CentreId"] 
            }]
        });
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
    } else if (req.session.isSystemUser) {
        entries = await UserEntry.findAll( {
            where: {
                SystemUserId: req.session.userId, 
                disabled: false,
                date: query
            }, 
            order: [
                ["createdAt", "DESC"]
            ],                
            include: [{ 
                model: SystemUser, 
                where: { id: req.session.userId, CentreId: req.session.centreId },
                attributes: ["id", "CentreId"] 
            }]
        });
    }

    return res.status(200).send({entries: entries});
}

// Disable an entry (move it to an archive)
exports.disableEntry = async (req, res) => {
    let entry = null;
    let disabled = false;

    // Retrieving the given entry from the database
    if(req.session.isIndUser) {
        try {
            entry = await IndEntry.findOne({where: { id: req.body.entryId, IndividualUserId: req.session.userId }});
        } catch (error) {
            console.log(error);
            return res.sendStatus(400);
        }
    } else if (req.session.isSystemUser) {
        entry = await UserEntry.findOne({
            where: { 
                id: req.body.entryId, 
                SystemUserId: req.session.userId 
            },
            include: [{ 
                model: SystemUser, 
                where: { id: req.session.userId, CentreId: req.session.centreId },
                attributes: ["id", "CentreId"] 
            }]
        });
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

// Get disabled entries page
exports.getDisabledEntriesPage = async (req, res) => {
    let entries = [];

    if(req.session.isIndUser) {
        try {
            entries = await IndEntry.findAll( 
                { where: {  
                    disabled: true,
                    IndividualUserId: req.session.userId 
                }, 
                order: [["createdAt", "DESC"]] 
            });
        } catch (error) {
            console.log(error);
            return res.sendStatus(400);
        }
    } else if (req.session.isSystemUser) {
        entries = await UserEntry.findAll({
            where: { 
                disabled: true, 
                SystemUserId: req.session.userId 
            },
            include: [{ 
                model: SystemUser, 
                where: { id: req.session.userId, CentreId: req.session.centreId },
                attributes: ["id", "CentreId"] 
            }]
        });
    }

    // Render the page
    return res.render("entries/disabled-entries-user", {
        title: "Review your archived entries",
        isAdmin: req.session.isAdmin,
        isSpecialist: req.session.isSpecialist,
        isSystemUser: req.session.isSystemUser,
        isIndUser: req.session.isIndUser,
        userName: req.session.name,
        userSurname: req.session.surname,
        titleToDisplay: "Archived Entries",
        entries: entries
    });
}

// Method to browse disabled entries by date 
exports.browseDisabledByDate = async (req, res) => {
    let entries = [];
    let dateVal = req.body.date;

    if(req.session.isIndUser) {
        try {
            entries = await IndEntry.findAll( { 
                where: { 
                    date: dateVal, 
                    disabled: true,
                    IndividualUserId: req.session.userId 
                }, 
                order: [["createdAt", "DESC"]] 
            });
        } catch (error) {
            console.log(error);
            return res.sendStatus(400);
        }
    } else {
        entries = await UserEntry.findAll({
            where: { 
                date: dateVal, 
                disabled: true, 
                SystemUserId: req.session.userId 
            },
            include: [{ 
                model: SystemUser, 
                where: { id: req.session.userId, CentreId: req.session.centreId },
                attributes: ["id", "CentreId"] 
            }]
        });
    }

    return res.status(200).send({entries: entries});
}

// Add user notes to an entry
exports.addUserNotes = async (req, res) => {
    let entry = null;

    if(req.session.isIndUser) {
        entry = await IndEntry.findOne({where: {id: req.body.entryId, IndividualUserId: req.session.userId}});
    } else if(req.session.isSystemUser) {
        entry = await UserEntry.findOne({
            where: { 
                id: req.body.entryId, 
                SystemUserId: req.session.userId 
            },
            include: [{ 
                model: SystemUser, 
                where: { id: req.session.userId, CentreId: req.session.centreId },
                attributes: ["id", "CentreId"] 
            }]
        });
    }

    if(entry == null) { return res.sendStatus(404); }

    try {
         entry.usernotes = req.body.notes;
         await entry.save();
    } catch (error) {
        console.log(error);
        res.sendStatus(400);
    }

    return res.status(200).send({notes: entry.usernotes});
}

// Fetch user's notes assigned to a given entry
exports.fetchUserNotes = async (req, res) => {
    let entry = null;

    if(req.session.isIndUser) {
        entry = await IndEntry.findOne({where: {id: req.query.entryId, IndividualUserId: req.session.userId}});
    } else if(req.session.isSystemUser) {
        entry = await UserEntry.findOne({
            where: { 
                id: req.query.entryId, 
                SystemUserId: req.session.userId 
            },
            include: [{ 
                model: SystemUser, 
                where: { id: req.session.userId, CentreId: req.session.centreId },
                attributes: ["id", "CentreId"] 
            }]
        });
    }

    if(entry == null) { return res.sendStatus(404); }

    return res.status(200).send({notes: entry.usernotes});
}