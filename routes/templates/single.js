const express = require('express');
const router = express.Router();
const Template = require('../../models/template');
const User = require('../../models/user');
const i18n = require('i18n');

router.get('/', async (req, res) => {
    res.redirect('/template/list');
});

router.get('/:id', async (req, res) => {
    const id = req.params.id;
    try {
        const user = await User.findById(res.locals.user._id);
        let workspaces = [];
        if (user) {
            workspaces = user.workspaces.map(workspace => workspace._id);
        }
        let template;
        if (res.locals.user.permissions.manage_documents) {
            template = await Template.findOne({_id: id});
        } else {
            template = await Template.findOne({
                $or: [
                    { _id: id, deleted: false },
                    { $and: [{ $or: [{ owner: res.locals.user._id }, { workspace: { $in: workspaces } }] }] }
                ]
            });
        }

        if (template) {
            await template.populate('info owner workspace');

            res.render('templates/single', {
                title: i18n.__("template_view_title") + ': ' + template.title + ' - ' + i18n.__('app_name'),
                template
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
