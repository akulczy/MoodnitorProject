const express = require("express");
const router = express.Router();
const public = require("../controllers/public");
const auth = require("../controllers/login-session");

// GET - get the registration page for clinics
router.get("/register", public.getClinicRegistrationPage);

// GET - get the registration page for individual users
router.get("/register/user", public.getInividualUserRegistrationPage);

// POST - register individual user
router.post("/register/create/user", public.registerIndividualUser);

// GET - get the registration page for clinics
router.get("/register/options", public.getChooseRegistrationPage);

// POST - submit the clinic's registration 
router.post("/register-clinic", public.registerClinicAndAdmin);

// GET - get the login page for specialists
router.get("/specialist/login", public.getSpecialistLoginPage);

// GET - verify the clinic
router.get("/verify/:verId", public.verifyRegistratrion);

// POST - login the user (specialist)
router.post("/specialist/login", auth.specialistLogIn);

// USE - get the main page
router.use(public.getMainPage);

module.exports = router;
