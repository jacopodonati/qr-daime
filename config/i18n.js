const i18n = require('i18n');

i18n.configure({
    locales: ['en', 'it', 'pt'],
    directory: __dirname + '/../locales',
    defaultLocale: 'pt'
});

module.exports = i18n;