const Centre = require("../models/centre");
const Specialist = require("../models/specialist");
const SystemUser = require("../models/systemuser");
const UserEntry = require("../models/userentry");
const UserEntryFile = require("../models/userentryfile");

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


// Method to render page where the entries can be reviewed by the user
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