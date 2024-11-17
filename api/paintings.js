const express = require('express');
const multer = require('multer');
const path = require('path');
const router = express.Router();

// Configure Multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './uploads/paintings'); // Directory for uploads
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Timestamp to prevent filename conflicts
  }
});

const upload = multer({ storage: storage, limits: { files: 3 } });

// POST route for adding paintings
router.post('/', upload.array('paintingPhotos', 3), (req, res) => {
    const { paintingName, paintingDescription, paintingPrice, paintingType } = req.body;

    if (!paintingName || !paintingDescription || !paintingPrice || !paintingType) {
        return res.status(400).json({ message: 'All fields are required, including painting type.' });
    }

    const uploadedFiles = req.files;
    const db = req.db;

    const imageUrl = uploadedFiles.length > 0 ? uploadedFiles[0].filename : null;

    const query = `INSERT INTO products (name, description, price, image_url, product_type) VALUES (?, ?, ?, ?, ?)`;

    db.query(query, [paintingName, paintingDescription, paintingPrice, imageUrl, paintingType], (err, result) => {
        if (err) {
            return res.status(500).json({ message: 'Failed to add painting' });
        }

        res.status(201).json({
            message: 'Painting added successfully',
            paintingId: result.insertId,
            paintingName,
            paintingDescription,
            paintingPrice,
            images: uploadedFiles.map(file => file.filename)
        });
    });
});

// Fetch all paintings
router.get('/', (req, res) => {
    const db = req.db;

    if (!db) {
        return res.status(500).json({ message: 'Database connection is not available' });
    }

    const query = `
        SELECT id, name, price, product_type, image_url
        FROM products
        WHERE product_type = 'painting'
        ORDER BY name;
    `;

    db.query(query, (err, results) => {
        if (err) {
            return res.status(500).json({ message: 'Failed to fetch products' });
        }
        res.status(200).json(results);
    });
});

// Fetch painting by ID
router.get('/:id', (req, res) => {
    const paintingId = req.params.id;
    const db = req.db;

    const query = `SELECT * FROM products WHERE id = ? AND product_type = 'painting'`;

    db.query(query, [paintingId], (err, results) => {
        if (err) {
            return res.status(500).json({ message: 'Failed to fetch painting' });
        }

        if (results.length === 0) {
            return res.status(404).json({ message: 'Painting not found' });
        }

        const painting = results[0];
        painting.images = [painting.image_url]; // Assuming one image URL
        res.status(200).json(painting);
    });
});

// PUT route to update painting details
router.put('/:id', upload.array('paintingPhotos', 3), (req, res) => {
    const paintingId = req.params.id;
    const { paintingName, paintingDescription, paintingPrice } = req.body;
    let imageUrl = null;

    console.log("Updating painting with ID:", paintingId);  // Add log
    console.log("Form data received:", req.body);  // Log form data

    if (req.files && req.files.length > 0) {
        imageUrl = req.files[0].filename; // Use the new image
        console.log("New image URL:", imageUrl);  // Log image URL
    } else if (req.body.existingImages && req.body.existingImages.length > 0) {
        imageUrl = req.body.existingImages[0]; // Preserve the existing image if no new ones
        console.log("Using existing image URL:", imageUrl);  // Log existing image URL
    } else {
        return res.status(400).json({ message: 'No image provided for the painting' });
    }

    const query = `UPDATE products SET name = ?, description = ?, price = ?, image_url = ? WHERE id = ? AND product_type = 'painting'`;

    req.db.query(query, [paintingName, paintingDescription, paintingPrice, imageUrl, paintingId], (err, result) => {
        if (err) {
            console.error('Database error:', err.message);
            return res.status(500).json({ message: 'Failed to update painting', error: err.message });
        }

        res.status(200).json({ message: 'Painting updated successfully' });
    });
});

// DELETE route for deleting a painting
router.delete('/:id', (req, res) => {
    const paintingId = req.params.id;
    const db = req.db;

    const query = `DELETE FROM products WHERE id = ? AND product_type = 'painting'`;

    db.query(query, [paintingId], (err, result) => {
        if (err) {
            console.error('Database error:', err.message);
            // Return proper JSON in case of an error
            return res.status(500).json({ message: 'Failed to delete painting', error: err.message });
        }

        if (result.affectedRows === 0) {
            // If no rows were affected, the painting was not found
            return res.status(404).json({ message: 'Painting not found' });
        }

        res.status(200).json({ message: 'Painting deleted successfully' });
    });
});


module.exports = router;
