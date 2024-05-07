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
}, { _id: false });

const workspaceSchema = new mongoose.Schema({
    name: String,
    members: [memberSchema],
    privacy: {
        type: String,
        enum: ['private', 'shared', 'public', 'personal'],
        default: 'private'
    },
    deleted: {
        type: Boolean,
        default: false
    }
});

const Workspace = mongoose.model('Workspace', workspaceSchema);

module.exports = Workspace;
