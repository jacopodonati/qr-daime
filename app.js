require('dotenv').config();

const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const session = require('express-session');
const db = require('./config/db');
const i18n = require('./config/i18n');
const flash = require('connect-flash');
const multer = require('multer');
const filters = require('./middleware/filters');

const { getUserPermissions } = require('./config/permissions');
const { passUserToRoutes } = require('./middleware/users');
const { setLangCookie } = require('./middleware/localization');
const { passLocalesToRoutes } = require('./middleware/localization');

const indexRouter = require('./routes/index');
const setupRouter = require('./routes/setup');
const staticRouter = require('./routes/static');
const userSingleRouter = require('./routes/users/single');
const userListRouter = require('./routes/users/list');
const userDeleteRouter = require('./routes/users/delete');
const userActivationRouter = require('./routes/users/activate');
const userRoleRouter = require('./routes/users/role');
const userLoginRouter = require('./routes/users/login');
const userLogoutRouter = require('./routes/users/logout');
const userPersonalProfileRouter = require('./routes/users/personal_profile');
const docListRouter = require('./routes/documents/list');
const icefluPageRouter = require('./routes/iceflu/page');
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
const workspaceSingleRouter = require('./routes/workspaces/single');
const workspaceListRouter = require('./routes/workspaces/list');
const workspaceAddRouter = require('./routes/workspaces/add');
const workspaceEditRouter = require('./routes/workspaces/edit');
const workspaceDeleteRouter = require('./routes/workspaces/delete');
const workspaceRestoreRouter = require('./routes/workspaces/restore');
const templateAddRouter = require('./routes/templates/add');
const templateEditRouter = require('./routes/templates/edit');
const templateDeleteRouter = require('./routes/templates/delete');
const templateRestoreRouter = require('./routes/templates/restore');
const templateListRouter = require('./routes/templates/list');
const templateSingleRouter = require('./routes/templates/single');

const app = express();

app.use(session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: false
}));

app.use(i18n.init);
app.use(flash());

app.use(cookieParser());

app.use(setLangCookie);
app.use(passLocalesToRoutes);

app.use((req, res, next) => {
    if (process.env.NODE_ENV === 'development') {
        const role = 'basic';
        req.session.user = {
            id: '123456',
            email: 'test@example.com',
            role: role,
            permissions: getUserPermissions(role)
        };
    }

    if (!req.session.user) {
        req.session.user = {
            id: null,
            email: null,
            role: 'loggedout',
            permissions: getUserPermissions('loggedout')
        };
    }
    passUserToRoutes(req, res, next);
});

app.use((req, res, next) => {
    res.locals.messages = req.flash();
    next();
});

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');
app.locals.filters = filters;

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(multer().none());
app.use(express.static(path.join(__dirname, 'public')));

// app.use((req, res, next) => {
//     if (process.env.NODE_ENV === 'development') {
//         req.session.user = {
//             id: '123456',
//             email: 'test@example.com',
//             role: 'admin',
//             permissions: getUserPermissions('admin')
//         };
//     }
// 
//     if (!req.session.user) {
//         req.session.user = {
//             role: 'loggedout',
//             permissions: getUserPermissions('loggedout')
//         };
//     }
// 
//     next();
// });

app.use('/static', express.static('static'));

app.use('/', indexRouter);
app.use('/setup', setupRouter);
app.use('/static', staticRouter);
app.use('/login', userLoginRouter);
app.use('/logout', userLogoutRouter);
app.use('/doc/list', docListRouter);
app.use('/iceflu/page', icefluPageRouter);
app.use('/doc/add', docAddRouter);
app.use('/doc/edit', docEditRouter);
app.use('/doc/delete', docDeleteRouter);
app.use('/doc/restore', docRestoreRouter);
app.use('/doc', docSingleRouter);
app.use('/pdf', docPdfRouter);
app.use('/info', infoSingleRouter);
app.use('/info/list', infoListRouter);
app.use('/info/add', infoAddRouter);
app.use('/info/edit', infoEditRouter);
app.use('/info/delete', infoDeleteRouter);
app.use('/info/restore', infoRestoreRouter);
app.use('/workspace/list', workspaceListRouter);
app.use('/workspace/view', workspaceSingleRouter);
app.use('/workspace/add', workspaceAddRouter);
app.use('/workspace/edit', workspaceEditRouter);
app.use('/workspace/delete', workspaceDeleteRouter);
app.use('/workspace/restore', workspaceRestoreRouter);
app.use('/template/view', templateSingleRouter);
app.use('/template/list', templateListRouter);
app.use('/template/add', templateAddRouter);
app.use('/template/edit', templateEditRouter);
app.use('/template/delete', templateDeleteRouter);
app.use('/template/restore', templateRestoreRouter);
app.use('/manage/users/', userSingleRouter);
app.use('/manage/users/list', userListRouter);
app.use('/manage/users/toggle-deletion', userDeleteRouter);
app.use('/manage/users/toggle-activation', userActivationRouter);
app.use('/manage/users/role', userRoleRouter);
app.use('/manage/you', userPersonalProfileRouter);

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
