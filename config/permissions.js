const permissions = {
    loggedout: {
        read_public: true
    },
    basic: {
        read_public: true,
        create: true,
        delete: true,
        edit: true
    },
    admin: {
        __extend: ['basic'],
        read_any: true,
        edit_any: true,
        delete_any: true,
        manage_users: true
    },
    god: {
        __extend: ['admin'],
        grant_permissions: true
    }
};

function getUserPermissions(role) {
    const userPermissions = {};
    let currentRole = role;

    while (permissions[currentRole]) {
        const rolePermissions = permissions[currentRole];
        Object.assign(userPermissions, rolePermissions);
        currentRole = rolePermissions.__extend ? rolePermissions.__extend[0] : undefined;
    }

    return userPermissions;
}

function getRoles() {
    return Object.keys(permissions);
}

module.exports = {
    permissions,
    getUserPermissions,
    getRoles
};
