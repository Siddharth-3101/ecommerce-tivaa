// src/app.js
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const routes = require('./routes');
const { notFound, errorHandler } = require('./middleware/errorHandlers');

const app = express();

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// mount all routes under /api
app.use('/api', routes);

// 404 handler
app.use(notFound);

// error handler
app.use(errorHandler);

module.exports = app;
