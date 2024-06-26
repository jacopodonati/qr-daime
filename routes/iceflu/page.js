const express = require('express');
const router = express.Router();
const Document = require('../../models/document');
const i18n = require('i18n');

router.get('/', async (req, res) => {
    try {
        const queryString = res.locals.user.permissions.read ? {} : { deleted: false };
        const documents = await Document.find(queryString);
        
        res.render('iceflu/page', {
            title: 'iceflu_homepage',
            fields: {
              presentation: 'A ICEFLU PRESENTATION',
              iceflu_links: [
                {
                  desc: 'a link desc',
                  link: 'alink'
                },
                {
                  desc: 'another link desc',
                  link: 'alink another'
                },
              ]
            },
        });

    } catch (error) {
        console.error('Errore durante la query al database:', error);
        res.status(500).json({ error: 'Errore del server interno' });
    }
});

module.exports = router;

