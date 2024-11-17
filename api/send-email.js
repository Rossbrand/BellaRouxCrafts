const express = require('express');
const sgMail = require('@sendgrid/mail');
const dotenv = require('dotenv');

dotenv.config();
sgMail.setApiKey(process.env.SEND_GRID_API_KEY);

const router = express.Router();

// Define the send email route
router.post('/', async (req, res) => {
    const { to, subject, text } = req.body;

    const msg = {
        to,
        from: 'teresoh@bellarouxcrafts.com', // Your verified sender email
        subject,
        text,
    };

    try {
        await sgMail.send(msg);
        res.status(200).json({ message: 'Email sent successfully!' });
    } catch (error) {
        console.error('Error sending email:', error);
        res.status(500).json({ error: 'Failed to send email' });
    }
});

module.exports = router;
