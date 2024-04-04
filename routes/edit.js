const express = require('express');
const router = express.Router();
const i18n = require('i18n');
const Document = require('../models/document');
const { getQRCodeString, getQRDocumentContent } = require('../qr');

router.use(express.json());

router.get('/:hash', async (req, res) => {
    try {
        const id = req.params.hash;

        const document = await Document.findById(id);

        if (!document) {
            res.redirect('/');
        }

        res.render('edit', {
            title: i18n.__('edit_doc_title') + ' ' + id + ' - ' + i18n.__('app_name'),
            document 
        });
    } catch (error) {
        console.error('Error retrieving document from the database:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.post('/:hash', async (req, res) => {
    try {
        const newData = req.body;
        const document = await Document.findById(req.params.hash);

        if (document) {
            document.set('information', newData);
            document.set('lastEdit', new Date());
            let doc = await getQRDocumentContent(document);
            let qrDoc = await getQRCodeString(doc);
            document.set('qrDocument', qrDoc)
            let savedDocument = await document.save();
            return res.status(200).json({ savedDocument });
        } 
    } catch (error) {
        console.error('Error updating document in the database:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = router;
