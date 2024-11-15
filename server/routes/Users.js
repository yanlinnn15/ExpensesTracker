const express = require("express");
const router = express.Router();
const {Users, Categories, Icon} = require("../models");
const {validateToken} = require("../middlewares/authMW");
const {sign} = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { sendVerificationEmail, sendForgotEmail } = require('./email');
const { Op } = require('sequelize');
const Joi =require("joi");
const crypto = require('crypto');

const USchema = Joi.object({
    fname: Joi.string().min(1).max(255).required(),
    lname: Joi.string().min(1).max(255).required(),
    email: Joi.string()
                .email({ minDomainSegments: 2, tlds: { allow: ['com', 'net', 'org', 'edu'] } }) // Validates email format
                .required() // Makes the email field required
                .messages({
                'string.email': 'Please provide a valid email address',
                'string.empty': 'Email is required',
                }).required(),
    password: Joi.string()
                .min(12) // Minimum length of 12 characters
                .regex(/(?=.*[A-Z])/) // At least one uppercase letter
                .regex(/(?=.*[a-z])/) // At least one lowercase letter
                .regex(/(?=.*\d)/) // At least one digit
                .regex(/(?=.*[@$!%*?&])/) // At least one special character
                .messages({
                'string.min': 'Password must be at least 12 characters long',
                'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
                }).required(),
});

const USchema1 = Joi.object({
    fname: Joi.string().min(1).max(255),
    lname: Joi.string().min(1).max(255),
    email: Joi.string()
                .email({ minDomainSegments: 2, tlds: { allow: ['com', 'net', 'org', 'edu'] } }) // Validates email format
                .messages({
                'string.email': 'Please provide a valid email address',
                'string.empty': 'Email is required',
                }),
    password: Joi.string()
                .min(12) // Minimum length of 12 characters
                .regex(/(?=.*[A-Z])/) // At least one uppercase letter
                .regex(/(?=.*[a-z])/) // At least one lowercase letter
                .regex(/(?=.*\d)/) // At least one digit
                .regex(/(?=.*[@$!%*?&])/) // At least one special character
                .messages({
                'string.min': 'Password must be at least 12 characters long',
                'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
                }),
}).min(1);

const changePassword = async (id, password) => {
    
    const user = await Users.findByPk(id, {
        attributes: {include: ['password']}
    });

    bcrypt.compare(password, user.password).then(async (match) => {
        if(match)
            return {message: "Password cannot same as previous password!"};

        const hash = await bcrypt.hash(password, 10);
        await Users.update(
            {
                password: hash,
                resetToken:"1"
            },
            {where: {id:id}}
        );
    });
        
    return {message: "Password Changed"};

};
  
//register
router.post("/", async (req, res) => {
    const {fname, lname, email, password} = req.body;
    const {error, value} = USchema.validate({fname, lname, email, password});

    if (error) 
        return res.status(400).json({ error: error.details[0].message });
    
    try{
        //hash password
        const hash = await bcrypt.hash(password, 10);

        //check if the user with same 
        const exist = await Users.findOne({where: {email:email}});

        if(!exist){
            const user = await Users.create({
                                fName: fname,
                                lName: lname,
                                email:email,
                                password:hash,
                                active:true   
                            });

            const verifyToken = crypto.randomBytes(32).toString('hex');    
            const verifyTokenEx = Date.now() + 3600000; // 1 hour expiration
            const verificationUrl = `https://localhost:5173/verify?token=${verifyToken}&id=${user.id}`;

            await Users.update({
                verifyToken:verifyToken,
                verifyTokenEx:verifyTokenEx,    
            },
            {
              where: {id:user.id}  
            });
            await sendVerificationEmail(user.email, verificationUrl);
            return res.status(201).json({ message: "Sign Up Successful. We have sent you the verify email!", showDialog: true });
   
        }else{
            const verify = await Users.findOne({where: {email:email, verify:true}});

            if(verify){
                return res.status(200).json({
                    message: "Account exists. Please go to Log In Page.",
                    link: "http://localhost:5173/auth/login",
                    showAlert: true
                });
            }else{
                return res.status(200).json({
                    message: "Account exists. Please verify your email.",
                    link: "http://localhost:5173/auth/verification",
                    showAlert: true
                });

            }
        }

    }catch(error){
        console.error(error);
        res.status(500).json({message: "Server Error"});
    };
});

