const express = require('express');
const router = express.Router();
const Document = require('../../models/document');
const User = require('../../models/user');
const i18n = require('i18n');

router.get('/', async (req, res) => {
    try {
        let documents;
        if (res.locals.user.permissions.manage_documents) {
            documents = await Document.find({})
                .populate({ path: 'workspace', select: 'privacy name'})
                .populate({ path: 'owner', select: 'username'});
        } else {
            const user = await User.findById(res.locals.user._id).populate({ path: 'workspaces', select: 'id' }).exec();
            let userWorkspaceIds = [];
            if (user) {
                userWorkspaceIds = user.workspaces.map(ws => ws._id);
            }
            documents = await Document.aggregate([
                {
                    $lookup: {
                        from: 'workspaces',
                        localField: 'workspace',
                        foreignField: '_id',
                        as: 'workspaceDetails'
                    }
                },
                {
                    $unwind: '$workspaceDetails'
                },
                {
                    $lookup: {
                        from: 'users',
                        localField: 'owner',
                        foreignField: '_id',
                        as: 'ownerDetails'
                    }
                },
                {
                    $unwind: '$ownerDetails'
                },
                {
                    $match: {
                        $and: [
                            {
                                deleted: false
                            },
                            {
                                $or: [
                                    { owner: res.locals.user._id },
                                    { 'workspaceDetails._id': { $in: userWorkspaceIds } },
                                    { 'workspaceDetails.privacy': 'public' }
                                ]
                            }
                        ]
                    }
                },
                {
                    $project: {
                        _id: 1,
                        dateOfIssue: 1,
                        lastEdit: 1,
                        'ownerDetails.username': 1,
                        'ownerDetails._id': 1,
                        information: 1,
                        'workspaceDetails._id': 1,
                        'workspaceDetails.name': 1,
                        'workspaceDetails.privacy': 1
                    }
                },
                {
                    $addFields: {
                        'workspace._id': '$workspaceDetails._id',
                        'workspace.name': '$workspaceDetails.name',
                        'workspace.privacy': '$workspaceDetails.privacy',
                        'owner.id': '$ownerDetails._id',
                        'owner.username': '$ownerDetails.username',
                    }
                },
                {
                    $project: {
                        workspaceDetails: 0,
                        ownerDetails: 0
                    }
                }
            ]);
        }
        
        res.render('documents/list', {
            title: i18n.__('listpage_title') + ' - ' + i18n.__('app_name'),
            documents
        });

    } catch (error) {
        console.error('Errore durante la query al database:', error);
        res.status(500).json({ error: 'Errore del server interno' });
    }
});

module.exports = router;
