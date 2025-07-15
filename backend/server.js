const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const nodemailer = require('nodemailer');

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

// POST /forgot-password
app.post('/forgot-password', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ success: false, message: 'Email is required' });

  const user = await User.findOne({ email });
  if (!user) {
    // For security, don't reveal if the email exists
    return res.json({ success: true, message: 'If this email exists, a reset link will be sent.' });
  }

  // Generate a fake reset token (in production, use a secure random token and save it to the DB)
  const resetToken = Math.random().toString(36).substr(2);
  // In production, save the token and its expiry to the user record

  // Simulate sending email
  const resetLink = `http://localhost:3000/reset-password?token=${resetToken}&email=${encodeURIComponent(email)}`;

  // Set up nodemailer (for dev, use ethereal)
  let transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    auth: {
      user: 'lincoln.senger@ethereal.email', // replace with your Ethereal user
      pass: 'xCbc9MJPbEDA1r4K2n', // replace with your Ethereal password
    },
  });
  
  let mailOptions = {
    from: 'no-reply@glamora.com',
    to: email,
    subject: 'Password Reset',
    text: `Click the following link to reset your password: ${resetLink}`,
  };

  // For now, just log the reset link instead of sending
  console.log(`Password reset link for ${email}: ${resetLink}`);
  // Uncomment below to actually send email
   await transporter.sendMail(mailOptions);

  return res.json({ success: true, message: 'If this email exists, a reset link will be sent.' });
});

app.listen(3000, () => console.log('🚀 Server running on http://localhost:3000'));
