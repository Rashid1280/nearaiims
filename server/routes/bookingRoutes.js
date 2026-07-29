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

// READ — bookings I made as a renter
router.get('/mine', requireAuth, async (req, res) => {
  try {
    const bookings = await Booking.find({ renter: req.user._id }).populate('property', 'propertyType location price');
    res.status(200).json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// READ — booking requests received, for properties I own
router.get('/received', requireAuth, async (req, res) => {
  try {
    const bookings = await Booking.find({ owner: req.user._id }).populate('property', 'propertyType location price').populate('renter', 'name phone');
    res.status(200).json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// UPDATE — only the property owner can accept or decline
router.put('/:id/status', requireAuth, async (req, res) => {
  try {
    const { status } = req.body;

    if (!['accepted', 'declined'].includes(status)) {
      return res.status(400).json({ message: 'Status must be accepted or declined' });
    }

    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // only the owner of the property being booked can respond to the request
    if (String(booking.owner) !== String(req.user._id)) {
      return res.status(403).json({ message: 'You can only respond to requests for your own properties' });
    }

    // only check for date conflicts when actually accepting (not declining)
    if (status === 'accepted') {
        const overlappingBooking = await Booking.findOne({
        property: booking.property,
        status: 'accepted', // only confirmed bookings count as real conflicts
        _id: { $ne: booking._id }, // exclude this booking itself (only invoked when a user double click on accepted bcoz first time, the status of current booking is still pending)
        startDate: { $lte: booking.endDate }, // does THIS one start before the other ends?
        endDate: { $gte: booking.startDate }, // does THIS one end after the other starts?
  });

  if (overlappingBooking) {
    return res.status(400).json({ message: 'This property already has an accepted booking that overlaps these dates' });
  }
}

    booking.status = status;
    await booking.save();
    res.status(200).json(booking);
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;