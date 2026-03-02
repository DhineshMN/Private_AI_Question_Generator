const mongoose = require('mongoose');
const path = require('path');
const User = require('../../database/models/User');

const connectDB = async () => {
    mongoose.connection.on('error', err => console.error('❌ Mongoose Connection Error Event:', err));
    mongoose.connection.on('disconnected', () => console.log('⚠️ Mongoose disconnected!'));

    await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 5000 })
        .then(async () => {
            console.log('✅ Connected to MongoDB (Compass)');
            // Seed Master Admin
            try {
                const existing = await User.findOne({ email: 'admin@admin.com' });
                if (!existing) {
                    await new User({ email: 'admin@admin.com', password: 'admin123', role: 'admin' }).save();
                    console.log('🔑 Master Admin seeded: admin@admin.com / admin123');
                }
            } catch (e) { console.error('Seed error:', e.message); }
        })
        .catch((err) => console.error('❌ MongoDB Connection Error:', err));
};

module.exports = connectDB;
