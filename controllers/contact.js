const Centre = require("../models/centre");
const Specialist = require("../models/specialist");
const SystemUser = require("../models/systemuser");
const IndUser = require("../models/individualuser");

// To enable emailing
const sgMail = require("@sendgrid/mail");
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// Method to render the contact page
exports.getContactPage = async (req, res) => {
    let user = null;
    let title = "";

    if(req.session.isSystemUser) {
        try {
            user = await SystemUser.findOne({
               where: {
                   id: req.session.userId,
               },
               attributes: ["id", "name", "surname", "email", "telephone", "SpecialistId"],
               include: {
                   model: Specialist,
                   required: true,
                   attributes: ["id", "name", "surname", "email"]
               }
           })
       } catch(error) {
           console.log(error);
           return res.redirect("/dashboard");
       }

       title =  "Contact Your Specialist";
    } else {
        user = await IndUser.findOne({
            where: {
                id: req.session.userId,
            },
            attributes: ["id", "name", "surname", "email", "telephone"]
        })

        title = "Contact Our Support";
    }

    if(user == null) { return res.redirect("/dashboard"); }

    return res.render("contact/contact-user", {
        title: title,
        isAdmin: req.session.isAdmin,
        isSpecialist: req.session.isSpecialist,
        isSystemUser: req.session.isSystemUser,
        isIndUser: req.session.isIndUser,
        userName: req.session.name,
        userSurname: req.session.surname,
        titleToDisplay: title,
        user: user
    });
}

// Method allowing to send an automated email to the assigned specialist
exports.sendMailToSpecialist = async (req, res) => {
    let user = null;

    try {
         user = await SystemUser.findOne({
            where: {
                id: req.session.userId,
            },
            attributes: ["id", "name", "surname", "email", "telephone", "SpecialistId"],
            include: {
                model: Specialist,
                required: true,
                attributes: ["id", "name", "surname", "email"]
            }
        })
    } catch(error) {
        console.log(error);
        return res.sendStatus(400);
    }

    if(user == null) { return res.sendStatus(400); }

    try{
        let message = `Dear ${user.Specialist.name} ${user.Specialist.surname},<br /><br /> A new message has been sent to you by <strong>${user.name} ${user.surname}</strong>. Please see the content of the message below:<br /><br />${req.body.email}<br /><br />To respond to the patient, please use the contact details listed below:<br/ ><br /><strong>Email:</strong> ${user.email}<br /><strong>Telephone number:</strong> ${user.telephone}<br /><br />Kind Regards, <br />Moodnitor<br /><br /><br />`;

        let msg = {
            to: "w1694656@my.westminster.ac.uk",
            from: "w1694656@my.westminster.ac.uk",
            subject: "Moodnitor - New Message from your Patient",
            html: message
        }

        sgMail
        .send(msg)
        .then(() => {
            console.log("E-Mail Sent");
            return res.sendStatus(200);
        }, error => {
            console.log(error);
            if (error.response) {
                console.log(error.response.body)
            }
            return res.sendStatus(400);
        });
    } catch(error){
        console.log(error);
        return res.sendStatus(400);
    }
}

// Method to render the contact
exports.getContactPageSpecialist = async (req, res) => {
    let users = null;

    try {
        users = await SystemUser.findAll({where: {SpecialistId: req.session.userId, CentreId: req.session.centreId, disabled: false}, attributes: ["id", "name", "surname", "disabled", "CentreId", "SpecialistId"]});
    } catch (error) {
        console.log(error);
        return res.redirect("/dashboard");
    }

    if(users == null) { return res.redirect("/dashboard"); }

    return res.render("contact/contact-specialist", {
        title: "Contact Your Specialist",
        isAdmin: req.session.isAdmin,
        isSpecialist: req.session.isSpecialist,
        isSystemUser: req.session.isSystemUser,
        isIndUser: req.session.isIndUser,
        userName: req.session.name,
        userSurname: req.session.surname,
        titleToDisplay: "Contact Your Specialist",
        users: users
    });
}

// Method allowing to send an automated email to the chosen assigned user
exports.sendMailToAssignedUser = async (req, res) => {
    let specialist = null;
    let user = null;

    try {
        specialist = await Specialist.findOne({
            where: {
                id: req.session.userId,
            },
            attributes: ["id", "name", "surname", "email", "telephone"]
        })
    } catch(error) {
        console.log(error);
        return res.sendStatus(400);
    }

    try {
        user = await SystemUser.findOne({
            where: {
                id: req.body.userId,
            },
            attributes: ["id", "name", "surname", "email", "telephone", "SpecialistId"]
        })
    } catch(error) {
        console.log(error);
        return res.sendStatus(400);
    }

    if(user == null || specialist == null) { return res.sendStatus(400); }

    try{
        let message = `Dear ${user.name} ${user.surname},<br /><br /> A new message has been sent to you by <strong>${specialist.name} ${specialist.surname}</strong>. Please see the content of the message below:<br /><br />${req.body.email}<br /><br />To respond to your assigned specialist, please use the contact details listed below:<br/ ><br /><strong>Email:</strong> ${specialist.email}<br /><strong>Telephone number:</strong> ${specialist.telephone}<br /><br />Kind Regards, <br />Moodnitor<br /><br /><br />`;

        let msg = {
            to: "w1694656@my.westminster.ac.uk",
            from: "w1694656@my.westminster.ac.uk",
            subject: "Moodnitor - New Message from your Specialist",
            html: message
        }

        sgMail
        .send(msg)
        .then(() => {
            console.log("E-Mail Sent");
            return res.sendStatus(200);
        }, error => {
            console.log(error);
            if (error.response) {
                console.log(error.response.body)
            }
            return res.sendStatus(400);
        });
    } catch(error){
        console.log(error);
        return res.sendStatus(400);
    }
}

// Method allowing to send an automated email to the support
exports.sendMailToSupport = async (req, res) => {
    let user = null;

    try {
        user = await IndUser.findOne({
            where: {
                id: req.session.userId,
            },
            attributes: ["id", "name", "surname", "email", "telephone"]
        })
    } catch(error) {
        console.log(error);
        return res.sendStatus(400);
    }

    if(user == null) { return res.sendStatus(400); }

    try{
        let message = `Dear Support Team,<br /><br /> A new message has been sent to you by <strong>${user.name} ${user.surname}</strong>. Please see the content of the message below:<br /><br />${req.body.email}<br /><br />To respond to the user's query, please use the contact details listed below:<br/ ><br /><strong>Email:</strong> ${user.email}<br /><strong>Telephone number:</strong> ${user.telephone}<br /><br />Kind Regards, <br />Moodnitor<br /><br /><br />`;

        let msg = {
            to: "w1694656@my.westminster.ac.uk",
            from: "w1694656@my.westminster.ac.uk",
            subject: "Moodnitor - New Message received",
            html: message
        }

        sgMail
        .send(msg)
        .then(() => {
            console.log("E-Mail Sent");
            return res.sendStatus(200);
        }, error => {
            console.log(error);
            if (error.response) {
                console.log(error.response.body)
            }
            return res.sendStatus(400);
        });
    } catch(error){
        console.log(error);
        return res.sendStatus(400);
    }
}