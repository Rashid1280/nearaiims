const mongoose = require("mongoose");

// An append-only log of payment events. Booking holds the CURRENT state;
// Transaction keeps the history of what happened and when.
const transactionSchema = new mongoose.Schema(
  {
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      required: true,
      index: true,
    },
    razorpayOrderId: { type: String },
    razorpayPaymentId: { type: String },
    // Razorpay's id for this webhook delivery (from the X-Razorpay-Event-Id header)
    razorpayEventId: { type: String },
    // in rupees, same as Booking.amount
    amount: { type: Number, required: true, min: 0 },
    currency: { type: String, default: "INR" },
    eventType: {
      type: String,
      required: true,
      enum: [
        "order_created",
        "payment_captured",
        "payment_failed",
        "refund_initiated",
        "refund_processed",
      ],
    },
    // the webhook body as received, kept for debugging
    rawPayload: { type: mongoose.Schema.Types.Mixed },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

// no two rows may share an event id, so a webhook Razorpay re-sends can't be recorded twice
transactionSchema.index(
  { razorpayEventId: 1 },
  {
    unique: true,
    partialFilterExpression: { razorpayEventId: { $type: "string" } },
  },
);

const Transaction = mongoose.model("Transaction", transactionSchema);

module.exports = Transaction;
