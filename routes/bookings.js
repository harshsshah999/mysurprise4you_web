// routes/bookings.js
const express = require('express');
const router = express.Router();
const { Booking, User } = require('../models');
const { Op } = require('sequelize');
const auth = require('../middleware/auth');

// Get all bookings for the authenticated user
router.get('/', auth, async (req, res) => {
    try {
        const bookings = await Booking.findAll({
            where: { user_id: req.user.id },
            order: [['start_date', 'ASC']],
            include: [{ model: User, attributes: ['email'] }]
        });
        res.json(bookings);
    } catch (error) {
        console.error('Error fetching bookings:', error);
        res.status(500).json({ message: 'Failed to fetch bookings' });
    }
});

// Create a new booking
router.post('/', auth, async (req, res) => {
    try {
        const { startDate, endDate, recipientName, hirerName } = req.body;

        if (!startDate || !endDate || !recipientName) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        // Check for overlapping bookings
        const overlappingBooking = await Booking.findOne({
            where: {
                [Op.or]: [
                    {
                        start_date: {
                            [Op.between]: [startDate, endDate]
                        }
                    },
                    {
                        end_date: {
                            [Op.between]: [startDate, endDate]
                        }
                    }
                ]
            }
        });

        if (overlappingBooking) {
            return res.status(409).json({ message: 'This time slot is already booked' });
        }

        // Create the booking with the authenticated user's ID
        const booking = await Booking.create({
            start_date: startDate,
            end_date: endDate,
            recipient_name: recipientName,
            hirer_name: hirerName || req.user.email,
            user_id: req.user.id,
            status: 'pending',
            template_type: 'immersive' // Default template
        });

        res.status(201).json(booking);
    } catch (error) {
        console.error('Error creating booking:', error);
        res.status(500).json({ 
            message: 'Failed to create booking',
            error: error.message 
        });
    }
});

// Delete a booking
router.delete('/:id', auth, async (req, res) => {
    try {
        const booking = await Booking.findOne({
            where: {
                id: req.params.id,
                user_id: req.user.id
            }
        });

        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        await booking.destroy();
        res.json({ message: 'Booking deleted successfully' });
    } catch (error) {
        console.error('Error deleting booking:', error);
        res.status(500).json({ message: 'Failed to delete booking' });
    }
});

// Update a booking's template type
router.patch('/:id', auth, async (req, res) => {
    try {
        const { template_type } = req.body;
        
        if (!template_type) {
            return res.status(400).json({ message: 'Template type is required' });
        }

        const booking = await Booking.findOne({
            where: {
                id: req.params.id,
                user_id: req.user.id
            }
        });

        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        await booking.update({ template_type });
        res.json(booking);
    } catch (error) {
        console.error('Error updating booking:', error);
        res.status(500).json({ message: 'Failed to update booking' });
    }
});

module.exports = router;