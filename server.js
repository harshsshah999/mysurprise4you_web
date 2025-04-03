// Authentication middleware
const authMiddleware = (req, res, next) => {
    if (!req.session.user) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    next();
};

// Session configuration
app.use(session({
    secret: 'your-secret-key',  // Replace with a secure secret key
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

// Auth check endpoint
app.get('/api/auth/check', (req, res) => {
    if (req.session.user) {
        res.json({ 
            user: {
                id: req.session.user.id,
                name: req.session.user.name,
                email: req.session.user.email
            }
        });
    } else {
        res.status(401).json({ error: 'Unauthorized' });
    }
});

// Logout endpoint
app.post('/api/auth/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({ error: 'Failed to logout' });
        }
        res.json({ message: 'Logged out successfully' });
    });
});

// Protected routes
app.get('/api/bookings', authMiddleware, async (req, res) => {
    try {
        const bookings = await Booking.findAll({
            where: { userId: req.session.user.id },
            order: [['date', 'DESC']]
        });
        res.json(bookings);
    } catch (error) {
        console.error('Failed to fetch bookings:', error);
        res.status(500).json({ error: 'Failed to fetch bookings' });
    }
});

app.delete('/api/bookings/:id', authMiddleware, async (req, res) => {
    try {
        const booking = await Booking.findOne({
            where: { 
                id: req.params.id,
                userId: req.session.user.id
            }
        });
        
        if (!booking) {
            return res.status(404).json({ error: 'Booking not found' });
        }
        
        await booking.destroy();
        res.json({ message: 'Booking deleted successfully' });
    } catch (error) {
        console.error('Failed to delete booking:', error);
        res.status(500).json({ error: 'Failed to delete booking' });
    }
});

app.get('/api/slides', authMiddleware, async (req, res) => {
    try {
        const slides = await Slide.findAll({
            where: { userId: req.session.user.id },
            order: [['createdAt', 'DESC']]
        });
        res.json(slides);
    } catch (error) {
        console.error('Failed to fetch slides:', error);
        res.status(500).json({ error: 'Failed to fetch slides' });
    }
});

app.get('/api/slides/:id', authMiddleware, async (req, res) => {
    try {
        const slide = await Slide.findOne({
            where: { 
                id: req.params.id,
                userId: req.session.user.id
            }
        });
        
        if (!slide) {
            return res.status(404).json({ error: 'Slide not found' });
        }
        
        res.json(slide);
    } catch (error) {
        console.error('Failed to fetch slide:', error);
        res.status(500).json({ error: 'Failed to fetch slide' });
    }
}); 