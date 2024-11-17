const express = require('express');
const path = require('path');
const cors = require('cors');
const dotenv = require('dotenv');
const mysql = require('mysql2');
const productsRoutes = require('./api/products');
const displayRoutes = require('./api/display');
const featuredRoutes = require('./api/featured');
const paintingsRoutes = require('./api/paintings');
const paymentsRoutes = require('./api/payments');
const shipstationRoutes = require('./api/shipstation');
const invoiceRoutes = require('./api/invoices');
const blockedRouter = require('./api/blocked_dates');
const sendEmailRoute = require('./api/send-email');

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from the current BRWebsiteFiles directory
app.use(express.static(path.join(__dirname)));

// MySQL database connection pool
const db = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
    connectionLimit: 10 // Max number of connections in the pool
});

db.getConnection((err) => {
    if (err) {
        console.error('Error connecting to MySQL:', err.message);
        process.exit(1);
    }
    console.log('Connected to MySQL database');
});

// Make the database accessible in all routes
app.use((req, res, next) => {
    req.db = db;
    next();
});

// Serve the main index.html from the top-level BRWebsiteFiles directory
app.get('/', (req, res) => {
    console.log('Serving index.html');
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.use('/scripts', express.static(path.join(__dirname, 'Scripts')));
app.use('/styles', express.static(path.join(__dirname, 'Styles')));

// Use the API routes
app.use('/api/products', productsRoutes);
app.use('/api/display', displayRoutes);
app.use('/api/featured', featuredRoutes);
app.use('/api/paintings', paintingsRoutes);
app.use('/api/payments', paymentsRoutes);
app.use('/api/shipstation', shipstationRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/blocked', blockedRouter);
app.use('/api/send-email', sendEmailRoute);
console.log("Initialized /api/send-email route");

// Serve additional static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/labels', express.static(path.join(__dirname, 'labels')));

// Start the backend on port 3000
const server = app.listen(10000, '127.0.0.1', () => {
    console.log('Backend server running on port 3000');
});

// Set timeouts for idle connections
server.keepAliveTimeout = 5000;
server.headersTimeout = 6000; // Slightly longer than keepAliveTimeout

// Graceful shutdown on SIGINT
process.on('SIGINT', () => {
    console.log("Shutting down server gracefully...");
    
    // End MySQL pool connections
    db.end(err => {
        if (err) console.error("Error closing database connection:", err);
        else console.log("Database connection closed.");

        // Close the server
        server.close(() => {
            console.log("Server closed.");
            process.exit(0);
        });
    });
});
