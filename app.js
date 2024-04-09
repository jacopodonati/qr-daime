const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const acceptLanguageParser = require('accept-language-parser');
const i18n = require('i18n');
const mongoose = require('mongoose');

require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI);

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'Errore di connessione al database:'));
db.once('open', async () => {
    console.log('Connessione al database MongoDB avvenuta con successo');
});

const indexRouter = require('./routes/index');
const setupRouter = require('./routes/setup');
const staticRouter = require('./routes/static');
const docListRouter = require('./routes/documents/list');
const docSingleRouter = require('./routes/documents/single');
const docAddRouter = require('./routes/documents/add');
const docEditRouter = require('./routes/documents/edit');
const docDeleteRouter = require('./routes/documents/delete');
const fieldRouter = require('./routes/field');

i18n.configure({
    locales: ['en', 'pt', 'it'],
    directory: __dirname + '/locales',
    defaultLocale: 'pt'
});

const app = express();

app.use(i18n.init);

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Workaround per forzare la localizzazione dei titoli delle pagine.
app.use((req, res, next) => {
    if (req.method === 'GET') {
        const acceptLanguage = req.headers['accept-language'];
        const languages = acceptLanguageParser.parse(acceptLanguage);
        const primaryLanguage = languages[0].code;

        if (primaryLanguage) {
            i18n.setLocale(primaryLanguage);
        }
    }
    next();
});

app.use('/', indexRouter);
app.use('/setup', setupRouter);
app.use('/static', staticRouter);
app.use('/list', docListRouter);
app.use('/doc', docSingleRouter);
app.use('/add', docAddRouter);
app.use('/edit', docEditRouter);
app.use('/delete', docDeleteRouter);
app.use('/field', fieldRouter);

app.use(function (req, res, next) {
    next(createError(404));
});

app.use(function (err, req, res, next) {
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    res.status(err.status || 500);
    res.render('error');
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Port: ${port}`);
});

module.exports = app;
