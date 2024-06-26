const express = require('express');
const router = express.Router();
const Information = require('../../models/information');
const i18n = require('i18n');

router.get('/:id', async (req, res) => {      
    try {
        const id = req.params.id;
        const queryString = res.locals.user.permissions.manage_info ? { _id: id } : { _id: id, owner: res.locals.user._id, deleted: false };
        const information = await Information.findOne(queryString);
        
        if (information) {
            res.render('info/delete', {
                title: i18n.__("info_no") + ': ' + information._id + ' - ' + i18n.__('app_name'),
                information
            });
        } else {
            res.redirect('/info/list');
        }
    } catch (error) {
        console.error('Error querying database:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.post('/:id', async (req, res) => {
    const id = req.params.id;
    const isAdmin = req.query.hasOwnProperty('admin');

    try {
        let information;
        if (isAdmin) {
            information = await Information.findById(id);
        } else {
            information = await Information.findOne({ _id: id, deleted: false });
        }

        if (information) {
            information.deleted = true;
            await information.save();
            res.redirect('/info/list');
        } else {
            res.status(404).json({ error: 'Informazione non trovata' });
        }
    } catch (error) {
        console.error('Errore nella cancellazione della informazione:', error);
        res.status(500).json({ error: 'Errore del server interno' });
    }
});

module.exports = router;
