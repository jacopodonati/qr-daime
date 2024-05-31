const express = require('express');
const router = express.Router();
const i18n = require('i18n');
const Document = require('../../models/document');
const Information = require('../../models/information');
const Workspace = require('../../models/workspace');
const { getQRCodeString, getQRDocumentContent } = require('../../qr');

router.use(express.json());

router.get('/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const fields = await Information.find({});

        const queryString = res.locals.user.permissions.manage_documents ? { id: id } : { _id: id, deleted: false, owner: res.locals.user.id };
        const document = await Document.findOne(queryString);

        if (document) {
            const workspaces = await Workspace.find({ 'members.user': res.locals.user.id });
            res.render('documents/edit', {
                title: i18n.__('edit_doc_title') + ' ' + id + ' - ' + i18n.__('app_name'),
                document,
                fields,
                workspaces
            });
        } else {
            return res.redirect('/');
        }
    } catch (error) {
        console.error('Error retrieving document from the database:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.post('/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const newData = req.body.fields;
        const workspace = req.body.workspace;

        let document;
        if (res.locals.user.permissions.manage_documents) {
            document = await Document.findById(id);
        } else {
            document = await Document.findOne({ _id: id, deleted: false, owner: res.locals.user.id });
        }

        if (document) {
            document.set('information', newData);
            document.set('workspace', workspace);
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
