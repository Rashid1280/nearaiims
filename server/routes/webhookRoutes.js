const express = require("express");
const AppError = require("../utils/AppError");
const { getWebhookSecret } = require("../config/razorpay");
const { isValidSignature } = require("../utils/signature");
const Booking = require("../models/Booking");
const Transaction = require("../models/Transaction");

const router = express.Router();

async function saveDiaryEntry(booking, event, eventType, eventId) {
  const payment = event.payload.payment.entity;
  try {
    await Transaction.create({
      bookingId: booking._id,
      razorpayOrderId: payment.order_id,
      razorpayPaymentId: payment.id,
      razorpayEventId: eventId,
      amount: payment.amount / 100,
      eventType,
      rawPayload: event,
    });
  } catch (error) {
    if (error.code !== 11000) throw error;
  }
}

async function handlePaymentCaptured(event, eventId) {
  const payment = event.payload.payment.entity;

  const booking = await Booking.findOne({ razorpayOrderId: payment.order_id });
  if (!booking) {
    console.log("webhook: no booking for order", payment.order_id);
    return;
  }

  await Booking.updateOne(
    {
      _id: booking._id,
      status: { $in: ["payment_pending", "payment_failed"] },
    },
    {
      status: "confirmed",
      razorpayPaymentId: payment.id,
      paidAt: new Date(),
    },
  );

  await saveDiaryEntry(booking, event, "payment_captured", eventId);
}

async function handlePaymentFailed(event, eventId) {
  const payment = event.payload.payment.entity;

  const booking = await Booking.findOne({ razorpayOrderId: payment.order_id });
  if (!booking) {
    console.log("webhook: no booking for order", payment.order_id);
    return;
  }

  await Booking.updateOne(
    { _id: booking._id, status: "payment_pending" },
    { status: "payment_failed" },
  );

  await saveDiaryEntry(booking, event, "payment_failed", eventId);
}

router.post("/razorpay", async (req, res, next) => {
  try {
    if (!Buffer.isBuffer(req.body)) {
      return next(new AppError("Invalid webhook request", 400)); //Buffer= raw-bytes (if req.body is anything except raw bytes , we reject)
    }

    const signature = req.headers["x-razorpay-signature"];
    if (!isValidSignature(req.body, getWebhookSecret(), signature)) {
      return next(new AppError("Invalid webhook signature", 400));
    }

    const event = JSON.parse(req.body.toString()); // convert raw-bytes into text with toString then to JSON with parse (only after same signature check)

    const eventId = req.headers["x-razorpay-event-id"];
    console.log("webhook:", event.event, eventId);

    if (event.event === "payment.captured") {
      await handlePaymentCaptured(event, eventId);
    } else if (event.event === "payment.failed") {
      await handlePaymentFailed(event, eventId);
    }

    res.status(200).json({ received: true });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
