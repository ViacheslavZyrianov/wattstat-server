function verifySession(req, res, next) {
  if (req.session && req.session.passport && req.session.passport.user) {
    // User is authenticated
    next();
  } else {
    res.status(401).json({ message: 'Unauthorized: No session' });
  }
}

module.exports = verifySession;
