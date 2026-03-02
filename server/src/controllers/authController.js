const User = require('../../database/models/User');

// POST /api/auth/signup
const signup = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }
        if (password.length < 6) {
            return res.status(400).json({ error: 'Password must be at least 6 characters' });
        }
        const existing = await User.findOne({ email: email.toLowerCase().trim() });
        if (existing) {
            return res.status(409).json({ error: 'An account with this email already exists' });
        }
        const user = new User({ email, password, role: 'user' });
        await user.save();
        console.log(`✅ New user registered: ${email}`);
        res.status(201).json({ success: true, user: { email: user.email, role: user.role } });
    } catch (err) {
        console.error('❌ Signup Error:', err.message);
        res.status(500).json({ error: 'Registration failed. Please try again.' });
    }
};

// POST /api/auth/login
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }
        const user = await User.findOne({ email: email.toLowerCase().trim() });
        if (!user) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }
        const isMatch = user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }
        console.log(`✅ User logged in: ${email} (${user.role})`);
        res.json({ success: true, user: { email: user.email, role: user.role } });
    } catch (err) {
        console.error('❌ Login Error:', err.message);
        res.status(500).json({ error: 'Login failed. Please try again.' });
    }
};

module.exports = { signup, login };
