const express = require('express');
const router = express.Router();
const Document = require('../../models/document');
const i18n = require('i18n');

router.get('/:hash', async (req, res) => {
    const hash = req.params.hash;
    const isAdmin = req.query.hasOwnProperty('admin');

    try {
        const document = await Document.findById(hash);

        if (document) {
            res.render('delete', {
                title: i18n.__("document") + ': ' + document._id + ' - ' + i18n.__('app_name'),
                document: document,
                isAdmin
            });
        } else {
            res.redirect('/list');
        }
    } catch (error) {
        console.error('Error querying database:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.post('/:hash', async (req, res) => {
    const hash = req.params.hash;
    const isAdmin = req.query.hasOwnProperty('admin');

    try {
        let document;
        if (isAdmin) {
            document = await Document.findById(hash);
        } else {
            document = await Document.findOne({ _id: hash, deleted: false });
        }

        if (document) {
            document.deleted = true;
            await document.save();
            res.redirect('/list');
        } else {
            res.status(404).json({ error: 'Documento non trovato' });
        }
    } catch (error) {
        console.error('Errore nella cancellazione del documento:', error);
        res.status(500).json({ error: 'Errore del server interno' });
    }
});

module.exports = router;
