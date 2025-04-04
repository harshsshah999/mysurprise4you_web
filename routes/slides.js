const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { Slide, Booking } = require('../models');
const { Op } = require('sequelize');
const auth = require('../middleware/auth');

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

// Get all slides for a booking
router.get('/', auth, async (req, res) => {
  try {
    const { bookingId } = req.query;
    console.log('Fetching slides for booking:', bookingId);
    
    if (!bookingId) {
      console.error('No bookingId provided');
      return res.status(400).json({ message: 'Booking ID is required' });
    }

    // Verify booking exists and belongs to user
    const booking = await Booking.findOne({
      where: {
        id: bookingId,
        user_id: req.user.id
      }
    });

    if (!booking) {
      console.error('Booking not found or unauthorized:', bookingId);
      return res.status(404).json({ message: 'Booking not found' });
    }

    console.log('Found booking:', booking.toJSON());

    const slides = await Slide.findAll({
      where: { 
        booking_id: bookingId,
        deleted_at: null
      },
      order: [['order', 'ASC']]
    });
    
    console.log('Found slides:', slides.length);
    res.json(slides);
  } catch (err) {
    console.error('Error fetching slides:', err);
    res.status(500).json({ 
      message: 'Failed to fetch slides',
      error: err.message 
    });
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
        start_date: { [Op.lte]: now },
        end_date: { [Op.gte]: now },
        status: 'pending' // Include pending bookings as they should be visible
      },
      order: [['start_date', 'DESC']] // Get the most recent booking if multiple exist
    });

    console.log('Active booking:', activeBooking ? activeBooking.toJSON() : null);

    let slides;
    if (activeBooking) {
      // Get slides for active booking
      slides = await Slide.findAll({
        where: { 
          booking_id: activeBooking.id,
          deleted_at: null
        },
        order: [['order', 'ASC']]
      });
      console.log('Found booking slides:', slides.length);
    } else {
      // Return default slides with images
      slides = [
        {
          id: 1,
          title: 'Welcome to MySurprise4You',
          description: 'Create unforgettable moments with personalized digital surprises',
          background_type: 'image',
          background_value: '/images/default/welcome-bg.jpg',
          order: 1,
          is_active: true,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: 2,
          title: 'Make Someone\'s Day Special',
          description: 'Design beautiful digital experiences for birthdays, anniversaries, and more',
          background_type: 'image',
          background_value: '/images/default/special-bg.jpg',
          order: 2,
          is_active: true,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: 3,
          title: 'Easy to Create, Amazing to Experience',
          description: 'Our intuitive editor makes it simple to create stunning digital surprises',
          background_type: 'image',
          background_value: '/images/default/experience-bg.jpg',
          order: 3,
          is_active: true,
          created_at: new Date(),
          updated_at: new Date()
        }
      ];
      console.log('Using default slides:', slides.length);
    }

    res.json(slides);
  } catch (err) {
    console.error('Error fetching active slides:', err);
    res.status(500).json({ 
      message: 'Failed to fetch slides',
      error: err.message 
    });
  }
});

// Create or update a slide
router.post('/', auth, upload.single('image'), async (req, res) => {
    try {
        const { bookingId, title, description, backgroundType, backgroundValue, order, id } = req.body;
        
        // Validate required fields
        if (!bookingId || !title || !backgroundType) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        // Verify booking exists and belongs to user
        const booking = await Booking.findOne({
            where: {
                id: bookingId,
                user_id: req.user.id
            }
        });

        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        let finalBackgroundValue = backgroundValue;

        // Handle image upload
        if (backgroundType === 'image' && req.file) {
            finalBackgroundValue = `/uploads/slides/${req.file.filename}`;
        } else if (backgroundType === 'image' && !backgroundValue && !req.file) {
            return res.status(400).json({ message: 'Image is required for image background type' });
        }

        // Create or update slide
        let slide;
        if (id) {
            // Update existing slide
            slide = await Slide.findOne({
                where: {
                    id: id,
                    booking_id: bookingId
                }
            });

            if (!slide) {
                return res.status(404).json({ message: 'Slide not found' });
            }

            // If changing background type or uploading new image, delete old image
            if (slide.background_type === 'image' && 
                (backgroundType !== 'image' || (req.file && slide.background_value !== finalBackgroundValue))) {
                const oldImagePath = path.join(__dirname, '../public', slide.background_value);
                if (fs.existsSync(oldImagePath)) {
                    fs.unlinkSync(oldImagePath);
                }
            }

            await slide.update({
                title,
                description,
                background_type: backgroundType,
                background_value: finalBackgroundValue,
                order: order || 0
            });
        } else {
            // Create new slide
            slide = await Slide.create({
                booking_id: bookingId,
                title,
                description,
                background_type: backgroundType,
                background_value: finalBackgroundValue,
                order: order || 0
            });
        }

        res.json(slide);
    } catch (err) {
        console.error('Error creating/updating slide:', err);
        res.status(500).json({ message: 'Failed to save slide', error: err.message });
    }
});

// Delete all slides for a booking
router.delete('/booking/:bookingId', async (req, res) => {
    try {
        const { bookingId } = req.params;
        
        // First get all slides to delete their images
        const slides = await Slide.findAll({
            where: { booking_id: bookingId }
        });

        // Delete image files if they exist
        for (const slide of slides) {
            if (slide.background_type === 'image' && slide.background_value) {
                const imagePath = path.join(__dirname, '../public', slide.background_value);
                if (fs.existsSync(imagePath)) {
                    fs.unlinkSync(imagePath);
                }
            }
        }
        
        // Then delete all slides from database
        await Slide.destroy({
            where: { booking_id: bookingId }
        });
        
        res.json({ message: 'All slides deleted successfully' });
    } catch (err) {
        console.error('Error deleting slides:', err);
        res.status(500).json({ message: 'Failed to delete slides', error: err.message });
    }
});

module.exports = router;