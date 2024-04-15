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
const docPdfRouter = require('./routes/documents/pdf');
const docAddRouter = require('./routes/documents/add');
const docEditRouter = require('./routes/documents/edit');
const docDeleteRouter = require('./routes/documents/delete');
const docRestoreRouter = require('./routes/documents/restore');
const infoSingleRouter = require('./routes/info/single');
const infoListRouter = require('./routes/info/list');
const infoAddRouter = require('./routes/info/add');
const infoEditRouter = require('./routes/info/edit');
const infoDeleteRouter = require('./routes/info/delete');
const infoRestoreRouter = require('./routes/info/restore');

i18n.configure({
    locales: ['en', 'it', 'pt'],
    directory: __dirname + '/locales',
    defaultLocale: 'pt'
});

function isAdmin(req, res, next) {
    req.isAdmin = req.query.hasOwnProperty('admin');
    next();
}

const app = express();

app.use(i18n.init);

app.use(isAdmin);
app.use((req, res, next) => {
    res.locals.isAdmin = req.isAdmin;
    next();
});

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

app.use('/static', express.static('static'));

app.use('/', indexRouter);
app.use('/setup', setupRouter);
app.use('/static', staticRouter);
app.use('/list', docListRouter);
app.use('/doc', docSingleRouter);
app.use('/pdf', docPdfRouter);
app.use('/add', docAddRouter);
app.use('/edit', docEditRouter);
app.use('/delete', docDeleteRouter);
app.use('/restore', docRestoreRouter);
app.use('/info/', infoSingleRouter);
app.use('/info/list', infoListRouter);
app.use('/info/add', infoAddRouter);
app.use('/info/edit', infoEditRouter);
app.use('/info/delete', infoDeleteRouter);
app.use('/info/restore', infoRestoreRouter);

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
