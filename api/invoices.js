const express = require('express');
const router = express.Router();

// Backend API to handle invoice creation
router.post('/', (req, res) => {
    console.log("POST /api/invoices called");
    const { orderNumber, customer, products, partyDetails, totalAmount, paymentStatus, orderSummary } = req.body;

    try {
        let invoiceType, items;
        if (products && products.length > 0) {
            invoiceType = 'product';
            items = JSON.stringify(products);
        } else if (partyDetails) {
            invoiceType = 'party';
            items = JSON.stringify(partyDetails);
        } else {
            return res.status(400).json({ success: false, message: 'No valid products or party details provided.' });
        }

        const invoiceData = {
            invoice_type: invoiceType,
            customer_name: customer.name || '',
            customer_email: customer.email,
            customer_phone: customer.phone || '',
            address: invoiceType === 'product' 
                ? JSON.stringify(customer.address)
                : JSON.stringify(partyDetails.address),
            order_number: orderNumber,
            total_amount: totalAmount,
            items,
            party_date: invoiceType === 'party' ? partyDetails.partyDate : null,
          
            tracking_number: invoiceType === 'product' ? '' : null,
            payment_status: paymentStatus,
            order_summary: JSON.stringify(orderSummary),
        
        };

        // Use the callback-based version of the query
        req.db.query('INSERT INTO invoices SET ?', invoiceData, (error, results) => {
            if (error) {
                console.error('Error creating invoice:', error);
                return res.status(500).json({ success: false, message: 'Failed to create invoice' });
            }
            res.json({ success: true, message: 'Invoice created', invoiceId: results.insertId });
        });
    } catch (error) {
        console.error('Error during invoice creation process:', error);
        res.status(500).json({ success: false, message: 'Failed to create invoice' });
    }
});

// Fetch product invoices
router.get('/products', (req, res) => {
    req.db.query("SELECT invoice_id, order_number, payment_status FROM invoices WHERE invoice_type = 'product'", (error, rows) => {
        if (error) {
            console.error("Error fetching product invoices:", error);
            return res.status(500).json({ error: "Failed to fetch product invoices" });
        }
        res.json(rows);
    });
});

// Fetch party invoices
router.get('/parties', (req, res) => {
    req.db.query("SELECT invoice_id, order_number, payment_status FROM invoices WHERE invoice_type = 'party'", (error, rows) => {
        if (error) {
            console.error("Error fetching party invoices:", error);
            return res.status(500).json({ error: "Failed to fetch party invoices" });
        }
        res.json(rows);
    });
});


// Fetch a specific party invoice by invoice_id
router.get('/party/:invoice_id', (req, res) => {
    const invoiceId = req.params.invoice_id; // Ensure this matches the route parameter
    console.log(`Received request for party invoice with invoice_id: ${invoiceId}`); // Log received invoice_id

    req.db.query("SELECT * FROM invoices WHERE invoice_id = ? AND invoice_type = 'party'", [invoiceId], (error, rows) => {
        if (error) {
            console.error("Error fetching party invoice:", error);
            return res.status(500).json({ error: "Failed to fetch party invoice" });
        }
        if (rows.length === 0) {
            console.log("No invoice found for the given invoice_id"); // Log if no results found
            return res.status(404).json({ error: "Invoice not found" });
        }
        console.log("Fetched invoice data:", rows[0]); // Log the invoice data returned from DB
        res.json(rows[0]);
    });
});


// Assuming you have a router set up for handling invoices
// Fetch a specific product invoice by invoice_id
router.get('/product/:invoice_id', (req, res) => {
    const invoiceId = req.params.invoice_id;

    req.db.query("SELECT * FROM invoices WHERE invoice_id = ? AND invoice_type = 'product'", [invoiceId], (error, rows) => {
        if (error) {
            console.error("Error fetching product invoice:", error);
            return res.status(500).json({ error: "Failed to fetch product invoice" });
        }
        if (rows.length === 0) {
            return res.status(404).json({ error: "Invoice not found" });
        }
        res.json(rows[0]); // Return the first (and only) result
    });
});

// Fetch party invoices for a specific month and year
router.get('/parties/:month/:year', (req, res) => {
    const month = req.params.month;
    const year = req.params.year;

    const query = `
        SELECT invoice_id, party_date AS partyDate, status 
        FROM invoices 
        WHERE invoice_type = 'party' 
        AND MONTH(party_date) = ? 
        AND YEAR(party_date) = ?
    `;

    req.db.query(query, [month, year], (error, rows) => {
        if (error) {
            console.error("Error fetching party invoices:", error);
            return res.status(500).json({ error: "Failed to fetch party invoices" });
        }
        res.json(rows);
    });
});





module.exports = router;
