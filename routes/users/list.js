const express = require('express');
const router = express.Router();
const i18n = require('i18n');
const User = require('../../models/user');
const { getRoles } = require('../../config/permissions');

router.get('/', async (req, res) => {
    if (res.locals.user.permissions.manage_users) {
        try {
            const users = await User.find({});
            
            res.render('users/list', {
                title: i18n.__('user_list_title') + ' - ' + i18n.__('app_name'),
                users, 
                roles: getRoles()
            });
            
        } catch (error) {
            console.error('Errore durante la query al database:', error);
            res.status(500).json({ error: 'Errore del server interno' });
        }
    } else {
        return res.status(403).send('Not allowed');
    }
});

module.exports = router;
