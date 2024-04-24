const express = require('express');
const router = express.Router();
const i18n = require('i18n');
const User = require('../../models/user');
const bcrypt = require('bcrypt');

router.get('/', (req, res) => {
    res.render('users/login', {
        title: i18n.__('login_title') + ' - ' + i18n.__('app_name')
    });
});

router.post('/', async (req, res) => {
    try {
        const { action, email, password } = req.body;

        if (action === 'signup') {
            const newUser = new User({ email, password });
            await newUser.save();
            res.redirect('/login');
        } else if (action === 'signin') {
            const user = await User.findOne({ email, deleted: false, activated: true });
            if (!user) {
                req.flash('error', 'Utente non trovato');
                return res.redirect('/login');
            }

            const isPasswordValid = await bcrypt.compare(password, user.password);
            if (!isPasswordValid) {
                req.flash('error', 'Password non valida');
                return res.redirect('/login');
            }

            req.flash('success', 'Login effettuato con successo');
            req.session.user = user;

            res.redirect('/');
        }
    } catch (error) {
        console.error('Errore durante il login/registrazione:', error);
        req.flash('error', 'Si è verificato un errore durante la registrazione.');
        res.status(500).send('Si è verificato un errore durante il login/registrazione.');
    }
});

module.exports = router;
