// api/featured.js
const express = require('express');
const router = express.Router();

// Get current featured products
router.get('/products', (req, res) => {
    const db = req.db;

    if (!db) {
        console.error('Database connection is not available.');
        return res.status(500).json({ message: 'Database connection is not available' });
    }

    const query = `
        SELECT id, position, image_url, item_id, item_type,  name
        FROM featured_items
        WHERE item_type = 'product'
        ORDER BY position;
    `;

    console.log('Executing query for products:', query);
    db.query(query, (err, results) => {
        if (err) {
            console.error('Database error:', err.message);
            return res.status(500).json({ message: 'Failed to fetch featured products', error: err.message });
        }
        res.status(200).json(results);
    });
});


// Get current featured paintings
router.get('/paintings', (req, res) => {
    const db = req.db;

    if (!db) {
        console.error('Database connection is not available.');
        return res.status(500).json({ message: 'Database connection is not available' });
    }

    const query = `
        SELECT id, position, item_id, image_url, item_type, name
        FROM featured_items
        WHERE item_type = 'painting'
        ORDER BY position;
    `;

    console.log('Executing query for paintings:', query);
    db.query(query, (err, results) => {
        if (err) {
            console.error('Database error:', err.message);
            return res.status(500).json({ message: 'Failed to fetch featured paintings', error: err.message });
        }
        res.status(200).json(results);
    });
});


// Update a featured item
router.put('/update', (req, res) => {
    const { id, item_id } = req.body;
    const db = req.db;

    console.log('Received update request:', { id, item_id });

    if (!id || !item_id) {
        console.error('Missing id or item_id:', { id, item_id });
        return res.status(400).json({ message: 'id and item_id are required.' });
    }

    // Fetch the new image_url and name from the products table
    const selectQuery = `SELECT image_url, name FROM products WHERE id = ?`;

    db.query(selectQuery, [item_id], (err, results) => {
        if (err) {
            console.error('Database error while fetching product details:', err.message);
            return res.status(500).json({ message: 'Failed to fetch product details', error: err.message });
        }

        if (results.length === 0) {
            console.error('Product not found for item_id:', item_id);
            return res.status(404).json({ message: 'Product not found' });
        }

        const { image_url, name } = results[0];

        // Update the featured_items table with the new image_url and name using the 'id' from the featured_items table
        const updateQuery = `
        UPDATE featured_items
        SET item_id = ?, image_url = ?, name = ?
        WHERE id = ?
    `;
    
    db.query(updateQuery, [item_id, image_url, name, id], (err, result) => {
        if (err) {
            console.error('Database error while updating featured item:', err.message);
            return res.status(500).json({ message: 'Failed to update featured item', error: err.message });
        }
    
        console.log('Update successful:', { id, item_id, image_url, name });
        res.status(200).json({ message: 'Featured item updated successfully' });
    });
    
    });
});

// Fetch and display the featured paintings
function fetchFeaturedPaintings() {
    fetch('/api/featured/paintings')
        .then(response => response.json())
        .then(data => {
            const container = document.querySelector('#featuredPaintings .horizontal-scroll');
            container.innerHTML = '';  // Clear previous content
            data.forEach(painting => {
                const paintingDiv = document.createElement('div');
                paintingDiv.classList.add('painting-item');
                paintingDiv.innerHTML = `
                    <a href="paintingDetail.html?id=${painting.id}">
                        <img src="/uploads/paintings/${painting.image_url}" alt="${painting.name}">
                        <p>${painting.name}</p>
                    </a>
                `;
                container.appendChild(paintingDiv);
            });
        })
        .catch(error => console.error('Error fetching featured paintings:', error));
}

// Get the current display data
router.get('/', (req, res) => {
    const db = req.db;

    if (!db) {
        return res.status(500).json({ message: 'Database connection is not available' });
    }

    const query = `
        SELECT image_url, headline, news_content 
        FROM display 
        WHERE id = 1
    `;

    db.query(query, (err, results) => {
        if (err) {
            return res.status(500).json({ message: 'Failed to fetch display data', error: err.message });
        }
        res.status(200).json(results[0]);  // Return the display data
    });
});


module.exports = router;
