const Specialist = require("../models/specialist");
const Patient = require("../models/patient");
const Centre = require("../models/centre");

const bcrypt = require("bcryptjs");

exports.getUsersListView = async (req, res) => {
    let users = [];

    try {
        users = await Patient.findAll({ where: {SpecialistId: req.session.userId } });
    } catch (error) {
        console.log(error);
    }

    res.render("specialist/users-list", {
        title: "Users List",
        isAdmin: req.session.isAdmin,
        isSpecialist: req.session.isSpecialist,
        userName: req.session.name,
        userSurname: req.session.surname,
        titleToDisplay: "Users List",
        users: users
    });
}

exports.getAddUserView = (req, res) => {
    res.render("administrative/add-user", {
        title: "Add New User",
        isAdmin: req.session.isAdmin,
        isSpecialist: req.session.isSpecialist,
        userName: req.session.name,
        userSurname: req.session.surname,
        titleToDisplay: "Add New User"
    });
}

exports.addUser = async (req, res) => {
    let user = null;
    let specialist = null;

    // Step 1 - Check if user with the given email address exists already
    try {
        user = await Patient.findOne({where: {email: req.body.email}});
    } catch (error) {
        console.log(error);
        return res.sendStatus(400);
    }

    // If the user exists - return status code 403
    if(user != null) {return res.sendStatus(403)};

    // Step 2 - find the specialist who adds the user
    try {
        specialist = await Specialist.findOne({where: {id: req.session.userId}});
    } catch (error) {
        console.log(error);
        return res.sendStatus(400);
    }

    if(specialist == null) {return res.sendStatus(400); }

    // Step 3 - hash the password
    let hashedPass = await bcrypt.hash(req.body.password, 14);

    // Step 4 - create user
    try {
        user = await Patient.create({
            name: req.body.name,
            surname: req.body.surname,
            email: req.body.email,
            password: hashedPass,
            telephone: req.body.telephone,
            SpecialistId: req.session.userId,
            CentreId: specialist.CentreId
        });
    } catch (error) {
        console.log(error);
        return res.sendStatus(400);
    }

    if(user == null) {return res.sendStatus(400); }

    return res.sendStatus(200);
}
