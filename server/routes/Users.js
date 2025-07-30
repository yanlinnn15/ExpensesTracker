const express = require("express");
const router = express.Router();
const {Users, Categories, Icon} = require("../models");
const {validateToken} = require("../middlewares/authMW");
const {sign} = require("jsonwebtoken");
const config = require('../config/config');
const passport = require('passport');

// Google OAuth routes
router.get('/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get('/google/callback',
  passport.authenticate('google', { 
    failureRedirect: `${config.frontend_url}/auth/login`,
    session: false
  }),
  (req, res) => {
    // Create JWT token for the authenticated user
    const token = sign(
      { fname: req.user.fName, id: req.user.id },
      process.env.JWT_SECRET || "important"
    );
    
    // Redirect to frontend with token
    res.redirect(`${config.frontend_url}/auth/google-callback?token=${token}`);
  }
);

// Guest login route
router.post('/guest', async (req, res) => {
    try {
        // Create a guest user
        const guestUser = await Users.create({
            fName: 'Guest',
            lName: 'User',
            email: `guest_${Date.now()}@example.com`,
            isGuest: true
        });

        // Create default categories for guest user
        await Categories.bulkCreate([
            { name: 'Salary', is_income: 1, UserId: guestUser.id, IconId: 1 },
            { name: 'Part Time', is_income: 1, UserId: guestUser.id, IconId: 2 },
            { name: 'Food', is_income: 0, UserId: guestUser.id, IconId: 6 },
            { name: 'Transport', is_income: 0, UserId: guestUser.id, IconId: 9 },
            { name: 'Essentials', is_income: 0, UserId: guestUser.id, IconId: 8 },
            { name: 'Shopping', is_income: 0, UserId: guestUser.id, IconId: 7 }
        ]);

        // Create JWT token for guest user
        const accessToken = sign(
            { fname: guestUser.fName, id: guestUser.id },
            process.env.JWT_SECRET || "important"
        );

        res.json({
            token: accessToken,
            fname: guestUser.fName,
            id: guestUser.id,
            isGuest: true
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error" });
    }
});

// Get user profile
router.get("/profile/:uid", validateToken, async (req, res) => {
    try {
        const id = req.params.uid;
        const profile = await Users.findByPk(id);
        res.status(200).json(profile);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error" });
    }
});

// Update profile
router.patch("/edit/:uid", validateToken, async (req, res) => {
    try {
        const id = req.params.uid;
        const { fname, lname } = req.body;

        const user = await Users.findByPk(id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (fname) user.fName = fname;
        if (lname) user.lName = lname;

        await user.save();
        res.status(200).json({ message: "Profile updated successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error" });
    }
});

// Auth check
router.get('/auth', validateToken, (req, res) => {
    res.json(req.user);
});

module.exports = router;