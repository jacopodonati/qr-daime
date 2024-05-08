const express = require('express');
const router = express.Router();
const User = require('../../models/user');
const Workspace = require('../../models/workspace');

router.get('/:id', async (req, res) => {
    if (res.locals.user.permissions.manage_workspaces) {
        try {
            const workspace = await Workspace.findById(req.params.id);
            
            if (workspace) {
                const memberIds = workspace.members.map(member => member.user);
                console.log(memberIds)
                await User.updateMany({ _id: { $in: memberIds } }, { $addToSet: { 'workspaces': workspace._id } })
                workspace.deleted = false;
                await workspace.save();
                res.redirect('/workspace/list');
            } else {
                res.status(404).json({ error: 'Workspace non trovato' });
            }
        } catch (error) {
            console.error('Errore nel ripristino del workspace:', error);
            res.status(500).json({ error: 'Errore del server interno' });
        }
    } else {
        res.redirect('/doc/list');
    }
});

module.exports = router;
