const mongoose = require('mongoose');

const WishlistRequestSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  category: { type: String, enum: ['Electronics', 'Books', 'Furniture', 'Clothing', 'Sports', 'Other'], default: 'Other' },
  budget: { type: Number, default: 0 },
  urgency: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
  status: { type: String, enum: ['open', 'fulfilled', 'closed'], default: 'open' },
  fulfilledBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  fulfilledListing: { type: mongoose.Schema.Types.ObjectId, ref: 'Listing', default: null },
  offers: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    message: String,
    listingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Listing', default: null },
    createdAt: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

module.exports = mongoose.model('WishlistRequest', WishlistRequestSchema);
