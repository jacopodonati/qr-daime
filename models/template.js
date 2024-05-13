const mongoose = require('mongoose');

const templateSchema = new mongoose.Schema({
    title: String,
    deleted: {
        type: Boolean,
        default: false
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    info: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Information'
    }],
    workspace: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Workspace'
    }
});

const Template = mongoose.model('Template', templateSchema);

module.exports = Template;
