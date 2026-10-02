// One-off migration: backfill pricePerNight on Property documents that
// still only have the retired price/priceType fields - for whichever
// database already had real data before the pricePerNight schema change.
//
// SAFE BY DEFAULT: dry run only, just reports what it WOULD change.
// Nothing is written unless you pass --apply.
//
// Usage:
//   node migratePricing.js "<mongo-uri>"            (dry run - read only)
//   node migratePricing.js "<mongo-uri>" --apply     (actually writes)
//
// The URI is a required argument, deliberately NOT read from .env -
// this should never silently run against whatever MONGO_URI happens to
// already be configured. Pass the exact database you mean to touch.

const mongoose = require('mongoose');

const uri = process.argv[2];
const apply = process.argv.includes('--apply');

if (!uri) {
  console.error('Usage: node migratePricing.js "<mongo-uri>" [--apply]');
  process.exit(1);
}

function nightlyRateFrom(price, priceType) {
  if (priceType === 'weekly') return Math.round(price / 7);
  if (priceType === 'monthly') return Math.round(price / 30);
  return price; // 'daily', or already per-night
}

async function run() {
  await mongoose.connect(uri);
  console.log(`Connected. Mode: ${apply ? 'APPLY (will write)' : 'DRY RUN (no writes)'}`);

  // raw driver access on purpose, not the Property model - the current
  // Mongoose schema no longer declares price/priceType, so a normal
  // Property.find() would hide them even though Mongo still has them.
  // Going through the native collection bypasses that and sees the
  // documents exactly as they really are in the database.
  const collection = mongoose.connection.collection('properties');

  const stale = await collection.find({ pricePerNight: { $exists: false } }).toArray();

  if (stale.length === 0) {
    console.log('Nothing to migrate - every document already has pricePerNight.');
  } else {
    console.log(`Found ${stale.length} document(s) still on the old fields:\n`);

    for (const doc of stale) {
      const nightly = nightlyRateFrom(doc.price, doc.priceType);
      console.log(
        `  ${doc._id}  "${doc.propertyType} in ${doc.location}"  ` +
        `${doc.price} (${doc.priceType}) -> pricePerNight: ${nightly}`
      );

      if (apply) {
        await collection.updateOne(
          { _id: doc._id },
          { $set: { pricePerNight: nightly }, $unset: { price: '', priceType: '' } }
        );
      }
    }

    console.log(
      apply
        ? `\nDone - ${stale.length} document(s) updated.`
        : `\nDry run only, nothing written. Review the numbers above, then re-run with --apply.`
    );
  }

  await mongoose.connection.close();
}

run().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});