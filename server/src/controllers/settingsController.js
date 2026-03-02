const fs = require('fs');
const path = require('path');

// Helper to update a specific key in .env content
const updateEnv = (content, key, val) => {
    const regex = new RegExp(`^${key}=.*`, 'm');
    if (regex.test(content)) {
        return content.replace(regex, `${key}=${val}`);
    } else {
        return content + `\n${key}=${val}`;
    }
};

// POST /api/settings/save-key
const saveKey = async (req, res) => {
    try {
        const { apiKey, model } = req.body;
        if (!apiKey) return res.status(400).json({ error: 'API Key is required' });

        // TARGET THE CLIENT FOLDER, NOT SERVER FOLDER
        const clientEnvPath = path.join(__dirname, '../../../client/.env');

        // Read existing file or create empty
        let envContent = '';
        if (fs.existsSync(clientEnvPath)) {
            envContent = fs.readFileSync(clientEnvPath, 'utf8');
        }

        // Update environment variables
        envContent = updateEnv(envContent, 'VITE_GROQ_API_KEY', apiKey);
        if (model) envContent = updateEnv(envContent, 'VITE_GROQ_MODEL', model);

        fs.writeFileSync(clientEnvPath, envContent.trim() + '\n');

        console.log(`✅ API: Updated client/.env with new Groq Key at ${clientEnvPath}`);
        res.json({ message: 'Settings saved to client configuration successfully' });
    } catch (error) {
        console.error('❌ Failed to save .env:', error);
        res.status(500).json({ error: 'Failed to save settings to server storage' });
    }
};

module.exports = { saveKey };
