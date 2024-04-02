const express = require('express');
const router = express.Router();
const Document = require('../models/document');
const Information = require('../models/information');

router.get('/', async (req, res) => {
    try {
        const doc_count = await Document.countDocuments();
        const info_count = await Information.countDocuments();
        const count = doc_count + info_count;

        if (count === 0) {
            await insertSampleData();
            res.redirect('/');
        } else {
            res.redirect('/');
        }
    } catch (error) {
        console.error('Errore durante il setup:', error);
        res.status(500).send('Errore durante il setup del database.');
    }
});

async function insertSampleData() {
    let info_daime = new Information({
        "labels": [
          {
            "locale": "it",
            "text": "Caratteristiche del daime"
          },
          {
            "locale": "en",
            "text": "Characteristics of the daime"
          },
          {
            "locale": "pt",
            "text": "Características do daime"
          }
        ],
        "fields": [
          {
            "labels": [
              {
                "locale": "it",
                "text": "Qualità"
              },
              {
                "locale": "en",
                "text": "Quality"
              },
              {
                "locale": "pt",
                "text": "Qualidade"
              }
            ]
          },
          {
            "labels": [
              {
                "locale": "it",
                "text": "Concentrazione"
              },
              {
                "locale": "en",
                "text": "Concentration"
              },
              {
                "locale": "pt",
                "text": "Concentração"
              }
            ]
          }
        ],
        "default": true
      });
    await info_daime.save();

    let info_harvest = new Information({
    "labels": [
        {
        "locale": "it",
        "text": "Raccolta"
        },
        {
        "locale": "en",
        "text": "Harvest"
        },
        {
        "locale": "pt",
        "text": "Colheita"
        }
    ],
    "fields": [
        {
        "labels": [
            {
            "locale": "it",
            "text": "Data"
            },
            {
            "locale": "en",
            "text": "Date"
            },
            {
            "locale": "pt",
            "text": "Data"
            }
        ]
        },
        {
        "labels": [
            {
            "locale": "it",
            "text": "Luogo"
            },
            {
            "locale": "en",
            "text": "Place"
            },
            {
            "locale": "pt",
            "text": "Local"
            }
        ]
        }
    ],
    "default": false
    });
    await info_harvest.save();

    let info_feitio = new Information({
        "labels": [
          {
            "locale": "it",
            "text": "Feitio"
          },
          {
            "locale": "en",
            "text": "Feitio"
          },
          {
            "locale": "pt",
            "text": "Feitio"
          }
        ],
        "fields": [
          {
            "labels": [
              {
                "locale": "it",
                "text": "Data"
              },
              {
                "locale": "en",
                "text": "Date"
              },
              {
                "locale": "pt",
                "text": "Data"
              }
            ]
          },
          {
            "labels": [
              {
                "locale": "it",
                "text": "Luogo"
              },
              {
                "locale": "en",
                "text": "Place"
              },
              {
                "locale": "pt",
                "text": "Lugar"
              }
            ]
          }
        ],
        "default": false
      })
      await info_feitio.save();
}

module.exports = router;
