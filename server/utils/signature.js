const crypto = require("crypto");

function isValidSignature(text, secret, signature) {
  const expected = crypto
    .createHmac("sha256", secret)
    .update(text)
    .digest("hex");
  const given = Buffer.from(String(signature));
  const wanted = Buffer.from(expected);
  if (given.length !== wanted.length) return false;
  return crypto.timingSafeEqual(given, wanted);
}

module.exports = { isValidSignature };
