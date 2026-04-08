const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  itemID: { type: mongoose.Schema.Types.ObjectId, ref: 'Item', required: true },
  requesterID: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  ownerID: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['Rent', 'Trade'], required: true },
  status: { 
    type: String, 
    enum: ['Pending', 'Accepted', 'Rejected', 'Completed'], 
    default: 'Pending' 
  },
  startDate: { type: Date },
  endDate: { type: Date },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Transaction', transactionSchema);
