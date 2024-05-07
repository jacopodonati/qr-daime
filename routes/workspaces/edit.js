const express = require('express');
const router = express.Router();
const i18n = require('i18n');
const Workspace = require('../../models/workspace');

router.use(express.json());

router.get('/:id', async (req, res) => {
    if (!res.locals.user.permissions.edit) {
      return res.redirect('/doc/list')
    }

    try {
        const id = req.params.id;

        let workspace;
        
        if (res.locals.user.permissions.manage_workspaces) {
            workspace = await Workspace.findOne({_id: id, privacy: { $ne: 'personal' }});
        } else {
            workspace = await Workspace.findOne({
                _id: id,
                deleted: false,
                members: {
                    user: res.locals.user.id,
                    role: 'workspace_admin'
                },
                privacy: { $ne: 'personal' }
            });
        }

        if (!workspace) {
            return res.redirect('/');
        }

        res.render('workspaces/edit', {
            title: i18n.__('edit_workspace_title') + ' ' + id + ' - ' + i18n.__('app_name'),
            workspace
        });
    } catch (error) {
        console.error('Error retrieving workspace from the database:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.post('/:id', async (req, res) => {
    const id = req.params.id;

    try {        
        let workspace;
        if (res.locals.user.permissions.manage_workspaces) {
            workspace = await Workspace.findOne({_id: id, privacy: { $ne: 'personal' }});
        } else {
            workspace = await Workspace.findOne({
                _id: id,
                deleted: false,
                members: {
                    user: res.locals.user.id,
                    role: 'workspace_admin'
                },
                privacy: { $ne: 'personal' }
            });
        }

        if (workspace) {
            workspace.set('name', req.body.name);
            workspace.set('privacy', typeof req.body.privacy !== 'undefined' ? 'public' : 'private');
            let updatedWorkspace = await workspace.save();
            return res.status(200).json({ updatedWorkspace });
        } 
    } catch (error) {
        console.error('Error updating document in the database:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = router;
