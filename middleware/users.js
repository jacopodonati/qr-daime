const { getUserPermissions } = require('../config/permissions');

function passUserToRoutes(req, res, next) {
    if (req.session.user) {
        res.locals.user = req.session.user;
    }
    next();
}

function passPermissionsToViews(req, res, next) {
    if (req.session.user) {
        const userPermissions = getUserPermissions(req.session.user.role);
        res.locals.userPermissions = userPermissions;
    } else {
        res.locals.userPermissions = false;
    }

    next();
}

module.exports = {
    'passUserToRoutes': passUserToRoutes,
    'passPermissionsToViews': passPermissionsToViews
};