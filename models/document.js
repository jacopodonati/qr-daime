// document.js
const mongoose = require('mongoose');

const fieldDataSchema = new mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    value: String
});

const fieldSchema = new mongoose.Schema({
    _id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Information'
    },
    fields: [fieldDataSchema],
    public: {
        type: Boolean,
        default: false
    }
});

const documentSchema = new mongoose.Schema({
    dateOfIssue: {
        type: Date,
        default: Date.now
    },
    fields: [fieldSchema]
});

const Document = mongoose.model('Document', documentSchema);

module.exports = Document;
