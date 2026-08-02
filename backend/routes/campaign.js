const express = require('express');
const router = express.Router();
const Campaign = require('../models/Campaign');
const authMiddleware = require('../middleware/auth');
const roleMiddleware = require('../middleware/role');

// Get all campaigns
router.get('/', async (req, res) => {
  try {
    const campaigns = await Campaign.find().populate('createdBy', 'name email');
    res.status(200).json(campaigns);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching campaigns', error: error.message });
  }
});

// Get campaign by ID
router.get('/:id', async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.params.id).populate('createdBy', 'name email');
    if (!campaign) {
      return res.status(404).json({ message: 'Campaign not found' });
    }
    res.status(200).json(campaign);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching campaign', error: error.message });
  }
});

// Create campaign
router.post('/', authMiddleware, roleMiddleware(['admin', 'moderator']), async (req, res) => {
  try {
    const { title, description, image, startDate, endDate, discount } = req.body;

    if (!title || !description || !image || !startDate || !endDate) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const campaign = new Campaign({
      title,
      description,
      image,
      startDate,
      endDate,
      discount: discount || 0,
      createdBy: req.user.id
    });

    await campaign.save();
    res.status(201).json({ message: 'Campaign created successfully', campaign });
  } catch (error) {
    res.status(500).json({ message: 'Error creating campaign', error: error.message });
  }
});

// Update campaign
router.put('/:id', authMiddleware, roleMiddleware(['admin', 'moderator']), async (req, res) => {
  try {
    const { title, description, image, startDate, endDate, isActive, discount } = req.body;

    const campaign = await Campaign.findById(req.params.id);
    if (!campaign) {
      return res.status(404).json({ message: 'Campaign not found' });
    }

    if (title) campaign.title = title;
    if (description) campaign.description = description;
    if (image) campaign.image = image;
    if (startDate) campaign.startDate = startDate;
    if (endDate) campaign.endDate = endDate;
    if (isActive !== undefined) campaign.isActive = isActive;
    if (discount !== undefined) campaign.discount = discount;
    campaign.updatedAt = Date.now();

    await campaign.save();
    res.status(200).json({ message: 'Campaign updated successfully', campaign });
  } catch (error) {
    res.status(500).json({ message: 'Error updating campaign', error: error.message });
  }
});

// Delete campaign
router.delete('/:id', authMiddleware, roleMiddleware(['admin']), async (req, res) => {
  try {
    const campaign = await Campaign.findByIdAndDelete(req.params.id);
    if (!campaign) {
      return res.status(404).json({ message: 'Campaign not found' });
    }
    res.status(200).json({ message: 'Campaign deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting campaign', error: error.message });
  }
});

module.exports = router;
