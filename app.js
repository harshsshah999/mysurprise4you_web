require('dotenv').config();
const express = require('express');
const sequelize = require('./models/index'); // Import from models/index.js

// Import models
const User = require('./models/User');
const Booking = require('./models/Booking');

// Import routes
const bookingsRouter = require('./routes/bookings');

const app = express();

// Middleware to parse JSON request bodies
app.use(express.json());

// Sync models with the database
sequelize.sync()
  .then(() => console.log('Database synced!'))
  .catch(err => console.error('Database sync failed:', err));

// Mount routes
app.use('/api/bookings', bookingsRouter);

// Test route
app.get('/', async (req, res) => {
  try {
    await sequelize.authenticate();
    res.send('Connected to MySQL! 🎉');
  } catch (err) {
    res.send('Failed to connect to MySQL: ' + err.message);
  }
});

// Start the server
app.listen(process.env.PORT, () => {
  console.log(`Server running on http://localhost:${process.env.PORT}`);
});

app.get('/test-env', (req, res) => {
    res.send(`
      DB_HOST: ${process.env.DB_HOST}<br>
      DB_USER: ${process.env.DB_USER}<br>
      DB_NAME: ${process.env.DB_NAME}
    `);
  });