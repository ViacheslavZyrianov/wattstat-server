const { executeQuery } = require('../connection');

/**
 * Find a user by their ID
 * @param {string} id - Google `sub`
 * @returns {Promise<Object|null>} User object or null if not found
 */
async function findById(id) {
  const rows = await executeQuery('SELECT * FROM users WHERE id = ?', [id]);
  return rows[0] || null;
}

/**
 * Create a new user
 * @param {Object} user - User object from Google
 * @param {string} user.id - Google `sub`
 * @param {string} user.email
 * @param {string} user.name
 * @param {string} user.picture
 * @param {string} user.provider - e.g. 'google'
 * @returns {Promise<void>}
 */
async function create({ id, email, name, picture, provider }) {
  await executeQuery(
    `
    INSERT INTO users (id, email, name, picture, provider)
    VALUES (?, ?, ?, ?, ?)
    `,
    [id, email, name, picture, provider]
  );
}

/**
 * Update last_login timestamp
 * @param {string} id - User ID
 * @returns {Promise<void>}
 */
async function updateLastLogin(id) {
  await executeQuery('UPDATE users SET last_login = ? WHERE id = ?', [new Date(), id]);
}

/**
 * Find a user by ID or create them if they don't exist
 * @param {Object} user - User info from Google token
 * @returns {Promise<Object>} User object
 */
async function findByIdOrCreate(user) {
  let existingUser = await findById(user.id);
  if (!existingUser) {
    await create(user);
    existingUser = await findById(user.id);
  } else {
    await updateLastLogin(user.id);
  }
  return existingUser;
}

module.exports = {
  findById,
  create,
  updateLastLogin,
  findByIdOrCreate,
};
