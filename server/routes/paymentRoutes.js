const express = require("express");
const Booking = require("../models/Booking");
const { requireAuth } = require("../middleware/auth");
const AppError = require("../utils/AppError");
const { getKeySecret } = require("../config/razorpay");
const { isValidSignature } = require("../utils/signature");

const router = express.Router();

// VERIFY — the browser reports a finished payment; we check it is genuine
router.post("/verify", requireAuth, async (req, res, next) => {
  try {
    const orderId = req.body.razorpay_order_id;
    const paymentId = req.body.razorpay_payment_id;
    const signature = req.body.razorpay_signature;
    if (
      typeof orderId !== "string" ||
      typeof paymentId !== "string" ||
      typeof signature !== "string"
    ) {
      return next(new AppError("Payment details are missing", 400));
    }

    const text = `${orderId}|${paymentId}`;
    if (!isValidSignature(text, getKeySecret(), signature)) {
      return next(new AppError("Payment verification failed", 400));
    }

    const booking = await Booking.findOne({ razorpayOrderId: orderId });
    if (!booking) {
      return next(new AppError("Booking not found", 404));
    }

    if (String(booking.renter) !== String(req.user._id)) {
      return next(new AppError("You can only verify your own payments", 403));
    }
    const confirmed = await Booking.findOneAndUpdate(
      {
        _id: booking._id,
        status: { $in: ["payment_pending", "payment_failed"] },
      },
      {
        status: "confirmed",
        razorpayPaymentId: paymentId,
        paidAt: new Date(),
      },
      { returnDocument: "after" },
    );

    const result = confirmed || (await Booking.findById(booking._id));
    res.status(200).json({ bookingId: result._id, status: result.status });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
