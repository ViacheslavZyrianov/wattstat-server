const { readingQueries } = require('../db/queries');

/**
 * Middleware to check resource ownership by table and ID param
 */
function authorizeOwnership(tableName) {
  return async (req, res, next) => {
    const id = req.params.id;

    if (!id) {
      return res.status(400).json({ error: 'ID parameter is required for ownership check' });
    }

    const userId = req.user.id;

    try {
      const hasOwnership = await readingQueries.checkOwnership(id, userId, tableName);
      if (!hasOwnership) {
        return res.status(403).json({ error: 'Forbidden: You do not own this resource' });
      }

      // If ownership is verified, continue
      next();
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: err.message });
    }
  };
}

module.exports = authorizeOwnership;
