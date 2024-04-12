const Information = require('./models/information');
const QRCode = require('qrcode');

QR_DOC_LOCALE = 'en';

const formatDate = (dateString) => {
    const options = { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false };
    const formattedDate = new Date(dateString).toLocaleString(QR_DOC_LOCALE, options);
    return formattedDate;
};

async function getQRDocumentContent(document) {
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
    
    return text;
}

async function getQRCodeString(text) {
    return await QRCode.toDataURL(text)
}

async function getQRCodeSVG(text) {
    return await QRCode.toString(text, { type: 'svg' });
}

module.exports = {
    'getQRDocumentContent': getQRDocumentContent,
    'getQRCodeString': getQRCodeString,
    'getQRCodeSVG': getQRCodeSVG
}