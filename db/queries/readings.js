const { executeQuery } = require('../connection');

/**
 * Create a new reading
 * @param {number} day - Day reading value
 * @param {number} night - Night reading value
 * @param {string} userId - User ID
 * @param {string} date - Reading date
 * @returns {Promise<void>}
 */
async function create(day, night, userId, date) {
    await executeQuery(
        'INSERT INTO readings (day, night, user_id, date) VALUES (?, ?, ?, ?)',
        [day, night, userId, date]
    );
}

/**
 * Find all readings for a user
 * @param {string} userId - User ID
 * @returns {Promise<Array>} Array of readings
 */
async function findByUserId(userId) {
    return await executeQuery(
        'SELECT * FROM readings WHERE user_id = ? ORDER BY date DESC',
        [userId]
    );
}

/**
 * Update a reading
 * @param {string} id - Reading ID
 * @param {Object} updates - Object containing fields to update
 * @returns {Promise<void>}
 */
async function update(id, updates) {
    const fields = [];
    const values = [];

    Object.entries(updates).forEach(([key, value]) => {
        if (value !== undefined) {
            fields.push(`${key} = ?`);
            values.push(value);
        }
    });

    if (fields.length === 0) {
        throw new Error('Nothing to update');
    }

    values.push(id);
    await executeQuery(
        `UPDATE readings SET ${fields.join(', ')} WHERE id = ?`,
        values
    );
}

/**
 * Delete a reading
 * @param {string} id - Reading ID
 * @returns {Promise<void>}
 */
async function remove(id) {
    await executeQuery('DELETE FROM readings WHERE id = ?', [id]);
}

/**
 * Check if a user owns a resource
 * @param {string} id - Resource ID
 * @param {string} userId - User ID
 * @param {string} tableName - Table name
 * @returns {Promise<boolean>} True if user owns the resource
 */
async function checkOwnership(id, userId, tableName) {
    const rows = await executeQuery(
        `SELECT * FROM ${tableName} WHERE id = ? AND user_id = ?`,
        [id, userId]
    );
    return rows.length > 0;
}

module.exports = {
    create,
    findByUserId,
    update,
    remove,
    checkOwnership
}; 