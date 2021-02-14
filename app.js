// NPM Packages used in the application
const express = require("express");
// Dotenv package - to store the environmental variables 
const dotenv = require("dotenv").config();
const fs = require("fs");
const bodyparser = require("body-parser");
const path = require("path");
const cookieparser = require("cookie-parser");

// Database connection, using Sequelize ORM
const sequelizedb = require("./conn/db");

// NPM Package used to initialize session
const session = require("express-session");
const sequelizeStore = require("connect-session-sequelize")(session.Store);

// Middleware is used to check whether the user is logged in or not
const loggedIn = require("./middleware/login-detect");
const loggedOut = require("./middleware/logout-detect");

// Router - for logged out and logged in users
const loggedOutRoutes = require("./routes/public");
const loggedInRoutes = require("./routes/private");

// Models (Model View Controller Design Pattern used)
const Centre = require("./models/centre");
const Specialist = require("./models/specialist");
const Patient = require("./models/patient");
const VerificationString = require("./models/verification");
const IndividualUser = require("./models/individualuser");
const IndividualEntry = require("./models/individualentry");

const app = express();
app.set("view engine", "ejs");
app.set("views", "views");

// Middleware that uses body-parser or multer to parse the key-value pairs from the incoming request
app.use(bodyparser.urlencoded({extended: false}));

// To expose the files in the "public" folder and grant the READ access to stylesheets, media and scripts
app.use(express.static(path.join(__dirname, 'public')));

// Session
let initsession = {
    secret: "finalyearprojectapplicationxxxhhhgeraltyyyinit", 
    resave: false, 
    proxy: true,
    saveUninitialized: false,
    store: new sequelizeStore({
        db: sequelizedb,
        tableName: "Sessions"
    }),
    cookie: {},
    rolling: true
};

// Max age of the session is 24hr (user logged out after 24hr)
initsession.cookie.maxAge = 24 * 60 * 60 * 1000;

app.use(cookieparser());

app.use(
    session(initsession)
);

app.use("/dashboard", loggedOut, loggedInRoutes);
app.use("/", loggedIn, loggedOutRoutes);

// Associations
Specialist.belongsTo(Centre);
Patient.belongsTo(Centre);
Patient.belongsTo(Specialist);
VerificationString.belongsTo(Centre);
IndividualEntry.belongsTo(IndividualUser);

process.on("uncaughtException", (error) => {
    console.log("UncaughtException:" + " " + error.message);
    console.error(error.stack);
    // Exit the process in case of an error
    process.exit(1)
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
});

/*sequelizedb.sync({force:true})
    .then(result => {
        app.listen(PORT);
    })
    .catch(error => {
        console.log(error);
    });*/