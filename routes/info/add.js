const express = require('express');
const router = express.Router();
const i18n = require('i18n');
const iso6391 = require('iso-639-1');
const Information = require('../../models/information');
const { validateInformationData } = require('../../middleware/validation')

router.get('/', async function(req, res, next) {
    const localeCodes = i18n.getLocales();
    let availableLocales = [];
    let removeButtonLabels = {};
    localeCodes.forEach(code => {
        const name = iso6391.getNativeName(code);
        availableLocales.push({ code, name });
        removeButtonLabels[code] = i18n.__({ phrase: 'INPUT_LBL_REMOVE', locale: code });
    });
    const acceptLanguage = req.headers['accept-language'] || 'en';
    const currentLocale = acceptLanguage.split(',')[0].split('-')[0];

    try {
        res.render('info/add', {
            title: i18n.__('info_add_title') + ' - ' + i18n.__('app_name'),
            availableLocales,
            currentLocale,
            removeButtonLabels
        });
    } catch (error) {
        console.error('Errore durante il recupero dei campi:', error);
        next(error);
    }
});

router.post('/', validateInformationData, async (req, res) => {
    console.log(req.body)
    try {
        const { labels, fields } = req.body;

        const newFieldData = {
            labels: labels,
            fields: fields
        }

        const savedField = await Information.create(newFieldData);
        res.status(201).json({ id: savedField.id });
    } catch (error) {
        console.error('Errore durante il salvataggio del campo:', error);
        res.status(500).json({ error: 'Errore durante il salvataggio del campo' });
    }
});

module.exports = router;
