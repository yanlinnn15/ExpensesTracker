const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const { Users } = require('../models');

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await Users.findByPk(id);
        done(null, user);
    } catch (error) {
        done(error, null);
    }
});

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: `${process.env.BACKEND_URL || 'http://localhost:3001'}/auth/google/callback`,
    userProfileURL: 'https://www.googleapis.com/oauth2/v3/userinfo'
},
async (accessToken, refreshToken, profile, done) => {
    try {
        // Check if user already exists
        let user = await Users.findOne({ where: { email: profile.emails[0].value } });
        
        if (!user) {
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
        } else if (!user.googleId) {
            // If user exists but hasn't logged in with Google before
            user.googleId = profile.id;
            await user.save();
        }

        return done(null, user);
    } catch (error) {
        return done(error, null);
    }
}));
