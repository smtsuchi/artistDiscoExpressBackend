const logger = require('../config/logger');

/**
 * Error handling middleware
 * Catches all errors and sends a standardized response
 */
const errorHandler = (err, req, res, next) => {
    logger.error('Error occurred:', {
        message: err.message,
        stack: err.stack,
        path: req.path,
        method: req.method
    });

    // Mongoose validation error
    if (err.name === 'ValidationError') {
        return res.status(400).json({
            success: false,
            error: 'Validation Error',
            details: Object.values(err.errors).map(e => e.message)
        });
    }

    // Mongoose duplicate key error
    if (err.code === 11000) {
        return res.status(409).json({
            success: false,
            error: 'Duplicate Entry',
            details: 'A record with this identifier already exists'
        });
    }

    // Mongoose cast error (invalid ObjectId, etc.)
    if (err.name === 'CastError') {
        return res.status(400).json({
            success: false,
            error: 'Invalid Data Format',
            details: `Invalid ${err.path}: ${err.value}`
        });
    }

    // Joi validation error
    if (err.isJoi) {
        return res.status(400).json({
            success: false,
            error: 'Validation Error',
            details: err.details.map(d => d.message)
        });
    }

    // Default to 500 server error
    res.status(err.statusCode || 500).json({
        success: false,
        error: err.message || 'Internal Server Error',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
};

/**
 * 404 Not Found handler
 */
const notFound = (req, res, next) => {
    const error = new Error(`Not Found - ${req.originalUrl}`);
    res.status(404);
    next(error);
};

module.exports = {
    errorHandler,
    notFound
};
