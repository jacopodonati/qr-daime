const express = require('express');
const router = express.Router();
const Document = require('../models/document');
const fs = require('fs');
const i18n = require('i18n');
const QRCode = require('qrcode');
const { domain } = require('../config');

QR_DIR = './static/qr/';
QR_LINK_DIR = 'link/';

function createQRDirectory() {
    try {
        if (!fs.existsSync(QR_DIR)) {
            fs.mkdirSync(QR_DIR);
        }

        if (!fs.existsSync(QR_DIR + QR_LINK_DIR)) {
            fs.mkdirSync(QR_DIR + QR_LINK_DIR);
        }

    } catch (err) {
        console.error('Si è verificato un errore durante la creazione delle cartelle per i QR:', err);
    }
}

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

router.get('/', async (req, res) => {
    res.redirect('/list');
});

router.get('/:hash', async (req, res) => {
    const hash = req.params.hash;
    const isAdmin = req.query.admin === 'true';
    console.log(isAdmin)

    try {
        const document = await Document.findById(hash);

        if (document) {
            const fullURL = `${domain}${req.originalUrl}`;
            const qrLinkPath = await getQRLink(hash, fullURL);
            res.render('doc', {
                title: i18n.__("document") + ': ' + document._id + ' - ' + i18n.__('app_name'),
                document: document,
                qr_link: qrLinkPath,
                isAdmin
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
