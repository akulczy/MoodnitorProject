module.exports = (req, res, next) => {
    if(!(req.session.isSpecialist)) {
        return res.redirect('/dashboard');
    }
    next();
};