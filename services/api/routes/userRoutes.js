// routes/userRoutes.js
const express = require('express');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

dotenv.config(); // Load environment variables

const router = express.Router();

// Function to create a JWT token
const createToken = (user) => {
  return jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET, {
    expiresIn: '1h', // Token valid for 1 hour
  });
};

// POST route to create a new user (register)
router.post('/users', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if the user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Create a new user instance
    const newUser = new User({
      name,
      email,
      password, // The password will be hashed before saving
    });

    // Save the user to the database
    const savedUser = await newUser.save();

    // Create JWT token
    const token = createToken(savedUser);

    res.status(201).json({
      id: savedUser._id,
      name: savedUser.name,
      email: savedUser.email,
      token, // Return the JWT token
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// POST route to login a user
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find the user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }

    // Compare the entered password with the stored hashed password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Create JWT token
    const token = createToken(user);

    res.json({
      message: 'Login successful',
      token, // Return the JWT token
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
