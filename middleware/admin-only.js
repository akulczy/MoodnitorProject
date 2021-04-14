module.exports = (req, res, next) => {
    if(!(req.session.isAdmin)) {
        return res.redirect('/dashboard');
    }
    next();
};