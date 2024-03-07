const express = require('express');
const router = express.Router();
const { getClient, ObjectId } = require('../db');

router.get('/:hash', async (req, res) => {
    const hash = req.params.hash;
    try {
        const client = await getClient(); 
        const database = client.db('da1me');
        const collection = database.collection('documents');

        const document = await collection.findOne({ _id: new ObjectId(hash) });

        if (document) {
            res.render('doc', {
                title: 'Issue: ' + document._id,
                document: document
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
