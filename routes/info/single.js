const express = require('express');
const router = express.Router();
const Information = require('../../models/information');
const i18n = require('i18n');

router.get('/id/:id', async (req, res) => {
    try {
        const field = await Information.findById(req.params.id)
        res.json(field);
    } catch (error) {
        console.error('Errore durante il recupero dei campi:', error);
        res.status(500).json({ error: 'Errore durante il recupero dei campi' });
    }
});

router.get('/view/:id', async (req, res) => {
    try {
        const id = req.params.id;
        let info;
        if (res.locals.user.permissions.manage_info) {
            info = await Information.findById(id);
        } else {
            info = await Information.findOne({ _id: id, deleted: false });
        }

        if (info) {
            res.render('info/single', {
                title: 'info',
                information: info
            });
        } else {
            res.redirect('/info/list');
        }
    } catch (error) {
        console.error('Error querying database:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = router;
