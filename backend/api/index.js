let app;
try {
  app = require('../src/app');
} catch (error) {
  const express = require('express');
  app = express();
  app.all('*', (req, res) => {
    res.status(500).json({
      error: 'SERVER_STARTUP_CRASH',
      message: error.message,
      stack: error.stack
    });
  });
}

// Export the Express app for Vercel Serverless Functions
module.exports = app;
