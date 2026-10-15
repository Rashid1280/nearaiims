const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    // the property being requested
    property: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Property",
      required: true,
    },
    // the user making the request
    renter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // property's owner, for fast authorization checks
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    // renter's optional note to the owner
    message: {
      type: String,
    },
    status: {
      type: String,
      enum: [
        "pending",
        "accepted",
        "declined",
        "payment_pending",
        "payment_failed",
        "confirmed",
        "cancelled",
        "refunded",
      ],
      default: "pending",
    },
    pricePerNight: { type: Number, min: 0 },
    nights: { type: Number, min: 1 },
    amount: { type: Number, min: 0 },
    platformFeePercent: { type: Number, default: 10 },
    platformFeeAmount: { type: Number, min: 0 },
    ownerPayoutAmount: { type: Number, min: 0 },
    // ---- Razorpay references ----
    razorpayOrderId: { type: String },
    razorpayPaymentId: { type: String },
    paidAt: { type: Date },
    // ---- cancellation and refund ----
    cancelledAt: { type: Date },
    refundId: { type: String },
    refundStatus: {
      type: String,
      enum: ["none", "pending", "processed", "failed"],
      default: "none",
    },
  },
  { timestamps: true },
);

// speeds up search for "confirmed bookings for this property that overlap these dates" (as multiple indexes , not just id index),
// Also the write call becomes a little slower as the index will update with every call and will also take storage.
bookingSchema.index({ property: 1, status: 1, startDate: 1, endDate: 1 });
bookingSchema.index({ razorpayOrderId: 1 }, { sparse: true });

const Booking = mongoose.model("Booking", bookingSchema);

module.exports = Booking;
