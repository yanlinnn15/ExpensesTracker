const {verify} = require("jsonwebtoken");
const {Users} = require("../models");

const JWT_SECRET = process.env.JWT_SECRET || 'important'; // Use environment variable in production

const validateToken = async (req,res,next) => {
    const accessToken = req.header("accessToken");

    if(!accessToken)
        return res.status(401).json({ error: "User not logged in" });

    try{
        const token = verify(accessToken, JWT_SECRET);
        const checkActive = await Users.findOne({where: {id:token.id}});

        if(!checkActive)
            return res.status(403).json({ message: 'Account is inactive' });
        
        req.user = token;
        
        // Update last active time for guest users
        if (checkActive.isGuest) {
            await Users.update(
                { lastActive: new Date() },
                { where: { id: token.id } }
            );
        }
        
        return next();
        
            
    }catch(error){
        console.error('Token validation error:', error);
        return res.status(401).json({ error: "Invalid access token" });
    }
}

module.exports = { validateToken };