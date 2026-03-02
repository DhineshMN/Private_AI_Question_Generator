const SME = require('../../database/models/SME');

// GET /api/smes
const getAllSMEs = async (req, res) => {
    try {
        const smes = await SME.find().sort({ createdAt: -1 });
        res.json(smes);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// POST /api/smes
const addSME = async (req, res) => {
    try {
        const { name, apiKey, model } = req.body;

        if (!name || !apiKey) {
            return res.status(400).json({ error: 'Name and API Key are required' });
        }

        const newSme = new SME({
            name,
            apiKey,
            model: model || 'llama-3.3-70b-versatile'
        });

        await newSme.save();
        res.status(201).json({ message: 'SME Profile added successfully', sme: newSme });
    } catch (err) {
        console.error('❌ Error adding SME:', err.message);
        res.status(500).json({ error: err.message });
    }
};

// DELETE /api/smes/:id
const deleteSME = async (req, res) => {
    try {
        const deleted = await SME.findByIdAndDelete(req.params.id);
        if (!deleted) {
            return res.status(404).json({ error: 'SME not found' });
        }
        res.json({ message: 'SME Profile deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// PUT /api/smes/:id
const updateSME = async (req, res) => {
    try {
        const updates = {};
        if (req.body.model) updates.model = req.body.model;
        if (req.body.apiKey) updates.apiKey = req.body.apiKey;
        if (req.body.name) updates.name = req.body.name;

        const updatedSme = await SME.findByIdAndUpdate(
            req.params.id,
            { $set: updates },
            { new: true }
        );
        if (!updatedSme) {
            return res.status(404).json({ error: 'SME not found' });
        }
        res.json({ message: 'SME Profile updated successfully', sme: updatedSme });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = { getAllSMEs, addSME, deleteSME, updateSME };
