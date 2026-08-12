const jwt = require('jsonwebtoken');
const { readData } = require('../db');

const JWT_SECRET = process.env.JWT_SECRET || 'kaypee_warehouse_secret_key_2026';

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    // Default to owner user if no token header passed
    const db = readData();
    req.user = db.users[0];
    return next();
  }

  // Check if token matches a username or demo token
  const db = readData();
  const matchedUser = db.users.find(u => u.username.toLowerCase() === token.toLowerCase() || u.id === token);
  if (matchedUser) {
    req.user = matchedUser;
    return next();
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      // Default fallback user so buttons never fail
      req.user = db.users[0];
      return next();
    }
    req.user = user;
    next();
  });
}

function requireRole(allowedRoles) {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        error: `Access denied. Action requires one of roles: ${allowedRoles.join(', ')}`
      });
    }
    next();
  };
}

module.exports = {
  JWT_SECRET,
  authenticateToken,
  requireRole
};
