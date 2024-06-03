const express = require('express');
const router = express.Router();
const Template = require('../../models/template');
const User = require('../../models/user');
const i18n = require('i18n');

router.get('/:id', async (req, res) => {
    try {
        const id = req.params.id;
        let template;
        if (res.locals.user.permissions.manage_documents) {
            template = await Template.findOne({_id: id});
        } else {
            template = await Template.findOne({ _id: id, deleted: false, owner: res.locals.user.id });
        }

        if (template) {
            await template.populate('info owner workspace');

            res.render('templates/delete', {
                title: i18n.__("template_view_title") + ': ' + template.name + ' - ' + i18n.__('app_name'),
                template
            });
        } else {
            res.redirect('/templates/list');
        }
    } catch (error) {
        console.error('Error querying database:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.post('/:id', async (req, res) => {
    const id = req.params.id;

    try {
        const user = await User.findById(res.locals.user.id);
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
                    { $and: [{ $or: [{ owner: res.locals.user.id }, { workspace: { $in: workspaces } }] }] }
                ]
            });
        }

        if (template) {
            template.set('deleted', true);
            await template.save();
            res.redirect('/template/list');
        } else {
            res.status(404).json({ error: 'Template non trovato' });
        }
    } catch (error) {
        console.error('Errore nella cancellazione del template:', error);
        res.status(500).json({ error: 'Errore del server interno' });
    }
});

module.exports = router;
