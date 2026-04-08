const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
  ownerID: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  category: { type: String, required: true },
  condition: { type: String, enum: ['new', 'good', 'fair', 'poor'], required: true },
  type: { type: String, enum: ['Rent', 'Trade', 'Share'], required: true },
  pricePerDay: { type: Number }, // optional, for Rent
  geoPosition: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], required: true } // [longitude, latitude]
  },
  currentState: { 
    type: String, 
    enum: ['Available', 'PendingTrade', 'Rented', 'Traded', 'Unavailable'], 
    default: 'Available' 
  },
  images: [String],
  createdAt: { type: Date, default: Date.now }
});

itemSchema.index({ geoPosition: '2dsphere' });

module.exports = mongoose.model('Item', itemSchema);
