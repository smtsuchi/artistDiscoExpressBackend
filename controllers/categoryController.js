const User = require('../dbModel');
const logger = require('../config/logger');
const { findCategoryIndex } = require('../utils/helpers');

/**
 * Create a new category for a user
 * POST /api/users/:user_id/categories
 */
const createCategory = async (req, res, next) => {
    try {
        const { user_id } = req.params;
        const { category_name, buffer } = req.body;

        const user = await User.findOne({ user_id });

        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }

        user.category_data.push({
            category_name,
            first_time: true,
            artists: [],
            buffer: buffer.split(','),
            liked_count: 0,
            liked: [],
            used: [],
            visited: [],
            childRefs: []
        });

        user.category_names.push(category_name);
        user.settings.current_playlist = category_name;

        await user.save();

        logger.info(`Category created: ${category_name} for user ${user_id}`);
        res.status(201).json({
            success: true,
            message: 'Category created successfully',
            data: {
                category: user.category_data[user.category_data.length - 1],
                categoryNames: user.category_names
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get category by name and set as current playlist
 * GET /api/users/:user_id/categories/:category_name
 */
const getCategoryByName = async (req, res, next) => {
    try {
        const { user_id, category_name } = req.params;

        const user = await User.findOne({ user_id });

        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }

        const categoryIndex = findCategoryIndex(user.category_data, category_name);

        if (categoryIndex === -1) {
            return res.status(404).json({
                success: false,
                error: 'Category not found'
            });
        }

        user.settings.current_playlist = category_name;
        await user.save();

        res.status(200).json({
            success: true,
            data: user.category_data[categoryIndex]
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get single artist from category (last in array)
 * GET /api/users/:user_id/categories/:category_name/current
 */
const getCurrentArtist = async (req, res, next) => {
    try {
        const { user_id, category_name } = req.params;

        const user = await User.findOne({ user_id });

        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }

        const categoryIndex = findCategoryIndex(user.category_data, category_name);

        if (categoryIndex === -1) {
            return res.status(404).json({
                success: false,
                error: 'Category not found'
            });
        }

        const category = user.category_data[categoryIndex];
        const currentArtist = category.artists[category.artists.length - 1];

        res.status(200).json({
            success: true,
            data: currentArtist
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Update category artists, used, and childRefs
 * PATCH /api/users/:user_id/categories/:category_name
 */
const updateCategory = async (req, res, next) => {
    try {
        const { user_id, category_name } = req.params;
        const { artists, used, child_refs } = req.body;

        const user = await User.findOne({ user_id });

        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }

        const categoryIndex = findCategoryIndex(user.category_data, category_name);

        if (categoryIndex === -1) {
            return res.status(404).json({
                success: false,
                error: 'Category not found'
            });
        }

        const category = user.category_data[categoryIndex];
        category.first_time = false;
        category.artists = artists;
        category.used = used;
        category.childRefs = child_refs;

        await user.save();

        logger.info(`Category updated: ${category_name} for user ${user_id}`);
        res.status(200).json({
            success: true,
            message: 'Category updated successfully',
            data: user.category_data[categoryIndex]
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Add artist to liked array
 * PATCH /api/users/:user_id/categories/:category_name/liked
 */
const addLikedArtist = async (req, res, next) => {
    try {
        const { user_id, category_name } = req.params;
        const { artist_id } = req.body;

        const user = await User.findOne({ user_id });

        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }

        const categoryIndex = findCategoryIndex(user.category_data, category_name);

        if (categoryIndex === -1) {
            return res.status(404).json({
                success: false,
                error: 'Category not found'
            });
        }

        const category = user.category_data[categoryIndex];
        category.liked.push(artist_id);

        await user.save();

        logger.info(`Artist ${artist_id} liked in category ${category_name}`);
        res.status(200).json({
            success: true,
            message: 'Artist added to liked',
            data: {
                liked: user.category_data[categoryIndex].liked
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Update visited and artists when leaving screen
 * PATCH /api/users/:user_id/categories/:category_name/leave
 */
const updateOnLeaveScreen = async (req, res, next) => {
    try {
        const { user_id, category_name } = req.params;
        const { visited, artists } = req.body;

        const user = await User.findOne({ user_id });

        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }

        const categoryIndex = findCategoryIndex(user.category_data, category_name);

        if (categoryIndex === -1) {
            return res.status(404).json({
                success: false,
                error: 'Category not found'
            });
        }

        const category = user.category_data[categoryIndex];
        category.visited = visited;
        category.artists = artists;

        await user.save();

        res.status(200).json({
            success: true,
            message: 'Category updated on leave screen',
            data: {
                visited: user.category_data[categoryIndex].visited,
                artists: user.category_data[categoryIndex].artists
            }
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createCategory,
    getCategoryByName,
    getCurrentArtist,
    updateCategory,
    addLikedArtist,
    updateOnLeaveScreen
};
