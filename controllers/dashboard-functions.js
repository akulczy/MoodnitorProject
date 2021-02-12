const Specialist = require("../models/specialist");
const Patient = require("../models/patient");
const Centre = require("../models/centre");

let moment = require("moment");

exports.getSpecialistDashboard = (req, res) => {
    let dateToday =  moment(new Date()).format("DD/MM/YYYY");

    if(req.session.isSpecialist) {
        res.render("dashboard/specialist-dashboard", {
            title: "Dashboard",
            isAdmin: req.session.isAdmin,
            isSpecialist: req.session.isSpecialist,
            userName: req.session.name,
            userSurname: req.session.surname,
            titleToDisplay: "Dashboard",
            dateToday: dateToday
        });
    }
}

// Method used to destroy the session and log the user out
exports.logoutUser = async (req, res) => {
    console.log("HEJ")
    try {
        await req.session.destroy();
        return res.redirect("/specialist/login");
    } catch(error) {
        console.log(error);
        return res.redirect("/dashboard?error=true"); 
    }
};