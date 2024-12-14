const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config();

// Initialize app and middleware
const app = express();
app.use(bodyParser.json());
app.use(cors()); // Enable CORS

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => console.log('Connected to MongoDB'))
    .catch((err) => console.error('Error connecting to MongoDB:', err));

// Define Balance model
const Balance = mongoose.model('Balance', new mongoose.Schema({
    amount: { type: Number, default: 0 },
}));

// API to get current balance
app.get('/balance', async (req, res) => {
    try {
        let balance = await Balance.findOne();
        if (!balance) {
            balance = new Balance();
            await balance.save();
        }
        res.json({ amount: balance.amount });
    } catch (error) {
        console.error('Error fetching balance:', error);
        res.status(500).json({ error: 'Failed to fetch balance' });
    }
});

// API to update balance (add or withdraw)
app.post('/balance', async (req, res) => {
    try {
        const { action, value } = req.body;
        let balance = await Balance.findOne();
        if (!balance) {
            balance = new Balance();
        }

        if (action === 'add') {
            balance.amount += value;
        } else if (action === 'withdraw') {
            balance.amount = Math.max(0, balance.amount - value); // Ensure balance doesn't go negative
        } else {
            return res.status(400).json({ error: 'Invalid action' });
        }

        await balance.save();
        res.json({ amount: balance.amount });
    } catch (error) {
        console.error('Error updating balance:', error);
        res.status(500).json({ error: 'Failed to update balance' });
    }
});

// Start server
const PORT = 3030;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
