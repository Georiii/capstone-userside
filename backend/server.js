const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose.connect('mongodb://127.0.0.1:27017/glamora', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ MongoDB error:', err));

// Example schema
const User = mongoose.model('User', {
  email: String,
  password: String,
});

// POST /login
app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email, password });
  if (user) return res.json({ success: true, user });
  return res.status(401).json({ success: false, message: 'Invalid credentials' });
});

app.listen(3000, () => console.log('🚀 Server running on http://localhost:3000'));
