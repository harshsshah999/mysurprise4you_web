const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { Instance, Template } = require('../models');

// Create an instance
router.post('/', authenticate, async (req, res) => {
  const { templateId, data } = req.body;
  const instance = await Instance.create({
    data,
    userId: req.userId,
    templateId
  });
  res.status(201).json(instance);
});

module.exports = router;