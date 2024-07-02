const express = require('express');
const router = express.Router();
const Document = require('../../models/document');

router.get('/', async (req, res) => {
    try {
        const queryString = res.locals.user.permissions.read ? {} : { deleted: false };
        const documents = await Document.find(queryString);
        
        res.render('documents/list', {
            title: 'iceflu_homepage',
        });

    } catch (error) {
        console.error('Errore durante la query al database:', error);
        res.status(500).json({ error: 'Errore del server interno' });
    }
});

module.exports = router;

