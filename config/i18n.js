const i18n = require('i18n');

i18n.configure({
    locales: ['en', 'it', 'pt'],
    directory: __dirname + '/../locales',
    defaultLocale: 'pt',
    cookie: 'lang',
    queryParameter: 'lang',
    order: ['cookie', 'querystring', 'header']
});

module.exports = i18n;