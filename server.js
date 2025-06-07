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
// For development (allows all origins explicitly)
const allowedOrigins = [process.env.CLIENT_URL_NGROK, process.env.CLIENT_URL]; // replace with actual

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
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
      sameSite: 'none',
      //sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax', // Use 'none' for cross-origin requests in production
    },
    proxy: process.env.NODE_ENV === 'production', // Trust the reverse proxy in production
  })
);

app.set('trust proxy', 1);

const routesPath = path.join(__dirname, 'routes');
fs.readdirSync(routesPath).forEach((file) => {
  if (file.endsWith('.js')) {
    const route = require(path.join(routesPath, file));
    const routeName = '/' + file.replace('.js', '');

    app.use(routeName, route);
  }
});

const connectToDB = async () => {
  let connected = false;
  let attempts = 0;
  const maxAttempts = 10;
  const retryDelay = 5000; // 5 seconds delay between attempts

  while (!connected && attempts < maxAttempts) {
    try {
      connected = await checkDatabaseConnection();
      if (!connected) {
        attempts++;
        console.log(
          `Database connection attempt ${attempts}/${maxAttempts} failed. Retrying in 5 seconds...`
        );
        await new Promise((resolve) => setTimeout(resolve, retryDelay));
      }
    } catch (error) {
      attempts++;
      console.error(
        `Database connection error (attempt ${attempts}/${maxAttempts}):`,
        error.message
      );
      await new Promise((resolve) => setTimeout(resolve, retryDelay));
    }
  }

  if (!connected) {
    console.error(
      'Failed to connect to database after maximum attempts. Server may not function properly.'
    );
  } else {
    console.log('Successfully connected to database');
  }
};

// Start server
app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);

  await connectToDB();
});
