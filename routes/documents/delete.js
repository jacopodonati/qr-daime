const express = require('express');
const router = express.Router();
const Document = require('../../models/document');
const Workspace = require('../../models/workspace');
const i18n = require('i18n');
const { replaceUrlWithImg } = require('../../middleware/validation');

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
        const queryString = res.locals.user.permissions.manage_documents ? { _id: id, deleted: false } : { _id: id, owner: res.locals.user._id, deleted: false };
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

            res.render('documents/delete', {
                title: 'document',
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

router.post('/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const queryString = res.locals.user.permissions.restore ? { _id: id, deleted: false } : { _id: id }
        const document = await Document.findById(queryString);

        if (document) {
            const personalWorkspace = await Workspace.findOne({ name: res.locals.user.email, privacy: 'personal' }, '_id');
            document.set('deleted', true);
            document.set('workspace', personalWorkspace._id);
            await document.save();
            res.redirect('/doc/list');
        } else {
            res.status(404).json({ error: 'Documento non trovato' });
        }
    } catch (error) {
        console.error('Errore nella cancellazione del documento:', error);
        res.status(500).json({ error: 'Errore del server interno' });
    }
});

module.exports = router;
