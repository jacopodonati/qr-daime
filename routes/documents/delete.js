const express = require('express');
const router = express.Router();
const Document = require('../../models/document');
const i18n = require('i18n');

router.get('/:id', async (req, res) => {
    const id = req.params.id;

    if (!res.locals.user.permissions.delete) {
        return res.status(403).send('Operazione non consentita');
    }

    try {
        const document = await Document.findById(id);

        if (document) {
            res.render('documents/delete', {
                title: i18n.__("document") + ': ' + document._id + ' - ' + i18n.__('app_name'),
                document: document
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
    const id = req.params.id;

    if (!res.locals.user.permissions.delete) {
        return res.status(403).send('Operazione non consentita');
    }

    try {
        const queryString = res.locals.user.permissions.restore ? { _id: id, deleted: false } : { _id: id }
        const document = await Document.findById(queryString);

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
