const express = require('express');
const router = express.Router();
const User = require('../../models/user');
const Template = require('../../models/template');
const Workspace = require('../../models/workspace');
const Information = require('../../models/information');

router.get('/:id', async function(req, res, next) {
    try {
        const id = req.params.id;
        const queryString = res.locals.user.permissions.manage_documents ? {_id: id} : { _id: id, deleted: false, owner: res.locals.user._id };
        const template = await Template.findOne(queryString);
        
        if (template) {
            const workspaces = await Workspace.find({ 'members.user': res.locals.user._id });
            const fields = await Information.find({ deleted: false });
            res.render('templates/edit', {
                title: 'template_edit_title',
                template,
                workspaces,
                fields
            });
        } else {
            res.redirect('/template/list');
        }
    } catch (error) {
        console.error('Errore durante il recupero dei campi:', error);
        next(error);
    }
});

router.post('/', async (req, res) => {
    try {
        const { id, title, workspace, info } = req.body;

        const user = await User.findById(res.locals.user._id);
        let workspacesIds = [];
        if (user) {
            workspacesIds = user.workspaces.map(workspace => workspace._id);
        }
        let template;
        if (res.locals.user.permissions.manage_documents) {
            template = await Template.findOne({_id: id});
        } else {
            template = await Template.findOne({
                $or: [
                    { _id: id, deleted: false },
                    { $and: [{ $or: [{ owner: res.locals.user._id }, { workspace: { $in: workspacesIds } }] }] }
                ]
            });
        }
        
        if (template) {
            template.title = title;
            template.workspace = workspace;
            template.info = info;
            const savedTemplate = await template.save();
            res.status(201).json({ id: id });
        } else {
            res.status(404);
        }
    } catch (error) {
        console.error('Errore durante il salvataggio del template:', error);
        res.status(500).json({ error: 'Errore durante il salvataggio del template' });
    }
});

module.exports = router;
