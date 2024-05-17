const express = require('express');
const router = express.Router();
const i18n = require('i18n');
const User = require('../../models/user');
const Workspace = require('../../models/workspace');

router.get('/', async (req, res) => {
    try {
        const ownProfile = await User.findById(res.locals.user.id);
        if (ownProfile) {
            await ownProfile.populate('workspaces');
            res.render('users/personal_profile', {
                title: i18n.__('user_profile_title') + ' - ' + i18n.__('app_name'),
                ownProfile
            });
        } else {
            res.status(404).json({});
        }
    } catch (error) {
        console.error('Errore durante il recupero dell\'utente:', error);
        res.status(500).json({ error: 'Errore durante il recupero dell\'utente' });
    }
});

router.post('/', async (req, res) => {
    console.log('normale')
    try {
        const updatedUser = await User.findByIdAndUpdate(res.locals.user.id, req.body, { new: true });
        if (updatedUser) {
            return res.status(200).json({ updatedUser });
        }
    } catch (error) {
        console.error('Error updating document in the database:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.post('/leave', async (req, res) => {
    try {
        const workspaceId = req.body.workspace_id;
        const updatedUser = await User.findByIdAndUpdate(
            res.locals.user.id,
            { $pull: { workspaces: workspaceId } },
            { new: true }
        );
        const updatedWorkspace = await Workspace.findByIdAndUpdate(
            workspaceId,
            { $pull: { members: { user: res.locals.user.id } } },
            { new: true }
        );
        
        if (updatedUser && updatedWorkspace) {
            res.status(200).json({'id': workspaceId});
        } else {
            res.status(404).json({ error: 'Documents not found' });
        }
    } catch (error) {
        console.error('Error updating document in the database:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = router;
