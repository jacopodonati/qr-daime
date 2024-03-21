const mongoose = require('mongoose');
const { mongodbURI } = require('./config');

mongoose.connect(mongodbURI);

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'Errore di connessione al database:'));
db.once('open', async () => {
    console.log('Connessione al database MongoDB avvenuta con successo');
    
    try {
        const collections = await mongoose.connection.db.collections();
    } catch (err) {
        console.error('Errore durante l\'ottenimento dei nomi delle collezioni:', err);
    }
});

module.exports = mongoose;
