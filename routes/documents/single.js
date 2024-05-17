const express = require('express');
const router = express.Router();
const Document = require('../../models/document');
const i18n = require('i18n');
const { replaceUrlWithImg } = require('../../middleware/validation');

router.get('/', async (req, res) => {
    res.redirect('/list');
});

router.get('/:id', async (req, res) => {
    const id = req.params.id;
    
    try {
        let document;
        if (res.locals.user.permissions.manage_documents) {
            document = await Document.findById(id);
        } else {
            document = await Document.findOne({ _id: id, deleted: false });
        }

        if (document) {
            for (let i = 0; i < document._doc.information.length; i++) {
                for (let j = 0; j < document._doc.information[i].fields.length; j++) {
                    const field = document._doc.information[i].fields[j];
                    let formattedValue = await replaceUrlWithImg(field.value)
                    field.set('value', formattedValue);
                }
            }
            
            res.render('documents/single', {
                title: i18n.__("document") + ': ' + document._id + ' - ' + i18n.__('app_name'),
                document,
                link: process.env.DOMAIN + '/doc/' + document._id
            });
        } else {
            res.redirect('/list');
        }
    } catch (error) {
        console.error('Error querying database:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = router;
