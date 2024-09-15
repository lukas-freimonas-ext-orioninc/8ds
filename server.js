const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const winston = require('winston');

dotenv.config();

const app = express();
const PORT = process.env.PORT;

app.use(express.json());

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
  ],
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(
    new winston.transports.Console({
      format: winston.format.simple(),
    })
  );
}

app.use((req, res, next) => {
  logger.info(`${req.method} ${req.url}`);
  next();
});

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    logger.info('Connected to MongoDB');
  } catch (err) {
    logger.error('MongoDB connection error:', err);
  }
};

app.use('/api/users', require('./routes/users'));
app.use('/api/items', require('./routes/items'));

if (require.main === module) {
  connectDB();
  app.listen({ host: '0.0.0.0', port: PORT }, () =>
    logger.info(`Server running on port ${PORT}`)
  );
}

module.exports = { app, connectDB };
