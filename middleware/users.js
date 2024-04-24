const { getUserPermissions } = require('../config/permissions');

function passUserToRoutes(req, res, next) {
    if (req.session.user) {
        res.locals.user = req.session.user;
        res.locals.user.permissions = getUserPermissions(res.locals.user.role);
    }
    next();
}

module.exports = {
    passUserToRoutes,
};