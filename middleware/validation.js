const i18n = require('i18n');
const { translateText } = require('./localization');

async function validateInformation(req, res, next) {
    const data = req.body;

    try {
        const hasLabelsWithText = data.labels.some(label => label.text.trim() !== '');
        const hasDescriptionsWithText = data.descriptions.some(description => description.text.trim() !== '');
        
        if (!hasLabelsWithText) {
            return res.status(400).json({ error: i18n.__('missing_label_text') });
        }
        
        if (!hasDescriptionsWithText) {
            return res.status(400).json({ error: i18n.__('missing_description_text') });
        }

        if (data.fields.length === 0) {
            return res.status(400).json({ error: i18n.__('missing_fields') });
        }

        next();
    } catch (error) {
        console.error('Errore durante la validazione delle informazioni:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

async function translateInformation(req, res, next) {
    const data = req.body;
    i18n.setLocale(req.getLocale());

    try {
        for (let label of data.labels) {
            if (label.text.trim() === '') {
                const notEmptyLabel = data.labels.find(l => l.text.trim() !== '');
                if (notEmptyLabel) {
                    const translatedLabel = await translateText(notEmptyLabel.text, notEmptyLabel.locale, label.locale);
                    label.text = translatedLabel;
                }
            }
        }

        for (let description of data.descriptions) {
            if (description.text.trim() === '') {
                const notEmptyDescription = data.descriptions.find(d => d.text.trim() !== '');
                if (notEmptyDescription) {
                    const translatedDescription = await translateText(notEmptyDescription.text, notEmptyDescription.locale, description.locale);
                    description.text = translatedDescription;
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

            for (let description of field.descriptions) {
                if (description.text.trim() === '') {
                    const notEmptyDescription = field.descriptions.find(d => d.text.trim() !== '');
                    if (notEmptyDescription) {
                        const translatedDescription = await translateText(notEmptyDescription.text, notEmptyDescription.locale, description.locale);
                        description.text = translatedDescription;
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

async function replaceUrlWithImg(content) {
    let newContent = content;
    const urlRegex = /(https?:\/\/[0-9a-z\-_\.~\/]+)/gi;
    const urls = content.match(urlRegex);
    if (urls && urls.length > 0) {
        for (let i = 0; i < urls.length; i++) {
            try {
                const res = await fetch(urls[i]);
                
                if (!res.ok) {
                    throw new Error(`Fetch failed with status ${res.status}`);
                }
    
                const buffer = await res.blob();
                if (buffer.type.startsWith('image/')) {
                    const imgTag = `<img src="${urls[i]}">`;
                    newContent = newContent.replace(urls[i], imgTag);
                } else {
                    const aTag = `<a href="${urls[i]}">${urls[i]}</a>`;
                    newContent = newContent.replace(urls[i], aTag);
                }
            } catch (error) {
                console.error('Fetch error:', error);
            }
        }
    }
    return newContent;
}

async function validateUserRoles(req, res, next) {
    const members = req.body.members;
    for (member of members) {
        if (member.role == 'workspace_admin') {
            return next();
        }
    }
    return res.status(400).json({ error: i18n.__('missing_workspace_admin') });
}

module.exports = {
    replaceUrlWithImg,
    translateInformation,
    validateInformation,
    validateUserRoles
};
