const express = require('express');
const router = express.Router();
const Workspace = require('../../models/workspace');
const mongoose = require('mongoose');

router.get('/', async (req, res) => {
    try {
        let workspaces;
        if (res.locals.user.permissions.manage_workspaces) {
            workspaces = await Workspace.find({});
        } else {
            workspaces = await Workspace.aggregate([
                {
                    $match: {
                        $and: [
                            { deleted: false },
                            {
                                $or: [
                                    { privacy: 'public' },
                                    { 'members.user': new mongoose.Types.ObjectId(res.locals.user._id) }
                                ]
                            }
                        ]
                    }
                }
            ]);
        }

        res.render('workspaces/list', {
            title: 'workspace_list_title',
            workspaces
        });

    } catch (error) {
        console.error('Errore durante la query al database:', error);
        res.status(500).json({ error: 'Errore del server interno' });
    }
});

module.exports = router;
