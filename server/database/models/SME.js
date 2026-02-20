const mongoose = require('mongoose');

const SMESchema = new mongoose.Schema({
    name: { type: String, required: true },
    apiKey: { type: String, required: true },
    model: { type: String, default: 'llama-3.3-70b-versatile' },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('SME', SMESchema);
