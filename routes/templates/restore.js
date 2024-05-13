const express = require('express');
const router = express.Router();
const Template = require('../../models/template');

router.get('/:id', async (req, res) => {
    if (res.locals.user.permissions.manage_documents) {        
        try {
            const template = await Template.findById(req.params.id);
            
            if (template) {
                template.deleted = false;
                await template.save();
                res.redirect('/template/list');
            } else {
                res.status(404).json({ error: 'Template non trovato' });
            }
        } catch (error) {
            console.error('Errore nel ripristino del template:', error);
            res.status(500).json({ error: 'Errore del server interno' });
        }
    } else {
        res.redirect('/info/list');
    }
});

module.exports = router;
