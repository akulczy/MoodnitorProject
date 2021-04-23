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
    let dateTodayS =  moment(new Date()).format("DD/MM/YYYY");
    dateToday = new Date(dateTodayS);
    let noOfEntries, noOfEntriesTillNow, freq, specfreq;
    let daysActive = 0;
    let noOfUsers = 0;
    let noOfEntriesSpec = 0;
    let noOfEntriesTotal = 0;
    let timeperiod = [];
    let dataset = [];

    if(req.session.isIndUser || req.session.isSystemUser) {
        noOfEntries = await getEntriesFromToday(req.session.isIndUser, req.session.isSystemUser, req.session.userId);
        noOfEntriesTillNow = await getHowManyEntriesTillNow(req.session.isIndUser, req.session.isSystemUser, req.session.userId);
        freq = await getUserFrequency(req.session.isIndUser, req.session.isSystemUser, req.session.userId);
        if(freq.length >= 3) {
            timeperiod = freq[0];
            dataset = freq[1];
            daysActive = freq[2];
        }        
    }

    if(req.session.isSpecialist || req.session.isAdmin) {
        noOfUsers = await getNumberOfAssignedUsers(req.session.userId);
        noOfEntriesSpec = await getNumberOfEntriesTodaySpec(req.session.userId);
        specfreq = await getNumberOfEntriesTotalSpec(req.session.userId);
        if(specfreq.length >= 3) {
            timeperiod = specfreq[0];
            dataset = specfreq[1];
            noOfEntriesTotal = specfreq[2];
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
            dateToday: dateTodayS,
            noOfUsers: noOfUsers,
            noOfEntriesSpec: noOfEntriesSpec,
            noOfEntriesTotal: noOfEntriesTotal,
            dataset: JSON.stringify(dataset),
            timeperiod: JSON.stringify(timeperiod)
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
            dateToday: dateTodayS,
            noOfEntries: noOfEntries,
            noOfEntriesTillNow: noOfEntriesTillNow,
            timeperiod: JSON.stringify(timeperiod),
            dataset: JSON.stringify(dataset),
            daysActive: daysActive
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
            dateToday: dateTodayS,
            noOfEntries: noOfEntries,
            noOfEntriesTillNow: noOfEntriesTillNow,
            timeperiod: JSON.stringify(timeperiod),
            dataset: JSON.stringify(dataset),
            daysActive: daysActive
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
                        attributes: ["name", "surname", "id", "email", "telephone"]
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
    let emailuser = null;

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

    // If user is updating their email
    if(user.email != req.body.userEmail) {

        // Check that the email is unique
        try {
            emailuser = await Specialist.findOne({where: {email: req.body.userEmail}});
        } catch (error) {
            console.log(error);
            return res.redirect("/dashboard");
        }
    
        // Record exists in the database already
        if (emailuser != null) {
            return res.redirect("/dashboard/account?unique=false");
        } 
    
        try {
            emailuser = await SystemUser.findOne({where: {email: req.body.userEmail}});
        } catch (error) {
            console.log(error);
            return res.redirect("/dashboard");
        }
    
        if (emailuser != null) {
            return res.redirect("/dashboard/account?unique=false");
        } 
    
        try {
            emailuser = await IndUser.findOne({where: {email: req.body.userEmail}});
        } catch (error) {
            console.log(error);
            return res.redirect("/dashboard");
        }
    
        if (emailuser != null) {
            return res.redirect("/dashboard/account?unique=false");
        } 
    }

    try {
        if(req.body.userName != null && req.body.userName != "") { user.name = req.body.userName; req.session.name = req.body.userName };
        if(req.body.userSurname != null && req.body.userSurname != "") { user.surname = req.body.userSurname; req.session.surname = req.body.userSurname };
        if(req.body.userEmail != null && req.body.userEmail != "") { user.email = req.body.userEmail; req.session.email = req.body.userEmail };
        if(req.body.userPhone != null && req.body.userPhone != "") { user.telephone = req.body.userPhone };
        if(req.body.jobTitle != null && req.body.jobTitle != "") { user.title = req.body.jobTitle };

        if(req.body.userPassword != null && req.body.userPassword != "") {
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
    dateToday = new Date(dateToday);
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
    dateToday = new Date(dateToday);
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
    let daysActive = 0;
    let today = moment();
    let weekBefore = moment(today).subtract(6, "days");
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

    let dataset = [];
    let entry;
    if(isIndividualUser) {
        for(let tp of timeperiod) {
            tpd = new Date(tp);
            entry = await IndividualEntry.findAndCountAll({where: {IndividualUserId: userId, date: tpd}});
            if(entry.count != 0) {
                daysActive++;
            }
            dataset.push({
                x: tp,
                y: entry.count
            });
        }
    } else if(isSystemUser) {
        for(let tp of timeperiod) {
            tpd = new Date(tp);
            entry = await UserEntry.findAndCountAll({where: {SystemUserId: userId, date: tpd}});
            if(entry.count != 0) {
                daysActive++;
            }
            dataset.push({
                x: tp,
                y: entry.count
            });
        }
    }

    return [timeperiod, dataset, daysActive];    
}

const getNumberOfAssignedUsers = async (userId) => {
    let noOfUsers = 0;
    let users;

    try{
        users = await SystemUser.findAndCountAll({where: {SpecialistId: userId}});
        noOfUsers = users.count;
    } catch(error) {
        console.log(error);
        noOfUsers = 0;
    }

    return noOfUsers;
}

const getNumberOfEntriesTodaySpec = async (userId) => {
    let noOfEntries = 0;
    let entries;
    let today = moment().format('YYYY-MM-DD');
    today = new Date(today);

    try {
        entries = await UserEntry.findAndCountAll({where: {date: today}, include: {model: SystemUser, where: {SpecialistId: userId}, required: true}})
        noOfEntries = entries.count;
    } catch(error) {
        console.log(error);
        noOfEntries = 0;
    }

    return noOfEntries;
}

const getNumberOfEntriesTotalSpec = async (userId) => {
    let noOfEntries = 0;
    let today = moment();
    let weekBefore = moment(today).subtract(6, "days");
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

    let dataset = [];
    let entry;

    for(let tp of timeperiod) {
        tpd = new Date(tp);
        entry = await UserEntry.findAndCountAll({where: {date: tpd}, include: {model: SystemUser, where: {SpecialistId: userId}, required: true}});
        if(entry.count != 0) {
            noOfEntries += entry.count;
        }
        dataset.push({
            x: tp,
            y: entry.count
        });
    }

    return [timeperiod, dataset, noOfEntries];    
}

exports.getMoreInfoPage = (req, res) => {
    return res.render("dashboard/more-info", {
        title: "Emotion Classes",
        isAdmin: req.session.isAdmin,
        isSpecialist: req.session.isSpecialist,
        isSystemUser: req.session.isSystemUser,
        isIndUser: req.session.isIndUser,
        userName: req.session.name,
        userSurname: req.session.surname,
        titleToDisplay: "Emotion Classes"
    });
}