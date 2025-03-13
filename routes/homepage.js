const express = require('express');
const router = express.Router();
const { Instance, Template } = require('../models');

router.get('/', async (req, res) => {
  try {
    const activeInstance = await Instance.findOne({
      where: { isActive: true },
      include: [Template] // Include the associated Template
    });

    if (!activeInstance) {
      const defaultTemplate = await Template.findOne({ where: { name: 'Default' } });
      return res.json({
        template: defaultTemplate,
        data: {}
      });
    }

    res.json(activeInstance);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;