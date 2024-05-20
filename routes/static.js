const express = require('express');
const router = express.Router();
const fs = require('fs');
const i18n = require('i18n');

router.get('/field.js', (req, res) => {
    const acceptLanguage = req.headers['accept-language'] || 'en';
    const language = acceptLanguage.split(',')[0].split('-')[0];
    i18n.setLocale(language);

    fs.readFile(__dirname + '/../static/js/fields.js', 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading fields.js file:', err);
            return res.status(500).send('Internal Server Error');
        }

        const translatedData = data
            .replace(/NO_FIELD_FOUND/g, i18n.__('NO_FIELD_FOUND'))
            .replace(/INPUT_LBL_REMOVE/g, i18n.__('INPUT_LBL_REMOVE'))
            .replace(/INPUT_LBL_PUBLIC/g, i18n.__('INPUT_LBL_PUBLIC'))
            .replace(/INPUT_LBL_PRIVATE/g, i18n.__('INPUT_LBL_PRIVATE'))
            .replace(/LBL_PLACEHOLDER/g, i18n.__('modal_new_field_title_placeholder'))
            .replace(/DESC_PLACEHOLDER/g, i18n.__('modal_new_field_description_placeholder'));

        res.type('application/javascript').send(translatedData);
    });
});

module.exports = router;
