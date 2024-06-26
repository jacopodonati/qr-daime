const express = require('express');
const router = express.Router();
const i18n = require('i18n');
const Information = require('../../models/information');
const { validateInformation, translateInformation } = require('../../middleware/validation')

router.get('/', async function(req, res, next) {
    if (!res.locals.user.permissions.create) {
        return res.status(403).send('Operazione non consentita');
    }
    const localeCodes = i18n.getLocales();
    let removeButtonLabels = {};
    let placeholdersForLabels = {};
    let placeholdersForDescriptions = {};
    localeCodes.forEach(code => {
        removeButtonLabels[code] = i18n.__({ phrase: 'INPUT_LBL_REMOVE', locale: code });
        placeholdersForLabels[code] = i18n.__({ phrase: 'modal_new_field_title_placeholder', locale: code });
        placeholdersForDescriptions[code] = i18n.__({ phrase: 'modal_new_field_description_placeholder', locale: code });
    });

    try {
        res.render('info/add', {
            title: 'info_add_title',
            removeButtonLabels,
            placeholdersForLabels,
            placeholdersForDescriptions
        });
    } catch (error) {
        console.error('Errore durante il recupero dei campi:', error);
        next(error);
    }
});

router.post('/', validateInformation, translateInformation, async (req, res) => {
    if (!res.locals.user.permissions.create) {
        return res.status(403).send('Operazione non consentita');
    }
    try {
        const { labels, fields, descriptions } = req.body;

        const newFieldData = {
            labels: labels,
            descriptions: descriptions,
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
