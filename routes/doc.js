const express = require('express');
const router = express.Router();
const fs = require('fs');
const { getClient, ObjectId } = require('../db');
const i18n = require('i18n');
const QRCode = require('qrcode');
const { domain } = require('../config');

QR_CODE_DIR = './static/qr/'

// TODO: check if `QR_CODE_DIR` exists and make it.

async function getQRCode(hash, url) {
    const qrCodePath = QR_CODE_DIR + hash + '.png';

    return new Promise((resolve, reject) => {
        fs.access(qrCodePath, fs.constants.F_OK, async (err) => {
            if (err) {
                try {
                    await QRCode.toFile(qrCodePath, url);
                    resolve(qrCodePath);
                } catch (error) {
                    reject(error);
                }
            } else {
                resolve(qrCodePath);
            }
        });
    });
}

router.get('/:hash', async (req, res) => {
    const hash = req.params.hash;
    try {
        const client = await getClient(); 
        const database = client.db('da1me');
        const collection = database.collection('documents');

        const document = await collection.findOne({ _id: new ObjectId(hash) });

        if (document) {
            const fullURL = `${domain}${req.originalUrl}`;
            console.log(fullURL)
            const qrCodePath = await getQRCode(hash, fullURL);
            res.render('doc', {
                title: i18n.__("document") + ': ' + document._id + ' - ' + i18n.__('app_name'),
                document: document,
                qr: qrCodePath
            });
        } else {
            res.redirect('/list');
        }

    } catch (error) {
        console.error('Error querying database:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.use('/static', express.static('static'));

module.exports = router;
