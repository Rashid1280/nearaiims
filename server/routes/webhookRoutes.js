const express = require("express");
const AppError = require("../utils/AppError");
const { getWebhookSecret } = require("../config/razorpay");
const { isValidSignature } = require("../utils/signature");

const router = express.Router();

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

    // temporary, replaced in the next pieces
    console.log("webhook received:", event.event);
    res.status(200).json({ received: true });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
