const User = require('../dbModel');
const logger = require('../config/logger');

/**
 * Create a new user
 * POST /api/users
 */
const createUser = async (req, res, next) => {
    try {
        const { user_id, my_playlist, access_token } = req.body;

        const user = new User({
            user_id,
            my_playlist,
            access_token,
            category_names: [],
            settings: {
                fav_on_like: true,
                follow_on_like: true,
                add_to_playlist_on_like: true,
                current_playlist: null
            }
        });

        await user.save();

        logger.info(`User created: ${user_id}`);
        res.status(201).json({
            success: true,
            message: 'User created successfully',
            data: user
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get user by user_id
 * GET /api/users/:user_id
 */
const getUserById = async (req, res, next) => {
    try {
        const { user_id } = req.params;
        const user = await User.findOne({ user_id });

        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }

        res.status(200).json({
            success: true,
            data: user
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get user settings by user_id
 * GET /api/users/:user_id/settings
 */
const getUserSettings = async (req, res, next) => {
    try {
        const { user_id } = req.params;
        const user = await User.findOne({ user_id }).select('settings');

        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }

        res.status(200).json({
            success: true,
            data: user.settings
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Update user settings (consolidated endpoint)
 * PATCH /api/users/:user_id/settings
 */
const updateUserSetting = async (req, res, next) => {
    try {
        const { user_id } = req.params;
        const { setting, value } = req.body;

        const user = await User.findOne({ user_id });

        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }

        user.settings[setting] = value;
        await user.save();

        logger.info(`User ${user_id} updated setting ${setting} to ${value}`);
        res.status(200).json({
            success: true,
            message: 'Setting updated successfully',
            data: {
                setting,
                value: user.settings[setting]
            }
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createUser,
    getUserById,
    getUserSettings,
    updateUserSetting
};
