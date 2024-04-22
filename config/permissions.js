const permissions = {
    loggedout: {
        read_public: true,
        delete: false,
        edit: false,
        restore: false,
    },
    basic: {
        read_public: true,
        delete: true,
        restore: false,
    },
    admin: {
        read_public: true,
        read_everything: true,
        delete: true,
        restore: true,
        manage_users: true
    },
    god: {
        read_public: true,
        read_everything: true,
        delete: true,
        restore: true,
        manage_users: true,
        grant_permissions: true
    }
};

function getUserPermissions(role) {
    return permissions[role] || {}; // Se il ruolo non esiste, restituisci un oggetto vuoto
}

module.exports = {
    'permissions': permissions,
    'getUserPermissions': getUserPermissions
};
