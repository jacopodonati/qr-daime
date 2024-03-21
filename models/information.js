const mongoose = require('mongoose');

const labelSchema = new mongoose.Schema({
    locale: String,
    text: String
});

const fieldSchema = new mongoose.Schema({
    labels: [labelSchema]
});

const informationSchema = new mongoose.Schema({
    labels: [labelSchema],
    fields: [fieldSchema],
    default: {
        type: Boolean,
        default: false
    },
    public: Boolean
});

const Information = mongoose.model('Information', informationSchema);

module.exports = Information;