require('dotenv').config();
const express = require('express');
const cookieParser = require('cookie-parser');
const path = require('path');

// Initialize Express app
const app = express();

// Destructure sequelize and models
const { sequelize, User, Template, Instance } = require('./models/index');

// Import routes
const authRouter = require('./routes/auth');
const bookingsRouter = require('./routes/bookings');
const dashboardRouter = require('./routes/dashboard');
const templatesRouter = require('./routes/templates');
const instancesRouter = require('./routes/instances');
const homepageRouter = require('./routes/homepage');

// Middleware
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.use('/api/auth', authRouter);
app.use('/api/bookings', bookingsRouter);
app.use('/api/dashboard', dashboardRouter);
app.use('/api/templates', templatesRouter);
app.use('/api/instances', instancesRouter);
app.use('/api/homepage', homepageRouter);

// Test route
app.get('/', async (req, res) => {
  try {
    await sequelize.authenticate();
    res.send('Connected to MySQL! 🎉');
  } catch (err) {
    res.send('Failed to connect to MySQL: ' + err.message);
  }
});

// Database sync and sample data
// In the database sync block:
sequelize.sync()
  .then(async () => {
    console.log('Database synced!');

    // Create default template
    const [template] = await Template.findOrCreate({
      where: { name: 'Default' },
      defaults: { /* ... template data ... */ }
    });

    // Create sample user
    const [user] = await User.findOrCreate({
      where: { email: 'test@example.com' },
      defaults: { password: 'password123' }
    });

    // Create instance with EXPLICIT associations
    await Instance.findOrCreate({
      where: { isActive: true },
      defaults: {
        data: { /* ... your data ... */ },
        UserId: user.id, // Lowercase 'u' if your model field is 'UserId'
        TemplateId: template.id // Lowercase 't' if model field is 'TemplateId'
      }
    });
  });

// Start server
app.listen(process.env.PORT, () => {
  console.log(`Server running on http://localhost:${process.env.PORT}`);
});