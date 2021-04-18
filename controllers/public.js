const Centre = require("../models/centre");
const Specialist = require("../models/specialist");
const Patient = require("../models/systemuser");
const IndUser = require("../models/individualuser");

// To encrypt the passwords
const bcrypt = require("bcryptjs");
const cryptoRandomString = require("crypto-random-string");
const VerificationString = require("../models/verification");

// To enable emailing
const sgMail = require("@sendgrid/mail");
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// Function used to render the Main Page, accessible for all the users
exports.getMainPage = (req, res) => {
    res.render("main-page", {
        title: "Main Page"
    });
};

// Function used to render the Login Page
exports.getSpecialistLoginPage = (req, res) => {
    res.render("auth/specialist-login-page", {
        title: "Login"
    });
};

// Function used to render the Login Page
exports.getIndUserLoginPage = (req, res) => {
    res.render("auth/induser-login-page", {
        title: "Login"
    });
};

// Function used to render the organisation's registration page 
exports.getClinicRegistrationPage = (req, res) => {
    res.render("auth/register-page", {
        title: "Register Your Clinic"
    });
};

// Function used to render the individual user's registration page 
exports.getInividualUserRegistrationPage = (req, res) => {
    res.render("auth/register-ind-user-page", {
        title: "Create new account"
    });
};

// Function to display error
exports.getAuthErrorPage = (req, res) => {
    res.render("auth/auth-error", {
        title: "Error"
    });
};

// Function to display error - email exists
exports.getEmailErrorPage = (req, res) => {
    res.render("auth/auth-account-exists", {
        title: "Wrong Credentials"
    });
};

// Function to display confirmation of clinic registration
exports.getClinicRegConfirmation = (req, res) => {
    res.render("auth/auth-reg-clinic-success", {
        title: "Registration Successful"
    });
};

// Function to display confirmation of individual user registration
exports.getIndRegConfirmation = (req, res) => {
    res.render("auth/auth-ind-reg-success", {
        title: "Registration Successful"
    });
};

// Function used to render the page where the user can choose how to register
exports.getChooseRegistrationPage = (req, res) => {
    res.render("auth/choose-registration", {
        title: "Choose Registration Way"
    });
};

// Function used to render the page where the user can choose how to login
exports.getChooseLoginPage = (req, res) => {
    res.render("auth/choose-login", {
        title: "Choose Login Way"
    });
};

// Function to inform that account could not be found
exports.accountNotFoundPage = (req, res) => {
    res.render("auth/auth-not-found", {
        title: "Account not Found"
    });
};

// Function to inform that account was not verified
exports.accountNotVerifiedPage = (req, res) => {
    res.render("auth/auth-not-verified", {
        title: "Account not Verified"
    });
};

// Register Clinic
/* Steps: 
    1. Initialize variables to null.
    2. Create new database records - the clinical centre:
       - Check if the clinic with the given e-mail does not exist already - if it exists, redirect to the main page;
       - Set verified as false in the "verified" column in the "clinics" table;
       - If error emerges, return to the registration page.
    3. Create new Admin: 
       - Use bcrypt npm package to encrypt the user's password.
       - If error emerges, return to the registration page.
    4. Create new "Verification" record.
    5. Send emails to the main administrators of the site.

*/
exports.registerClinicAndAdmin = async (req, res) => {
    // Step 1
    let submittedCentre = null;
    let submittedAdmin = null;
    let verificationString = null;

    // Step 2

    // Check if the clinic with the given email address exists in the database already
    try {
        submittedCentre = await Centre.findOne({where: {email: req.body.clinicEmail}});
    } catch (error) {
        console.log(error);
        return res.redirect("/auth/error");
    }

    // Create a new record if submittedCentre is equal to null (no entries with the given email found)
    if(submittedCentre == null) {    
        try {
            submittedCentre = await Centre.create({
                email: req.body.clinicEmail,
                name: req.body.clinicName,
                phone: req.body.clinicPhone,
                verified: 0
            });
        } catch (error) {
            console.log(error);
            return res.redirect("/auth/error");
        }
    } else {
        return res.redirect("/auth/email/error");
    }

    // Step 3
    try {
        submittedAdmin = await Specialist.findOne({where: {email: req.body.adminEmail}});
    } catch (error) {
        console.log(error);
        return res.redirect("/auth/error");
    }

    // Record exists in the database already - email of Admin not unique - return to the register page and alert the user
    if (submittedAdmin != null) {
        return res.redirect("/auth/email/error");
    } 

    try {
        submittedAdmin = await Patient.findOne({where: {email: req.body.adminEmail}});
    } catch (error) {
        console.log(error);
        return res.redirect("/auth/error");
    }

    if (submittedAdmin != null) {
        return res.redirect("/auth/email/error");
    } 

    try {
        submittedAdmin = await IndUser.findOne({where: {email: req.body.adminEmail}});
    } catch (error) {
        console.log(error);
        return res.redirect("/auth/error");
    }

    if (submittedAdmin != null) {
        return res.redirect("/auth/email/error");
    } 
    
    // Password Encryption
    let hashedPass = await bcrypt.hash(req.body.adminPassword, 14);
 
    try {
        submittedAdmin = await Specialist.create({
            name: req.body.adminName,
            surname: req.body.adminSurname,
            email: req.body.adminEmail,
            password: hashedPass,
            isAdmin: 1,
            CentreId: submittedCentre.id,
            telephone: req.body.adminPhone
        });
    } catch(error) {
        console.log(error);
        return res.redirect("/auth/error");
    }

    // Step 4
    try {
        verificationString = await VerificationString.create({
            CentreId: submittedCentre.id,
            token: cryptoRandomString(10)
        });
    } catch (error) {
        console.log(error);
        return res.redirect("/auth/error");
    }

    res.redirect("/auth/confirm/clinic");

    // Step 5
    try{
        let message = "Dear Administrator, <br /><br />A new enquiry has been submitted by a clinic interested in joining the platform. Please find their details below: <br /><br />Name: " + submittedCentre.name + "<br /><br />Email: " + submittedCentre.email + "<br /><br />The details of the Clinic's Administrator are as follow: <br /><br />Name: " + submittedAdmin.name +"<br /><br />Surame: " + submittedAdmin.surname + "<br /><br />Email: " + submittedAdmin.email +"<br /><br />To confirm the registration and enable the access to the platform for the Administrator, please access the link below:<br /><br /><a href='http://localhost:3000/verify/" + verificationString.token + "' target='_blank'>" + "https://localhost:3000/verify/" + verificationString.token + "</a><br /><i>Accessing the link will unlock the access for the clinic automatically.</i> <br /><br /> Kind Regards, <br />Moodnitor<br /><br /><br />";

        let msg = {
            to: "w1694656@my.westminster.ac.uk",
            from: "w1694656@my.westminster.ac.uk",
            subject: "Moodnitor - New Registration Enquiry",
            html: message
        }

        sgMail
        .send(msg)
        .then(() => {
            console.log("E-Mail Sent");
        }, error => {
            console.log(error);
            if (error.response) {
                console.log(error.response.body)
            }
        });
    } catch(error){
        console.log(error);
    }
};