router.post("/resendveri", async (req,res) => {
    try{
        const {email} = req.body;
        const exist = await Users.findOne({where: {email:email}});
        const {error, value} = USchema1.validate({email});

        if (error) 
            return res.status(400).json({ error: error.details[0].message });

        if(!exist)
            return res.status(400).json({ message: 'User Not Found' });

        const active = await Users.findOne({where: {email:email, active:true}});

        if(!active)
            return res.status(400).json({ message: 'Your account is inactive' });

        const verify = await Users.findOne({where: {email:email, verify:true}});
        
        if(verify)
            return res.status(400).json({ message: 'Your account is verified' });


        const verifyToken = crypto.randomBytes(32).toString('hex');    
        const verifyTokenEx = Date.now() + 3600000; 
        const user = await Users.update({
                                verifyToken:verifyToken,
                                verifyTokenEx:verifyTokenEx,    
                            },
                            {
                            where: {email:email}  
                            });
        
        const updatedUser = await Users.findOne({
            where: { email: email },
        });

        const verificationUrl = `http://localhost:5173/auth/verify?token=${verifyToken}&id=${updatedUser.id}`;

        await sendVerificationEmail(email, verificationUrl);
        return res.status(200).json({ message: "We have sent you the verify email!", showDialog: true });
    }catch(error){
        console.error(error);
        res.status(500).json({message: "Server Error"});
   };
});

//verify email
router.post("/verify-email", async (req,res) => {

    const {token, id} = req.query;

    try{
        if(!token || !id)
            return res.status(400).json('Invalid verification link.');

        const user = await Users.findOne({
            where: {
                id: id,
                active: true,  
                verify: false, 
                verifyToken: token,
                verifyTokenEx: { [Op.gt]: Date.now() } 
            }
        });

        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired verification link.' });
        }

        const veri = await Users.update(
            {verify:true, verifyToken: "1"},
            {where: {id:id}}
        ); 

        if(veri){
            await Categories.bulkCreate(
                [                
                        { name: 'Salary', is_income:1, UserId:id, IconId:1 },
                        { name: 'Part Time', is_income:1, UserId:id, IconId:2 },
                        { name: 'Food', is_income:0, UserId:id, IconId:6 },
                        { name: 'Transport', is_income:0, UserId:id, IconId:9 },
                        { name: 'Essentials', is_income:0, UserId:id, IconId:8 },
                        { name: 'Shopping', is_income:0, UserId:id, IconId:7 },
                ]
            );
        }
            
        res.status(200).json({message: "Verification Successful"});

    }catch(error){
        console.error(error);
        res.status(500).json({message: "Server Error"});
   };

});

router.post("/forgotlink", async (req,res) => {
    const {email} = req.body;
    try{
        const {error, value} = USchema1.validate({email});

        if (error) 
            return res.status(400).json({ error: error.details[0].message });

        const exist = await Users.findOne({where: {email:email}});

        if(!exist)
            return res.status(404).json({ message: 'User Not Found' });

        const active = await Users.findOne({where: {email:email, active:true}});

        if(!active)
            return res.status(400).json({ message: 'Your account is inactive' });

        const verify = await Users.findOne({where: {email:email, verify:false}});
        
        if(verify)
            return res.status(400).json({ message: 'Your account is not verified' });

        const resetToken = crypto.randomBytes(32).toString('hex');    
        const resetTokenEx = Date.now() + 3600000; // 1 hour expiration
        const user = await Users.update(
            {
                resetToken:resetToken,
                resetTokenEx: resetTokenEx
            },
            {where: {email:email}},
        );
        const updatedUser = await Users.findOne({
            where: { email: email },
        });
        const resetUrl = `http://localhost:5173/auth/resetpass?token=${resetToken}&id=${updatedUser.id}`;


        await sendForgotEmail(email, resetUrl);
        res.status(200).json({message: "Sent Successful"});
    }catch(error){
        console.error(error);
        res.status(500).json({message: "Server Error"});
   };
});

