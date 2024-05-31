const express = require('express');
const router = express.Router();
const Workspace = require('../../models/workspace');
const i18n = require('i18n');

router.get('/', async (req, res) => {
    try {
        const queryString = res.locals.user.permissions.manage_workspaces ? {} : { privacy: 'public', deleted: false };
        const workspaces = await Workspace.find(queryString);
        
        res.render('workspaces/list', {
            title: i18n.__('workspace_list_title') + ' - ' + i18n.__('app_name'),
            workspaces
        });

    } catch (error) {
        console.error('Errore durante la query al database:', error);
        res.status(500).json({ error: 'Errore del server interno' });
    }
});

module.exports = router;
