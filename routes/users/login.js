const express = require('express');
const router = express.Router();
const i18n = require('i18n');
const bcrypt = require('bcrypt');
const User = require('../../models/user');
const Workspace = require('../../models/workspace');

router.get('/', (req, res) => {
    res.render('users/login', {
        title: i18n.__('login_title') + ' - ' + i18n.__('app_name')
    });
});

router.post('/', async (req, res) => {
    try {
        const { action, email, password } = req.body;

        if (action === 'signup') {
            const username = email.substring(0, email.indexOf('@'));
            const newUser = new User({ email, password, username});
            await newUser.save();
            const personalWorkspace = new Workspace({
                members: [{
                    role: 'workspace_admin',
                    user: newUser._id
                }],
                name: email,
                privacy: 'personal'
            });
            await personalWorkspace.save();
            newUser.workspaces.push(personalWorkspace._id);
            await newUser.save();
            req.flash('success', i18n.__('login_user_created'));
            return res.redirect('/login');
        } else if (action === 'signin') {
            const user = await User.findOne({ email });
            if (!user) {
                req.flash('error', i18n.__('login_user_not_found'));
                return res.redirect('/login');
            }
            if (!user.activated) {
                req.flash('error', i18n.__('login_user_not_activated'));
                return res.redirect('/login');
            }
            if (user.deleted) {
                req.flash('error', i18n.__('login_user_deleted'));
                return res.redirect('/login');
            }

            const isPasswordValid = await bcrypt.compare(password, user.password);
            if (!isPasswordValid) {
                req.flash('error', i18n.__('login_password_not_valid'));
                return res.redirect('/login');
            }

            req.flash('success', i18n.__('login_success'));
            req.session.user = user;

            return res.redirect('/');
        }
    } catch (error) {
        console.error('Errore durante il login/registrazione:', error);
        req.flash('error', 'Si è verificato un errore durante la registrazione.');
        res.status(500).send('Si è verificato un errore durante il login/registrazione.');
    }
});

module.exports = router;
