const Centre = require("../models/centre");
const Specialist = require("../models/specialist");
const SystemUser = require("../models/systemuser");
const UserEntry = require("../models/userentry");
const UserEntryFile = require("../models/userentryfile");
const UserEntryResult = require("../models/userentryresult");
const UserEntrySentence = require("../models/userentrysentence");

const IndUser = require("../models/individualuser");
const IndEntry = require("../models/individualentry");
const IndividualEntryFile = require("../models/individualentryfile");
const IndEntryResult = require("../models/individualentryresult");
const IndEntrySentence = require("../models/individualentrysentence");

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
    let class_names = ['joy', 'fear', 'anger', 'sadness', 'neutral'];
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

    let predictions = [];

    // Connecting to the Python API
    await axios.post('http://localhost:5000/predict', {
            emotion: entryContent
        })
        .then((response) => {
            predictions = response.data.predictions;
        }, 
        (error) => {
            console.log(error);
        });

    let predictionData = [];

    let j = 1;
    let neutral = 0;
    let joy = 0;
    let sadness = 0;
    let anger = 0;
    let fear = 0;
    for(let pred of predictions) {
        let indprediction = [];
        class_names.forEach(
            (key, i) => indprediction.push(
                {
                    "emotion": class_names[i], 
                    "percentage": parseFloat((pred.prediction[0][i]*100).toFixed(5))
                }
            )
        );
        predictionData.push(indprediction);
        pred.prediction = indprediction;
        pred.maxVal = parseFloat(pred.maxVal);
        pred.sentenceNo = j;

        for(let p of pred.prediction) {
            switch(p.emotion) {
                case "joy":
                    joy += p.percentage;
                    break;
                case "fear":
                    fear += p.percentage;
                    break;
                case "sadness":
                    sadness += p.percentage;
                    break;
                case "neutral":
                    neutral += p.percentage;
                    break;
                case "anger":
                    anger += p.percentage;
                    break;
                default:
                    //       
            }
        }
       
        j++;
    }

    console.log(joy + " " + sadness + " " + anger + " " + fear + " " + neutral)

    let total = parseFloat((joy + sadness + anger + fear + neutral).toFixed(5));
    let prJoy = parseFloat(((joy/total)*100).toFixed(5));
    let prSadness = parseFloat(((sadness/total)*100).toFixed(5));
    let prAnger = parseFloat(((anger/total)*100).toFixed(5));
    let prFear = parseFloat(((fear/total)*100).toFixed(5));
    let prNeutral = parseFloat(((neutral/total)*100).toFixed(5));

    let totalClasses = [
        {'emotion': 'joy', 'percentage': prJoy},
        {'emotion': 'fear', 'percentage': prFear},
        {'emotion': 'anger', 'percentage': prAnger},
        {'emotion': 'sadness', 'percentage': prSadness},
        {'emotion': 'neutral', 'percentage': prNeutral}
    ];

    let mainPredClass = "";
    let tempMaxVal = 0;
    for(let cl of totalClasses) {
        // Main emotion detected in all sentences
        if(cl.percentage > tempMaxVal) {
            tempMaxVal = cl.percentage;
            mainPredClass = cl.emotion;
        }
    }

    mainPredClass = mainPredClass.charAt(0).toUpperCase() + mainPredClass.slice(1);

    let entryresult = null;
    // Save results into the database
    if(req.session.isIndUser) {
        try {
            entryresult = await IndEntryResult.create({
                predictions: totalClasses,
                emotion: mainPredClass,
                maxVal: tempMaxVal,
                IndividualEntryId: entry.id
            });
        } catch (error) {
            console.log(error);
            return res.sendStatus(400);
        }

        if(entryresult == null) { return res.sendStatus(400); }

        // Create a record for each sentence
        for(let p of predictions) {
            try {
                await IndEntrySentence.create({
                    sentenceNo: p.sentenceNo,
                    sentence: p.sentence,
                    predictions: p.prediction,
                    emotion: p.predclass,
                    IndividualEntryId: entry.id,
                    IndividualEntryResultId: entryresult.id
                });
            } catch(error) {
                console.log(error);
            }           
        }

    } else {
        try {
            entryresult = await UserEntryResult.create({
                predictions: totalClasses,
                emotion: mainPredClass,
                maxVal: tempMaxVal,
                UserEntryId: entry.id
            });
        } catch (error) {
            console.log(error);
            return res.sendStatus(400);
        }

        if(entryresult == null) { return res.sendStatus(400); }

        // Create a record for each sentence
        for(let p of predictions) {
            try {
                await UserEntrySentence.create({
                    sentenceNo: p.sentenceNo,
                    sentence: p.sentence,
                    predictions: p.prediction,
                    emotion: p.predclass,
                    UserEntryId: entry.id,
                    UserEntryResultId: entryresult.id
                });
            } catch(error) {
                console.log(error);
            }           
        }
    }

    // File Handling
    if(entryFiles != null) {
        if(req.session.isIndUser) {
            for(let entryfile of entryFiles) {
                const FileKeyName = "IndividualEntry/" + entry.id + "/" + entryfile.filename;
                const fileContent =  fs.readFileSync(entryfile.path, null);
    
                const fileAWS = {
                    Bucket: S3_BUCKET,
                    Key: FileKeyName,
                    Body: fileContent
                };
    
                s3.upload(fileAWS, async (error, data) => {
                    if(error) { throw error; };
    
                    try {
                        await IndividualEntryFile.create({
                            fileId: FileKeyName,
                            IndividualEntryId: entry.id
                        });
                    } catch (error) { console.log(error); }
    
                    try {
                        fs.unlink(entryfile.path, (error) => {
                            if(error) { console.error(error); };
                        });
                    } catch(error) { console.log(error); } 
                });
            }
        } else if (req.session.isSystemUser) {
            for(let entryfile of entryFiles) {
                const FileKeyName = "UserEntry/" + entry.id + "/" + entryfile.filename;
                const fileContent =  fs.readFileSync(entryfile.path, null);
    
                const fileAWS = {
                    Bucket: S3_BUCKET,
                    Key: FileKeyName,
                    Body: fileContent
                };
    
                s3.upload(fileAWS, async (error, data) => {
                    if(error) { throw error; };
    
                    try {
                        await UserEntryFile.create({
                            fileId: FileKeyName,
                            UserEntryId: entry.id
                        });
                    } catch (error) { console.log(error); }
    
                    try {
                        fs.unlink(entryfile.path, (error) => {
                            if(error) { console.error(error); };
                        });
                    } catch(error) { console.log(error); } 
                });
            }
        }
    }

    // Entry created successfully - status 200
    return res
            .status(200)
            .json({
                    emotion: mainPredClass, 
                    predictionData: predictionData,
                    totalClasses: totalClasses,
                    predictions: predictions,
                    id: entry.id
                });
}

