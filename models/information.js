const mongoose = require('mongoose');

const labelSchema = new mongoose.Schema({
    locale: String,
    text: String
}, { _id: false });

const descriptionSchema = new mongoose.Schema({
    locale: String,
    text: String
}, { _id: false });

const fieldSchema = new mongoose.Schema({
    labels: [labelSchema],
    descriptions: [descriptionSchema],
    htmlSafe: {
        type: Boolean,
        default: true
    },
    type: {
        type: String,
        enum: ['text', 'rich', 'bool', 'list', 'dict'],
        default: 'text'
    }
});

const informationSchema = new mongoose.Schema({
    labels: [labelSchema],
    descriptions: [descriptionSchema],
    fields: [fieldSchema],
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    default: {
        type: Boolean,
        default: false
    },
    deleted: {
        type: Boolean,
        default: false
    },
    workspace: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Workspace'
    }
});

const Information = mongoose.model('Information', informationSchema);

module.exports = Information;