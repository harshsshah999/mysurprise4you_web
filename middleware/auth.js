// middleware/auth.js
module.exports = (req, res, next) => {
    if (!req.isAuthenticated()) {
        console.log('Authentication failed: User not authenticated');
        return res.status(401).json({ 
            message: 'Unauthorized - Please login to continue',
            redirect: '/auth.html'
        });
    }
    next();
};