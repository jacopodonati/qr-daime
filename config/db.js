const mongoose = require('mongoose');

mongoose.connect(process.env.MONGODB_URI);

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'Errore di connessione al database:'));
db.once('open', async () => {
    console.log('Connessione al database MongoDB avvenuta con successo');
});

module.exports = db;
