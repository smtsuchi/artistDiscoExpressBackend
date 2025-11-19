const express = require('express');
const router = express.Router();
const { validate, schemas } = require('../middleware/validation');
const {
    createCategory,
    getCategoryByName,
    getCurrentArtist,
    updateCategory,
    addLikedArtist,
    updateOnLeaveScreen
} = require('../controllers/categoryController');

// Category routes (all under /api/users/:user_id/categories)
router.post('/', validate(schemas.createCategory), createCategory);
router.get('/:category_name', getCategoryByName);
router.get('/:category_name/current', getCurrentArtist);
router.patch('/:category_name', validate(schemas.patchCategory), updateCategory);
router.patch('/:category_name/liked', validate(schemas.patchCategoryLiked), addLikedArtist);
router.patch('/:category_name/leave', validate(schemas.patchCategoryLeaveScreen), updateOnLeaveScreen);

module.exports = router;
