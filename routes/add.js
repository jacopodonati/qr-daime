const express = require('express');
const router = express.Router();
const i18n = require('i18n');
const Document = require('../models/document');
const { getQRCodeString, getQRDocumentContent } = require('../qr');

function getDocLink(id) {
    return process.env.DOMAIN + '/doc/' + id
}

router.get('/', async function(req, res, next) {
    try {
        res.render('add', {
            title: i18n.__('add_doc_title') + ' - ' + i18n.__('app_name'),
            locale: req.getLocale(),
            fallbackLocale: i18n.getLocale()
        });
    } catch (error) {
        console.error('Errore durante il recupero dei campi:', error);
        next(error);
    }
});

router.post('/', async (req, res) => {
    try {
        const formDataArray = req.body;
        const fields = formDataArray.map(formData => {
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
