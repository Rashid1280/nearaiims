const MS_PER_DAY = 24 * 60 * 60 * 1000;

function countNights(startDate, endDate) {
  return Math.round((endDate - startDate) / MS_PER_DAY);
}

// decimals in binary, so 0.1 + 0.2 gives 0.30000000000000004.
// x100 makes it a whole number, round it, then /100 to go back so it give 0.3.
function roundMoney(value) {
  return Math.round(value * 100) / 100;
}

function calculateAmounts(pricePerNight, nights, platformFeePercent) {
  const amount = pricePerNight * nights;
  const platformFeeAmount = roundMoney((amount * platformFeePercent) / 100);
  const ownerPayoutAmount = roundMoney(amount - platformFeeAmount);
  return { amount, platformFeeAmount, ownerPayoutAmount };
}

function toPaise(rupees) {
  return Math.round(rupees * 100);
}

function parseDate(value) {
  if (typeof value !== "string") return null;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const date = new Date(value + "T00:00:00.000Z"); //This is the line where JS turns 31 Feb into 3 March.
  if (Number.isNaN(date.getTime())) return null; //catches dates JS REFUSED like "2026-13-01" "yyyy-mm-dd": getTime() is NaN
  if (date.toISOString().slice(0, 10) !== value) return null; //31 Feb became "2026-03-03", which is not "2026-02-31"
  return date;
}

const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000; // India is UTC+5:30

// Today's date in India, as a UTC-midnight Date (same format parseDate returns)
function todayInIndia(now = Date.now()) {
  const istNow = new Date(now + IST_OFFSET_MS);
  return new Date(istNow.toISOString().slice(0, 10) + "T00:00:00.000Z");
}

module.exports = {
  countNights,
  calculateAmounts,
  toPaise,
  parseDate,
  todayInIndia,
};
