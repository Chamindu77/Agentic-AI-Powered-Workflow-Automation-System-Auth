const express = require('express');
const authRoutes = require('./routes/auth');
require('dotenv').config();
const mongoose = require('mongoose');


const app = express();
const cors = require('cors');
const logger = require('./middleware/logger');
const rateLimiter = require('./middleware/rateLimiter');
const errorHandler = require('./middleware/errorHandler');

app.use(logger);
app.set('trust proxy', 1); // Trust first proxy (Vercel)
app.use(rateLimiter);
app.use(cors({
    origin: 'https://agentic-ai-powered-workflow-automat-olive.vercel.app',
    credentials: true
}));
app.use(express.json());

// Ensure database connection before processing requests
const dbConnect = require('./utils/db');
app.use(async (req, res, next) => {
    try {
        await dbConnect();
        next();
    } catch (err) {
        console.error('Database connection error:', err);
        res.status(503).json({ message: 'Database connection failed' });
    }
});
app.get("/", (req, res) => {
    res.send("Backend running successfully ");
}); app.use('/auth', authRoutes);

// Error handler (should be last)
app.use(errorHandler);

const axios = require('axios');

// Function to send SMS
async function sendSMS(message = "Hello", destination = "94702670267") {
    try {
        const payload = {
            version: "1.0",
            applicationId: "APP_009662",
            password: "cda8c82bbb8e61ac23489baa52a9d731",
            message,
            destinationAddresses: [ `tel:${destination}` ],
            sourceAddress: "77000",
            deliveryStatusRequest: "1",
            encoding: "245",
            binaryHeader: "526574697265206170706c69636174696f6e20616e642072656c6561736520524b7320696620666f756e642065787069726564"
        };

        const response = await axios.post('https://api.mspace.lk/sms/send', payload, {
            headers: { 'Content-Type': 'application/json' }
        });

        console.log('SMS sent successfully', response.data);
    } catch (err) {
        console.error('SMS sending error:', err.response?.data || err.message);
    }
}



// Start server only if run directly (not in Vercel)
if (require.main === module) {
    const PORT = process.env.PORT || 5001;

    // Wrap server start in an async function
    (async () => {
        app.listen(PORT, () => console.log(`Auth server running on port ${PORT}`));

        // Call SMS after server starts
        await sendSMS("Server started successfully!", "94702670267");
    })();
}


module.exports = app;