module.exports = (req, res, next) => {
    if(!(req.session.isSystemUser || req.session.isIndUser)) {
        return res.redirect('/dashboard');
    }
    next();
};