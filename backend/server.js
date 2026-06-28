const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/db');

dotenv.config();

// Connect to Database
connectDB();

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
  })
);

// Route mounting
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/muscle-groups', require('./routes/muscleGroupRoutes'));
app.use('/api/exercises', require('./routes/exerciseRoutes'));
app.use('/api/sessions', require('./routes/sessionRoutes'));
app.use('/api/stats', require('./routes/statsRoutes'));

app.get('/', (req, res) => {
  res.send('MeetFit API Service Running');
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err.stack);
  res.status(500).json({ message: 'Internal Server Error' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 MeetFit Backend running on port ${PORT}`);
});
