const { MET } = require('bing-translate-api');
const i18n = require('i18n');
const iso6391 = require('iso-639-1');

function setLangCookie(req, res, next) {
    if (req.query.lang) {
        res.cookie('lang', req.query.lang, { maxAge: 900000, httpOnly: true });
        res.setLocale(req.query.lang);
    } else if (req.cookies.lang) {
        res.setLocale(req.cookies.lang);
    }
    next();
}

function passLocalesToRoutes(req, res, next) {
    const locale_codes = i18n.getLocales();
    let availableLocales = []
    locale_codes.forEach(code => {
        const name = iso6391.getNativeName(code);
        availableLocales.push({ code, name })
    });
    res.locals.locales = {
        availableLocales: availableLocales,
        currentLocale: i18n.getLocale()
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

module.exports = {
    passLocalesToRoutes,
    setLangCookie,
    translateText
};