const express = require('express');
const router = express.Router();
const Information = require('../../models/information');

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