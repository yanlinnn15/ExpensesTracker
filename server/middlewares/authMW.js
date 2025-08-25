const {verify} = require("jsonwebtoken");
const {Users} = require("../models");

const validateToken = async (req, res, next) => {
    try {
        // Check for token in different places
        const accessToken = req.header("accessToken") || 
                          req.cookies?.accessToken ||
                          req.query?.token;

        if (!accessToken) {
            console.log('No access token provided');
            return res.status(401).json({ error: "User not logged in" });
        }

        // Verify the token
        const token = verify(accessToken, process.env.JWT_SECRET || 'important');
        
        // Find the user
        const user = await Users.findOne({
            where: { id: token.id },
            attributes: ['id', 'fName', 'lName', 'email', 'googleId', 'isGuest', 'active', 'lastActive']
        });

        if (!user) {
            console.log('User not found for token:', token.id);
            return res.status(403).json({ error: "User not found" });
        }

        if (!user.active) {
            console.log('Account is inactive:', token.id);
            return res.status(403).json({ error: "Account is inactive" });
        }

        // Update last active time for guest users
        if (user.isGuest) {
            await Users.update(
                { lastActive: new Date() },
                { where: { id: token.id } }
            );
        }

        // Attach user to request
        req.user = token;
        next();
    } catch (error) {
        console.error('Token validation error:', error);
        return res.status(401).json({ error: "Invalid token" });
    }
};

module.exports = { validateToken };