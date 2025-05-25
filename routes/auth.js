const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const { userQueries } = require('../db/queries');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

router.post('/google', async (req, res) => {
  const { credential } = req.body;

  try {
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const user = await userQueries.findByIdOrCreate({
      id: payload.sub,
      email: payload.email,
      name: payload.name,
      picture: payload.picture,
      provider: 'google',
    });

    // Create your own JWT
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        name: user.name,
      },
      process.env.GOOGLE_CLIENT_SECRET,
      { expiresIn: '1h' }
    );

    res.json({ token, user });
  } catch (err) {
    console.error('Google login error:', err);
    res.status(401).json({ message: 'Invalid Google token' });
  }
});

// Add the missing export statement
module.exports = router;
