const express = require('express');
const router = express.Router();
const Information = require('../../models/information');
const i18n = require('i18n');
const { MET } = require('bing-translate-api');
const iso6391 = require('iso-639-1');

router.use(express.json());

async function validateAndTranslateData(req, res, next) {
    const data = req.body;
    i18n.setLocale(req.getLocale());

    try {
        const hasLabelsWithText = data.labels.some(label => label.text.trim() !== '');
        
        if (!hasLabelsWithText) {
            return res.status(400).json({ error: i18n.__('missing_label_text') });
        }

        for (let label of data.labels) {
            if (label.text.trim() === '') {
                const notEmptyLabel = data.labels.find(l => l.text.trim() !== '');
                if (notEmptyLabel) {
                    const translatedLabel = await translateText(notEmptyLabel.text, notEmptyLabel.locale, label.locale);
                    label.text = translatedLabel;
                }
            }
        }

        for (let field of data.fields) {
            const hasLabelsWithTextInField = field.labels.some(label => label.text.trim() !== '');
            if (!hasLabelsWithTextInField) {
                return res.status(400).json({ error: i18n.__('missing_label_text_in_field') });
            }
            for (let label of field.labels) {
                if (label.text.trim() === '') {
                    const notEmptyLabel = field.labels.find(l => l.text.trim() !== '');
                    if (notEmptyLabel) {
                        const translatedLabel = await translateText(notEmptyLabel.text, notEmptyLabel.locale, label.locale);
                        label.text = translatedLabel;
                    }
                }
            }
        }

        next();
    } catch (error) {
        console.error('Errore durante la validazione e traduzione dei dati:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

async function translateText(text, sourceLanguage, targetLanguage) {
    try {
        const translation = await MET.translate(text, sourceLanguage, targetLanguage);
        return translation[0].translations[0].text;
    } catch (error) {
        throw new Error(`Errore durante la traduzione: ${error}`);
    }
}

router.get('/:id', async (req, res) => {
    const isAdmin = req.query.hasOwnProperty('admin');
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
        const id = req.params.id;

        let information;
        if (isAdmin) {
            information = await Information.findById(id);
        } else {
            information = await Information.findOne({ _id: id, deleted: false });
        }

        if (!information) {
            res.redirect('/');
        }

        res.render('info/edit', {
            title: i18n.__('edit_info_title') + ' ' + id + ' - ' + i18n.__('app_name'),
            information,
            isAdmin,
            availableLocales,
            currentLocale,
            removeButtonLabels
        });
    } catch (error) {
        console.error('Errore nel recupero dell\'informazinoe dal database:', error);
        res.status(500).json({ error: 'Errore interno' });
    }
});

router.post('/:id', validateAndTranslateData, async (req, res) => {
    const isAdmin = req.body.admin;
    try {
        const id = req.params.id;
        const newData = req.body;
        let information;
        
        if (isAdmin) {
            information = await Information.findById(id);
        } else {
            information = await Information.findOne({ _id: id, deleted: false });
        }

        if (information) {
            information.set('default', newData.default);
            information.set('deleted', newData.deleted);

            information.set('labels', newData.labels);

            information.fields = [];
            newData.fields.forEach(async (newField) => {
                console.log(newField)
                if (newField._id.substring(0, 3) === 'tmp') {
                    delete newField._id;
                }
                information.fields.push(newField);
            });
            information.fields.sort((a, b) => a.order - b.order);

            let savedInformation = await information.save();
            console.log(savedInformation._doc);
            return res.status(200).json({ savedInformation });
        } 
    } catch (error) {
        console.error('Error updating information in the database:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = router;
