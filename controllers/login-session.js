const bcrypt = require("bcryptjs");
const Specialist = require("../models/specialist");
const Patient = require("../models/patient");
const IndUser = require("../models/systemuser");
const Centre = require("../models/centre");

exports.centreLogin = async (req, res,) => {
    let email = req.body.email;
    let password = req.body.password;
    let isSpecialist = true;
    let retrievedUser = null;

    // Step 1 - find the user with the given email
    try {
        retrievedUser = await Specialist.findOne({where: {email: email}, include: [{model: Centre, attributes: ["id", "verified"]}]});
    } catch (error) {
        console.log(error);
        return res.redirect("/login?found=false");
    }

    // User not found - redirection
    if(retrievedUser == null) {
        isSpecialist = false;
        try {
            retrievedUser = await Patient.findOne({where: {email: email}, include: [{model: Centre, attributes: ["id", "verified"]}]});
        } catch (error) {
            console.log(error);
        }
    
        // User not found - redirection
        if(retrievedUser == null) {
            return res.redirect("/login?found=false");
        }
    }

    // Specialist's centre not verified
    if(retrievedUser.Centre.verified == 0) {
        return res.redirect("/login?verified=false");
    }

    // Step 2 - Check if the passwords are matching
    // npm bcrypt package is used for the passwords decryption and encryption
    bcrypt
    .compare(password, retrievedUser.password)
    .then(passwordsMatching => {
        if(passwordsMatching) {
            // Step 3 - Session
            if(isSpecialist) {
                req.session.userId = retrievedUser.id; 
                req.session.centreId = retrievedUser.CentreId;
                req.session.name = retrievedUser.name;
                req.session.surname = retrievedUser.surname;
                req.session.email = retrievedUser.email;
                req.session.isSystemUser = false;
                req.session.isIndUser = false;
                req.session.isAdmin = retrievedUser.isAdmin;
                req.session.isSpecialist = true;
                req.session.loggedIn = true;
            } else {
                req.session.userId = retrievedUser.id; 
                req.session.centreId = retrievedUser.CentreId;
                req.session.name = retrievedUser.name;
                req.session.surname = retrievedUser.surname;
                req.session.email = retrievedUser.email;
                req.session.isSystemUser = true;
                req.session.isIndUser = false;
                req.session.isAdmin = false;
                req.session.isSpecialist = false;
                req.session.loggedIn = true;
            }

            // Login correct - page redirection
            return req.session.save(error => {
                res.redirect("/dashboard");
            });
        // The password in the database does not match the password inserted by the user
        } else {
            return res.redirect("/login?found=false"); 
        }
    })
    .catch(error => {
        console.log(error);
    });
};

exports.indUserLogin = async (req, res) => {
    const email = req.body.email;
    const password = req.body.password;
    let retrievedUser = null;

    // Step 1 - find the user with the given email
    try {
        retrievedUser = await IndUser.findOne({ where: {email: email} });
    } catch (error) {
        console.log(error);
    }

    // User not found - redirection
    if(retrievedUser == null) {
        return res.redirect("/login?found=false");
    }

    // Step 2 - Check if the passwords are matching
    // npm bcrypt package is used for the passwords decryption and encryption
    bcrypt
    .compare(password, retrievedUser.password)
    .then(passwordsMatching => {
        if(passwordsMatching) {
            // Step 3 - Session
            req.session.userId = retrievedUser.id; 
            req.session.centreId = 0;
            req.session.name = retrievedUser.name;
            req.session.surname = retrievedUser.surname;
            req.session.email = retrievedUser.email;
            req.session.isSystemUser = false;
            req.session.isIndUser = true;
            req.session.isAdmin = false;
            req.session.isSpecialist = false;
            req.session.loggedIn = true;

            // Login correct - page redirection
            return req.session.save(error => {
                res.redirect("/dashboard");
            });
        // The password in the database does not match the password inserted by the user
        } else {
            return res.redirect("/login?found=false"); 
        }
    })
    .catch(error => {
        console.log(error);
    });
}

