const bcrypt = require("bcryptjs");
const Specialist = require("../models/specialist");
const Patient = require("../models/patient");
const Centre = require("../models/centre");

exports.specialistLogIn = async (req, res, next) => {
    const specialistEmail = req.body.sMail;
    const specialistPassword = req.body.sPass;
    let retrievedUser = null;

    // Step 1 - find the user with the given email
    try {
        retrievedUser = await Specialist.findOne({where: {email: specialistEmail}, include: [{model: Centre, attributes: ["id", "verified"]}]});
    } catch (error) {
        console.log(error);
    }

    // User not found - redirection
    if(retrievedUser == null) {
        return res.redirect("/login?found=false");
    }

    // Specialist's clinic not verified
    if(retrievedUser.Centre.verified == 0) {
        return res.redirect("/login?verified=false");
    }

    // Step 2 - Check if the passwords are matching
    // npm bcrypt packages is used for the passwords decryption and encryption
    bcrypt
    .compare(specialistPassword, retrievedUser.password)
    .then(passwordsMatching => {
        if(passwordsMatching) {
            // Step 3 - Session
            req.session.userId = retrievedUser.id; 
            req.session.name = retrievedUser.name;
            req.session.surname = retrievedUser.surname;
            req.session.email = retrievedUser.email;
            req.session.isAdmin = retrievedUser.isAdmin;
            req.session.isSpecialist = true;
            req.session.loggedIn = true;

            // Login correct - page redirection
            return req.session.save(error => {
                /*if(userFetched.isAdmin && !userFetched.isTeacher && !userFetched.isStudent) {
                    res.redirect("/admin/panel");
                } */
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


