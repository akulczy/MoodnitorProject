const Specialist = require("../models/specialist");
const Patient = require("../models/patient");
const Centre = require("../models/centre");

let moment = require("moment");

exports.getSpecialistDashboard = (req, res) => {
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