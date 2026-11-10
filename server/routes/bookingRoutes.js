const express = require("express");
const Booking = require("../models/Booking");
const Property = require("../models/Property");
const { requireAuth } = require("../middleware/auth");
const AppError = require("../utils/AppError");
const {
  calculateAmounts,
  countNights,
  parseDate,
  todayInIndia,
  toPaise,
} = require("../utils/pricing");
const Transaction = require("../models/Transaction");
const { getKeyId, getRazorpay } = require("../config/razorpay");
const PLATFORM_FEE_PERCENT = 10;

const router = express.Router();

// CREATE — a logged-in user requests to book a property
router.post("/", requireAuth, async (req, res, next) => {
  try {
    const { propertyId, startDate, endDate, message } = req.body;

    const property = await Property.findById(propertyId);
    if (!property) {
      return next(new AppError("Property not found", 404));
    }

    // owners shouldn't be able to book their own listings
    if (String(property.owner) === String(req.user._id)) {
      return next(new AppError("You cannot book your own property", 400));
    }

    const overlappingBooking = await Booking.findOne({
      property: property._id,
      renter: req.user._id,
      status: { $in: ["pending", "accepted"] },
      startDate: { $lte: endDate },
      endDate: { $gte: startDate },
    });

    if (overlappingBooking) {
      return next(
        new AppError(
          "You already have an active request for these dates on this property",
          409,
        ),
      );
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

// RESERVE — a logged-in user reserves dates and starts payment
router.post("/reserve", requireAuth, async (req, res, next) => {
  const { propertyId } = req.body;
  if (typeof propertyId !== "string") {
    return next(new AppError("A valid property id is required", 400));
  }
  try {
    const startDate = parseDate(req.body.startDate);
    const endDate = parseDate(req.body.endDate);
    if (!startDate || !endDate) {
      return next(
        new AppError("Dates must be valid and in YYYY-MM-DD format", 400),
      );
    }

    if (startDate < todayInIndia()) {
      return next(new AppError("Start date cannot be in the past", 400));
    }

    const nights = countNights(startDate, endDate);
    if (nights < 1) {
      return next(new AppError("Check-out must be after check-in", 400));
    }

    const property = await Property.findById(propertyId);
    if (!property) {
      return next(new AppError("Property not found", 404));
    }

    if (String(property.owner) === String(req.user._id)) {
      return next(new AppError("You cannot book your own property", 400));
    }

    if (!property.isAvailable) {
      return next(new AppError("This property is not available", 400));
    }

    if (property.pricePerNight < 1) {
      return next(new AppError("This property has no valid price", 400));
    }

    const amounts = calculateAmounts(
      property.pricePerNight,
      nights,
      PLATFORM_FEE_PERCENT,
    );

    const clash = await Booking.findOne({
      property: property._id,
      status: "confirmed",
      startDate: { $lt: endDate },
      endDate: { $gt: startDate },
    });
    if (clash) {
      return next(new AppError("These dates are already booked", 409));
    }

    const booking = new Booking({
      property: property._id,
      renter: req.user._id,
      owner: property.owner,
      startDate,
      endDate,
      status: "payment_pending",
      pricePerNight: property.pricePerNight,
      nights,
      amount: amounts.amount,
      platformFeePercent: PLATFORM_FEE_PERCENT,
      platformFeeAmount: amounts.platformFeeAmount,
      ownerPayoutAmount: amounts.ownerPayoutAmount,
    });

    const order = await getRazorpay().orders.create({
      amount: toPaise(amounts.amount),
      currency: "INR",
      receipt: String(booking._id),
    });

    booking.razorpayOrderId = order.id;
    await booking.save();

    await Transaction.create({
      bookingId: booking._id,
      razorpayOrderId: order.id,
      amount: booking.amount,
      eventType: "order_created",
    });

    res.status(201).json({
      bookingId: booking._id,
      orderId: order.id,
      keyId: getKeyId(),
      amount: booking.amount,
      amountInPaise: order.amount,
    });
  } catch (error) {
    next(error);
  }
});

// READ — bookings I made as a renter
router.get("/mine", requireAuth, async (req, res, next) => {
  try {
    const bookings = await Booking.find({ renter: req.user._id })
      .populate(
        "property",
        "propertyType location pricePerNight images ownerContactNumber",
      )
      .lean();

    const sanitized = bookings.map((booking) => {
      if (booking.property && booking.status !== "accepted") {
        const { ownerContactNumber, ...propertyWithoutNumber } =
          booking.property;
        return { ...booking, property: propertyWithoutNumber };
      }
      return booking;
    });

    res.status(200).json(sanitized);
  } catch (error) {
    next(error);
  }
});

// READ — booking requests received, for properties I own
router.get("/received", requireAuth, async (req, res, next) => {
  try {
    const bookings = await Booking.find({ owner: req.user._id })
      .populate("property", "propertyType location pricePerNight images")
      .populate("renter", "name phone");
    res.status(200).json(bookings);
  } catch (error) {
    next(error);
  }
});

// UPDATE — only the property owner can accept or decline
router.put("/:id/status", requireAuth, async (req, res, next) => {
  try {
    const { status } = req.body;

    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return next(new AppError("Booking not found", 404));
    }

    // only the owner of the property being booked can respond to the request
    if (String(booking.owner) !== String(req.user._id)) {
      return next(
        new AppError(
          "You can only respond to requests for your own properties",
          403,
        ),
      );
    }

    if (!["accepted", "declined"].includes(status)) {
      return next(new AppError("Status must be accepted or declined", 400));
    }

    // only check for date conflicts when actually accepting (not declining)
    if (status === "accepted") {
      const overlappingBooking = await Booking.findOne({
        property: booking.property,
        status: "accepted", // only confirmed bookings count as real conflicts
        _id: { $ne: booking._id }, // exclude this booking itself (only invoked when a user double click on accepted bcoz first time, the status of current booking is still pending)
        startDate: { $lte: booking.endDate }, // does THIS one start before the other ends?
        endDate: { $gte: booking.startDate }, // does THIS one end after the other starts?
      });

      if (overlappingBooking) {
        return next(
          new AppError(
            "This property already has an accepted booking that overlaps these dates",
            409,
          ),
        );
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
