require('dotenv').config();
const bcrypt = require('bcryptjs');
const connectDB = require('./config/db');
const mongoose = require('mongoose');
const cloudinary = require('./config/cloudinary');
const User = require('./models/User');
const Property = require('./models/Property');
const Booking = require('./models/Booking');

const SALT_ROUNDS = 10; 

// picsum.photos generates a real random photo
async function uploadSeedImage(seedName) {
  const sourceUrl = `https://picsum.photos/seed/${seedName}/800/600`;
  const result = await cloudinary.uploader.upload(sourceUrl, {
    folder: 'nearaiims',
  });
  return result.secure_url;
}

async function seed() {
  await connectDB();

  console.log('Clearing existing data...');
  await Booking.deleteMany({});
  await Property.deleteMany({});
  await User.deleteMany({});

  const passwordHash = await bcrypt.hash('password123', SALT_ROUNDS);

  console.log('Creating users...');
  const asha = await User.create({
    name: 'Asha Owner',
    email: 'asha@test.com',
    passwordHash,
    phone: '9000000001',
  });

  const karan = await User.create({
    name: 'Karan Owner',
    email: 'karan@test.com',
    passwordHash,
    phone: '9000000002',
  });

  const priya = await User.create({
    name: 'Priya Renter',
    email: 'priya@test.com',
    passwordHash,
    phone: '9000000003',
  });

  const rahul = await User.create({
    name: 'Rahul Dual',
    email: 'rahul@test.com',
    passwordHash,
    phone: '9000000004',
  });

  console.log('Uploading seed images to Cloudinary...');
  const imageA1 = await uploadSeedImage('nearaiims-room-1');
  const imageA2 = await uploadSeedImage('nearaiims-room-2');
  const imageB = await uploadSeedImage('nearaiims-bhk-1');
  const imageC = await uploadSeedImage('nearaiims-pg-1');
  const imageD = await uploadSeedImage('nearaiims-2bhk-1');

  console.log('Creating properties...');
  const propertyA = await Property.create({
    owner: asha._id,
    propertyType: 'Room',
    description: 'Cozy single room, walking distance to AIIMS main gate.',
    location: 'Tatibandh',
    address: '12 Tatibandh Road, Raipur',
    priceType: 'weekly',
    price: 8000,
    amenities: ['furnished', 'kitchenAccess'],
    ownerContactNumber: '9000000001',
    images: [imageA1, imageA2],
    isAvailable: true,
  });

  const propertyB = await Property.create({
    owner: asha._id,
    propertyType: '1 BHK',
    description: 'Quiet 1BHK, ideal for a short family stay.',
    location: 'Devendra Nagar',
    address: '45 Devendra Nagar, Raipur',
    priceType: 'weekly',
    price: 12000,
    amenities: ['furnished', 'ac', 'parking'],
    ownerContactNumber: '9000000001',
    images: [imageB],
    isAvailable: true,
  });

  const propertyC = await Property.create({
    owner: karan._id,
    propertyType: 'PG',
    description: 'Shared PG accommodation with meals included.',
    location: 'Shankar Nagar',
    address: '9 Shankar Nagar, Raipur',
    priceType: 'monthly',
    price: 6000,
    amenities: ['kitchenAccess'],
    ownerContactNumber: '9000000002',
    images: [imageC],
    isAvailable: true,
  });

  const propertyD = await Property.create({
    owner: rahul._id,
    propertyType: '2 BHK',
    description: 'Spacious 2BHK, currently off the market.',
    location: 'Pandri',
    address: '78 Pandri Main Road, Raipur',
    priceType: 'weekly',
    price: 15000,
    amenities: ['furnished', 'ac'],
    ownerContactNumber: '9000000004',
    images: [imageD],
    isAvailable: false, // deliberately unavailable, to test that UI state
  });

  console.log('Creating bookings...');

  // accepted - lets you test the "reveal owner's contact number" flow
  await Booking.create({
    property: propertyA._id,
    renter: priya._id,
    owner: asha._id,
    startDate: new Date('2026-08-01'),
    endDate: new Date('2026-08-10'),
    message: 'Family visiting for treatment, need it furnished.',
    status: 'accepted',
  });

  // pending - waiting on Karan to accept/decline
  await Booking.create({
    property: propertyC._id,
    renter: priya._id,
    owner: karan._id,
    startDate: new Date('2026-09-01'),
    endDate: new Date('2026-09-15'),
    message: 'Would like a bed near the window if possible.',
    status: 'pending',
  });

  // declined - confirms a declined renter CAN still submit a fresh
  // request on the same property afterward 
  await Booking.create({
    property: propertyB._id,
    renter: rahul._id,
    owner: asha._id,
    startDate: new Date('2026-08-05'),
    endDate: new Date('2026-08-12'),
    message: 'Is early check-in possible?',
    status: 'declined',
  });

  // pending - a DIFFERENT renter (Rahul) requesting the same property (C)
  // Priya already has a pending request on - allowed, since the guard only
  // blocks the SAME renter twice, not two different renters competing
  await Booking.create({
    property: propertyC._id,
    renter: rahul._id,
    owner: karan._id,
    startDate: new Date('2026-09-05'),
    endDate: new Date('2026-09-20'),
    message: 'Traveling with one more family member, is that okay?',
    status: 'pending',
  });

  console.log('Seed data created successfully.');
  console.log('All seeded users share the password: password123');
  console.log('  asha@test.com  - owns Room + 1BHK in Tatibandh/Devendra Nagar');
  console.log('  karan@test.com - owns PG in Shankar Nagar');
  console.log('  priya@test.com - renter only, has 1 accepted + 1 pending booking');
  console.log('  rahul@test.com - dual role: owns 2BHK, also has 1 declined + 1 pending booking');
}

seed()
  .catch((error) => {
    console.error('Seeding failed:', error);
  })
  .finally(async () => {
    await mongoose.connection.close();
    process.exit();
  });