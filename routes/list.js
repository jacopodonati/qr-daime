const express = require('express');
const router = express.Router();
const { getClient, ObjectId } = require('../db');
const i18n = require('i18n');

router.get('/', async (req, res) => {
    try {
        const client = await getClient(); 
        const database = client.db('da1me');
        const collection = database.collection('documents');

        const documents = await collection.find({}).toArray();
        res.render('list', {
            title: i18n.__('listpage_title') + ' - ' + i18n.__('app_name'),
            documents: documents
        });

    } catch (error) {
        console.error('Error querying database:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = router;
