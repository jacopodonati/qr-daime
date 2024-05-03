const { MET } = require('bing-translate-api');
const acceptLanguageParser = require('accept-language-parser');
const i18n = require('i18n');

async function translateText(text, sourceLanguage, targetLanguage) {
    try {
        const translation = await MET.translate(text, sourceLanguage, targetLanguage);
        return translation[0].translations[0].text;
    } catch (error) {
        throw new Error(`Errore durante la traduzione: ${error}`);
    }
}

function pageTitleLocalizationWorkaround(req, res, next) {
    if (req.method === 'GET') {
        const acceptLanguage = req.headers['accept-language'];
        const languages = acceptLanguageParser.parse(acceptLanguage);
        const primaryLanguage = languages[0].code;
        
        if (primaryLanguage) {
            i18n.setLocale(primaryLanguage);
        }
    }
    next();
}

module.exports = {
    pageTitleLocalizationWorkaround,
    translateText
};