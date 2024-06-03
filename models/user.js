const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
    email: String,
    password: String,
    username: String,
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

async function getUniqueUsername(username) {
    let newUsername = username;
    let usernameInUse = await User.findOne({ username: newUsername });
    if (usernameInUse) {
        let counter = 1;
        do {
            usernameInUse = await User.findOne({ username: `${newUsername}_${counter}` });
            counter++;
        } while (usernameInUse);
        newUsername = `${newUsername}_${counter}`;
    }

    return newUsername;
}

userSchema.pre('save', async function (next) {
    try {
        if (this.isModified('password')) {
            this.password = await encryptPassword(this.password);
        }
        if (this.isModified('username')) {
            this.username = await getUniqueUsername(this.username)
        }
        next();
    } catch (error) {
        next(error);
    }
});

userSchema.pre('findOneAndUpdate', async function (next) {
    try {
        const update = this.getUpdate();

        if (update) {
            if (update.password) {
                update.password = await encryptPassword(update.password);
                this.setUpdate(update);
            }
            if (update.username) {
                update.username = await getUniqueUsername(update.username);
                this.setUpdate(update);
            }
        }

        next();
    } catch (error) {
        next(error);
    }
});



const User = mongoose.model('User', userSchema);

module.exports = User;
