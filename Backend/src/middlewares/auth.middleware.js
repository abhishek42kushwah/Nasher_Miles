const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret_key_erp';

// Verify JWT Token
exports.verifyToken = (req, res, next) => {
    const token = req.header('Authorization')?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'No token, authorization denied' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        res.status(401).json({ message: 'Token is not valid' });
    }
};

// Authorize Roles
exports.authorize = (...roles) => {
    return (req, res, next) => {
        // Support role in header for development/testing flexibility
        const userRole = req.header('role') || req.user?.role;

        if (!roles.includes(userRole)) {
            return res.status(403).json({
                message: `Role ${userRole} is not authorized to access this route`
            });
        }
        next();
    };
};
