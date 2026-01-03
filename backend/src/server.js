const express = require('express');
const cors = require('cors');
const errorHandler=require('../errorHandler')
const { MongoClient } = require('mongodb');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection
let db;
MongoClient.connect(process.env.MONGODB_URI)
  .then(client => {
    console.log('Connected to MongoDB');
    db = client.db();

    // Make db available to routes
    app.locals.db = db;

    // Routes
    // 404 handler for unknown API routes
app.use((req, res, next) => {
  const error = new Error('API route not found');
  error.statusCode = 404;
  next(error);
});

    app.use('/api/auth', require('./routes/auth'));
    app.use('/api/products', require('./routes/products'));
    app.use('/api/donations', require('./routes/donations'));
    app.use('/api/upload', require('./routes/upload'));
    app.use('/api/chat', require('./routes/chat'));
    app.use('/api/feedback', require('./routes/feedback'));

    // Health check
    app.get('/api/health', (req, res) => {
      res.json({ status: 'OK', message: 'Server is running' });
    });

    // Start server after DB connection
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
    
  .catch(error => {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  });
