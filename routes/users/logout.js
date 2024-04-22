const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Errore durante il logout:', err);
            return res.status(500).send('Si è verificato un errore durante il logout.');
        }
        res.redirect('/');
    });
});


module.exports = router;
