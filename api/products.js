const express = require('express');
const multer = require('multer');
const path = require('path');
const router = express.Router();

// Configure Multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './uploads/products'); // Directory for uploads
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Timestamp to prevent filename conflicts
  }
});

const upload = multer({ storage: storage, limits: { files: 3 } });

// POST route for adding products
router.post('/', upload.array('productPhotos', 3), (req, res) => {
    const { productName, productDescription, productPrice, productType, length, width, height, weight } = req.body;

    if (!productName || !productDescription || !productPrice || !productType) {
        return res.status(400).json({ message: 'All fields are required, including product type.' });
    }

    const uploadedFiles = req.files;
    const db = req.db;

    const imageUrl = uploadedFiles.length > 0 ? uploadedFiles[0].filename : null;

    // Insert product with dimensions
    const query = `INSERT INTO products (name, description, price, image_url, product_type, length, width, height, weight) 
                   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    db.query(query, [productName, productDescription, productPrice, imageUrl, productType, length, width, height, weight], (err, result) => {
        if (err) {
            console.error('Database error:', err.message);
            return res.status(500).json({ message: 'Failed to add product' });
        }

        res.status(201).json({
            message: 'Product added successfully',
            productId: result.insertId,
            productName,
            productDescription,
            productPrice,
            images: uploadedFiles.map(file => file.filename)
        });
    });
});




router.get('/', (req, res) => {
    const db = req.db;

    if (!db) {
        console.error('Database connection is not available.');
        return res.status(500).json({ message: 'Database connection is not available' });
    }

    // Fetch all products, optionally filter by item_type if needed
    const query = `
        SELECT id, name, price, product_type, image_url
        FROM products
        WHERE product_type = 'product' 
        ORDER BY name;
    `;

    console.log('Executing query:', query);
    db.query(query, (err, results) => {
        if (err) {
            console.error('Database error:', err.message);
            return res.status(500).json({ message: 'Failed to fetch products', error: err.message });
        }
        res.status(200).json(results);
    });
});


// DELETE route for deleting a product
router.delete('/:id', (req, res) => {
    const productId = req.params.id;
    const db = req.db;

    const query = `DELETE FROM products WHERE id = ?`;

    db.query(query, [productId], (err, result) => {
        if (err) {
            console.error('Database error:', err.message);
            return res.status(500).json({ message: 'Failed to delete product' });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Product not found' });
        }

        res.status(200).json({ message: 'Product deleted successfully' });
    });
});

// GET route to fetch a single product by ID
router.get('/:id', (req, res) => {
    const productId = req.params.id;
    const db = req.db;

    const query = `SELECT id, name, description, price, image_url, length, width, height, weight FROM products WHERE id = ?`;

    db.query(query, [productId], (err, results) => {
        if (err) {
            console.error('Database error:', err.message);
            return res.status(500).json({ message: 'Failed to fetch product', error: err.message });
        }

        if (results.length === 0) {
            return res.status(404).json({ message: 'Product not found' });
        }

        res.status(200).json({
            id: results[0].id,
            name: results[0].name,
            description: results[0].description,
            price: results[0].price,
            image_url: results[0].image_url,
            length: results[0].length,  // Include these fields in the response
            width: results[0].width,
            height: results[0].height,
            weight: results[0].weight
        });
    });
});

// PUT route for updating a product

router.put('/:id', upload.array('productPhotos', 3), (req, res) => {
    const productId = req.params.id;
    const { productName, productDescription, productPrice, existingImages } = req.body;
    let imageUrl = null;

    // If new images are uploaded, use them; otherwise, keep existing images
    if (req.files && req.files.length > 0) {
        imageUrl = req.files[0].filename; // Use the new image
    } else if (existingImages && existingImages.length > 0) {
        imageUrl = existingImages[0]; // Preserve the existing image if no new ones
    }

    const query = `
        UPDATE products 
        SET name = ?, description = ?, price = ?, image_url = ?
        WHERE id = ?
    `;

    req.db.query(query, [productName, productDescription, productPrice, imageUrl, productId], (err, result) => {
        if (err) {
            console.error('Database error:', err.message);
            return res.status(500).json({ message: 'Failed to update product' });
        }

        res.status(200).json({ message: 'Product updated successfully' });
    });
});


router.get('/products/:id', (req, res) => {
    const productId = req.params.id;
    const db = req.db;

    const query = `SELECT * FROM products WHERE id = ? AND product_type = 'product'`;
    db.query(query, [productId], (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }
        if (results.length === 0) {
            return res.status(404).json({ error: 'Product not found' });
        }
        res.status(200).json(results[0]);
    });
});




router.post('/reserve/:id', (req, res) => {
    const productId = req.params.id;
    const db = req.db;

    const query = `UPDATE products SET status = 'reserved' WHERE id = ? AND status = 'available'`;
    db.query(query, [productId], (error, results) => {
      if (error) {
        console.error('Database error:', error);
        return res.status(500).json({ success: false, message: 'Error reserving product.' });
      }
  
      if (results.affectedRows > 0) {
        res.json({ success: true });
      } else {
        res.json({ success: false, message: 'Product is already reserved.' });
      }
    });
});
  
  module.exports = router;