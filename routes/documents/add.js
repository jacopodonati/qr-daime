const express = require('express');
const router = express.Router();
const i18n = require('i18n');
const Document = require('../../models/document');
const Information = require('../../models/information');
const Workspace = require('../../models/workspace');
const Template = require('../../models/template');
const User = require('../../models/user');

function getDocLink(id) {
    return process.env.DOMAIN + '/doc/' + id
}

router.get('/', async function(req, res, next) {
    if (!res.locals.user.permissions.create) {
        return res.status(403).send('Operazione non consentita');
    }

    if (typeof req.query.template === 'undefined') {
        try {
            const templates = await Template.find({ 'deleted': false });
            
            res.render('documents/select_template', {
                title: 'add_doc_title',
                templates
            });
        } catch (error) {
            console.error('Errore durante il recupero dei campi:', error);
            next(error);
        }
    } else {
        try {
            const fields = await Information.find({});
            const workspaces = await Workspace.find({ 'members.user': res.locals.user._id });
            const user = await User.findById(res.locals.user._id);
            let template = {};
            if (req.query.template !== '') {
                template = await Template.findOne({ _id: req.query.template, deleted: false});
            }

            res.render('documents/add', {
                title: 'add_doc_title',
                locale: req.getLocale(),
                fallbackLocale: i18n.getLocale(),
                fields,
                workspaces,
                template,
                defaultWorkspace: user.default_workspace
            });
        } catch (error) {
            console.error('Errore durante il recupero dei campi:', error);
            next(error);
        }
    }
});

router.post('/', async (req, res) => {
    if (!res.locals.user.permissions.create) {
        return res.status(403).send('Operazione non consentita');
    }

    try {
        const formData = req.body;
        const fields = formData['fields'].map(formData => {
            const fieldData = formData.fields.map(field => ({
                _id: field._id,
                value: field.value
            }));

            return {
                _id: formData._id,
                public: formData.public,
                fields: fieldData
            };
        });

        const newDocument = new Document({
            owner: res.locals.user._id,
            workspace: formData['workspace'],
            information: fields
        });

        const savedDocument = await newDocument.save();
        
        if (savedDocument) {
            return res.status(201).json({ updatedDocument });
        }
    } catch (error) {
        console.error('Errore durante il salvataggio del documento:', error);
        res.status(500).json({ error: 'Errore interno del server' });
    }
});

module.exports = router;
