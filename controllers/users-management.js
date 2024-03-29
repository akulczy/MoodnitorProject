const Specialist = require("../models/specialist");
const Patient = require("../models/systemuser");
const IndUser = require("../models/individualuser");
const Centre = require("../models/centre");

const bcrypt = require("bcryptjs");

exports.getUsersListView = async (req, res) => {
    let users = [];

    try {
        users = await Patient.findAll({ 
            where: {
                CentreId: req.session.centreId 
            }, 
            order: [
                ["disabled", "ASC"], ["name", "ASC"]
            ],
            include: [
                {
                    model: Centre,
                    where: {id: req.session.centreId}
                },
                {
                    model: Specialist,
                    attributes: ["id", "name", "surname"]
                }
            ] 
        });
    } catch (error) {
        console.log(error);
    }

    res.render("administrative/users-list", {
        title: "Users List",
        isAdmin: req.session.isAdmin,
        isSpecialist: req.session.isSpecialist,
        isSystemUser: req.session.isSystemUser,
        isIndUser: req.session.isIndUser,
        userName: req.session.name,
        userSurname: req.session.surname,
        titleToDisplay: "Users List",
        users: users
    });
}

exports.getSpecialistsListView = async (req, res) => {
    let users = [];

    try {
        users = await Specialist.findAll({ 
            where: {
                CentreId: req.session.centreId 
            }, 
            order: [
                ["disabled", "ASC"], ["isAdmin", "DESC"], ["name", "ASC"]
            ],
            include: [
                {
                    model: Centre,
                    where: {id: req.session.centreId},
                    required: true
                }
            ] 
        });
    } catch (error) {
        console.log(error);
    }

    res.render("administrative/specialists-list", {
        title: "Users List",
        isAdmin: req.session.isAdmin,
        isSpecialist: req.session.isSpecialist,
        isSystemUser: req.session.isSystemUser,
        isIndUser: req.session.isIndUser,
        userName: req.session.name,
        userSurname: req.session.surname,
        titleToDisplay: "Users List",
        users: users
    });
}

exports.getAddUserView = async (req, res) => {
    let specialists = [];

    try {
        specialists = await Specialist.findAll({where: {CentreId: req.session.centreId}});
    } catch(error) {
        console.log(error);
        return res.redirect("/dashboard");
    }

    res.render("administrative/add-user", {
        title: "Add New User",
        isAdmin: req.session.isAdmin,
        isSpecialist: req.session.isSpecialist,
        isSystemUser: req.session.isSystemUser,
        isIndUser: req.session.isIndUser,
        userName: req.session.name,
        userSurname: req.session.surname,
        titleToDisplay: "Add New User",
        specialists: specialists
    });
}

exports.addUser = async (req, res) => {
    let user = null;
    let specialist = null;
    let privilege = req.body.privileges;

    // Step 1 - Check if user with the given email address exists already
    try {
        user = await Patient.findOne({where: {email: req.body.email}});
    } catch (error) {
        console.log(error);
        return res.sendStatus(400);
    }

    // If the user exists - return status code 403
    if(user != null) {return res.sendStatus(403)};

    try {
        user = await Specialist.findOne({where: {email: req.body.email}});
    } catch (error) {
        console.log(error);
        return res.sendStatus(400);
    }

    if(user != null) {return res.sendStatus(403)};

    try {
        user = await IndUser.findOne({where: {email: req.body.email}});
    } catch (error) {
        console.log(error);
        return res.sendStatus(400);
    }

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
    if(privilege == "Patient") {
        try {
            user = await Patient.create({
                name: req.body.name,
                surname: req.body.surname,
                email: req.body.email,
                password: hashedPass,
                telephone: req.body.telephone,
                SpecialistId: req.body.SpecialistId,
                CentreId: specialist.CentreId
            });
        } catch (error) {
            console.log(error);
            return res.sendStatus(400);
        }
    } else {
        try {
            user = await Specialist.create({
                name: req.body.name,
                surname: req.body.surname,
                email: req.body.email,
                password: hashedPass,
                telephone: req.body.telephone,
                isAdmin: (privilege == "Administrator" ? true : false),
                CentreId: specialist.CentreId,
                title: ((req.body.specTitle == "" || req.body.specTitle == null) ? "N/A" : req.body.specTitle)
            });
        } catch (error) {
            console.log(error);
            return res.sendStatus(400);
        }
    }

    if(user == null) {return res.sendStatus(400); }

    return res.sendStatus(200);
}

exports.disableUser = async (req, res) => {
    let user = null;
    let disabled = false;

    // Retrieving the given user from the database
    try {
        user = await Patient.findOne({where: { id: req.body.userId, CentreId: req.session.centreId }});
    } catch (error) {
        console.log(error);
        return res.sendStatus(400);
    }

    if(user == null) { return res.sendStatus(400); }

    // Set the user as disabled or enabled
    try {
        if(user.disabled) {
            user.disabled = false;
        } else {
            user.disabled = true;
            disabled = true;
        }

        await user.save();
    } catch (error) {
        console.log(error);
        return res.sendStatus(400);
    }

    return res.status(200).send({disabled: disabled});
}