router.post('/validate-reset-token', async (req, res) => {
    const { token, id } = req.query;

    try {
        if (!token || !id) {
            return res.status(400).json('Invalid request. Token and ID are required.');
        }

        const exist = await Users.findOne({ where: { id: id } });
        if (!exist) {
            return res.status(400).json({ message: 'User Not Found' });
        }

        const time = Date.now();
        const validToken = await Users.findOne({
            where: {
                id: id,
                resetToken: token,
                resetTokenEx: { [Op.gt]: time } 
            }
        });

        if (!validToken) {
            return res.status(400).json({ message: 'Your reset password link is expired or invalid.' });
        }

        res.status(200).json({ message: 'Reset password link is valid.' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error" });
    }
});



router.post('/forgotpass', async (req, res) => {
    const { token, id } = req.query;
    const { password, confirmPassword } = req.body;

    if (!token) {
        return res.status(400).json("No reset token provided.");
    }

    if (password !== confirmPassword) {
        return res.status(400).json("Password and Confirm Password must be the same.");
    }

    const { error } = USchema1.validate({ password });
    if (error) {
        return res.status(400).json({ error: error.details[0].message });
    }

    try {
        const user = await Users.findOne({ where: { id, resetToken: token, resetTokenEx: { [Op.gt]: new Date() } } });
        
        if (!user) {
            return res.status(400).json("Invalid or expired reset token.");
        }

        const result = await changePassword(id, password);

        await Users.update(
            { resetToken: null, resetTokenEx: null },
            { where: { id } }
        );

        res.status(200).json({ message: "Password reset successfully!", showDialog: true });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error" });
    }
})


router.post("/login", async (req,res) =>{

    //LogIn
    const {email, password} = req.body;
    const user = await Users.findOne({where: {email:email}});

   try{
        if(user){
            const userExist = await Users.findOne({where: {email:email, verify:true}});

            if(userExist){
                const userActive = await Users.findOne({where: {email:email, verify:true, active:true}});

                if(userActive){
                    bcrypt.compare(password, user.password).then((match) => {
                        if(match){
                            const accessToken = sign({fname:user.fName, id:user.id}, "important");
                            res.json({token:accessToken, fname:user.fName, id:user.id});
                        }else{
                            res.status(400).json({message: "Invalid Email or Password!"});
                        }
                    });
                }else{
                    res.status(400).json({message: "Your account is Inactive."});
                }

            }else{
                res.status(400).json({message: "Please verify your email. Click here to verify: <a href='http://localhost:5173/auth/verification'>Verify Email "});
            }
        }else{
            res.status(400).json({message: "Invalid Email or Password!"});
        }
   }catch(error){
        console.error(error);
        res.status(500).json({message: "Server Error"});
   };

});

router.get("/profile/:uid", validateToken, async (req,res) => {
    try{
        const id = req.params.uid;
        const profile = await Users.findByPk(id, {
            attributes: {exclude: ['password']}
        });
        res.status(200).json(profile);
    }catch(error){
        console.error(error);
        res.status(500).json({message: "Server Error"});
    }
});

router.put("/pass/:uid", validateToken, async (req,res) => {
    try{
        const id = req.user.id;
        const {password, confirmPassword} = req.body;

        if(password!==confirmPassword)
            return res.status(400).json("Password and Confirm Password must be same.");

        const {error, value} = USchema1.validate({password});

        if (error) 
            return res.status(400).json({ error: error.details[0].message });
        
        const mss = await changePassword(id, password);
        res.status(200).json(mss);
        
    }catch(error){
        console.error(error);
        res.status(500).json({message: "Server Error"});
    }
});

router.patch("/edit/:uid", validateToken, async (req, res) => {
    try {
        const id = req.params.uid;
        const { fname, lname } = req.body;

        const { error, value } = USchema1.validate({ fname, lname });
        if (error) {
            return res.status(400).json({ error: error.details[0].message });
        }

        const user = await Users.findByPk(id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (fname !== "") user.fName = fname;
        if (lname !== "") user.lName = lname;

        await user.save();
        res.status(200).json({ messages: "Change Successful!" });

    } catch (error) {
        console.error(error); 
        res.status(500).json({ message: "Server Error" });
    }
});


router.get('/auth',validateToken, (req,res) => {
    res.json(req.user);
});

module.exports = router;