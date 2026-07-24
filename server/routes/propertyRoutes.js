const express = require('express');
const Property = require('../models/Property');
const { requireAuth } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

// CREATE — must be logged in
router.post('/', requireAuth, upload.array('images', 6), async (req, res) => {
  try {

    if(!req.files || req.files.length ===0){
     return res.status(400).json({message : 'At least one image is required'})
    }
    const images = req.files.map((file)=> `/uploads/${file.filename}` );
    
    const property = await Property.create({
      ...req.body,
      images,
      owner: req.user._id,
    });
    res.status(201).json(property);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// READ — all properties, public, no login needed
router.get('/', async (req, res) => {
  try {
    const properties = await Property.find({ isAvailable: true });
    res.status(200).json(properties);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// READ — one property, public, with owner's info populated
router.get('/:id', async (req, res) => {
  try {
    const property = await Property.findById(req.params.id).populate('owner', 'name');
    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }
    res.status(200).json(property);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// UPDATE — must be logged in AND must own this specific property
router.put('/:id', requireAuth, upload.array('images', 6), async (req, res) => {
  try {

    const property = await Property.findById(req.params.id);
    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }
    if (String(property.owner) !== String(req.user._id)) {
      return res.status(403).json({ message: 'You can only edit your own listings' });
    }

      if(!req.files || req.files.length ===0){
     return res.status(400).json({message : 'At least one image is required'})
    }

    const images = req.files.map((file)=> `/uploads/${file.filename}` );

    Object.assign(property, req.body, {images});
    await property.save();
    res.status(200).json(property);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// DELETE — same ownership rule as update
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }
    if (String(property.owner) !== String(req.user._id)) {
      return res.status(403).json({ message: 'You can only delete your own listings' });
    }

    await property.deleteOne();
    res.status(200).json({ message: 'Property deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;