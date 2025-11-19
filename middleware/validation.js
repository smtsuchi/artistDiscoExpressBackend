const Joi = require('joi');

/**
 * Validation middleware factory
 * @param {Joi.Schema} schema - Joi validation schema
 * @returns {Function} Express middleware function
 */
const validate = (schema) => {
    return (req, res, next) => {
        const { error } = schema.validate(req.body, { abortEarly: false });
        if (error) {
            return res.status(400).json({
                success: false,
                error: 'Validation Error',
                details: error.details.map(detail => detail.message)
            });
        }
        next();
    };
};

// Validation schemas
const schemas = {
    createUser: Joi.object({
        user_id: Joi.string().required(),
        my_playlist: Joi.string().allow('', null),
        access_token: Joi.string().required()
    }),

    createCategory: Joi.object({
        category_name: Joi.string().required(),
        buffer: Joi.string().required() // Comma-separated artist IDs
    }),

    patchCategory: Joi.object({
        artists: Joi.array().items(Joi.object()).required(),
        used: Joi.array().items(Joi.string()).required(),
        child_refs: Joi.array().items(Joi.object()).required()
    }),

    patchCategoryLiked: Joi.object({
        artist_id: Joi.string().required()
    }),

    patchCategoryLeaveScreen: Joi.object({
        visited: Joi.array().items(Joi.string()).required(),
        artists: Joi.array().items(Joi.object()).required()
    }),

    updateSetting: Joi.object({
        setting: Joi.string().valid('fav_on_like', 'follow_on_like', 'add_to_playlist_on_like').required(),
        value: Joi.boolean().required()
    })
};

module.exports = {
    validate,
    schemas
};
