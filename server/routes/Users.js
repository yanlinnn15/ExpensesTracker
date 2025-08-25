const express = require("express");
const router = express.Router();
const {Users, Categories, Icons} = require("../models");
const {validateToken} = require("../middlewares/authMW");
const {sign} = require("jsonwebtoken");
const passport = require('passport');

// Auth check endpoint
router.get('/auth', validateToken, async (req, res) => {
    try {
        const user = await Users.findByPk(req.user.id, {
            attributes: ['id', 'fName', 'lName', 'email', 'googleId', 'isGuest']
        });
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        res.json(user);
    } catch (error) {
        console.error('Auth check error:', error);
        res.status(500).json({ error: "Internal server error" });
    }
});

// Profile endpoint
router.get('/profile/:id', validateToken, async (req, res) => {
    try {
        const userId = req.params.id;
        
        // For security, only allow users to view their own profile
        if (req.user.id !== parseInt(userId)) {
            return res.status(403).json({ error: "Access denied" });
        }

        const user = await Users.findByPk(userId, {
            attributes: ['id', 'fName', 'lName', 'email', 'googleId', 'isGuest', 'active', 'lastActive', 'registeredAt']
        });

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        res.json(user);
    } catch (error) {
        console.error('Profile fetch error:', error);
        res.status(500).json({ error: "Internal server error" });
    }
});

// Guest login route
router.post('/guest', async (req, res) => {
    try {
        console.log('Processing guest login request...');
        
        // First check if icons exist
        const icons = await Icons.findAll();
        console.log('Found icons:', icons ? icons.length : 0);
        
        if (!icons || icons.length === 0) {
            console.log('No icons found in database');
            return res.status(500).json({ message: "System is not properly initialized. Please contact administrator." });
        }

        // Create a guest user with a unique email
        const guestEmail = `guest_${Date.now()}_${Math.random().toString(36).substring(7)}@example.com`;
        console.log('Creating guest user with email:', guestEmail);
        
        const guestUser = await Users.create({
            fName: 'Guest',
            lName: 'User',
            email: guestEmail,
            isGuest: true,
            active: true,
            verify: true
        });

        console.log('Guest user created:', guestUser.id);

        // Create default categories for the guest user
        await Categories.bulkCreate([
            { name: 'Salary', is_income: 1, UserId: guestUser.id, IconId: icons[0].id },
            { name: 'Part Time', is_income: 1, UserId: guestUser.id, IconId: icons[1].id },
            { name: 'Food', is_income: 0, UserId: guestUser.id, IconId: icons[2].id },
            { name: 'Transport', is_income: 0, UserId: guestUser.id, IconId: icons[3].id },
            { name: 'Essentials', is_income: 0, UserId: guestUser.id, IconId: icons[4].id },
            { name: 'Shopping', is_income: 0, UserId: guestUser.id, IconId: icons[5].id }
        ]);

        console.log('Created default categories for guest user');

        // Create JWT token
        const token = sign(
            { fname: guestUser.fName, id: guestUser.id },
            process.env.JWT_SECRET || "important"
        );

        // Return success response
        return res.json({
            token,
            id: guestUser.id,
            fname: guestUser.fName,
            message: "Guest account created successfully"
        });

    } catch (error) {
        console.error('Error in guest login:', error);
        return res.status(500).json({ 
            message: "Error creating guest account", 
            error: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
});

// Google OAuth routes
console.log('Setting up Google OAuth routes with credentials:', {
    clientIDExists: !!process.env.GOOGLE_CLIENT_ID,
    clientSecretExists: !!process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: `${process.env.BACKEND_URL || 'http://localhost:3001'}/auth/google/callback`
});

router.get('/google', (req, res, next) => {
    console.log('Initiating Google OAuth flow...');
    passport.authenticate('google', { 
        scope: ['profile', 'email'],
        session: false
    })(req, res, next);
});

router.get('/google/callback', (req, res, next) => {
    console.log('Received Google OAuth callback');
    passport.authenticate('google', { 
        session: false,
        failureRedirect: `${process.env.FRONTEND_URL}/login`
    }, (err, user, info) => {
        if (err) {
            console.error('Google OAuth callback error:', err);
            return res.redirect(`${process.env.FRONTEND_URL}/login?error=auth_failed`);
        }
        if (!user) {
            console.error('No user from Google OAuth:', info);
            return res.redirect(`${process.env.FRONTEND_URL}/login?error=no_user`);
        }

        // Create JWT token
        const token = sign(
            { fname: user.fName, id: user.id },
            process.env.JWT_SECRET || "important"
        );

        // Redirect to frontend with token
        res.redirect(`${process.env.FRONTEND_URL}/auth/google-callback?token=${token}`);
    })(req, res, next);
});

module.exports = router;