const express = require('express');
const router = express.Router();
const { getClient } = require('../db');
const i18n = require('i18n');
const Document = require('../models/document')

router.get('/', async function(req, res, next) {
    try {
        res.render('add', {
            title: i18n.__('addpage_title') + ' - ' + i18n.__('app_name'),
            locale: req.getLocale(),
            fallbackLocale: i18n.getLocale()
        });
    } catch (error) {
        console.error('Errore durante il recupero dei campi:', error);
        next(error);
    }
});

router.post('/', async (req, res) => {
    try {
        const formDataArray = req.body;
        const fields = formDataArray.map(formData => {
            const fieldData = formData.fields.map(field => ({
                _id: field._id,
                value: field.value
            }));

            return {
                _id: formData._id,
                public: formData.public,
                fields: fieldData
            };
        });

        const newDocument = new Document({
            fields: fields
        });

        const savedDocument = await newDocument.save();
        console.log(savedDocument)

        res.status(201).json({ savedDocument });
    } catch (error) {
        console.error('Errore durante il salvataggio del documento:', error);
        res.status(500).json({ error: 'Errore interno del server' });
    }
});


module.exports = router;
