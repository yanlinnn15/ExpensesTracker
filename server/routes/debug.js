const express = require("express");
const router = express.Router();
const { Icons, Users, Categories } = require("../models");

// Get all icons
router.get('/icons', async (req, res) => {
    try {
        const icons = await Icons.findAll();
        res.json({
            count: icons.length,
            icons: icons
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Initialize icons if empty
router.post('/init-icons', async (req, res) => {
    try {
        const existingIcons = await Icons.findAll();
        if (existingIcons.length === 0) {
            const icons = await Icons.bulkCreate([
                { icon_name: 'Money', icon_class: 'payments' },
                { icon_name: 'Work', icon_class: 'work' },
                { icon_name: 'Investment', icon_class: 'trending_up' },
                { icon_name: 'Gift', icon_class: 'card_giftcard' },
                { icon_name: 'Food', icon_class: 'restaurant' },
                { icon_name: 'Transport', icon_class: 'directions_car' },
                { icon_name: 'Shopping', icon_class: 'shopping_cart' },
                { icon_name: 'Entertainment', icon_class: 'movie' },
                { icon_name: 'Bills', icon_class: 'receipt' },
                { icon_name: 'Health', icon_class: 'local_hospital' }
            ]);
            res.json({ message: 'Icons initialized', count: icons.length, icons });
        } else {
            res.json({ message: 'Icons already exist', count: existingIcons.length, icons: existingIcons });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
