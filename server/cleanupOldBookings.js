require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("./config/db");
const Booking = require("./models/Booking");

// the statuses your new code uses; anything else is an old test booking
const VALID_STATUSES = ["confirmed", "payment_pending", "payment_failed"];

// dry run by default; only deletes if you pass --apply
const APPLY = process.argv.includes("--apply");

async function cleanup() {
  await connectDB();
  console.log(`Database: ${mongoose.connection.name}`);

  const filter = { status: { $nin: VALID_STATUSES } };
  const oldBookings = await Booking.find(filter).select("status startDate");

  console.log(`Found ${oldBookings.length} old booking(s):`);
  oldBookings.forEach((b) => console.log(` - ${b._id} (${b.status})`));

  if (!APPLY) {
    console.log(
      "Dry run only. Nothing deleted. Re-run with --apply to delete.",
    );
    return;
  }

  const result = await Booking.deleteMany(filter);
  console.log(`Deleted ${result.deletedCount} booking(s).`);
}

cleanup()
  .catch((error) => console.error("Cleanup failed:", error))
  .finally(async () => {
    await mongoose.connection.close();
    process.exit();
  });
