require('dotenv').config();
const express = require('express');
const cors = require('cors');
const session = require('express-session');
const verifySession = require('./middleware/verifySession');
const fs = require('fs');
const path = require('path');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const cookieParser = require('cookie-parser');
const authorizeOwnership = require('./middleware/authorizeOwnership');

const app = express();
const PORT = 3001;

app.use(cookieParser());

// CORS config
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  })
);

app.use(express.json());

app.use(
  session({
    secret: process.env.GOOGLE_CLIENT_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
  })
);

// Passport configuration
passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});

// Configure Google Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: '/api/auth/google/callback',
      scope: ['profile', 'email'],
    },
    (accessToken, refreshToken, profile, done) => {
      // Create user object from profile data
      const user = {
        id: profile.id,
        displayName: profile.displayName,
        firstName: profile.name?.givenName,
        lastName: profile.name?.familyName,
        email: profile.emails?.[0]?.value,
        avatar: profile.photos?.[0]?.value,
        accessToken,
      };
      return done(null, user);
    }
  )
);

// Initialize passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Dynamically load all route files in ./routes
const publicRoutes = ['auth']; // List public routes here
// Dynamically load all route files
const routesPath = path.join(__dirname, 'routes');
fs.readdirSync(routesPath).forEach((file) => {
  if (file.endsWith('.js')) {
    const route = require(path.join(routesPath, file));
    const routeName = '/' + file.replace('.js', '');

    // Apply middleware to all routes except auth-related ones
    if (publicRoutes.includes(routeName.slice(1))) {
      app.use(routeName, route);
    } else {
      console.log('routeName', `${routeName}/*`);
      app.use(routeName, verifySession, route);

      // Apply ownership check only on routes that contain :id
      app.use(`${routeName}/:id`, authorizeOwnership(routeName.slice(1)));
    }
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on ${process.env.SERVER_URL}, on port ${PORT}`);
});
