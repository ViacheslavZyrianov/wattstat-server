const db = require('../db');

/**
 * Middleware to check resource ownership by table and ID param
 */
function authorizeOwnership(tableName) {
  return (req, res, next) => {
    const id = req.params.id;

    if (!id) {
      return res.status(400).json({ error: 'ID parameter is required for ownership check' });
    }

    const userId = req.user.id;

    // Construct the SQL query to check if the user owns the resource
    const query = `SELECT * FROM ${tableName} WHERE id = ? AND user_id = ?`;

    db.get(query, [id, userId], (err, row) => {
      if (err) return res.status(500).json({ error: err.message });
      if (!row) return res.status(403).json({ error: 'Forbidden: You do not own this resource' });

      // If ownership is verified, continue
      next();
    });
  };
}

module.exports = authorizeOwnership;
