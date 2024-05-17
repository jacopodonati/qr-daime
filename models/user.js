const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
    email: String,
    password: String,
    activated: {
        type: Boolean,
        default: false
    },
    deleted: {
        type: Boolean,
        default: false
    },
    role: {
        type: String,
        enum: ['basic', 'admin', 'god'],
        default: 'basic'
    },
    workspaces: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Workspace'
    }]
});

async function encryptPassword(password) {
    const salt = await bcrypt.genSalt(parseInt(process.env.BCRYPT_ROUNDS));
    return await bcrypt.hash(password, salt);
}

userSchema.pre('save', async function (next) {
    try {
        if (this.isModified('password')) {
            this.password = await encryptPassword(this.password);
        }
        next();
    } catch (error) {
        next(error);
    }
});

userSchema.pre('findOneAndUpdate', async function (next) {
    try {
        const update = this.getUpdate();
        if (update && update.password) {
            update.password = await encryptPassword(update.password);
            this.setUpdate(update);
        }
        next();
    } catch (error) {
        next(error);
    }
});



const User = mongoose.model('User', userSchema);

module.exports = User;
