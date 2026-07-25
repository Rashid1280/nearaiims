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

    // Mongoose validation failures (bad enum, missing required field, etc)
    // are the client's fault — changing respond status to 400, not 500
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: error.message });
  }
});

// READ — all properties, public, no login needed
router.get('/', async (req, res) => {
  try {

    const {location, propertyType, minPrice, maxPrice} = req.query;

    // filter object - late query parameters will also be added as key vaule pairs
    const filter = {isAvailable : true};

    // partial, case-insensitive location match
    if(location){
      filter.location = {$regex : location, $options : 'i'}
    }
    if(propertyType){
      filter.propertyType = propertyType;
    }
    if(minPrice || maxPrice){
      filter.price = {};
      if(minPrice) filter.price.$gte = Number(minPrice);
      if(maxPrice) filter.price.$lte = Number(maxPrice);
    }

    const properties = await Property.find(filter);
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

     Object.assign(property, req.body);

      if(req.files && req.files.length >0){
    property.images = req.files.map((file)=> `/uploads/${file.filename}`)
     
    }
   
    await property.save();
    res.status(200).json(property);
  } catch (error) {

     // Mongoose validation failures (bad enum, missing required field, etc)
    // are the client's fault — changing respond status to 400, not 500
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: error.message });
    }
    
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