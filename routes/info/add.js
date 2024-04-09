const express = require('express');
const router = express.Router();
const i18n = require('i18n');
const { MET } = require('bing-translate-api');
const Information = require('../../models/information');

function validateFieldData(req, res, next) {
    const { locale, label, infos } = req.body;
    i18n.setLocale(locale);
    
    if (!label || !infos.length) {
        return res.status(400).json({ error: i18n.__('missing_labels_or_infos') });
    }
    next();
}

async function translateText(text, sourceLanguage, targetLanguage) {
    try {
        const translation = await MET.translate(text, sourceLanguage, targetLanguage);
        return translation[0].translations[0].text;
    } catch (error) {
        throw new Error(`Errore durante la traduzione: ${error}`);
    }
}

router.post('/add', validateFieldData, async (req, res) => {
    try {
        const { label, infos, locale } = req.body;
        const supportedLocales = i18n.getLocales().filter(item => item !== locale);
        
        let infos_obj = []
        for (const info of infos) {
            let labels = [{
                locale: locale,
                text: info
            }];
            for (const supportedLocale of supportedLocales) {
                let translatedLabel = await translateText(info, locale, supportedLocale);
                labels.push({
                    locale: supportedLocale,
                    text: translatedLabel
                });
            }

            infos_obj.push({
                labels: labels
            });
        }

        let labels = [{
            locale: locale,
            text: label
        }];
        for (const supportedLocale of supportedLocales) {
            let translatedLabel = await translateText(label, locale, supportedLocale);
            labels.push({
                locale: supportedLocale,
                text: translatedLabel
            });
        }

        const newFieldData = {
            labels: labels,
            fields: infos_obj
        }
        const savedField = await Information.create(newFieldData);
        res.status(201).json({ id: savedField.id });
    } catch (error) {
        console.error('Errore durante il salvataggio del campo:', error);
        res.status(500).json({ error: 'Errore durante il salvataggio del campo' });
    }
});

module.exports = router;
