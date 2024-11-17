const express = require('express');
const axios = require('axios');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');
const { clearScreenDown } = require('readline');

dotenv.config();

const router = express.Router();

// Helper function to create a shipping label
async function createShippingLabel(labelData) {
    const apiKey = process.env.SHIPSTATION_API_KEY;
    const apiSecret = process.env.SHIPSTATION_API_SECRET;

    const auth = Buffer.from(`${apiKey}:${apiSecret}`).toString('base64');

    try {
        const response = await axios({
            method: 'POST',
            url: 'https://ssapi.shipstation.com/shipments/createlabel',
            headers: {
                'Authorization': `Basic ${auth}`,
                'Content-Type': 'application/json',
            },
            data: labelData,
        });

        return response.data;
    } catch (error) {
        console.error('ShipStation API Error:', error.response ? error.response.data : error.message);
        throw new Error(error.response ? JSON.stringify(error.response.data) : error.message);
    }
}

// Endpoint to generate and download label
// Endpoint to generate and download label
router.post('/create-label', async (req, res) => {
    const {
        carrierCode,
        serviceCode,
        packageCode,
        confirmation,
        shipDate,
        weight,         // Weight passed from request
        dimensions,     // Dimensions passed from request
        shipFrom,       // Shipping from address passed from request
        shipTo,
        testLabel          // Shipping to address passed from request
    } = req.body;

    const labelData = {
        carrierCode,  // Use dynamic carrierCode from the request
        serviceCode,  // Use dynamic serviceCode from the request
        packageCode: packageCode || 'package',  // Default to 'package' if not provided
        confirmation: confirmation || 'delivery',  // Default to 'delivery' if not provided
        shipDate: shipDate || new Date().toISOString().split('T')[0],  // Default to today's date
        weight,  // Use dynamic weight from the request
        dimensions,  // Use dynamic dimensions from the request
        shipFrom,  // Use dynamic 'shipFrom' address from the request
        shipTo,    // Use dynamic 'shipTo' address from the request
        testLabel: testLabel || true 
    };

    try {
        const labelResponse = await createShippingLabel(labelData);

        const pdfBase64 = labelResponse.labelData;

        // Ensure the labels directory exists
        const labelsDir = path.join(__dirname, '..', 'labels');
        if (!fs.existsSync(labelsDir)) {
            fs.mkdirSync(labelsDir, { recursive: true });
        }

        // Save PDF as file
        const pdfPath = path.join(labelsDir, 'shipping_label.pdf');
        const pdfBuffer = Buffer.from(pdfBase64, 'base64');
        fs.writeFileSync(pdfPath, pdfBuffer);

        // Respond with success and the file path
        res.json({
            success: true,
            message: 'Shipping label generated successfully!',
            labelPath: pdfPath,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message,
        });
    }
});


// Endpoint to list all shipping providers connected to this account
router.get('/carriers', async (req, res) => {
    const apiKey = process.env.SHIPSTATION_API_KEY;
    const apiSecret = process.env.SHIPSTATION_API_SECRET;

    const auth = Buffer.from(`${apiKey}:${apiSecret}`).toString('base64');

    try {
        const response = await axios({
            method: 'GET',
            url: 'https://ssapi.shipstation.com/carriers',
            headers: {
                'Authorization': `Basic ${auth}`,
                'Content-Type': 'application/json',
            },
        });

        res.json(response.data);
    } catch (error) {
        console.error('Error fetching carriers:', error.response ? error.response.data : error.message);
        res.status(500).json({
            success: false,
            error: error.message,
        });
    }
});
// Endpoint to list available services for a specific carrier
router.get('/carriers/listservices', async (req, res) => {
    const { carrierCode } = req.query; // carrierCode passed as query parameter
    const apiKey = process.env.SHIPSTATION_API_KEY;
    const apiSecret = process.env.SHIPSTATION_API_SECRET;

    const auth = Buffer.from(`${apiKey}:${apiSecret}`).toString('base64');

    try {
        const response = await axios({
            method: 'GET',
            url: `https://ssapi.shipstation.com/carriers/listservices?carrierCode=${carrierCode}`,
            headers: {
                'Authorization': `Basic ${auth}`,
                'Content-Type': 'application/json',
            },
        });

        res.json(response.data);
    } catch (error) {
        console.error('Error fetching services:', error.response ? error.response.data : error.message);
        res.status(500).json({
            success: false,
            error: error.message,
        });
    }
});


async function getShippingRates(rateData) {
    const apiKey = process.env.SHIPSTATION_API_KEY;
    const apiSecret = process.env.SHIPSTATION_API_SECRET;

    const auth = Buffer.from(`${apiKey}:${apiSecret}`).toString('base64');

    try {
        const response = await axios({
            method: 'POST',
            url: 'https://ssapi.shipstation.com/shipments/getrates',
            headers: {
                'Authorization': `Basic ${auth}`,
                'Content-Type': 'application/json',
            },
            data: rateData,
        });

        return response.data;
    } catch (error) {
        console.error('ShipStation API Error:', error.response ? error.response.data : error.message);
        throw new Error(error.response ? JSON.stringify(error.response.data) : error.message);
    }
}

// Endpoint to get rates for multiple USPS services
router.post('/get-rates', async (req, res) => {

 
    const {
        toState,
        toCountry,
        toPostalCode,
        toCity,
        weight: { value: weightValue, units: weightUnits } = {},
        dimensions: { length, width, height } = {},
        confirmation = 'delivery',
        residential = false,
        services = ['ups_ground', 'ups_2nd_day_air', 'ups_next_day_air']
    } = req.body;

    const rateDataTemplate = {
        carrierCode: 'ups_walleted',
        serviceCode: '',
        packageCode: 'package',
        fromPostalCode: '73086',
        toState,
        toCountry,
        toPostalCode,
        toCity,
        weight: { value: weightValue, units: weightUnits || 'pounds' },
        dimensions: { units: 'inches', length, width, height },
        confirmation,
        residential
    };

    try {
        const ratePromises = services.map(serviceCode => {
            const rateData = { 
                ...rateDataTemplate,
                serviceCode
            };
            console.log("Requesting rate for:", rateData);
            return getShippingRates(rateData);
        });

        const allRates = await Promise.all(ratePromises);

        res.json({
            success: true,
            rates: allRates
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message,
        });
    }
});






module.exports = router;
