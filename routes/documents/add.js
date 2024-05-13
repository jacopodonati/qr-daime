const express = require('express');
const router = express.Router();
const i18n = require('i18n');
const Document = require('../../models/document');
const Information = require('../../models/information');
const Workspace = require('../../models/workspace');
const Template = require('../../models/template');
const { getQRCodeString, getQRDocumentContent } = require('../../qr');

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
                title: i18n.__('add_doc_title') + ' - ' + i18n.__('app_name'),
                templates
            });
        } catch (error) {
            console.error('Errore durante il recupero dei campi:', error);
            next(error);
        }
    } else {
        try {
            const fields = await Information.find({});
            const workspaces = await Workspace.find({ 'members.user': res.locals.user.id });
            let template = {};
            if (req.query.template !== '') {
                template = await Template.findOne({ _id: req.query.template, deleted: false});
            }

            res.render('documents/add', {
                title: i18n.__('add_doc_title') + ' - ' + i18n.__('app_name'),
                locale: req.getLocale(),
                fallbackLocale: i18n.getLocale(),
                fields,
                workspaces,
                template
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
            owner: res.locals.user.id,
            workspace: formData['workspace'],
            information: fields
        });

        const savedDocument = await newDocument.save();
        
        if (savedDocument) {
            let doc = await getQRDocumentContent(savedDocument);
            let qrDoc = await getQRCodeString(doc);
            let qrUrl = await getQRCodeString(getDocLink(savedDocument._id));
            const updatedDocument = await Document.findByIdAndUpdate(savedDocument._id, {
                qrDocument: qrDoc,
                qrUrl: qrUrl 
            }, { new: true });
            return res.status(201).json({ updatedDocument });
        }
    } catch (error) {
        console.error('Errore durante il salvataggio del documento:', error);
        res.status(500).json({ error: 'Errore interno del server' });
    }
});

module.exports = router;
