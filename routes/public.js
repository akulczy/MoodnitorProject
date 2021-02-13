const express = require("express");
const router = express.Router();
const public = require("../controllers/public");
const auth = require("../controllers/login-session");

// GET - get the registration page for ccentres
router.get("/register/centre", public.getClinicRegistrationPage);

// GET - get the registration page for individual users
router.get("/register/user", public.getInividualUserRegistrationPage);

// POST - register individual user
router.post("/register/create/user", public.registerIndividualUser);

// GET - get the registration page 
router.get("/register", public.getChooseRegistrationPage);

// GET - get the login page
router.get("/login", public.getChooseLoginPage);

// POST - submit the clinic's registration 
router.post("/register-clinic", public.registerClinicAndAdmin);

// GET - verify the clinic
router.get("/verify/:verId", public.verifyRegistratrion);

// GET - get the login page for specialists
router.get("/login/centre", public.getSpecialistLoginPage);

// POST - login the user (specialist)
router.post("/specialist/login", auth.centreLogin);

// GET - get the login page for system users
router.get("/login/user", public.getIndUserLoginPage);

// POST - login the user (system user)
router.post("/induser/login", auth.indUserLogin);

// USE - get the main page
router.use(public.getMainPage);

module.exports = router;
