const express = require('express');
const router = express.Router();
const Template = require('../../models/template');

router.get('/', async (req, res) => {
    try {
        let templates;
        if (res.locals.user.permissions.manage_documents) {
            templates = await Template.find({})
            .populate({
                path: 'owner',
                select: '_id username'
            })
            .populate({
                path: 'workspace',
                select: 'privacy name'
            });
        } else {
            templates = await Template.aggregate([
                { 
                    $match: 
                        { $and:
                            [
                                { deleted: false },
                                { $or: 
                                    [
                                        { owner: res.locals.user._id },
                                        { workspace: { $exists: true } }
                                    ] 
                                }
                            ]
                        }
                    },
                {
                    $lookup: {
                        from: 'workspaces',
                        localField: 'workspace',
                        foreignField: '_id',
                        as: 'workspaceDetails'
                    }
                },
                { $unwind: '$workspaceDetails' },
                {
                    $lookup: {
                        from: 'users',
                        localField: 'owner',
                        foreignField: '_id',
                        as: 'ownerDetails'
                    }
                },
                { $unwind: '$ownerDetails' },
                {
                    $match: {
                        $or: [
                            { 'workspaceDetails.members.user': res.locals.user._id },
                            { 'workspaceDetails.privacy': 'public' }
                        ]
                    }
                },
                {
                    $project: {
                        _id: 1,
                        owner: {
                            _id: '$ownerDetails._id',
                            username: '$ownerDetails.username'
                        },
                        'workspace._id': '$workspaceDetails._id',
                        'workspace.name': '$workspaceDetails.name',
                        'workspace.privacy': '$workspaceDetails.privacy',
                        title: 1
                    }
                }
            ]
            );
        }

        res.render('templates/list', {
            title: 'template_list_title',
            templates
        });

    } catch (error) {
        console.error('Errore durante la query al database:', error);
        res.status(500).json({ error: 'Errore del server interno' });
    }
});

module.exports = router;
