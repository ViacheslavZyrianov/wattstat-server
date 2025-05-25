require('dotenv').config();
const express = require('express');
const cors = require('cors');
const session = require('express-session');
const fs = require('fs');
const path = require('path');
const cookieParser = require('cookie-parser');
const { checkDatabaseConnection } = require('./db/connection');

const app = express();
const PORT = process.env.PORT || '3001';

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
      secure: process.env.NODE_ENV === 'production',
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax', // Use 'none' for cross-origin requests in production
    },
    proxy: process.env.NODE_ENV === 'production', // Trust the reverse proxy in production
  })
);

const routesPath = path.join(__dirname, 'routes');
fs.readdirSync(routesPath).forEach((file) => {
  if (file.endsWith('.js')) {
    const route = require(path.join(routesPath, file));
    const routeName = '/' + file.replace('.js', '');

    app.use(routeName, route);
  }
});

// Start server
app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);

  await checkDatabaseConnection();
});
