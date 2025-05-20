const { executeQuery } = require('../connection');

/**
 * Find a user by their ID
 * @param {string} id - User ID
 * @returns {Promise<Object|null>} User object or null if not found
 */
async function findById(id) {
    const rows = await executeQuery('SELECT * FROM users WHERE id = ?', [id]);
    return rows[0];
}

/**
 * Create a new user
 * @param {string} id - User ID
 * @returns {Promise<void>}
 */
async function create(id) {
    await executeQuery('INSERT INTO users (id) VALUES (?)', [id]);
}

module.exports = {
    findById,
    create
}; 