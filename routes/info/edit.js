const express = require('express');
const router = express.Router();
const Information = require('../../models/information');
const i18n = require('i18n');
const { validateInformation, translateInformation } = require('../../middleware/validation');

router.use(express.json());

router.get('/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const queryString = res.locals.user.permissions.manage_info ? { _id: id } : { _id: id, owner: res.locals.user._id, deleted: false };
        const information = await Information.findOne(queryString);

        if (information) {
            const localeCodes = i18n.getLocales();
            let removeButtonLabels = {};
            let placeholdersForLabels = {};
            let placeholdersForDescriptions = {};
            localeCodes.forEach(code => {
                removeButtonLabels[code] = i18n.__({ phrase: 'INPUT_LBL_REMOVE', locale: code });
                placeholdersForLabels[code] = i18n.__({ phrase: 'modal_new_field_title_placeholder', locale: code });
                placeholdersForDescriptions[code] = i18n.__({ phrase: 'modal_new_field_description_placeholder', locale: code });
            });
            
            res.render('info/edit', {
                title: i18n.__('edit_info_title') + ' ' + id + ' - ' + i18n.__('app_name'),
                information,
                removeButtonLabels,
                placeholdersForLabels,
                placeholdersForDescriptions
            });
        } else {
            res.redirect('/');
        }

    } catch (error) {
        console.error('Errore nel recupero dell\'informazinoe dal database:', error);
        res.status(500).json({ error: 'Errore interno' });
    }
});

router.post('/:id', validateInformation, translateInformation, async (req, res) => {
    try {
        const id = req.params.id;
        const newData = req.body;

        let information;
        
        if (res.locals.user.permissions.manage_info) {
            information = await Information.findById(id);
        } else {
            information = await Information.findOne({ _id: id, deleted: false });
        }

        if (information) {
            information.set('labels', newData.labels);
            information.set('descriptions', newData.descriptions);
            information.set('deleted', newData.deleted);

            information.fields = [];
            newData.fields.forEach(async (newField) => {
                if (newField._id.substring(0, 3) === 'tmp') {
                    delete newField._id;
                }
                information.fields.push(newField);
            });
            information.fields.sort((a, b) => a.order - b.order);
            
            let savedInformation = await information.save();
            return res.status(200).json({ savedInformation });
        } 
    } catch (error) {
        console.error('Error updating information in the database:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = router;
