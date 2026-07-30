const express = require('express');
const Booking = require('../models/Booking');
const Property = require('../models/Property');
const { requireAuth } = require('../middleware/auth');
const AppError = require('../utils/AppError');

const router = express.Router();

// CREATE — a logged-in user requests to book a property
router.post('/', requireAuth, async (req, res, next) => {
  try {
    const { propertyId, startDate, endDate, message } = req.body;

    const property = await Property.findById(propertyId);
    if (!property) {
      return next(new AppError('Property not found', 404));
    }

    // owners shouldn't be able to book their own listings
    if (String(property.owner) === String(req.user._id)) {
       return next(new AppError('You cannot book your own property', 400));
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
    next(error);
  }
});

// READ — bookings I made as a renter
router.get('/mine', requireAuth, async (req, res, next) => {
  try {
    const bookings = await Booking.find({ renter: req.user._id }).populate('property', 'propertyType location price');
    res.status(200).json(bookings);
  } catch (error) {
    next(error);
  }
});

// READ — booking requests received, for properties I own
router.get('/received', requireAuth, async (req, res, next) => {
  try {
    const bookings = await Booking.find({ owner: req.user._id }).populate('property', 'propertyType location price').populate('renter', 'name phone');
    res.status(200).json(bookings);
  } catch (error) {
    next(error);
  }
});

// UPDATE — only the property owner can accept or decline
router.put('/:id/status', requireAuth, async (req, res, next) => {
  try {
    const { status } = req.body;

    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return next(new AppError('Booking not found',404));
    }

    // only the owner of the property being booked can respond to the request
    if (String(booking.owner) !== String(req.user._id)) {
      return next(new AppError('You can only respond to requests for your own properties',403));
    }

    if (!['accepted', 'declined'].includes(status)) {
      return next(new AppError('Status must be accepted or declined',400));
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
    return next(new AppError('This property already has an accepted booking that overlaps these dates',409));
  }
}

    booking.status = status;
    await booking.save();
    res.status(200).json(booking);
  } catch (error) {
     next(error);
  }
});

module.exports = router;