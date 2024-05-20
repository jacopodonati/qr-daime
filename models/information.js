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
    descriptions: [descriptionSchema]
});

const informationSchema = new mongoose.Schema({
    labels: [labelSchema],
    descriptions: [descriptionSchema],
    fields: [fieldSchema],
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