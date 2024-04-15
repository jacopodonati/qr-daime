const express = require('express');
const router = express.Router();
const Document = require('../../models/document');

router.get('/:id', async (req, res) => {
    const id = req.params.id;

    if (req.isAdmin) {        
        try {
            const document = await Document.findById(id);
            
            if (document) {
                document.deleted = false;
                await document.save();
                res.redirect('/list?admin');
            } else {
                res.status(404).json({ error: 'Documento non trovato' });
            }
        } catch (error) {
            console.error('Errore nel ripristino del documento:', error);
            res.status(500).json({ error: 'Errore del server interno' });
        }
    } else {
        res.redirect('/list');
    }
});

module.exports = router;
