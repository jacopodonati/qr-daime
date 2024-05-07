const mongoose = require('mongoose');

const fieldSchema = new mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    value: String
});

const informationSchema = new mongoose.Schema({
    _id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Information'
    },
    fields: [fieldSchema],
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
    deleted: {
        type: Boolean,
        default: false
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    qrDocument: String,
    qrUrl: String,
    information: [informationSchema],
    workspace: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Workspace'
    }
});

documentSchema.post('find', function(docs) {
    docs.forEach(doc => {
        doc.information.forEach(field => {
            field.fields.sort((a, b) => a.sort - b.sort);
        });
    });
});

const Document = mongoose.model('Document', documentSchema);

module.exports = Document;
