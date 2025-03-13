const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const Template = require('../models/Template');

// Get all templates
router.get('/', authenticate, async (req, res) => {
  const templates = await Template.findAll();
  res.json(templates);
});

// Create a template (Admin-only – add role check later)
router.post('/', authenticate, async (req, res) => {
  const { name, html, css } = req.body;
  const template = await Template.create({ name, html, css });
  res.status(201).json(template);
});

module.exports = router;