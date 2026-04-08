const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Database Connection
console.log('Connecting to:', process.env.MONGO_URI ? 'URI found' : 'URI undefined');
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Routes (to be implemented)
app.use('/api/auth', require('./routes/auth'));
app.use('/api/items', require('./routes/items'));
app.use('/api/transactions', require('./routes/transactions'));
app.use('/api/users', require('./routes/users'));

app.get('/', (req, res) => {
  res.send('TradeHub API is running...');
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
