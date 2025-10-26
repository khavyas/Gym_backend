const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.protect = async (req, res, next) => {
  let token;

  // Check for token in Authorization header
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
    } catch (error) {
      return res.status(401).json({ message: 'Invalid token format' });
    }
  }

  // If no token found
  if (!token) {
    console.log('No token provided for route:', req.method, req.originalUrl);
    return res.status(401).json({ message: 'Not authorized, no token provided' });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Get user from token
    req.user = await User.findById(decoded.id).select('-password');

    if (!req.user) {
      return res.status(401).json({ message: 'User not found' });
    }

    next();
  } catch (error) {
    console.error('Token verification error:', error.message);
    return res.status(401).json({ message: 'Not authorized, token failed' });
  }
};


export const roleCheck = (requiredRoles: string[]) => {
  return (req, res, next) => {
    console.log('User role:', req.user ? req.user.role : 'No user');
    if (!req.user) {
      return res.status(401).json({ message: 'Not authorized, no user found' });
    }

    if (!requiredRoles.includes(req.user.role)) {
      return res.status(403).json({
        message: `Not authorized, ${requiredRoles.join(', ')} roles required`
      });
    }

    next();
  };
};
