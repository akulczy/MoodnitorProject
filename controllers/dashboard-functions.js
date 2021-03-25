const Specialist = require("../models/specialist");
const SystemUser = require("../models/systemuser");
const IndUser = require("../models/individualuser");
const Centre = require("../models/centre");

const IndividualEntry = require("../models/individualentry");
const UserEntry = require("../models/userentry");

// To encrypt the passwords
const bcrypt = require("bcryptjs");
let moment = require("moment");
const { Op } = require("sequelize"); 

exports.getDashboard = async (req, res) => {
    let dateToday =  moment(new Date()).format("DD/MM/YYYY");
    let noOfEntries, noOfEntriesTillNow, freq;
    let timeperiod = [];
    let dataset = [];

    if(req.session.isIndividualUser || req.session.isSystemUser) {
        noOfEntries = await getEntriesFromToday(req.session.isIndividualUser, req.session.isSystemUser, req.session.userId);
        noOfEntriesTillNow = await getHowManyEntriesTillNow(req.session.isIndividualUser, req.session.isSystemUser, req.session.userId);
        freq = await getUserFrequency(req.session.isIndividualUser, req.session.isSystemUser, req.session.userId);
        if(freq.length == 2) {
            timeperiod = freq[0];
            dataset = freq[1];
        }        
    }

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
            dateToday: dateToday,
            noOfEntries: noOfEntries,
            noOfEntriesTillNow: noOfEntriesTillNow,
            timeperiod: JSON.stringify(timeperiod),
            dataset: JSON.stringify(dataset)
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
            dateToday: dateToday,
            noOfEntries: noOfEntries,
            noOfEntriesTillNow: noOfEntriesTillNow,
            timeperiod: JSON.stringify(timeperiod),
            dataset: JSON.stringify(dataset)
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
        if(req.body.userName != null || req.body.userName != "") { user.name = req.body.userName; req.session.name = req.body.userName };
        if(req.body.userSurname != null || req.body.userSurname != "") { user.surname = req.body.userSurname; req.session.surname = req.body.userSurname };
        if(req.body.userEmail != null || req.body.userEmail != "") { user.email = req.body.userEmail; req.session.email = req.body.userEmail };
        if(req.body.userPhone != null || req.body.userPhone != "") { user.telephone = req.body.userPhone };

        if(req.body.userPassword != null || req.body.userPassword != "") {
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

const getEntriesFromToday = async (isIndividualUser, isSystemUser, userId) => {
    let dateToday =  moment(new Date()).format("YYYY-MM-DD");
    let noOfEntries = 0;

    if(isIndividualUser) {
        try{
            noOfEntries = await IndividualEntry.findAndCountAll({where: {IndividualUserId: userId, date: dateToday}});
        } catch(error) {
            console.log(error);
            noOfEntries = 0;
        }
    } else if(isSystemUser) {
        try{
            noOfEntries = await UserEntry.findAndCountAll({where: {SystemUserId: userId, date: dateToday}});
        } catch(error) {
            console.log(error);
            noOfEntries = 0;
        }
    }

    return noOfEntries.count;
}

const getHowManyEntriesTillNow = async (isIndividualUser, isSystemUser, userId) => {
    let dateToday =  moment(new Date()).format("YYYY-MM-DD");
    let noOfEntries = 0;

    if(isIndividualUser) {
        try{
            noOfEntries = await IndividualEntry.findAndCountAll({where: {IndividualUserId: userId, date: {[Op.lte]: dateToday}}});
        } catch(error) {
            console.log(error);
            noOfEntries = 0;
        }
    } else if(isSystemUser) {
        try{
            noOfEntries = await UserEntry.findAndCountAll({where: {SystemUserId: userId, date: {[Op.lte]: dateToday}}});
        } catch(error) {
            console.log(error);
            noOfEntries = 0;
        }
    }

    return noOfEntries.count;
}

const getUserFrequency = async (isIndividualUser, isSystemUser, userId) => {
    let entries = [];
    let today = moment();
    let weekBefore = moment(today).subtract(7, "days");
    today = today.format('YYYY-MM-DD');
    weekBefore = weekBefore.format('YYYY-MM-DD');

    let timeperiod = [];
    let start = new Date(weekBefore);
    let end = new Date(today);

    while(start <= end){
        timeperiod.push(moment(start).format('YYYY-MM-DD'));
        let newDate = start.setDate(start.getDate() + 1);
        start = new Date(newDate);  
    }

    if(isIndividualUser) {
        try{
            entries = await IndividualEntry.findAll({where: {IndividualUserId: userId, date: {[Op.gte]: weekBefore, [Op.lte]: today}, order: [["date", "ASC"]]}});
        } catch(error) {
            console.log(error);
        }
    } else if(isSystemUser) {
        try{
            entries = await UserEntry.findAll({where: {SystemUserId: userId, date: {[Op.gte]: weekBefore, [Op.lte]: today}, order: [["date", "ASC"]]}});
        } catch(error) {
            console.log(error);
        }
    }

    let dataset = [];
    let entry;
    if(isIndividualUser) {
        for(let tp of timeperiod) {
            entry = await IndividualEntry.findAndCountAll({where: {IndividualUserId: userId, date: tp}});
            dataset.push({
                x: tp,
                y: entry.count
            });
        }
    } else if(isSystemUser) {
        for(let tp of timeperiod) {
            entry = await UserEntry.findAndCountAll({where: {SystemUserId: userId, date: tp}});
            dataset.push({
                x: tp,
                y: entry.count
            });
        }
    }

    return [timeperiod, dataset];    
}