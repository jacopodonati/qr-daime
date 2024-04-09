const express = require('express');
const router = express.Router();
const Information = require('../../models/information');

router.get('/:id', async (req, res) => {
    try {
        const field = await Information.findById(req.params.id)
        res.json(field);
    } catch (error) {
        console.error('Errore durante il recupero dei campi:', error);
        res.status(500).json({ error: 'Errore durante il recupero dei campi' });
    }
});

module.exports = router;
