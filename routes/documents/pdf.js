const express = require('express');
const router = express.Router();
const Document = require('../../models/document');
const PDFDocument = require('pdfkit');
const { getQRCodeSVG, getQRCodeString } = require('../../qr');

function mmToPoints(length_mm) {
    const MM_TO_POINTS = 72 / 25.4;
    const length_in_pts = length_mm * MM_TO_POINTS;
    return length_in_pts;
}

function getDocLink(id) {
    return process.env.DOMAIN + '/doc/' + id
}

function addImageToPDF(pdfDoc, dataUrl, x, y, width, height) {
    return new Promise((resolve, reject) => {
      const imageData = dataUrl.split(';base64,').pop();
      const imageBuffer = Buffer.from(imageData, 'base64');
      pdfDoc.image(imageBuffer, x, y, { width, height });
      resolve();
    });
  }

router.get('/', async (req, res) => {
    res.redirect('/list');
});

router.get('/:id/:what?', async (req, res) => {
    const id = req.params.id;
    const isAdmin = req.query.hasOwnProperty('admin');

    try {
        let document;
        if (isAdmin) {
            document = await Document.findById(id);
        } else {
            document = await Document.findOne({ _id: id, deleted: false });
        }

        if (document) {         
            const PAGE_WIDTH = mmToPoints(140);
            const PAGE_HEIGHT = mmToPoints(65);
            const PAGE_BG_COLOR = '#fcee4f';
            const PAGE_FG_COLOR = '#000000';
            const pdfDocument = new PDFDocument({ size: [PAGE_WIDTH, PAGE_HEIGHT] });
            pdfDocument.page.margins = { top: 0, left: 0, bottom: 0, right: 0 };

            const PAGE_MARGIN_TOP = mmToPoints(3.9);
            const PAGE_MARGIN_RIGHT = PAGE_MARGIN_TOP;
            const PAGE_MARGIN_LEFT = PAGE_MARGIN_RIGHT;
            const PAGE_MARGIN_BOTTOM = PAGE_MARGIN_TOP;

            const FORM_BG_COLOR = '#dadada';
            const FORM_MARGIN_TOP = PAGE_MARGIN_RIGHT + 0;
            const FORM_MARGIN_RIGHT = PAGE_MARGIN_LEFT + 0;
            const FORM_MARGIN_LEFT = PAGE_MARGIN_RIGHT + mmToPoints(17.6);
            const FORM_MARGIN_BOTTOM = PAGE_MARGIN_BOTTOM + 0;
            const FORM_WIDTH = PAGE_WIDTH - FORM_MARGIN_RIGHT - FORM_MARGIN_LEFT;
            const FORM_HEIGHT = PAGE_HEIGHT - FORM_MARGIN_TOP - FORM_MARGIN_BOTTOM;

            pdfDocument.fillColor(PAGE_BG_COLOR);
            pdfDocument.rect(0, 0, PAGE_WIDTH, PAGE_HEIGHT).fill();

            pdfDocument.fillColor(FORM_BG_COLOR);
            pdfDocument.rect(FORM_MARGIN_LEFT, FORM_MARGIN_TOP, FORM_WIDTH, FORM_HEIGHT).fill();

            const GUTTER_X = mmToPoints(1.43);
            const GUTTER_Y = mmToPoints(1.43);
            const FIELD_BG_COLOR = '#ffffff';
            const FULL_FIELD_WIDTH = FORM_WIDTH - (GUTTER_X * 2);
            const SHORT_FIELD_WIDTH = mmToPoints(49);
            const LONG_FIELD_WIDTH = FULL_FIELD_WIDTH - GUTTER_X - SHORT_FIELD_WIDTH;
            const FIELD_HEIGHT = (FORM_HEIGHT - (GUTTER_X * 6)) / 5;
            const STARTING_Y = FORM_MARGIN_TOP + GUTTER_Y;
            const STARTING_X = FORM_MARGIN_LEFT + GUTTER_X;
            const NUM_OF_ROWS = 5;

            let position = STARTING_Y;
            pdfDocument.fillColor(FIELD_BG_COLOR);
            for (let i = 0; i < NUM_OF_ROWS; i++) {
                if (i < 2) {
                    pdfDocument.rect(STARTING_X, position, LONG_FIELD_WIDTH, FIELD_HEIGHT).fill();
                    pdfDocument.rect(STARTING_X + LONG_FIELD_WIDTH + GUTTER_X, position, SHORT_FIELD_WIDTH, FIELD_HEIGHT).fill();
                } else {
                    pdfDocument.rect(STARTING_X, position, FULL_FIELD_WIDTH, FIELD_HEIGHT).fill();
                }
                position += FIELD_HEIGHT + GUTTER_Y;
            }

            const FONT_SIZE_SMALL = 10;
            const FONT_SIZE_LARGE = 12;
            pdfDocument.fillColor(PAGE_FG_COLOR);
            pdfDocument.fontSize(FONT_SIZE_SMALL);
            const FONT_HEIGHT = pdfDocument.currentLineHeight();
            const FIELD_LABEL_PADDING_LEFT = STARTING_X + 4;
            const FIELD_LABEL_PADDING_BOTTOM = 3;
            const SHORT_FIELD_PADDING_LEFT = FIELD_LABEL_PADDING_LEFT + LONG_FIELD_WIDTH + GUTTER_X;

            position = STARTING_Y + FIELD_HEIGHT - FIELD_LABEL_PADDING_BOTTOM - FONT_HEIGHT;
            pdfDocument.text('Grau:', FIELD_LABEL_PADDING_LEFT, position);
            pdfDocument.text('Fabricação:   ___/___/____', SHORT_FIELD_PADDING_LEFT, position);
            
            position += FIELD_HEIGHT + GUTTER_Y;
            pdfDocument.text('Casa de Feitio:', FIELD_LABEL_PADDING_LEFT, position);
            pdfDocument.text('Validade:       ___/___/____', SHORT_FIELD_PADDING_LEFT, position);
            
            position += FIELD_HEIGHT + GUTTER_Y;
            pdfDocument.text('Feitor:', FIELD_LABEL_PADDING_LEFT, position);
            
            position += FIELD_HEIGHT + GUTTER_Y;
            pdfDocument.text('Ingredientes:', FIELD_LABEL_PADDING_LEFT, position);
            pdfDocument.fontSize(FONT_SIZE_LARGE);
            pdfDocument.text('Chá de banisteriopsis caapi\ne psychotria viridis', FIELD_LABEL_PADDING_LEFT + 70, position - 14);
            
            pdfDocument.fontSize(FONT_SIZE_SMALL);
            position += FIELD_HEIGHT + GUTTER_Y;
            pdfDocument.text('Procedência\nFolha Rainha/Jagube:', FIELD_LABEL_PADDING_LEFT, position - FONT_HEIGHT);

            const QR_PANEL_SIZE = (GUTTER_Y * 3) + (FIELD_HEIGHT * 2);
            const QR_PANEL_X = PAGE_WIDTH - PAGE_MARGIN_RIGHT - QR_PANEL_SIZE;
            const QR_PANEL_Y = PAGE_HEIGHT - PAGE_MARGIN_BOTTOM - QR_PANEL_SIZE;
            const QR_SIZE = QR_PANEL_SIZE - (GUTTER_Y * 2);
            const QR_X = QR_PANEL_X + GUTTER_X;
            const QR_Y = QR_PANEL_Y + GUTTER_Y;
            const QR = await getQRCodeString(getDocLink(document._id));
            pdfDocument.fillColor(FORM_BG_COLOR);
            pdfDocument.rect(QR_PANEL_X, QR_PANEL_Y, QR_PANEL_SIZE, QR_PANEL_SIZE).fill();

            addImageToPDF(pdfDocument, QR, QR_X, QR_Y, QR_SIZE, QR_SIZE)
                .then(() => {
                    res.setHeader('Content-Type', 'application/pdf');
                    pdfDocument.pipe(res);
                    pdfDocument.end();
                })
                .catch(error => {
                  console.error('Errore:', error);
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
