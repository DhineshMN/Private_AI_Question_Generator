const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '.env') });

// Import DB connection
const connectDB = require('./src/config/db');

// Import Routes
const authRoutes = require('./src/routes/authRoutes');
const questionRoutes = require('./src/routes/questionRoutes');
const smeRoutes = require('./src/routes/smeRoutes');
const statsRoutes = require('./src/routes/statsRoutes');
const settingsRoutes = require('./src/routes/settingsRoutes');

// Import Error Handler Middleware
const errorHandler = require('./src/middleware/errorHandler');

// Initialize Express App
const app = express();
const PORT = process.env.PORT || 5000;

// =============================================
// GLOBAL MIDDLEWARE
// =============================================
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// =============================================
// DATABASE CONNECTION
// =============================================
connectDB();

// =============================================
// ROUTES
// =============================================
app.use('/api/auth', authRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/smes', smeRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/settings', settingsRoutes);

// =============================================
// GLOBAL ERROR HANDLER
// =============================================
app.use(errorHandler);

// =============================================
// START SERVER
// =============================================
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});
