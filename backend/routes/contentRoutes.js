const express = require('express');
const multer = require('multer');
const path = require('path');
const Content = require('../models/Content');
const authenticateAdmin = require('../middlewares/authenticateAdmin');

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

// Save or update content
router.post('/', authenticateAdmin, upload.any(), async (req, res) => {
  try {
    const { component } = req.body;
    if (!component) return res.status(400).json({ error: 'Component is required' });

    const updates = {};

    // Text fields
    for (const [key, value] of Object.entries(req.body)) {
      if (key !== 'component') updates[key] = value;
    }

    // File fields
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        updates[file.fieldname] = `/uploads/${file.filename}`;
      }
    }

    let content = await Content.findOne({ component });
    if (!content) content = new Content({ component, data: new Map() });

    // Update Map fields
    for (const [key, value] of Object.entries(updates)) {
      content.data.set(key, value);
    }

    await content.save();

    res.status(200).json({ success: true, data: Object.fromEntries(content.data) });
  } catch (err) {
    console.error('Error updating content:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get content for a component
router.get('/:component', async (req, res) => {
  try {
    const content = await Content.findOne({ component: req.params.component });
    if (!content) return res.status(404).json({ error: 'Content not found' });

    res.status(200).json({ success: true, data: Object.fromEntries(content.data) });
  } catch (err) {
    console.error('Error fetching content:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
