const Specialist = require("../models/specialist");
const SystemUser = require("../models/systemuser");
const IndUser = require("../models/individualuser");
const Centre = require("../models/centre");

// To encrypt the passwords
const bcrypt = require("bcryptjs");
let moment = require("moment");

exports.getDashboard = (req, res) => {
    let dateToday =  moment(new Date()).format("DD/MM/YYYY");

    if(req.session.isSpecialist) {
        return res.render("dashboard/specialist-dashboard", {
            title: "Dashboard",
            isAdmin: req.session.isAdmin,
            isSpecialist: req.session.isSpecialist,
            isSystemUser: req.session.isSystemUser,
            isIndUser: req.session.isIndUser,
            userName: req.session.name,
            userSurname: req.session.surname,
            titleToDisplay: "Dashboard",
            dateToday: dateToday
        });
    }

    if(req.session.isSystemUser) {
        return res.render("dashboard/user-dashboard", {
            title: "Dashboard",
            isAdmin: req.session.isAdmin,
            isSpecialist: req.session.isSpecialist,
            isSystemUser: req.session.isSystemUser,
            isIndUser: req.session.isIndUser,
            userName: req.session.name,
            userSurname: req.session.surname,
            titleToDisplay: "Dashboard",
            dateToday: dateToday
        });
    }

    if(req.session.isIndUser) {
        return res.render("dashboard/user-dashboard", {
            title: "Dashboard",
            isAdmin: req.session.isAdmin,
            isSpecialist: req.session.isSpecialist,
            isSystemUser: req.session.isSystemUser,
            isIndUser: req.session.isIndUser,
            userName: req.session.name,
            userSurname: req.session.surname,
            titleToDisplay: "Dashboard",
            dateToday: dateToday
        });
    }
}

exports.getAccountPage = async (req, res) => {
    let user = null; 

    if(req.session.isIndUser) {
        try {
            user = await IndUser.findOne({where: {id: req.session.userId}});
        } catch (error) {
            console.log(error);
            return res.redirect("/dashboard");
        }
    }

    if(req.session.isSystemUser) {
        try {
            user = await SystemUser.findOne({
                where: {
                    id: req.session.userId
                },
                include: [
                    {
                        model: Specialist,
                        attributes: ["name", "surname", "id", "email"]
                    },
                    {   
                        model: Centre,
                        attributes: ["name", "id", "email"]
                    }
                ]
            });
        } catch (error) {
            console.log(error);
            return res.redirect("/dashboard");
        }
    }

    if(req.session.isSpecialist) {
        try {
            user = await Specialist.findOne({
                where: {
                    id: req.session.userId
                },
                include: {
                    model: Centre,
                    attributes: ["name", "id", "email"]
                }
            });
        } catch (error) {
            console.log(error);
            return res.redirect("/dashboard");
        }
    }

    if(user == null) { return res.redirect("/dashboard"); }

    return res.render("dashboard/view-profile", {
        title: "View Your Profile",
        isAdmin: req.session.isAdmin,
        isSpecialist: req.session.isSpecialist,
        isSystemUser: req.session.isSystemUser,
        isIndUser: req.session.isIndUser,
        userName: req.session.name,
        userSurname: req.session.surname,
        titleToDisplay: "View Your Profile",
        user: user
    });
}

exports.getUpdateAccountPage = async (req, res) => {
    let user = null; 

    if(req.session.isIndUser) {
        try {
            user = await IndUser.findOne({where: {id: req.session.userId}});
        } catch (error) {
            console.log(error);
            return res.redirect("/dashboard");
        }
    }

    if(req.session.isSystemUser) {
        try {
            user = await SystemUser.findOne({
                where: {
                    id: req.session.userId
                },
                include: [
                    {
                        model: Specialist,
                        attributes: ["name", "surname", "id", "email"]
                    },
                    {   
                        model: Centre,
                        attributes: ["name", "id", "email"]
                    }
                ]
            });
        } catch (error) {
            console.log(error);
            return res.redirect("/dashboard");
        }
    }

    if(req.session.isSpecialist) {
        try {
            user = await Specialist.findOne({
                where: {
                    id: req.session.userId
                },
                include: {
                    model: Centre,
                    attributes: ["name", "id", "email"]
                }
            });
        } catch (error) {
            console.log(error);
            return res.redirect("/dashboard");
        }
    }

    if(user == null) { return res.redirect("/dashboard"); }

    return res.render("dashboard/update-profile", {
        title: "Update Your Profile",
        isAdmin: req.session.isAdmin,
        isSpecialist: req.session.isSpecialist,
        isSystemUser: req.session.isSystemUser,
        isIndUser: req.session.isIndUser,
        userName: req.session.name,
        userSurname: req.session.surname,
        titleToDisplay: "Update Your Profile",
        user: user
    });
}

exports.updateUserDetails = async (req, res) => {
    let user = null;

    if(req.session.isIndUser) {
        try {
            user = await IndUser.findOne({where: {id: req.session.userId}});
        } catch (error) {
            console.log(error);
            return res.redirect("/dashboard");
        }
    }

    if(req.session.isSystemUser) {
        try {
            user = await SystemUser.findOne({
                where: {
                    id: req.session.userId
                },
                include: [
                    {
                        model: Specialist,
                        attributes: ["name", "surname", "id", "email"]
                    },
                    {   
                        model: Centre,
                        attributes: ["name", "id", "email"]
                    }
                ]
            });
        } catch (error) {
            console.log(error);
            return res.redirect("/dashboard");
        }
    }

    if(req.session.isSpecialist) {
        try {
            user = await Specialist.findOne({
                where: {
                    id: req.session.userId
                },
                include: {
                    model: Centre,
                    attributes: ["name", "id", "email"]
                }
            });
        } catch (error) {
            console.log(error);
            return res.redirect("/dashboard");
        }
    }

    if(user == null) { return res.redirect("/dashboard"); }

    try {
        if(req.body.userName != null) { user.name = req.body.userName; req.session.name = req.body.userName };
        if(req.body.userSurname != null) { user.surname = req.body.userSurname; req.session.surname = req.body.userSurname };
        if(req.body.userEmail != null) { user.email = req.body.userEmail; req.session.email = req.body.userEmail };
        if(req.body.userPhone != null) { user.telephone = req.body.userPhone };

        if(req.body.userPassword != null) {
            let hashedPass = await bcrypt.hash(req.body.userPassword, 14);
            user.password = hashedPass;
        }

        await user.save();
    } catch (error) {
        console.log(error);
        return res.redirect("/dashboard");
    }

    return res.redirect("/dashboard/account");
}

// Method used to destroy the session and log the user out
exports.logoutUser = async (req, res) => {
    try {
        await req.session.destroy();
        return res.redirect("/login");
    } catch(error) {
        console.log(error);
        return res.redirect("/dashboard?error=true"); 
    }
};