const express = require('express');
const jwt = require('jsonwebtoken');
const { readData, writeData } = require('../db');
const { JWT_SECRET, authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();

// Login
router.post('/login', (req, res) => {
  const { username, password } = req.body;
  const db = readData();
  const user = db.users.find(
    u => u.username.toLowerCase() === (username || '').toLowerCase() && u.password === password
  );

  if (!user) {
    return res.status(401).json({ error: 'Invalid username or password' });
  }

  const token = jwt.sign(
    { id: user.id, username: user.username, name: user.name, role: user.role },
    JWT_SECRET,
    { expiresIn: '7d' }
  );

  res.json({
    token,
    user: {
      id: user.id,
      username: user.username,
      name: user.name,
      role: user.role
    }
  });
});

// Get current user details
router.get('/me', authenticateToken, (req, res) => {
  res.json({ user: req.user });
});

// Get all users (Owner only)
router.get('/users', authenticateToken, requireRole(['owner']), (req, res) => {
  const db = readData();
  const safeUsers = db.users.map(u => ({
    id: u.id,
    username: u.username,
    name: u.name,
    role: u.role
  }));
  res.json(safeUsers);
});

// Create new user (Owner only)
router.post('/users', authenticateToken, requireRole(['owner']), (req, res) => {
  const { username, password, name, role } = req.body;
  if (!username || !password || !name || !role) {
    return res.status(400).json({ error: 'All fields (username, password, name, role) are required' });
  }

  const db = readData();
  if (db.users.some(u => u.username.toLowerCase() === username.toLowerCase())) {
    return res.status(400).json({ error: 'Username already exists' });
  }

  const newUser = {
    id: 'u_' + Date.now(),
    username: username.trim(),
    password: password.trim(),
    name: name.trim(),
    role
  };

  db.users.push(newUser);
  writeData(db);

  res.status(201).json({
    message: 'User created successfully',
    user: { id: newUser.id, username: newUser.username, name: newUser.name, role: newUser.role }
  });
});

module.exports = router;
