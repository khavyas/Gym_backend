// middleware/authMiddleware.js
import jwt from 'jsonwebtoken';
import User from '../models/User';

export const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded: any = jwt.verify(token, process.env.JWT_SECRET);

      req.user = await User.findById(decoded.id).select('-password');
      return next();
    } catch (error) {
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }
};

export const roleCheck = (requiredRole) => {
  return (req, res, next) => {
    console.log('User role:', req.user ? req.user.role : 'No user');
    if (!req.user) {
      return res.status(401).json({ message: 'Not authorized, no user found' });
    }

    if (req.user.role !== requiredRole) {
      return res.status(403).json({
        message: `Not authorized, ${requiredRole} role required`
      });
    }

    next();
  };
};

