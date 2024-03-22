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
    },
    sort: Number
});

const documentSchema = new mongoose.Schema({
    dateOfIssue: {
        type: Date,
        default: Date.now
    },
    lastEdit: {
        type: Date,
        default: Date.now
    },
    fields: [fieldSchema]
});

documentSchema.post('find', function(docs) {
    docs.forEach(doc => {
        doc.fields.forEach(field => {
            field.fields.sort((a, b) => a.sort - b.sort);
        });
    });
});

const Document = mongoose.model('Document', documentSchema);

module.exports = Document;
