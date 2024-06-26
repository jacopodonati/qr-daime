const express = require('express');
const router = express.Router();
const Workspace = require('../../models/workspace');
const User = require('../../models/user');
const Document = require('../../models/document');
const i18n = require('i18n');

router.get('/:id', async (req, res) => {
    const id = req.params.id;
        
    try {
        let workspace;
        if (res.locals.user.permissions.manage_workspaces) {
            workspace = await Workspace.findOne({_id: id});
        } else {
            workspace = await Workspace.findOne({
                _id: id,
                deleted: false,
                members: {
                    user: res.locals.user._id,
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

            const documents = await Document.find({ workspace: workspace._id, deleted: false })
                .populate({
                    path: 'owner',
                    select: 'email'
                });
            res.render('workspaces/delete', {
                title: 'workspace_view_title',
                workspace,
                documents
            });
        } else {
            res.redirect('/workspace/list');
        }
    } catch (error) {
        console.error('Error querying database:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.post('/:id', async (req, res) => {
    const id = req.params.id;

    try {
        let workspace;
        if (res.locals.user.permissions.manage_workspaces) {
            workspace = await Workspace.findOne({_id: id});
        } else {
            workspace = await Workspace.findOne({
                _id: id,
                deleted: false,
                members: {
                    user: res.locals.user._id,
                    role: 'workspace_admin'
                },
                privacy: { $ne: 'personal' }
            });
        }

        if (workspace) {
            await User.updateMany({ 'workspaces': workspace._id}, { $pull: { 'workspaces': workspace._id } });
            const documents = await Document.find({ workspace: workspace._id });

            for (const document of documents) {
                const owner = await User.findById(document.owner);
                const personalWorkspace = await Workspace.findOne({ name: owner.email, privacy: 'personal' }, '_id');
                document.workspace = personalWorkspace._id;
                await document.save();
            }

            workspace.set('deleted', true);
            await workspace.save();
            res.redirect('/workspace/list');
        } else {
            res.status(404).json({ error: 'Workspace non trovato' });
        }
    } catch (error) {
        console.error('Errore nella cancellazione del workspace:', error);
        res.status(500).json({ error: 'Errore del server interno' });
    }
});

module.exports = router;
