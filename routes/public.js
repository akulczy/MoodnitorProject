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

// GET - get the error page
router.get("/auth/error", public.getAuthErrorPage);

// GET - get the email error page
router.get("/auth/email/error", public.getEmailErrorPage);

// GET - confirmation page
router.get("/auth/confirm/clinic", public.getClinicRegConfirmation);

// GET - confirmation page
router.get("/auth/confirm/ind", public.getIndRegConfirmation);

// GET - Account not found page
router.get("/auth/notfound", public.accountNotFoundPage);

// GET - Account not verified page
router.get("/auth/notverified", public.accountNotVerifiedPage);

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
