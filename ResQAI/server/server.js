const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const connectDB = require('./config/db');
const { errorHandler } = require('./middleware/errorMiddleware');

// Route imports
const authRoutes = require('./routes/authRoutes');
const aiRoutes = require('./routes/aiRoutes');
const reportRoutes = require('./routes/reportRoutes');
const hospitalRoutes = require('./routes/hospitalRoutes');
const historyRoutes = require('./routes/historyRoutes');

// Connect to Database
connectDB();

const app = express();

// Security HTTP headers - disable cross-origin block for serving upload images
app.use(helmet({
  crossOriginResourcePolicy: false,
  crossOriginEmbedderPolicy: false
}));

// Enable CORS
app.use(cors());

// Compress all responses
app.use(compression());

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Create uploads folders if they don't exist
const uploadsPath = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsPath)) {
  fs.mkdirSync(uploadsPath, { recursive: true });
}
const reportsPath = path.join(__dirname, 'uploads/reports');
if (!fs.existsSync(reportsPath)) {
  fs.mkdirSync(reportsPath, { recursive: true });
}

// Serve uploaded assets statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Rate Limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, 
  message: {
    message: 'Too many requests from this IP, please try again after 15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api', apiLimiter);

// Mount API routes
app.use('/api/auth', authRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/hospitals', hospitalRoutes);
app.use('/api/history', historyRoutes);

// Base Route
app.get('/', (req, res) => {
  res.json({ message: 'ResQAI Backend API is running' });
});

// Centralized error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
