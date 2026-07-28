const express = require('express');
const Booking = require('../models/Booking');
const Property = require('../models/Property');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

// CREATE — a logged-in user requests to book a property
router.post('/', requireAuth, async (req, res) => {
  try {
    const { propertyId, startDate, endDate, message } = req.body;

    const property = await Property.findById(propertyId);
    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    // owners shouldn't be able to book their own listings
    if (String(property.owner) === String(req.user._id)) {
      return res.status(400).json({ message: 'You cannot book your own property' });
    }

    const booking = await Booking.create({
      property: property._id,
      renter: req.user._id,
      owner: property.owner,
      startDate,
      endDate,
      message,
    });

    res.status(201).json(booking);
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;