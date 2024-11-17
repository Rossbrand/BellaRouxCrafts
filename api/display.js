const express = require('express');
const multer = require('multer');
const path = require('path');
const router = express.Router();

// Configure Multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './uploads/display'); // Directory for display uploads
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); // Timestamp for uniqueness
    }
});

const upload = multer({ storage: storage });

// Update Display Route
router.post('/', upload.single('displayImage'), (req, res) => {
    const { headline, newsContent } = req.body;
    const db = req.db;
    const imageUrl = req.file ? req.file.filename : null;

    // Update the existing display
    const query = `
        UPDATE display 
        SET image_url = ?, headline = ?, news_content = ?, created_at = NOW()
        WHERE id = 1
    `;

    db.query(query, [imageUrl, headline, newsContent], (err, result) => {
        if (err) {
            console.error('Database error:', err.message);
            return res.status(500).json({ message: 'Failed to update display' });
        }
        res.status(200).json({ message: 'Display updated successfully' });
    });
});

// Fetch the main display data from the database
router.get('/', (req, res) => {
    const db = req.db;

    if (!db) {
        return res.status(500).json({ message: 'Database connection is not available' });
    }

    const query = `SELECT image_url, headline, news_content FROM display WHERE id = 1`;
    db.query(query, (err, results) => {
        if (err) {
            return res.status(500).json({ message: 'Failed to fetch display', error: err.message });
        }
        res.status(200).json(results[0]); // Send the data to the client
    });
});

module.exports = router; // Ensure this line is present and correct
