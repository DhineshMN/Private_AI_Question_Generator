const mongoose = require('mongoose');
const crypto = require('crypto');

const UserSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['admin', 'user'], default: 'user' },
    createdAt: { type: Date, default: Date.now }
});

// Hash password before saving
UserSchema.pre('save', async function () {
    if (!this.isModified('password')) return;
    this.password = crypto.createHash('sha256').update(this.password).digest('hex');
});

// Compare password method
UserSchema.methods.comparePassword = function (candidatePassword) {
    const hash = crypto.createHash('sha256').update(candidatePassword).digest('hex');
    return this.password === hash;
};

module.exports = mongoose.model('User', UserSchema);
