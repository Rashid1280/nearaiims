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
      if (booking.property && booking.status !== "confirmed") {
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

// READ — paid bookings on properties I own
router.get("/received", requireAuth, async (req, res, next) => {
  try {
    const bookings = await Booking.find({
      owner: req.user._id,
      status: { $in: ["confirmed", "cancelled", "refunded"] },
    })
      .populate("property", "propertyType location pricePerNight images")
      .populate("renter", "name phone");
    res.status(200).json(bookings);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
