const express = require('express');
const { Client, Environment } = require('square');
const dotenv = require('dotenv');

dotenv.config();

const router = express.Router();

// Initialize Square client
const client = new Client({
    environment: process.env.NODE_ENV === 'production' ? Environment.Production : Environment.Sandbox,
    accessToken: process.env.SQUARE_ACCESS_TOKEN,
});

// Payments API instance
const paymentsApi = client.paymentsApi;

// Helper function to convert BigInt to regular numbers/strings
function handleBigIntConversion(data) {
    if (typeof data === 'object' && data !== null) {
        for (const key in data) {
            if (typeof data[key] === 'bigint') {
                data[key] = data[key].toString();  // Convert BigInt to string
            } else if (typeof data[key] === 'object') {
                handleBigIntConversion(data[key]);  // Recursively handle nested objects
            }
        }
    }
    return data;
}

// POST /api/payments - Endpoint to process payments
router.post('/', async (req, res) => {
    const { sourceId, amount } = req.body;

    // Validate input
    if (!sourceId || !amount) {
        return res.status(400).json({
            success: false,
            error: 'Missing sourceId or amount',
        });
    }

    try {
        // Process the payment using Square API
        const paymentResponse = await paymentsApi.createPayment({
            sourceId,
            idempotencyKey: new Date().toISOString(),
            amountMoney: {
                amount: Number(amount),  // Convert to regular number if needed
                currency: 'USD',
            },
            locationId: process.env.SQUARE_LOCATION_ID,
        });

        // Safely convert BigInt fields to strings or numbers
        const paymentResult = handleBigIntConversion(paymentResponse.result.payment);

        // Return the result
        res.json({
            success: true,
            payment: paymentResult,
        });
    } catch (error) {
        console.error('Payment Error:', error);
        res.status(500).json({
            success: false,
            error: error.message,
        });
    }
});

module.exports = router;
