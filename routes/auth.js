const express = require('express');
const passport = require('passport');
const { OAuth2Client } = require('google-auth-library');
const router = express.Router();

// Initialize Google OAuth client with credentials
const client = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET
  // Note: We don't set a redirect URI here because it will be provided in the requests
);

// Route to initiate Google OAuth flow
router.get(
  '/google',
  passport.authenticate('google', {
    scope: ['profile', 'email'],
  })
);

// Callback route after Google authentication using passport strategy
router.get(
  '/google-callback',
  passport.authenticate('google', {
    failureRedirect: '/auth',
    session: true,
  }),
  (req, res) => {
    // Successful authentication
    res.redirect('/dashboard');
  }
);

// Handle authorization code from frontend redirect flow
router.post('/google-callback', async (req, res) => {
  try {
    const { code, redirectUri } = req.body;

    if (!code) {
      return res.status(400).json({ error: 'Authorization code is required' });
    }

    // Exchange the authorization code for tokens
    const { tokens } = await client.getToken({
      code,
      redirect_uri: redirectUri,
    });

    // Get user info using the access token
    const ticket = await client.verifyIdToken({
      idToken: tokens.id_token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    // Get user info from payload
    const payload = ticket.getPayload();

    // Create user object from payload
    const user = {
      id: payload.sub,
      email: payload.email,
      displayName: payload.name,
      firstName: payload.given_name,
      lastName: payload.family_name,
      avatar: payload.picture,
      emailVerified: payload.email_verified,
    };

    // In a real app, you would check if the user exists in your database
    // If not, create the user, and then handle user sessions

    // Log the user in
    req.login(user, (err) => {
      if (err) {
        return res.status(500).json({ error: 'Failed to login', details: err.message });
      }
      return res.json({ authenticated: true, user });
    });
  } catch (error) {
    console.error('Authorization code exchange error:', error);
    res.status(401).json({
      error: 'Failed to authenticate with Google',
      details: error.message,
    });
  }
});

// Verify Google ID token (for Google Identity Services)
router.post('/google/verify-token', async (req, res) => {
  try {
    const { token } = req.body;

    // Verify the token
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    // Get user info from payload
    const payload = ticket.getPayload();

    // Create user object from payload
    const user = {
      id: payload.sub,
      email: payload.email,
      displayName: payload.name,
      firstName: payload.given_name,
      lastName: payload.family_name,
      avatar: payload.picture,
      emailVerified: payload.email_verified,
    };

    // Log the user in
    req.login(user, (err) => {
      if (err) {
        return res.status(500).json({ error: 'Failed to login' });
      }
      return res.json({ authenticated: true, user });
    });
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(401).json({ error: 'Invalid token', details: error.message });
  }
});

// Check authentication status
router.get('/status', (req, res) => {
  if (req.isAuthenticated()) {
    return res.json({
      authenticated: true,
      user: req.user,
    });
  }
  return res.json({ authenticated: false });
});

// Logout route
router.post('/logout', (req, res) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({ error: 'Logout failed' });
    }
    res.json({ success: true });
  });
});

module.exports = router;
