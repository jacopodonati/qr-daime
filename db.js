const { MongoClient, ObjectId } = require('mongodb');
const { mongodbURI } = require('./config');

const client = new MongoClient(mongodbURI);

async function connectToMongo() {
    try {
        await client.connect();
        console.log('Connected to MongoDB');
    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
    }
}

async function getClient() {
    // FIXME: check if connection has been established
    // if (!client.isConnected()) {
    //     await connectToMongo();
    // }
    return client;
}

module.exports = {
    getClient: getClient,
    ObjectId: ObjectId
};
