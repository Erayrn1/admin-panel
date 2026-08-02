const express = require('express');
const router = express.Router();
const Settings = require('../models/Settings');
const authMiddleware = require('../middleware/auth');
const roleMiddleware = require('../middleware/role');

// Get all settings
router.get('/', authMiddleware, roleMiddleware(['admin']), async (req, res) => {
  try {
    const settings = await Settings.findOne();
    if (!settings) {
      return res.status(404).json({ message: 'Settings not found' });
    }
    res.status(200).json(settings);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching settings', error: error.message });
  }
});

// Get specific setting by key
router.get('/:key', authMiddleware, async (req, res) => {
  try {
    const settings = await Settings.findOne();
    if (!settings) {
      return res.status(404).json({ message: 'Settings not found' });
    }

    const value = settings[req.params.key];
    if (value === undefined) {
      return res.status(404).json({ message: `Setting key '${req.params.key}' not found` });
    }

    res.status(200).json({ key: req.params.key, value });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching setting', error: error.message });
  }
});

// Update settings
router.put('/', authMiddleware, roleMiddleware(['admin']), async (req, res) => {
  try {
    const updates = req.body;

    let settings = await Settings.findOne();
    if (!settings) {
      settings = new Settings(updates);
    } else {
      Object.assign(settings, updates);
    }

    settings.updatedAt = Date.now();
    await settings.save();

    res.status(200).json({ message: 'Settings updated successfully', settings });
  } catch (error) {
    res.status(500).json({ message: 'Error updating settings', error: error.message });
  }
});

// Update specific setting by key
router.patch('/:key', authMiddleware, roleMiddleware(['admin']), async (req, res) => {
  try {
    const { value } = req.body;

    if (value === undefined) {
      return res.status(400).json({ message: 'Value is required' });
    }

    let settings = await Settings.findOne();
    if (!settings) {
      settings = new Settings();
    }

    settings[req.params.key] = value;
    settings.updatedAt = Date.now();
    await settings.save();

    res.status(200).json({ 
      message: `Setting '${req.params.key}' updated successfully`, 
      key: req.params.key,
      value 
    });
  } catch (error) {
    res.status(500).json({ message: 'Error updating setting', error: error.message });
  }
});

// Reset settings to default
router.post('/reset', authMiddleware, roleMiddleware(['admin']), async (req, res) => {
  try {
    await Settings.deleteMany({});
    const defaultSettings = new Settings();
    await defaultSettings.save();

    res.status(200).json({ message: 'Settings reset to default', settings: defaultSettings });
  } catch (error) {
    res.status(500).json({ message: 'Error resetting settings', error: error.message });
  }
});

// Get settings for public access (limited fields)
router.get('/public/config', async (req, res) => {
  try {
    const settings = await Settings.findOne();
    if (!settings) {
      return res.status(404).json({ message: 'Settings not found' });
    }

    const publicSettings = {
      siteTitle: settings.siteTitle,
      siteDescription: settings.siteDescription,
      maintenanceMode: settings.maintenanceMode,
      contactEmail: settings.contactEmail,
      socialLinks: settings.socialLinks
    };

    res.status(200).json(publicSettings);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching public settings', error: error.message });
  }
});

module.exports = router;
