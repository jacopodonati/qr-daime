const mongoose = require('mongoose');

const memberSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    role: {
        type: String,
        enum: ['basic', 'workspace_admin'],
        default: 'basic'
    }
});

const workspaceSchema = new mongoose.Schema({
    name: String,
    members: [memberSchema],
    documents: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Document'
    }],
    informations: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Information'
    }]
});

const Workspace = mongoose.model('Workspace', workspaceSchema);

module.exports = Workspace;
