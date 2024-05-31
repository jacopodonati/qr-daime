const express = require('express');
const router = express.Router();
const Document = require('../../models/document');
const Workspace = require('../../models/workspace');
const i18n = require('i18n');

router.get('/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const queryString = res.locals.user.permissions.manage_documents ? { _id: id, deleted: false } : { _id: id, owner: res.locals.user.id, deleted: false };
        const document = await Document.findOne(queryString);

        if (document) {
            res.render('documents/delete', {
                title: i18n.__("document") + ': ' + document._id + ' - ' + i18n.__('app_name'),
                document
            });
        } else {
            res.redirect('/doc/list');
        }
    } catch (error) {
        console.error('Error querying database:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.post('/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const queryString = res.locals.user.permissions.restore ? { _id: id, deleted: false } : { _id: id }
        const document = await Document.findById(queryString);

        if (document) {
            const personalWorkspace = await Workspace.findOne({ name: res.locals.user.email, privacy: 'personal' }, '_id');
            document.set('deleted', true);
            document.set('workspace', personalWorkspace._id);
            await document.save();
            res.redirect('/doc/list');
        } else {
            res.status(404).json({ error: 'Documento non trovato' });
        }
    } catch (error) {
        console.error('Errore nella cancellazione del documento:', error);
        res.status(500).json({ error: 'Errore del server interno' });
    }
});

module.exports = router;
