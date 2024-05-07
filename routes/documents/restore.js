const express = require('express');
const router = express.Router();
const Document = require('../../models/document');

router.get('/:id', async (req, res) => {
    if (res.locals.user.permissions.manage_documents) {
        try {
            const document = await Document.findById(req.params.id);
            
            if (document) {
                document.deleted = false;
                await document.save();
                res.redirect('/doc/list');
            } else {
                res.status(404).json({ error: 'Documento non trovato' });
            }
        } catch (error) {
            console.error('Errore nel ripristino del documento:', error);
            res.status(500).json({ error: 'Errore del server interno' });
        }
    } else {
        res.redirect('/doc/list');
    }
});

module.exports = router;
