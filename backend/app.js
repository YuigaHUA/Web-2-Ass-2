const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

// Import routes
const eventRoutes = require('./routes/events');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware configuration
app.use(cors({
    origin: ['http://localhost:3000', 'http://127.0.0.1:3000', 'http://localhost:5500'],
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static file serving - frontend files
app.use(express.static(path.join(__dirname, '../frontend')));

// API routes
app.use('/api/events', eventRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        message: 'Charity Events API is running',
        timestamp: new Date().toISOString()
    });
});

// Home page route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// Search page route
app.get('/search', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/search.html'));
});

// Details page route
app.get('/event', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/event-details.html'));
});

// 404 handling
app.use('*', (req, res) => {
    if (req.originalUrl.startsWith('/api/')) {
        res.status(404).json({ 
            error: 'API endpoint not found',
            path: req.originalUrl 
        });
    } else {
        res.status(404).sendFile(path.join(__dirname, '../frontend/index.html'));
    }
});

// Global error handling middleware
app.use((err, req, res, next) => {
    console.error('🚨 Server Error:', err.stack);
    res.status(500).json({ 
        error: 'Internal Server Error',
        message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong!'
    });
});

// Start server
app.listen(PORT, () => {
    console.log('🎉 Charity Events Server started successfully!');
    console.log(`📍 Local access: http://localhost:${PORT}`);
    console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
    console.log(`📊 API base URL: http://localhost:${PORT}/api/events`);
    console.log('⏰', new Date().toLocaleString());
});

module.exports = app;