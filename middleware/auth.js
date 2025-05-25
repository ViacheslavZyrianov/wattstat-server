const jwt = require('jsonwebtoken');

function authenticateToken(req, res, next) {
  // Skip token verification for auth routes
  if (req.path.startsWith('/auth/')) {
    return next();
  }

  const token = req.headers['authorization']?.split(' ')[1]; // Get the token after "Bearer"

  if (!token) return res.status(401).json({ error: 'Token required' });

  try {
    req.user = jwt.verify(token, process.env.GOOGLE_CLIENT_SECRET); // Attach payload to request
    next();
  } catch (err) {
    return res.status(403).json({ error: err.message });
  }
}

module.exports = authenticateToken;
