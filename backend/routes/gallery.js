const express = require('express');
const router = express.Router();
const Gallery = require('../models/Gallery');
const authMiddleware = require('../middleware/auth');
const roleMiddleware = require('../middleware/role');

// Get all gallery images
router.get('/', async (req, res) => {
  try {
    const { category, isPublished } = req.query;
    let query = {};

    if (category) query.category = category;
    if (isPublished !== undefined) query.isPublished = isPublished === 'true';

    const images = await Gallery.find(query).populate('uploadedBy', 'name email');
    res.status(200).json(images);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching gallery images', error: error.message });
  }
});

// Get gallery image by ID
router.get('/:id', async (req, res) => {
  try {
    const image = await Gallery.findById(req.params.id).populate('uploadedBy', 'name email');
    if (!image) {
      return res.status(404).json({ message: 'Image not found' });
    }
    res.status(200).json(image);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching image', error: error.message });
  }
});

// Upload new gallery image
router.post('/', authMiddleware, roleMiddleware(['admin', 'moderator']), async (req, res) => {
  try {
    const { title, description, image, category } = req.body;

    if (!title || !image || !category) {
      return res.status(400).json({ message: 'Title, image, and category are required' });
    }

    const galleryImage = new Gallery({
      title,
      description,
      image,
      category,
      uploadedBy: req.user.id
    });

    await galleryImage.save();
    res.status(201).json({ message: 'Image uploaded successfully', galleryImage });
  } catch (error) {
    res.status(500).json({ message: 'Error uploading image', error: error.message });
  }
});

// Update gallery image
router.put('/:id', authMiddleware, roleMiddleware(['admin', 'moderator']), async (req, res) => {
  try {
    const { title, description, image, category, isPublished } = req.body;

    const galleryImage = await Gallery.findById(req.params.id);
    if (!galleryImage) {
      return res.status(404).json({ message: 'Image not found' });
    }

    if (title) galleryImage.title = title;
    if (description) galleryImage.description = description;
    if (image) galleryImage.image = image;
    if (category) galleryImage.category = category;
    if (isPublished !== undefined) galleryImage.isPublished = isPublished;
    galleryImage.updatedAt = Date.now();

    await galleryImage.save();
    res.status(200).json({ message: 'Image updated successfully', galleryImage });
  } catch (error) {
    res.status(500).json({ message: 'Error updating image', error: error.message });
  }
});

// Delete gallery image
router.delete('/:id', authMiddleware, roleMiddleware(['admin']), async (req, res) => {
  try {
    const galleryImage = await Gallery.findByIdAndDelete(req.params.id);
    if (!galleryImage) {
      return res.status(404).json({ message: 'Image not found' });
    }
    res.status(200).json({ message: 'Image deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting image', error: error.message });
  }
});

module.exports = router;
