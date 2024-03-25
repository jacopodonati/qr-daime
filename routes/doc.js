const express = require('express');
const router = express.Router();
const Document = require('../models/document');
const Information = require('../models/information');
const fs = require('fs');
const i18n = require('i18n');
const QRCode = require('qrcode');
const { domain } = require('../config');

QR_DIR = './static/qr/';
QR_LINK_DIR = 'link/';
QR_DOC_DIR = 'doc/';
QR_DOC_LOCALE = 'en';

function createQRDirectory() {
    try {
        if (!fs.existsSync(QR_DIR)) {
            fs.mkdirSync(QR_DIR);
        }

        if (!fs.existsSync(QR_DIR + QR_LINK_DIR)) {
            fs.mkdirSync(QR_DIR + QR_LINK_DIR);
        }

        if (!fs.existsSync(QR_DIR + QR_DOC_DIR)) {
            fs.mkdirSync(QR_DIR + QR_DOC_DIR);
        }
    } catch (err) {
        console.error('Si è verificato un errore durante la creazione delle cartelle per i QR:', err);
    }
}

async function getQRDocument(document) {
    createQRDirectory();
    const qrCodePath = QR_DIR + QR_DOC_DIR + document._id + '.png';

    let text = `Document no. ${document._id}
Issued on: ${formatDate(document.dateOfIssue)}
Modified on: ${formatDate(document.lastEdit)}
Informations:`;

    for (const info of document.information) {
        const information = await Information.findById(info._id);
        const informationLabel = information.labels.find(label => label.locale === QR_DOC_LOCALE).text;
        text += `
- ${informationLabel}`
        for (const field of info.fields) {
            const fieldLabel = information.fields.find(field => field._id === field._id).labels.find(label => label.locale === QR_DOC_LOCALE).text;
            text += `
  - ${fieldLabel}: ${field.value}`
        }
    }

    return new Promise((resolve, reject) => {
        fs.access(qrCodePath, fs.constants.F_OK, async (err) => {
            if (err) {
                try {
                    await QRCode.toFile(qrCodePath, text);
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

const formatDate = (dateString) => {
    const options = { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false };
    const formattedDate = new Date(dateString).toLocaleString(QR_DOC_LOCALE, options);
    return formattedDate;
};

async function getQRLink(hash, url) {
    createQRDirectory();
    const qrCodePath = QR_DIR + QR_LINK_DIR + hash + '.png';

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

    try {
        const document = await Document.findById(hash);

        if (document) {
            const fullURL = `${domain}${req.originalUrl}`;
            const qrLinkPath = await getQRLink(hash, fullURL);
            const qrDocPath = await getQRDocument(document);
            res.render('doc', {
                title: i18n.__("document") + ': ' + document._id + ' - ' + i18n.__('app_name'),
                document: document,
                qr_link: qrLinkPath,
                qr_doc: qrDocPath,
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
