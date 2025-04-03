const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { Slide, Booking } = require('../models');
const { Op } = require('sequelize');

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../public/uploads/slides');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for image upload
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadsDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG and GIF are allowed.'));
    }
  }
});

// Get all active slides for homepage
router.get('/active', async (req, res) => {
  try {
    const now = new Date();
    console.log('Current time:', now);

    // Find the active booking that includes the current time
    const activeBooking = await Booking.findOne({
      where: {
        startDate: { [Op.lte]: now },
        endDate: { [Op.gte]: now },
        status: 'pending' // Include pending bookings as they should be visible
      },
      order: [['startDate', 'DESC']] // Get the most recent booking if multiple exist
    });

    console.log('Active booking:', activeBooking ? activeBooking.toJSON() : null);

    let slides;
    if (activeBooking) {
      // Get slides for active booking
      slides = await Slide.findAll({
        where: { bookingId: activeBooking.id },
        order: [['order', 'ASC']]
      });
      console.log('Found booking slides:', slides.length);
    } else {
      // Get default slides
      slides = await Slide.findAll({
        where: { 
          isActive: true,
          bookingId: null
        },
        order: [['createdAt', 'ASC']]
      });
      console.log('Found default slides:', slides.length);
    }

    // If no slides found, create a default slide
    if (!slides || slides.length === 0) {
      slides = [{
        title: 'Welcome to MySurprise4You',
        description: 'Book a time slot to create your personalized surprise!',
        backgroundType: 'gradient',
        backgroundValue: 'linear-gradient(135deg, #FEADA6, #F5EFEF)',
        isActive: true
      }];
    }

    res.json(slides);
  } catch (err) {
    console.error('Error fetching active slides:', err);
    res.status(500).json({ message: 'Failed to fetch slides' });
  }
});

// Get all slides for a booking
router.get('/', async (req, res) => {
  try {
    const { bookingId } = req.query;
    
    if (!bookingId) {
      return res.status(400).json({ message: 'Booking ID is required' });
    }

    // Verify booking exists and belongs to user
    const booking = await Booking.findByPk(bookingId);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    const slides = await Slide.findAll({
      where: { bookingId },
      order: [['order', 'ASC']]
    });
    
    res.json(slides);
  } catch (err) {
    console.error('Error fetching slides:', err);
    res.status(500).json({ message: 'Failed to fetch slides' });
  }
});

// Create a new slide with image upload
router.post('/', upload.single('image'), async (req, res) => {
  try {
    console.log('Received slide creation request:', {
      body: req.body,
      file: req.file,
      headers: req.headers
    });

    const slideData = { 
      ...req.body,
      order: parseInt(req.body.order) || 0
    };
    
    // Validate required fields
    if (!slideData.title || !slideData.backgroundType) {
      return res.status(400).json({ 
        message: 'Missing required fields',
        required: ['title', 'backgroundType']
      });
    }
    
    // Handle image background type
    if (slideData.backgroundType === 'image') {
      if (req.file) {
        // New image uploaded
        slideData.backgroundValue = `/uploads/slides/${req.file.filename}`;
      } else if (slideData.backgroundValue) {
        // Using existing image path
        // Validate that the image path exists
        const imagePath = path.join(__dirname, '../public', slideData.backgroundValue);
        if (!fs.existsSync(imagePath)) {
          console.error('Invalid image path:', imagePath);
          return res.status(400).json({ 
            message: 'Invalid image path provided',
            path: slideData.backgroundValue
          });
        }
      } else {
        return res.status(400).json({ 
          message: 'Image file or existing image path is required for image background type' 
        });
      }
    } else if (!slideData.backgroundValue) {
      // Ensure backgroundValue is set for non-image types
      return res.status(400).json({ 
        message: 'Background value is required for non-image background types' 
      });
    }
    
    console.log('Creating slide with data:', slideData);
    const slide = await Slide.create(slideData);
    console.log('Slide created successfully:', slide);
    
    res.status(201).json(slide);
  } catch (err) {
    console.error('Error creating slide:', err);
    res.status(500).json({ 
      message: 'Failed to create slide', 
      error: err.message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }
});

// Update a slide with image upload
router.put('/:id', upload.single('image'), async (req, res) => {
  try {
    console.log('Received slide update request:', {
      id: req.params.id,
      body: req.body,
      file: req.file
    });

    const slideData = { ...req.body };
    
    // Get the existing slide
    const existingSlide = await Slide.findByPk(req.params.id);
    if (!existingSlide) {
      return res.status(404).json({ message: 'Slide not found' });
    }

    // Handle image updates
    if (req.file) {
      // New image uploaded
      slideData.backgroundType = 'image';
      slideData.backgroundValue = `/uploads/slides/${req.file.filename}`;
      
      // Delete old image if it exists
      if (existingSlide.backgroundType === 'image' && existingSlide.backgroundValue) {
        const oldImagePath = path.join(__dirname, '../public', existingSlide.backgroundValue);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
    } else if (slideData.backgroundType === 'image' && slideData.backgroundValue) {
      // Using existing image path
      const imagePath = path.join(__dirname, '../public', slideData.backgroundValue);
      if (!fs.existsSync(imagePath)) {
        console.error('Invalid image path:', imagePath);
        return res.status(400).json({ 
          message: 'Invalid image path provided',
          path: slideData.backgroundValue
        });
      }
    }
    
    // Update the slide
    const [updated] = await Slide.update(slideData, {
      where: { id: req.params.id }
    });

    if (!updated) {
      return res.status(404).json({ message: 'Slide not found' });
    }

    // Get the updated slide
    const updatedSlide = await Slide.findByPk(req.params.id);
    res.json(updatedSlide);
  } catch (err) {
    console.error('Error updating slide:', err);
    res.status(500).json({ 
      message: 'Failed to update slide', 
      error: err.message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }
});

// Delete all slides for a booking
router.delete('/booking/:bookingId', async (req, res) => {
    try {
        const { bookingId } = req.params;
        
        // First get all slides to delete their images
        const slides = await Slide.findAll({
            where: { bookingId }
        });

        // Delete image files if they exist
        for (const slide of slides) {
            if (slide.backgroundType === 'image' && slide.backgroundValue) {
                const imagePath = path.join(__dirname, '../public', slide.backgroundValue);
                if (fs.existsSync(imagePath)) {
                    fs.unlinkSync(imagePath);
                }
            }
        }
        
        // Then delete all slides from database
        await Slide.destroy({
            where: { bookingId }
        });
        
        res.json({ message: 'All slides deleted successfully' });
    } catch (err) {
        console.error('Error deleting slides:', err);
        res.status(500).json({ message: 'Failed to delete slides', error: err.message });
    }
});

module.exports = router;