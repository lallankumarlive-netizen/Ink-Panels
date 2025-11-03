const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const http = require('http');
const WebSocket = require('ws');

// Error handling function
const errorHandler = (err, req, res, next) => {
    console.error('Error:', err.stack);
    res.status(err.status || 500).json({
        error: err.message || 'Something went wrong!',
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
};

// Import routes
const authRoutes = require('./routes/auth');
const mangaRoutes = require('./routes/manga');
const orderRoutes = require('./routes/orders');
const userRoutes = require('./routes/users');
const pageRoutes = require('./routes/pages');

// Load environment variables
dotenv.config();

// Create Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'public')));

// Ensure directory exists
app.use((req, res, next) => {
    if (req.method === 'GET' && req.accepts('html')) {
        res.sendFile(path.join(__dirname, '..', 'public', 'index.html'), err => {
            if (err) {
                console.log('Error serving file:', err);
                next();
            }
        });
    } else {
        next();
    }
});

// Connect to MongoDB with retry logic
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ink_panels_db', {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 5000,
            retryWrites: true
        });
        console.log('Connected to MongoDB');
    } catch (err) {
        console.error('MongoDB connection error:', err);
        // Wait for 5 seconds before retrying
        await new Promise(resolve => setTimeout(resolve, 5000));
        return connectDB();
    }
};

// Initialize MongoDB connection
connectDB();

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/manga', mangaRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/users', userRoutes);

// Page Routes
app.use('/', pageRoutes);

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
    app.use(express.static('public'));
    app.get('*', (req, res) => {
        res.sendFile(path.resolve(__dirname, '../public', 'index.html'));
    });
}

// Error handling middleware
app.use(errorHandler);

// Handle 404s
app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

// Create HTTP server
const server = http.createServer(app);

// Create WebSocket server
const wss = new WebSocket.Server({ server });

// WebSocket connection handling
wss.on('connection', function connection(ws) {
    console.log('New WebSocket connection established');

    ws.on('message', function incoming(message) {
        console.log('received: %s', message);
    });

    ws.send('Connected to WebSocket server');
});

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`WebSocket server is running on ws://localhost:${PORT}`);
});