// =============================================
// GLOBAL ERROR HANDLER MIDDLEWARE
// =============================================

// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
    console.error('❌ Unhandled Error:', err.stack || err.message);
    const status = err.statusCode || 500;
    res.status(status).json({
        error: err.message || 'An unexpected server error occurred.'
    });
};

module.exports = errorHandler;
