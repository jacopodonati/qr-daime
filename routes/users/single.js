const express = require('express');
const router = express.Router();
const User = require('../../models/user');

router.get('/email/:email', async (req, res) => {
    try {
        const user = await User.findOne({ email: req.params.email, activated: true, deleted: false}, '_id email');
        if (user) {
            res.status(200).json(user);
        } else {
            res.status(404).json(user);
        }
    } catch (error) {
        console.error('Errore durante il recupero dell\'utente:', error);
        res.status(500).json({ error: 'Errore durante il recupero dell\'utente' });
    }
});

module.exports = router;