// Method to review summary of entry
exports.getSystemUserEntrySummaryPage = async (req, res) => {
    let entry = null;

    try {
        entry = await UserEntry.findOne({
            where: {
                id: req.params.entryId, 
                SystemUserId: req.session.userId
            },
            include: [
                {
                    model: SystemUser,
                    attributes: ["id", "name", "surname", "CentreId"],
                    where: {
                        CentreId: req.session.centreId
                    }
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
                }
            ]
        });
    } catch(error) {
        console.log(error);
        return res.redirect("/dashboard");
    }

    if(entry == null) { return res.redirect("/dashboard"); }

    const renderView = (entryFiles) => {
        res.render("entries/entry-summary", {
            title: "Entry Summary",
            isAdmin: req.session.isAdmin,
            isSpecialist: req.session.isSpecialist,
            isSystemUser: req.session.isSystemUser,
            isIndUser: req.session.isIndUser,
            userName: req.session.name,
            userSurname: req.session.surname,
            titleToDisplay: "Entry Summary",
            entry: entry,
            mainpredictions: JSON.stringify(entry.UserEntryResult.predictions),
            sentencespredictions: JSON.stringify(entry.UserEntryResult.UserEntrySentences),
            files: JSON.stringify(entryFiles)
        });
    }
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

        return renderView(files);

    } else {
        return renderView("");
    }
}

// Method to download files attached to an entry
exports.downloadSystemUserEntryFile = async (req, res) => {
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

// Method to review summary of entry
exports.getIndividualUserEntrySummaryPage = async (req, res) => {
    let entry = null;

    try {
        entry = await IndEntry.findOne({
            where: {
                id: req.params.entryId, 
                IndividualUserId: req.session.userId
            },
            include: [
                {
                    model: IndUser,
                    attributes: ["id", "name", "surname"]
                },
                {
                    model: IndEntryResult,
                    required: true,
                    include: {
                        model: IndEntrySentence,
                        required: true
                    }
                },
                {
                    model: IndividualEntryFile
                }
            ]
        });
    } catch(error) {
        console.log(error);
        return res.redirect("/dashboard");
    }

    if(entry == null) { return res.redirect("/dashboard"); }

    const renderView = (entryFiles) => {
        res.render("entries/entry-summary", {
            title: "Entry Summary",
            isAdmin: req.session.isAdmin,
            isSpecialist: req.session.isSpecialist,
            isSystemUser: req.session.isSystemUser,
            isIndUser: req.session.isIndUser,
            userName: req.session.name,
            userSurname: req.session.surname,
            titleToDisplay: "Entry Summary",
            entry: entry,
            mainpredictions: JSON.stringify(entry.IndividualEntryResult.predictions),
            sentencespredictions: JSON.stringify(entry.IndividualEntryResult.IndividualEntrySentences),
            files: JSON.stringify(entryFiles),
            filesLength: filesLength
        });
    }

    let filesLength = 0;
    if((entry.IndividualEntryFiles).length > 0) {
        let files = [];
        let promises = [];
        for(let f of entry.IndividualEntryFiles) {
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

// Method to download files attached to an entry
exports.downloadIndividualUserEntryFile = async (req, res) => {
    let fileId = req.body.fileid;
    let file = null;

    try {
        file = await IndividualEntryFile.findOne({where: {id: fileId}});
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

// Method to render page where the entries can be reviewed by the user
exports.getReviewEntriesPage = async (req, res) => {
    let entries = [];
    let today = moment().format("YYYY-MM-DD");
    let monthBefore = moment().subtract(30, "days");
    monthBefore = monthBefore.format("YYYY-MM-DD");

    // Retrieving all the users' entries to display them on the page
    if(req.session.isIndUser) {
        try {
            entries = await IndEntry.findAll( {
                where: {
                    IndividualUserId: req.session.userId, 
                    disabled: false,
                    date: {
                        [Op.gte]: monthBefore,
                        [Op.lte]: today
                    } 
                }, 
                order: [
                    ["createdAt", "DESC"]
                ] 
            });
        } catch(error) {
            console.log(error);
            return res.redirect("/dashboard");
        }
    } else if (req.session.isSystemUser) {
        try {
            entries = await UserEntry.findAll( {
                where: {
                    SystemUserId: req.session.userId, 
                    disabled: false,
                    date: {
                        [Op.gte]: monthBefore,
                        [Op.lte]: today
                    } 
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