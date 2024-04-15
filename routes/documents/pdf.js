const express = require('express');
const router = express.Router();
const Document = require('../../models/document');
const PDFDocument = require('pdfkit');
const { getQRCodeString } = require('../../qr');

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

    try {
        let document;
        if (req.isAdmin) {
            document = await Document.findById(id);
        } else {
            document = await Document.findOne({ _id: id, deleted: false });
        }

        if (document) {         
            const PAGE_WIDTH = mmToPoints(140);
            const PAGE_HEIGHT = mmToPoints(65);
            const PAGE_BG_COLOR = '#fcee4f';
            const PAGE_FG_COLOR = '#000000';
            const PAGE_MARGIN_TOP = mmToPoints(3.9);
            const PAGE_MARGIN_RIGHT = PAGE_MARGIN_TOP;
            const PAGE_MARGIN_LEFT = PAGE_MARGIN_RIGHT;
            const PAGE_MARGIN_BOTTOM = PAGE_MARGIN_TOP;

            const FONT_SIZE_SMALLER = 6;
            const FONT_SIZE_SMALL = 10;
            const FONT_SIZE_LARGE = 12;

            const FORM_BG_COLOR = '#dadada';
            const FORM_MARGIN_TOP = PAGE_MARGIN_RIGHT + 0;
            const FORM_MARGIN_RIGHT = PAGE_MARGIN_LEFT + 0;
            const FORM_MARGIN_LEFT = PAGE_MARGIN_RIGHT + mmToPoints(17.6);
            const FORM_MARGIN_BOTTOM = PAGE_MARGIN_BOTTOM + 0;
            const FORM_WIDTH = PAGE_WIDTH - FORM_MARGIN_RIGHT - FORM_MARGIN_LEFT;
            const FORM_HEIGHT = PAGE_HEIGHT - FORM_MARGIN_TOP - FORM_MARGIN_BOTTOM;

            const LOGO_MARGIN_TOP = mmToPoints(4);
            const LOGO_MARGIN_LEFT = mmToPoints(10);
            const LOGO_MARGIN_BOTTOM = mmToPoints(8);
            const LOGO_WIDTH = mmToPoints(14);
            const LOGO_HEIGHT = mmToPoints(19);

            const pdfDocument = new PDFDocument({ size: [PAGE_WIDTH, PAGE_HEIGHT] });
            pdfDocument.page.margins = { top: 0, left: 0, bottom: 0, right: 0 };

            pdfDocument.fillColor(PAGE_BG_COLOR);
            pdfDocument.rect(0, 0, PAGE_WIDTH, PAGE_HEIGHT).fill();
            
            pdfDocument.image('static/img/logo.png', LOGO_MARGIN_TOP, LOGO_MARGIN_LEFT, { width: LOGO_WIDTH, height: LOGO_HEIGHT });
            
            pdfDocument.fillColor(PAGE_FG_COLOR);
            const LOGO_TEXT = 'ICEFLU';
            const BOX_WIDTH = LOGO_WIDTH;
            let text_width = pdfDocument.widthOfString(LOGO_TEXT);
            let text_height = pdfDocument.heightOfString(LOGO_TEXT);
            let textX = ((BOX_WIDTH - text_width) / 2) + (LOGO_MARGIN_LEFT / 2);
            let textY = LOGO_HEIGHT + LOGO_MARGIN_TOP + LOGO_MARGIN_BOTTOM;

            pdfDocument.fontSize(FONT_SIZE_SMALL);
            pdfDocument.text(LOGO_TEXT, textX, textY);
            let string_position_y = textY + text_height;

            pdfDocument.fontSize(FONT_SIZE_SMALLER);
            const strings = ['IGREJA DO CULTO', 'ECLÉTICO DA', 'FLUENTE LUZ', 'UNIVERSAL', 'PATRONO', 'SEBASTIÃO MOTA', 'DE MELO', 'SANTO DAIME'];
            strings.forEach(function(string) {
                text_width = pdfDocument.widthOfString(string);
                text_height = pdfDocument.heightOfString(string);
                textX = ((BOX_WIDTH - text_width) / 2) + (LOGO_MARGIN_LEFT / 2.7);
                textY = string_position_y;
                pdfDocument.text(string, textX, textY);
                string_position_y += text_height;
            });

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

            string_position_y = STARTING_Y;
            pdfDocument.fillColor(FIELD_BG_COLOR);
            for (let i = 0; i < NUM_OF_ROWS; i++) {
                if (i < 2) {
                    pdfDocument.rect(STARTING_X, string_position_y, LONG_FIELD_WIDTH, FIELD_HEIGHT).fill();
                    pdfDocument.rect(STARTING_X + LONG_FIELD_WIDTH + GUTTER_X, string_position_y, SHORT_FIELD_WIDTH, FIELD_HEIGHT).fill();
                } else {
                    pdfDocument.rect(STARTING_X, string_position_y, FULL_FIELD_WIDTH, FIELD_HEIGHT).fill();
                }
                string_position_y += FIELD_HEIGHT + GUTTER_Y;
            }

            pdfDocument.fillColor(PAGE_FG_COLOR);
            pdfDocument.fontSize(FONT_SIZE_SMALL);
            const FONT_HEIGHT = pdfDocument.currentLineHeight();
            const FIELD_LABEL_PADDING_LEFT = STARTING_X + 4;
            const FIELD_LABEL_PADDING_BOTTOM = 3;
            const SHORT_FIELD_PADDING_LEFT = FIELD_LABEL_PADDING_LEFT + LONG_FIELD_WIDTH + GUTTER_X;

            string_position_y = STARTING_Y + FIELD_HEIGHT - FIELD_LABEL_PADDING_BOTTOM - FONT_HEIGHT;
            pdfDocument.text('Grau:', FIELD_LABEL_PADDING_LEFT, string_position_y);
            pdfDocument.text('Fabricação:   ___/___/____', SHORT_FIELD_PADDING_LEFT, string_position_y);
            
            string_position_y += FIELD_HEIGHT + GUTTER_Y;
            pdfDocument.text('Casa de Feitio:', FIELD_LABEL_PADDING_LEFT, string_position_y);
            pdfDocument.text('Validade:       ___/___/____', SHORT_FIELD_PADDING_LEFT, string_position_y);
            
            string_position_y += FIELD_HEIGHT + GUTTER_Y;
            pdfDocument.text('Feitor:', FIELD_LABEL_PADDING_LEFT, string_position_y);
            
            string_position_y += FIELD_HEIGHT + GUTTER_Y;
            pdfDocument.text('Ingredientes:', FIELD_LABEL_PADDING_LEFT, string_position_y);
            pdfDocument.fontSize(FONT_SIZE_LARGE);
            pdfDocument.text('Chá de banisteriopsis caapi\ne psychotria viridis', FIELD_LABEL_PADDING_LEFT + 70, string_position_y - 14);
            
            pdfDocument.fontSize(FONT_SIZE_SMALL);
            string_position_y += FIELD_HEIGHT + GUTTER_Y;
            pdfDocument.text('Procedência\nFolha Rainha/Jagube:', FIELD_LABEL_PADDING_LEFT, string_position_y - FONT_HEIGHT);

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
