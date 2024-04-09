const express = require('express');
const router = express.Router();
const Information = require('../../models/information');
const i18n = require('i18n');
const acceptLanguageParser = require('accept-language-parser');

router.get('/', async (req, res) => {
    try {
        const isAdmin = req.query.hasOwnProperty('admin');
        const queryString = isAdmin ? {} : { deleted: false };
        const info = await Information.find(queryString);

        const acceptLanguage = req.headers['accept-language'];
        const languages = acceptLanguageParser.parse(acceptLanguage);
        const locale = languages[0].code;
        
        res.render('info/list', {
            title: i18n.__('list_info') + ' - ' + i18n.__('app_name'),
            information: info,
            locale: locale,
            isAdmin: isAdmin
        });

    } catch (error) {
        console.error('Errore durante la query al database:', error);
        res.status(500).json({ error: 'Errore del server interno' });
    }
});

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

router.get('/default', async (req, res) => {
    try {
        const defaultFields = await Information.find({ default: true });
        res.json(defaultFields);
    } catch (error) {
        console.error('Errore durante il recupero dei campi:', error);
        res.status(500).json({ error: 'Errore durante il recupero dei campi' });
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
