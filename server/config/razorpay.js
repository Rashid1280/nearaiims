const Razorpay = require("razorpay");

function getKeyId() {
  const keyId = process.env.RAZORPAY_KEY_ID;
  if (!keyId) {
    throw new Error("RAZORPAY_KEY_ID is not set");
  }
  if (!keyId.startsWith("rzp_test_")) {
    throw new Error(
      "Only Razorpay test keys (rzp_test_) are allowed in this project",
    );
  }
  return keyId;
}

function getKeySecret() {
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keySecret) {
    throw new Error("RAZORPAY_KEY_SECRET is not set");
  }
  return keySecret;
}

let razorpayInstance = null;

// Builds the Razorpay client on first use, then reuses it.
function getRazorpay() {
  if (!razorpayInstance) {
    razorpayInstance = new Razorpay({
      key_id: getKeyId(),
      key_secret: getKeySecret(),
    });
  }
  return razorpayInstance;
}

function getWebhookSecret() {
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!webhookSecret) {
    throw new Error("RAZORPAY_WEBHOOK_SECRET is not set");
  }
  return webhookSecret;
}

module.exports = { getKeyId, getKeySecret, getRazorpay, getWebhookSecret };
