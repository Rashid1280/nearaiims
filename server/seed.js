require("dotenv").config();
const bcrypt = require("bcryptjs");
const connectDB = require("./config/db");
const mongoose = require("mongoose");
const cloudinary = require("./config/cloudinary");
const User = require("./models/User");
const Property = require("./models/Property");
const Booking = require("./models/Booking");
const { calculateAmounts, countNights } = require("./utils/pricing");

const SALT_ROUNDS = 10;
const PLATFORM_FEE_PERCENT = 10; // keep equal to the one in bookingRoutes.js

// picsum.photos generates a real random photo
// async function uploadSeedImage(seedName) {
//   const sourceUrl = `https://picsum.photos/seed/${seedName}/800/600`;
//   const result = await cloudinary.uploader.upload(sourceUrl, {
//     folder: "nearaiims",
//   });
//   return result.secure_url;
// }

//Trial alternate for picsum
const sources = [
  "https://res.cloudinary.com/demo/image/upload/sample.jpg",
  "https://res.cloudinary.com/demo/image/upload/cld-sample.jpg",
  "https://res.cloudinary.com/demo/image/upload/cld-sample-2.jpg",
  "https://res.cloudinary.com/demo/image/upload/cld-sample-3.jpg",
  "https://res.cloudinary.com/demo/image/upload/cld-sample-4.jpg",
  "https://res.cloudinary.com/demo/image/upload/cld-sample-5.jpg",
];
let imageCount = 0;

async function uploadSeedImage(seedName) {
  const sourceUrl = sources[imageCount % sources.length];
  imageCount++;
  const result = await cloudinary.uploader.upload(sourceUrl, {
    folder: "nearaiims",
    public_id: seedName,
  });
  return result.secure_url;
}

// a date `days` from today at UTC midnight (the form parseDate returns)
function daysFromNow(days) {
  const date = new Date();
  date.setUTCHours(0, 0, 0, 0);
  date.setUTCDate(date.getUTCDate() + days);
  return date;
}

// creates a booking with the same price snapshot the reserve route saves
async function createBooking(property, renter, startDays, endDays, status) {
  const startDate = daysFromNow(startDays);
  const endDate = daysFromNow(endDays);
  const nights = countNights(startDate, endDate);
  const amounts = calculateAmounts(
    property.pricePerNight,
    nights,
    PLATFORM_FEE_PERCENT,
  );
  const paid = status === "confirmed";

  return Booking.create({
    property: property._id,
    renter: renter._id,
    owner: property.owner,
    startDate,
    endDate,
    status,
    pricePerNight: property.pricePerNight,
    nights,
    amount: amounts.amount,
    platformFeePercent: PLATFORM_FEE_PERCENT,
    platformFeeAmount: amounts.platformFeeAmount,
    ownerPayoutAmount: amounts.ownerPayoutAmount,
    razorpayOrderId: `order_seed_${startDays}`,
    razorpayPaymentId: paid ? `pay_seed_${startDays}` : undefined,
    paidAt: paid ? new Date() : undefined,
  });
}

async function seed() {
  await connectDB();

  // guard: refuse to run on any database except stayfinder_dev
  if (mongoose.connection.name !== "stayfinder_dev") {
    console.error(`Refusing to seed "${mongoose.connection.name}"`);
    process.exit(1);
  }

  console.log("Clearing existing data...");
  await Booking.deleteMany({});
  await Property.deleteMany({});
  await User.deleteMany({});

  const passwordHash = await bcrypt.hash("password123", SALT_ROUNDS);

  console.log("Creating users...");
  const asha = await User.create({
    name: "Asha Owner",
    email: "asha@test.com",
    passwordHash,
    phone: "9000000001",
  });

  const karan = await User.create({
    name: "Karan Owner",
    email: "karan@test.com",
    passwordHash,
    phone: "9000000002",
  });

  const priya = await User.create({
    name: "Priya Renter",
    email: "priya@test.com",
    passwordHash,
    phone: "9000000003",
  });

  const rahul = await User.create({
    name: "Rahul Dual",
    email: "rahul@test.com",
    passwordHash,
    phone: "9000000004",
  });

  console.log("Uploading seed images to Cloudinary...");
  const imageA1 = await uploadSeedImage("nearaiims-room-1");
  const imageA2 = await uploadSeedImage("nearaiims-room-2");
  const imageB = await uploadSeedImage("nearaiims-bhk-1");
  const imageC = await uploadSeedImage("nearaiims-pg-1");
  const imageD = await uploadSeedImage("nearaiims-2bhk-1");

  console.log("Creating properties...");
  const propertyA = await Property.create({
    owner: asha._id,
    propertyType: "Room",
    description: "Cozy single room, walking distance to AIIMS main gate.",
    location: "Tatibandh",
    address: "12 Tatibandh Road, Raipur",
    pricePerNight: 900,
    amenities: ["furnished", "kitchenAccess"],
    ownerContactNumber: "9000000001",
    images: [imageA1, imageA2],
    isAvailable: true,
  });

  const propertyB = await Property.create({
    owner: asha._id,
    propertyType: "1 BHK",
    description: "Quiet 1BHK, ideal for a short family stay.",
    location: "Devendra Nagar",
    address: "45 Devendra Nagar, Raipur",
    pricePerNight: 2000,
    amenities: ["furnished", "ac", "parking"],
    ownerContactNumber: "9000000001",
    images: [imageB],
    isAvailable: true,
  });

  const propertyC = await Property.create({
    owner: karan._id,
    propertyType: "PG",
    description: "Shared PG accommodation with meals included.",
    location: "Shankar Nagar",
    address: "9 Shankar Nagar, Raipur",
    pricePerNight: 500,
    amenities: ["kitchenAccess"],
    ownerContactNumber: "9000000002",
    images: [imageC],
    isAvailable: true,
  });

  // deliberately unavailable, to test that UI state
  await Property.create({
    owner: rahul._id,
    propertyType: "2 BHK",
    description: "Spacious 2BHK, currently off the market.",
    location: "Pandri",
    address: "78 Pandri Main Road, Raipur",
    pricePerNight: 2500,
    amenities: ["furnished", "ac"],
    ownerContactNumber: "9000000004",
    images: [imageD],
    isAvailable: false,
  });

  console.log("Creating bookings...");

  // confirmed - the renter sees the owner's contact number
  await createBooking(propertyA, priya, 10, 14, "confirmed");
  await createBooking(propertyB, rahul, 20, 23, "confirmed");

  // payment_pending - the popup was closed before paying
  await createBooking(propertyC, priya, 30, 35, "payment_pending");

  // payment_failed - the card was declined
  await createBooking(propertyC, rahul, 40, 45, "payment_failed");

  console.log("Seed data created successfully.");
  console.log("All seeded users share the password: password123");
  console.log(
    "  asha@test.com  - owns Room + 1BHK in Tatibandh/Devendra Nagar",
  );
  console.log("  karan@test.com - owns PG in Shankar Nagar");
  console.log(
    "  priya@test.com  - renter only, has 1 confirmed + 1 payment pending booking",
  );
  console.log(
    "  rahul@test.com  - dual role: owns 2BHK, also has 1 confirmed + 1 payment failed booking",
  );
}

seed()
  .catch((error) => {
    console.error("Seeding failed:", error);
  })
  .finally(async () => {
    await mongoose.connection.close();
    process.exit();
  });
