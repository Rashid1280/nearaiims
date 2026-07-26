const mongoose = require('mongoose');

const propertySchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    propertyType: {
      type: String,
      enum :["Room", "1 RK", "1 BHK", "2 BHK", "3 BHK", "Independent House", "PG"],
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    location: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    distanceFromAiimsKm: {
      type: Number,
    },
    priceType: {
      type: String,
      enum: ['daily', 'weekly', 'monthly'],
      default: 'weekly',
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    amenities: {
     type: [String],
     enum: ['furnished', 'ac', 'kitchenAccess', 'parking'],
    },
    ownerContactNumber: {
      type: String,
      required: true,
    },
    images: {
      type: [String],
      required: true,
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

const Property = mongoose.model('Property', propertySchema);

module.exports = Property;


