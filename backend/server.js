require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const connectDB = require('./config/db');

// Initialize Express app
const app = express();

// Connect to MongoDB
connectDB();

// Middleware
// Temporarily disable Helmet to diagnose CORS issues
// app.use(helmet()); // Security headers
const corsOptions = {
    origin: [
        'http://localhost:3000',
        'http://localhost:3001',
        'http://localhost:3002',
        'http://127.0.0.1:3000',
        'http://127.0.0.1:3001',
        'http://127.0.0.1:3002'
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    optionsSuccessStatus: 200
};
app.use(cors(corsOptions));
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true }));

// Basic health check route
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        message: 'Event Network API is running',
        timestamp: new Date().toISOString()
    });
});

// Mount routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/forms', require('./routes/forms'));

// Response routes are nested under forms
// e.g., POST /api/forms/:id/submit
const responsesRouter = require('./routes/responses');
app.use('/api/forms', responsesRouter);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(err.statusCode || 500).json({
        success: false,
        error: err.message || 'Server Error'
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: 'Route not found'
    });
});

// Start server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
