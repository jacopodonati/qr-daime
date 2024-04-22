const express = require('express');
const router = express.Router();
const Document = require('../../models/document');
const i18n = require('i18n');
const { getUserPermissions } = require('../../config/permissions');

router.get('/', async (req, res) => {
    const role = getUserPermissions(req.session.user.role);
    try {
        const queryString = role.restore ? {} : { deleted: false };
        const documents = await Document.find(queryString);
        
        res.render('documents/list', {
            title: i18n.__('listpage_title') + ' - ' + i18n.__('app_name'),
            documents: documents
        });

    } catch (error) {
        console.error('Errore durante la query al database:', error);
        res.status(500).json({ error: 'Errore del server interno' });
    }
});

module.exports = router;
