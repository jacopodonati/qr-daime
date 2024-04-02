const mongoose = require('mongoose');

mongoose.connect(process.env.MONGODB_URI);

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