// Verify Clinic
exports.verifyRegistratrion = async (req, res) => {
    const verId = req.params.verId;
    let verification = null;
    let centreEmail;

    // Step 1 - find the Verification record with the ID from the url
    try {
        verification = await VerificationString.findOne({where: {token: verId, archived: 0}, include: [{model: Centre, attributes: ["id", "verified", "name", "email"]}]});
        centreEmail = verification.Centre.email;
    } catch (error) {
        console.log(error);
        return res.redirect("/");
    }

    // TODO if verification archived

    // If the verification record can not be found, return to the main page
    // Else - set the clinic as verified
    if(verification == null) { 
        return res.redirect("/"); 
    } else {
        verification.Centre.verified = 1;
        verification.archived = 1;
        await verification.save();
        await verification.Centre.save();

        res.render("auth/verification-page", {
            pageTitle: "Registration Verification",
            name: verification.Centre.name
        });

        try{
            let message = "Dear " + verification.Centre.name + ", <br /><br />We are pleased to inform you that your registration in the Moodnitor system has been verified. You can now login by accessing the link below: <br /><br />https://moodnitor.herokuapp.com/login/centre<br /><br /> Kind Regards, <br />Moodnitor<br /><br /><br />";
    
            let msg = {
                to: "w1694656@my.westminster.ac.uk",
                from: "w1694656@my.westminster.ac.uk",
                subject: "Moodnitor - Your Account has been verified",
                html: message
            }
    
            sgMail
            .send(msg)
            .then(() => {
                console.log("E-Mail Sent");
            }, error => {
                console.log(error);
                if (error.response) {
                    console.log(error.response.body)
                }
            });
        } catch(error){
            console.log(error);
        }
    }
};


// Register individual user
/*
Steps: 
    1. Check if user with the given email address does not already exist.
    2. Hash and salt submited password.
    3. Create user.
    4. Redirect to another page.
*/
exports.registerIndividualUser = async (req, res) => {
    let user = null;

    // Step 1
    try {
        user = await IndUser.findOne({where: {email: req.body.userEmail}});
    } catch (error) {
        console.log(error);
        return res.redirect("/auth/error");
    }

    if(user != null) { return res.redirect("/auth/email/error"); }

    try {
        user = await Patient.findOne({where: {email: req.body.userEmail}});
    } catch (error) {
        console.log(error);
        return res.redirect("/auth/error");
    }

    if(user != null) { return res.redirect("/auth/email/error"); }

    try {
        user = await Specialist.findOne({where: {email: req.body.userEmail}});
    } catch (error) {
        console.log(error);
        return res.redirect("/auth/error");
    }

    if(user != null) { return res.redirect("/auth/email/error"); }

    // Step 2
    let hashedPass = await bcrypt.hash(req.body.userPassword, 14);

    // Step 3
    try {
        user = await IndUser.create({
            name: req.body.userName,
            surname: req.body.userSurname,
            email: req.body.userEmail,
            password: hashedPass,
            telephone: req.body.userPhone
        });
    } catch(error) {
        console.log(error);
        return res.redirect("/auth/error");
    }

    // Step 4
    return res.redirect("/auth/confirm/ind");
};
