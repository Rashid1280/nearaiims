const express = require('express');
const Property = require('../models/Property');
const { requireAuth } = require('../middleware/auth');
const upload = require('../middleware/upload');
const AppError = require('../utils/AppError');

const router = express.Router();

// CREATE — must be logged in
router.post('/', requireAuth, upload.array('images', 6), async (req, res, next) => {
  try {

    if(!req.files || req.files.length ===0){
      return next(new AppError('At least one image is required', 400))
    }
    const images = req.files.map((file)=> `/uploads/${file.filename}` );
    
    const property = await Property.create({
      ...req.body,
      images,
      owner: req.user._id,
    });
    res.status(201).json(property);
  } catch (error) {
    next(error);
  }
});

// READ — all properties, public, no login needed
router.get('/', async (req, res, next) => {
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
    next(error);
  }
});

// READ — one property, public, with owner's info populated
router.get('/:id', async (req, res, next) => {
  try {

    const property = await Property.findById(req.params.id).populate('owner', 'name');
    if (!property) {
      return next(new AppError('Property not found',404))
    }

    res.status(200).json(property);
  } catch (error) {
    next(error);
  }
});

// UPDATE — must be logged in AND must own this specific property
router.put('/:id', requireAuth, upload.array('images', 6), async (req, res, next) => {
  try {

    const property = await Property.findById(req.params.id);
    if (!property) {
      return next(new AppError('Property not found',404))
    }
    if (String(property.owner) !== String(req.user._id)) {
      return next(new AppError('You can only edit your own listings',403))
    }

     Object.assign(property, req.body);

      if(req.files.length >0){
    property.images = req.files.map((file)=> `/uploads/${file.filename}`)
     
    }
   
    await property.save();
    res.status(200).json(property);
  } catch (error) {
    next(error);
  }
});

// DELETE — same ownership rule as update
router.delete('/:id', requireAuth, async (req, res, next) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) {
      return next(new AppError('Property not found',404))
    }
    if (String(property.owner) !== String(req.user._id)) {
      return next(new AppError('You can only delete your own listings',403))
    }

    await property.deleteOne();
    res.status(200).json({ message: 'Property deleted' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;