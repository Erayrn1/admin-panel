const express = require('express');
const router = express.Router();
const Contact = require('../models/Contact');
const authMiddleware = require('../middleware/auth');
const roleMiddleware = require('../middleware/role');

// Get all contact messages
router.get('/', authMiddleware, roleMiddleware(['admin', 'moderator']), async (req, res) => {
  try {
    const { status, isRead } = req.query;
    let query = {};

    if (status) query.status = status;
    if (isRead !== undefined) query.isRead = isRead === 'true';

    const messages = await Contact.find(query).sort({ createdAt: -1 });
    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching contact messages', error: error.message });
  }
});

// Get contact message by ID
router.get('/:id', authMiddleware, roleMiddleware(['admin', 'moderator']), async (req, res) => {
  try {
    const message = await Contact.findById(req.params.id);
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }
    res.status(200).json(message);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching message', error: error.message });
  }
});

// Create contact message
router.post('/', async (req, res) => {
  try {
    const { name, email, phone, subject, message, category } = req.body;

    if (!name || !email || !subject || !message) {
      return res.status(400).json({ message: 'Name, email, subject, and message are required' });
    }

    const contact = new Contact({
      name,
      email,
      phone,
      subject,
      message,
      category: category || 'general'
    });

    await contact.save();
    res.status(201).json({ message: 'Message sent successfully', contact });
  } catch (error) {
    res.status(500).json({ message: 'Error sending message', error: error.message });
  }
});

// Mark message as read
router.patch('/:id/read', authMiddleware, roleMiddleware(['admin', 'moderator']), async (req, res) => {
  try {
    const message = await Contact.findByIdAndUpdate(
      req.params.id,
      { isRead: true, readAt: Date.now() },
      { new: true }
    );
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }
    res.status(200).json({ message: 'Message marked as read', contact: message });
  } catch (error) {
    res.status(500).json({ message: 'Error updating message', error: error.message });
  }
});

// Update contact message status
router.patch('/:id/status', authMiddleware, roleMiddleware(['admin', 'moderator']), async (req, res) => {
  try {
    const { status, reply } = req.body;

    if (!status) {
      return res.status(400).json({ message: 'Status is required' });
    }

    const message = await Contact.findByIdAndUpdate(
      req.params.id,
      { 
        status,
        reply: reply || undefined,
        repliedAt: reply ? Date.now() : undefined
      },
      { new: true }
    );
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }
    res.status(200).json({ message: 'Message status updated', contact: message });
  } catch (error) {
    res.status(500).json({ message: 'Error updating message', error: error.message });
  }
});

// Delete contact message
router.delete('/:id', authMiddleware, roleMiddleware(['admin']), async (req, res) => {
  try {
    const message = await Contact.findByIdAndDelete(req.params.id);
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }
    res.status(200).json({ message: 'Message deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting message', error: error.message });
  }
});

module.exports = router;
