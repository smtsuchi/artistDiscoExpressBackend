/**
 * Find the index of a category in the categories array
 * @param {Array} categories - Array of category objects
 * @param {String} categoryName - Name of the category to find
 * @returns {Number} Index of the category, or -1 if not found
 */
const findCategoryIndex = (categories, categoryName) => {
    return categories.findIndex(cat => cat.category_name === categoryName);
};

/**
 * Generates a random string containing numbers and letters
 * @param {Number} length - The length of the string
 * @returns {String} The generated string
 */
const generateRandomString = (length) => {
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let text = '';

    for (let i = 0; i < length; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
};

module.exports = {
    findCategoryIndex,
    generateRandomString
};
