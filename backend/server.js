const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Backend is running.' });
});

app.listen(3000, () => console.log('🚀 Server running on http://localhost:3000'));
