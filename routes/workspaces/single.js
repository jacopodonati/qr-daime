const express = require('express');
const router = express.Router();
const Workspace = require('../../models/workspace');
const Document = require('../../models/document');

router.get('/', async (req, res) => {
    res.redirect('/workspace/list');
});

router.get('/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const queryString = res.locals.user.permissions.manage_workspaces ? { _id: id } : {
            _id: id,
            deleted: false,
            $or: [
                {
                    members: {
                        $elemMatch: {
                            user: res.locals.user._id
                        }
                    }
                },
                {
                    privacy: 'public'
                }
            ]
        }
        const workspace = await Workspace.findOne(queryString);

        if (workspace) {
            await workspace.populate({
                path: 'members.user',
                select: 'email'
            });

            const documents = await Document.find({ workspace: id, deleted: false })
                .populate({
                    path: 'owner',
                    select: 'email'
                });

            res.render('workspaces/single', {
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

module.exports = router;
