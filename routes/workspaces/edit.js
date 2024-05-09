const express = require('express');
const router = express.Router();
const i18n = require('i18n');
const Workspace = require('../../models/workspace');
const User = require('../../models/user');

const getRoles = async () => {
    try {
        const schema = Workspace.schema;
        const enumValues = schema.path('members.role').enumValues;
        let roles = [];
        for (const value of enumValues) {
            const roleLabel = 'edit_workspace_role_' + value
            roles.push({
                value: value,
                label: i18n.__(roleLabel)
            });
        }
        return roles;
    } catch (error) {
        console.error('Errore durante il recupero dei ruoli:', error);
        return [];
    }
};

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

        if (workspace) {
            await workspace.populate({
                path: 'members.user',
                select: 'email'
            });
            res.render('workspaces/edit', {
                title: i18n.__('edit_workspace_title') + ' ' + id + ' - ' + i18n.__('app_name'),
                workspace,
                roles: await getRoles()
            });
        } else {
            res.redirect('/');
        }
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
            const members = req.body.members;
            workspace.members = []
            for (member of members) {
                console.log(member)
                await User.findByIdAndUpdate({ _id: member.id }, { $addToSet: { workspaces: workspace._id } });
                workspace.members.push({ user: member.id, role: member.role });
            }
            let updatedWorkspace = await workspace.save();
            return res.status(200).json({ updatedWorkspace });
        } 
    } catch (error) {
        console.error('Error updating document in the database:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = router;
