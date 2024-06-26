const express = require('express');
const router = express.Router();
const Document = require('../../models/document');
const i18n = require('i18n');
const { replaceUrlWithImg } = require('../../middleware/validation');

router.get('/', async (req, res) => {
    res.redirect('/list');
});

router.get('/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const locale_codes = i18n.getLocales();
        let qrLabels = []
        locale_codes.forEach(code => {
            qrLabels.push({code, label: 'record_no', value: i18n.__({ phrase: 'record_no', locale: code})});
            qrLabels.push({code, label: 'record_date_issue', value: i18n.__({ phrase: 'record_date_issue', locale: code})});
            qrLabels.push({code, label: 'record_date_edit', value: i18n.__({ phrase: 'record_date_edit', locale: code})});
            qrLabels.push({code, label: 'record_information', value: i18n.__({ phrase: 'record_information', locale: code})});
        });


        const queryString = res.locals.user.permissions.manage_documents ? { _id: id } : { _id: id, deleted: false };
        let document = await Document.findOne(queryString);

        if (document) {
            await document.populate('information._id');
            
            for (let i = 0; i < document._doc.information.length; i++) {
                for (let j = 0; j < document._doc.information[i].fields.length; j++) {
                    const field = document._doc.information[i].fields[j];
                    let formattedValue = await replaceUrlWithImg(field.value)
                    field.set('value', formattedValue);
                }
            }
            
            document = document.toObject();
            document.information = document.information.map(info => {
                return {
                    _id: info._id._id,
                    public: info.public,
                    labels: info._id.labels,
                    descriptions: info._id.descriptions,
                    fields: info.fields.map(field => {
                        const matchingField = info._id.fields.find(f => f._id.equals(field._id));
                        if (matchingField) {
                            return { ...matchingField, value: field.value };
                        }
                        return field;
                    })
                };
            });
            
            res.render('documents/single', {
                title: i18n.__("document") + ': ' + document._id + ' - ' + i18n.__('app_name'),
                document,
                qrLabels
            });
        } else {
            res.redirect('/doc/list');
        }
    } catch (error) {
        console.error('Error querying database:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = router;
