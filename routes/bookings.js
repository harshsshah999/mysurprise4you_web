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
            where: { userId: req.user.id },
            order: [['startDate', 'ASC']],
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
                        startDate: {
                            [Op.between]: [startDate, endDate]
                        }
                    },
                    {
                        endDate: {
                            [Op.between]: [startDate, endDate]
                        }
                    }
                ]
            }
        });

        if (overlappingBooking) {
            return res.status(409).json({ message: 'This time slot is already booked' });
        }

        const booking = await Booking.create({
            startDate,
            endDate,
            recipientName,
            hirerName,
            userId: req.user.id,
            status: 'pending'
        });

        res.status(201).json(booking);
    } catch (error) {
        console.error('Error creating booking:', error);
        res.status(500).json({ message: 'Failed to create booking' });
    }
});

// Delete a booking
router.delete('/:id', auth, async (req, res) => {
    try {
        const booking = await Booking.findOne({
            where: {
                id: req.params.id,
                userId: req.user.id
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

module.exports = router;