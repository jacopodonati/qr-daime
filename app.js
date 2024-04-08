const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
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
const listRouter = require('./routes/list');
const docRouter = require('./routes/doc');
const addRouter = require('./routes/add');
const editRouter = require('./routes/edit');
const deleteRouter = require('./routes/delete');
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

app.use('/', indexRouter);
app.use('/setup', setupRouter);
app.use('/list', listRouter);
app.use('/doc', docRouter);
app.use('/add', addRouter);
app.use('/edit', editRouter);
app.use('/delete', deleteRouter);
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
