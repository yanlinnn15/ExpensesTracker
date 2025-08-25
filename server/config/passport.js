const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const { Users, Categories } = require('../models');

// Serialize user for the session
passport.serializeUser((user, done) => {
    done(null, user.id);
});

// Deserialize user from the session
passport.deserializeUser(async (id, done) => {
    try {
        const user = await Users.findByPk(id);
        done(null, user);
    } catch (error) {
        done(error, null);
    }
});

// Configure Google OAuth Strategy
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    console.log('Initializing Google OAuth Strategy...');
    console.log('Using callback URL:', `${process.env.FRONTEND_URL || 'http://localhost:3001'}/auth/google/callback`);
    
    passport.use('google', new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: `${process.env.BACKEND_URL || 'http://localhost:3001'}/auth/google/callback`,
        userProfileURL: 'https://www.googleapis.com/oauth2/v3/userinfo'
    },
    async (accessToken, refreshToken, profile, done) => {
        try {
            console.log('Google OAuth callback received for profile:', profile.id);
            
            // Check if user already exists
            let user = await Users.findOne({ 
                where: { 
                    email: profile.emails[0].value 
                }
            });
            
            if (!user) {
                console.log('Creating new user from Google profile');
                // Create new user if doesn't exist
                user = await Users.create({
                    email: profile.emails[0].value,
                    fName: profile.name.givenName,
                    lName: profile.name.familyName,
                    password: '', // No password for OAuth users
                    active: true,
                    verify: true, // Google users are automatically verified
                    googleId: profile.id
                });

                // Create default categories for new user
                await Categories.bulkCreate([
                    { name: 'Salary', is_income: 1, UserId: user.id, IconId: 1 },
                    { name: 'Part Time', is_income: 1, UserId: user.id, IconId: 2 },
                    { name: 'Food', is_income: 0, UserId: user.id, IconId: 6 },
                    { name: 'Transport', is_income: 0, UserId: user.id, IconId: 9 },
                    { name: 'Essentials', is_income: 0, UserId: user.id, IconId: 8 },
                    { name: 'Shopping', is_income: 0, UserId: user.id, IconId: 7 }
                ]);
                
                console.log('Created default categories for new user');
            } else {
                console.log('Found existing user:', user.id);
                // Update Google ID if not set
                if (!user.googleId) {
                    user.googleId = profile.id;
                    await user.save();
                }
            }

            return done(null, user);
        } catch (error) {
            console.error('Error in Google OAuth callback:', error);
            return done(error, null);
        }
    }));
    
    console.log('Google OAuth Strategy initialized successfully');
} else {
    console.warn('Google OAuth credentials not found in environment variables.');
    console.warn('GOOGLE_CLIENT_ID:', process.env.GOOGLE_CLIENT_ID ? 'Set' : 'Not Set');
    console.warn('GOOGLE_CLIENT_SECRET:', process.env.GOOGLE_CLIENT_SECRET ? 'Set' : 'Not Set');
}

module.exports = passport;
