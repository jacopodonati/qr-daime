const express = require('express');
const router = express.Router();
const Information = require('../../models/information');

router.get('/:id', async (req, res) => {
    const id = req.params.id;
    const isAdmin = req.query.hasOwnProperty('admin');

    if (isAdmin) {        
        try {
            const information = await Information.findById(id);
            
            if (information) {
                information.deleted = false;
                await information.save();
                res.redirect('/info/list?admin');
            } else {
                res.status(404).json({ error: 'Informazione non trovata' });
            }
        } catch (error) {
            console.error('Errore nel ripristino dell\'informazione:', error);
            res.status(500).json({ error: 'Errore del server interno' });
        }
    } else {
        res.redirect('/info/list');
    }
});

module.exports = router;
