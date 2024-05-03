const express = require('express');
const router = express.Router();
const i18n = require('i18n');
const Document = require('../../models/document');
const Information = require('../../models/information');
const { getQRCodeString, getQRDocumentContent } = require('../../qr');

router.use(express.json());

router.get('/:id', async (req, res) => {
    if (!res.locals.user.permissions.edit) {
      return res.redirect('/doc/list')
    }
    try {
        const id = req.params.id;
        const fields = await Information.find({});

        let document;
        if (res.locals.user.permissions.manage_documents) {
            document = await Document.findById(id);
        } else {
            document = await Document.findOne({ _id: id, deleted: false });
        }

        if (!document) {
            return res.redirect('/');
        }

        res.render('documents/edit', {
            title: i18n.__('edit_doc_title') + ' ' + id + ' - ' + i18n.__('app_name'),
            document,
            fields
        });
    } catch (error) {
        console.error('Error retrieving document from the database:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.post('/:id', async (req, res) => {
    const id = req.params.id;

    try {
        const newData = req.body.fields;

        let document;
        if (res.locals.user.permissions.manage_documents) {
            document = await Document.findById(id);
        } else {
            document = await Document.findOne({ _id: id, deleted: false });
        }

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