exports.getEditUserPage = async (req, res) => {
    let user = null;
    let specialists = [];

    // Retrieving the given user from the database
    try {
        user = await Patient.findOne({
            where: { 
                id: req.params.userId, 
                CentreId: req.session.centreId 
            },
            include: {
                model: Specialist,
                attributes: ["id", "CentreId", "name", "surname"]
            }
        });
    } catch (error) {
        console.log(error);
        return res.redirect("/dashboard");
    }

    try {
        specialists = await Specialist.findAll({where: {CentreId: req.session.centreId}});
    } catch(error) {
        console.log(error);
        return res.redirect("/dashboard");
    }

    res.render("administrative/edit-user", {
        title: "Edit User's Details",
        isAdmin: req.session.isAdmin,
        isSpecialist: req.session.isSpecialist,
        isSystemUser: req.session.isSystemUser,
        isIndUser: req.session.isIndUser,
        userName: req.session.name,
        userSurname: req.session.surname,
        titleToDisplay: "Edit User's Details",
        user: user,
        specialists: specialists
    });
}

exports.editUserDetails = async (req, res) => {
    let user = null;

    // Retrieving the given user from the database
    try {
        user = await Patient.findOne({where: { id: req.body.uId, CentreId: req.session.centreId }});
    } catch (error) {
        console.log(error);
        return res.redirect("/dashboard/specialist/users/list");
    }

    // Checking if the fields were not left empty or filled with space characters only
    if(((req.body.userName).replace(/ /g, '') == "") || ((req.body.userName).replace(/ /g, '') == "") || ((req.body.userName).replace(/ /g, '') == "") || ((req.body.userName).replace(/ /g, '') == "")) {
        return res.redirect(`/dashboard/specialist/users/edit/${user.id}`);
    }

    // Updating user's details
    try {
        user.name = req.body.userName;
        user.surname = req.body.userSurname;
        user.email = req.body.userEmail;
        user.telephone = req.body.userPhone;
        user.SpecialistId = req.body.assignSpecialist;
        await user.save();
    } catch (error) {
        console.log(error);
        return res.redirect(`/dashboard/specialist/users/edit/${user.id}`);
    }

    // Redirect to the Users List
    return res.redirect("/dashboard/specialist/users/list");
}

exports.getAssignedUsersListView = async (req, res) => {
    let users = [];

    try {
        users = await Patient.findAll({ where: {SpecialistId: req.session.userId, CentreId: req.session.centreId }, order: [["disabled", "ASC"], ["name", "ASC"]] });
    } catch (error) {
        console.log(error);
    }

    res.render("specialist/assigned-users", {
        title: "Assigned Users List",
        isAdmin: req.session.isAdmin,
        isSpecialist: req.session.isSpecialist,
        isSystemUser: req.session.isSystemUser,
        isIndUser: req.session.isIndUser,
        userName: req.session.name,
        userSurname: req.session.surname,
        titleToDisplay: "Assigned Users List",
        users: users
    });
}

exports.disableSpecialist = async (req, res) => {
    let user = null;
    let disabled = false;

    // Retrieving the given user from the database
    try {
        user = await Specialist.findOne({where: { id: req.body.userId, CentreId: req.session.centreId }});
    } catch (error) {
        console.log(error);
        return res.sendStatus(400);
    }

    if(user == null) { return res.sendStatus(400); }

    // Set the user as disabled or enabled
    try {
        if(user.disabled) {
            user.disabled = false;
        } else {
            user.disabled = true;
            disabled = true;
        }

        await user.save();
    } catch (error) {
        console.log(error);
        return res.sendStatus(400);
    }

    return res.status(200).send({disabled: disabled});
}

exports.getEditSpecialistPage = async (req, res) => {
    let user = null;

    // Retrieving the given user from the database
    try {
        user = await Specialist.findOne({where: { id: req.params.userId, CentreId: req.session.centreId }});
    } catch (error) {
        console.log(error);
        return res.redirect("/dashboard");
    }

    res.render("administrative/edit-specialist", {
        title: "Edit User's Details",
        isAdmin: req.session.isAdmin,
        isSpecialist: req.session.isSpecialist,
        isSystemUser: req.session.isSystemUser,
        isIndUser: req.session.isIndUser,
        userName: req.session.name,
        userSurname: req.session.surname,
        titleToDisplay: "Edit User's Details",
        user: user
    });
}

exports.editSpecialistDetails = async (req, res) => {
    let user = null;

    // Retrieving the given user from the database
    try {
        user = await Specialist.findOne({where: { id: req.body.uId, CentreId: req.session.centreId }});
    } catch (error) {
        console.log(error);
        return res.redirect("/dashboard/specialist/users/list/specialists");
    }

    // Checking if the fields were not left empty or filled with space characters only
    if(((req.body.userName).replace(/ /g, '') == "") || ((req.body.userName).replace(/ /g, '') == "") || ((req.body.userName).replace(/ /g, '') == "") || ((req.body.userName).replace(/ /g, '') == "")) {
        return res.redirect(`/dashboard/specialist/users/edit/spec/${user.id}`);
    }

    // Updating user's details
    try {
        user.name = req.body.userName;
        user.surname = req.body.userSurname;
        user.email = req.body.userEmail;
        user.telephone = req.body.userPhone;
        user.isAdmin = (req.body.adminCheck == "1" ? true : false);
        user.title = ((req.body.jobTitle == "" || req.body.jobTitle == null) ? "N/A" : req.body.jobTitle);
        await user.save();
    } catch (error) {
        console.log(error);
        return res.redirect(`/dashboard/specialist/users/edit/spec/${user.id}`);
    }

    // Redirect to the Users List
    return res.redirect("/dashboard/specialist/users/list/specialists");
}