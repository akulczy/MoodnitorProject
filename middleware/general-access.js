module.exports = (req, res, next) => {
    if(!(req.session.isSpecialist || req.session.isAdmin || req.session.isSystemUser || req.session.isIndUser)) {
        return res.redirect('/dashboard');
    }
    next();
};