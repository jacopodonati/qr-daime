const express = require('express');
const router = express.Router();
const i18n = require('i18n');
const { MET } = require('bing-translate-api');
const Information = require('../models/information');

router.get('/search', async (req, res) => {
    try {
        const q = req.query.q;

        const acceptLanguage = req.headers['accept-language'];
        const locales = acceptLanguage ? acceptLanguage.split(',') : [];

        let locale = 'pt';
        if (locales.length > 0) {
            locale = locales[0].trim().substring(0, 2);
        }

        const fields = await Information.find({
            $or: [
                { 'labels.text': { $regex: q, $options: 'i' } },
                { 'fields.labels.text': { $regex: q, $options: 'i' } }
            ],
            'labels.locale': locale,
            'fields.labels.locale': locale,
            default: false
        });
        
        const searchResults = fields.map(field => ({
            locale: locale,
            query: q,
            result: {
                _id: field._id,
                labels: field.labels,
                fields: field.fields,
                default: field.default,
                public: field.public
            }
        }));

        res.json(searchResults);
    } catch (error) {
        console.error('Errore durante la ricerca dei campi:', error);
        res.status(500).json({ error: 'Errore durante la ricerca dei campi' });
    }
});

function validateFieldData(req, res, next) {
    const { label, infos } = req.body;

    if (!label || !infos.length) {
        return res.status(400).json({ error: 'I campi labels e informations sono richiesti' });
    }
    next();
}

async function translateText(text, sourceLanguage, targetLanguage) {
    try {
        const translation = await MET.translate(text, sourceLanguage, targetLanguage); // Utilizza la funzione di traduzione da Bing
        return translation[0].translations[0].text;
    } catch (error) {
        throw new Error(`Errore durante la traduzione: ${error}`);
    }
}

router.get('/get', async (req, res) => {
    try {
        let query = {};
        const id = req.query.id;
        if (id) {
            query = { _id: id };
            const field = await Information.findOne(query);
            res.json(field);
        } else {
            query = { default: true };
            const defaultFields = await Information.find(query);
            res.json(defaultFields);
        }

    } catch (error) {
        console.error('Errore durante il recupero dei campi:', error);
        res.status(500).json({ error: 'Errore durante il recupero dei campi' });
    }
});

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

router.post('/labels', async (req, res) => {
    try {
        const infoIds = req.body.infoIds;
        const labels = [];

        for (const infoIdObj of infoIds) {
            const information = await Information.findOne({ _id: infoIdObj._id });
            if (information) {
                const infoLabels = {
                    id: infoIdObj._id,
                    labels: information.labels,
                    fields: []
                };
                for (const fieldId of infoIdObj.fields) {
                    const field = information.fields.find(field => field._id.toString() === fieldId.toString());
                    if (field) {
                        infoLabels.fields.push({
                            id: field._id,
                            labels: field.labels
                        });
                    }
                }
                labels.push(infoLabels);
            }
        }

        res.json(labels);
    } catch (error) {
        console.error('Errore durante il recupero delle label dei campi:', error);
        res.status(500).json({ error: 'Errore durante il recupero delle label dei campi' });
    }
});

module.exports = router;
