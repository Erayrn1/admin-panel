const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

// Load environment variables
dotenv.config();

// Import middleware
const authMiddleware = require('./middleware/auth');
const roleMiddleware = require('./middleware/role');
const errorHandler = require('./middleware/errorHandler');
const requestLogger = require('./middleware/requestLogger');

// Import routes
const userRoutes = require('./routes/users');
const contactRoutes = require('./routes/contacts');
const settingsRoutes = require('./routes/settings');
const logsRoutes = require('./routes/logs');
const dashboardRoutes = require('./routes/dashboard');

// Create Express app
const app = express();

// CORS configuration
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(requestLogger);

// Health check route
app.get('/health', (req, res) => {
  res.status(200).json({ message: 'Server is running' });
});

// Public routes (no auth required)
app.use('/api/auth', require('./routes/auth')); // Login, Register, Password Reset

// Protected routes (auth required)
app.use('/api/users', authMiddleware, userRoutes);
app.use('/api/contacts', authMiddleware, contactRoutes);
app.use('/api/settings', authMiddleware, settingsRoutes);
app.use('/api/logs', authMiddleware, logsRoutes);
app.use('/api/dashboard', authMiddleware, dashboardRoutes);

// Admin only routes
app.use('/api/admin', authMiddleware, roleMiddleware(['admin']));

// 404 route
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Error handling middleware (must be last)
app.use(errorHandler);

module.exports = app;