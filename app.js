const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const i18n = require('i18n');

require('dotenv').config();

const indexRouter = require('./routes/index');
const setupRouter = require('./routes/setup');
const listRouter = require('./routes/list');
const docRouter = require('./routes/doc');
const addRouter = require('./routes/add');
const editRouter = require('./routes/edit');
const fieldRouter = require('./routes/field');

i18n.configure({
    locales: ['en', 'pt', 'it'],
    directory: __dirname + '/locales',
    defaultLocale: 'pt'
});

const app = express();

app.use(i18n.init);

// view engine setup
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
app.use('/field', fieldRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Port: ${port}`);
});

module.exports = app;
