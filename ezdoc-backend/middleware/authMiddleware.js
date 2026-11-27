const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Lets the request through only with a valid "Authorization: Bearer <token>" header.
 * Puts the logged-in user (without the password) on req.user for the next handler.
 */
async function protect(req, res, next) {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'No token, authorization denied' });
    }

    // "Bearer abc.def.ghi" -> "abc.def.ghi"
    const token = authHeader.split(' ')[1];

    try {
        // Throws if the token was changed or has expired
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'ezdoc_secret');
        req.user = await User.findById(decoded.id).select('-password');

        if (!req.user) {
            return res.status(401).json({ message: 'User not found' }); // account was deleted
        }

        next();
    } catch (err) {
        return res.status(401).json({ message: 'Token is not valid' });
    }
}

/**
 * Role guard, used after protect: requireRole('doctor') or requireRole('doctor', 'admin').
 * It is a function that BUILDS the middleware, so each route can say which roles it allows.
 */
function requireRole(...roles) {
    return function checkRole(req, res, next) {
        let role = undefined;
        if (req.user) {
            role = req.user.role;
        }
        if (!roles.includes(role)) {
            return res.status(403).json({ message: `Access denied. Requires role: ${roles.join(' or ')}` });
        }
        next();
    };
}

module.exports = { protect, requireRole };
