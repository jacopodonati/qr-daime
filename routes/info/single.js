const express = require('express');
const router = express.Router();
const Information = require('../../models/information');
const i18n = require('i18n');
const iso6391 = require('iso-639-1');

router.get('/id/:id', async (req, res) => {
    try {
        const field = await Information.findById(req.params.id)
        res.json(field);
    } catch (error) {
        console.error('Errore durante il recupero dei campi:', error);
        res.status(500).json({ error: 'Errore durante il recupero dei campi' });
    }
});

router.get('/view/:id', async (req, res) => {
    const id = req.params.id;
    const locale_codes = i18n.getLocales();
    let availableLocales = []
    locale_codes.forEach(code => {
        const name = iso6391.getNativeName(code);
        availableLocales.push({ code, name })
    });

    try {
        let info;
        if (req.isAdmin) {
            info = await Information.findById(id);
        } else {
            info = await Information.findOne({ _id: id, deleted: false });
        }

        if (info) {
            res.render('info/single', {
                title: i18n.__("info_no") + ' ' + info._id + ' - ' + i18n.__('app_name'),
                information: info,
                availableLocales
            });
        } else {
            res.redirect('/info/list');
        }
    } catch (error) {
        console.error('Error querying database:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = router;
