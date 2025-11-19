const express = require('express');
const router = express.Router();
const { validate, schemas } = require('../middleware/validation');
const {
    createUser,
    getUserById,
    getUserSettings,
    updateUserSetting
} = require('../controllers/userController');

/**
 * @swagger
 * /api/users:
 *   post:
 *     summary: Create a new user
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - user_id
 *               - access_token
 *             properties:
 *               user_id:
 *                 type: string
 *               access_token:
 *                 type: string
 *               my_playlist:
 *                 type: string
 *     responses:
 *       201:
 *         description: User created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/', validate(schemas.createUser), createUser);

/**
 * @swagger
 * /api/users/{user_id}:
 *   get:
 *     summary: Get user by ID
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: user_id
 *         required: true
 *         schema:
 *           type: string
 *         description: Spotify user ID
 *     responses:
 *       200:
 *         description: User found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/:user_id', getUserById);

/**
 * @swagger
 * /api/users/{user_id}/settings:
 *   get:
 *     summary: Get user settings
 *     tags: [Settings]
 *     parameters:
 *       - in: path
 *         name: user_id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Settings retrieved
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Settings'
 *       404:
 *         description: User not found
 *   patch:
 *     summary: Update user setting
 *     tags: [Settings]
 *     parameters:
 *       - in: path
 *         name: user_id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - setting
 *               - value
 *             properties:
 *               setting:
 *                 type: string
 *                 enum: [fav_on_like, follow_on_like, add_to_playlist_on_like]
 *               value:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Setting updated
 *       400:
 *         description: Validation error
 *       404:
 *         description: User not found
 */
router.get('/:user_id/settings', getUserSettings);
router.patch('/:user_id/settings', validate(schemas.updateSetting), updateUserSetting);

module.exports = router;
