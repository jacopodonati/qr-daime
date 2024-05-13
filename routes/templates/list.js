const express = require('express');
const router = express.Router();
const Template = require('../../models/template');
const i18n = require('i18n');

router.get('/', async (req, res) => {
    try {
        const queryString = res.locals.user.permissions.manage_documents ? {} : { deleted: false };
        const templates = await Template.find(queryString)
            .populate('owner workspace');
        
        res.render('templates/list', {
            title: i18n.__('template_list_title') + ' - ' + i18n.__('app_name'),
            templates
        });

    } catch (error) {
        console.error('Errore durante la query al database:', error);
        res.status(500).json({ error: 'Errore del server interno' });
    }
});

module.exports = router;
