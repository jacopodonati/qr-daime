const i18n = require('i18n');
const { translateText } = require('./localization');

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

module.exports = {
    validateAndTranslateData
};
