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
      enum: ['weekly', 'monthly'],
      default: 'monthly',
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    amenities: {
      furnished: { type: Boolean, default: false },
      ac: { type: Boolean, default: false },
      kitchenAccess: { type: Boolean, default: false },
      parking: { type: Boolean, default: false },
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