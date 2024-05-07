const express = require('express');
const router = express.Router();
const i18n = require('i18n');
const Workspace = require('../../models/workspace');
const User = require('../../models/user');

router.get('/', async function(req, res, next) {
    if (!res.locals.user.permissions.create) {
        return res.status(403).send('Operazione non consentita');
    }
    res.render('workspaces/add', {
        title: i18n.__('add_workspace_title') + ' - ' + i18n.__('app_name')
    });
});

router.post('/', async (req, res) => {
    if (!res.locals.user.permissions.create) {
        return res.status(403).send('Operazione non consentita');
    }
    try {
        const newWorkspace = new Workspace({
            name: req.body.name,
            public: typeof req.body.privacy !== 'undefined' ? true : false,
            members: [{
                role: 'workspace_admin',
                user: res.locals.user.id
            }],
        });

        const savedWorkspace = await newWorkspace.save();
        
        if (savedWorkspace) {
            const owner = await User.findById(res.locals.user.id);
            owner.workspaces.push(savedWorkspace._id);
            await owner.save();
            return res.status(201).json({ savedWorkspace });
        }
    } catch (error) {
        console.error('Errore durante il salvataggio del documento:', error);
        res.status(500).json({ error: 'Errore interno del server' });
    }
});

module.exports = router;