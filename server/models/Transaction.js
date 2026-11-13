const mongoose = require("mongoose");

// An append-only log of payment events. Booking holds only the CURRENT state while
// Transaction keeps the history of what happened and when (All events).
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
    razorpayEventId: { type: String },
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
    // the webhook body as received, kept for debugging(As the name suggests raw payload)
    rawPayload: { type: mongoose.Schema.Types.Mixed },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

// no two documents may share an event id, so a webhook Razorpay re-sends can't be recorded twice
transactionSchema.index(
  { razorpayEventId: 1 },
  {
    unique: true,
    partialFilterExpression: { razorpayEventId: { $type: "string" } },
  },
);

const Transaction = mongoose.model("Transaction", transactionSchema);

module.exports = Transaction;
