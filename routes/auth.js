// routes/auth.js
const express = require('express');
const passport = require('passport');
const { User } = require('../models');
const router = express.Router();
const { Op } = require('sequelize');

router.post('/register', async (req, res) => {
  try {
    console.log('Registration attempt:', { email: req.body.email });
    const { email, password } = req.body;
    
    // Validate input
    if (!email || !password) {
      console.log('Missing required fields');
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Check for existing user
    const existingUser = await User.findOne({ 
      where: { 
        email,
        deleted_at: null // Only check for non-deleted users
      }
    });
    
    if (existingUser) {
      console.log('User already exists:', existingUser.email);
      return res.status(400).json({ message: 'Email already exists' });
    }

    console.log('Creating new user with password:', password);
    const user = await User.create({ email, password });
    console.log('User created with hashed password:', user.password);
    
    req.login(user, (err) => {
      if (err) {
        console.error('Login after registration failed:', err);
        return res.status(500).json({ message: 'Login after registration failed' });
      }
      const { password, ...userData } = user.get({ plain: true });
      console.log('User registered successfully:', userData);
      res.status(201).json(userData);
    });

  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ 
      message: 'Registration failed',
      error: err.message 
    });
  }
});

router.post('/login', (req, res, next) => {
  passport.authenticate('local', async (err, user, info) => {
    if (err) {
      console.error('Login error:', err);
      return res.status(500).json({ 
        message: 'Login failed', 
        error: err.message,
        type: 'server_error'
      });
    }

    // Check if user exists
    if (!user) {
      const { email } = req.body;
      const existingUser = await User.findOne({ where: { email } });
      
      if (!existingUser) {
        console.log('Login failed - account does not exist');
        return res.status(401).json({ 
          message: 'Account does not exist', 
          type: 'account_not_found'
        });
      } else {
        console.log('Login failed - invalid password');
        return res.status(401).json({ 
          message: 'Invalid password', 
          type: 'invalid_password'
        });
      }
    }

    req.logIn(user, (err) => {
      if (err) {
        console.error('Login error during session creation:', err);
        return res.status(500).json({ 
          message: 'Login failed', 
          error: err.message,
          type: 'session_error'
        });
      }
      console.log('Login successful, session created for user:', user.email);
      const { password, ...userData } = user.get({ plain: true });
      return res.json({
        ...userData,
        message: 'Login successful',
        type: 'success'
      });
    });
  })(req, res, next);
});

router.post('/logout', (req, res) => {
  req.logout(() => res.sendStatus(200));
});

router.get('/user', (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  const { password, ...userData } = req.user.get({ plain: true });
  res.json(userData);
});

module.exports = router;