const Joi = require('joi');
const authService = require('../services/authService');
const AppError = require('../middlewares/AppError');
const logger = require('../utils/logger');
const { logEvent, EVENTS } = require('../utils/eventLogger');

const USchema = Joi.object({
    fname:    Joi.string().min(1).max(255).required(),
    lname:    Joi.string().min(1).max(255).required(),
    email:    Joi.string()
                 .email({ minDomainSegments: 2, tlds: { allow: ['com', 'net', 'org', 'edu'] } })
                 .required()
                 .messages({ 'string.email': 'Please provide a valid email address', 'string.empty': 'Email is required' }),
    password: Joi.string()
                 .min(12)
                 .regex(/(?=.*[A-Z])/).regex(/(?=.*[a-z])/).regex(/(?=.*\d)/).regex(/(?=.*[@$!%*?&])/)
                 .messages({
                     'string.min': 'Password must be at least 12 characters long',
                     'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
                 })
                 .required(),
});

const USchema1 = Joi.object({
    fname:    Joi.string().min(1).max(255),
    lname:    Joi.string().min(1).max(255),
    email:    Joi.string()
                 .email({ minDomainSegments: 2, tlds: { allow: ['com', 'net', 'org', 'edu'] } })
                 .messages({ 'string.email': 'Please provide a valid email address', 'string.empty': 'Email is required' }),
    password: Joi.string()
                 .min(12)
                 .regex(/(?=.*[A-Z])/).regex(/(?=.*[a-z])/).regex(/(?=.*\d)/).regex(/(?=.*[@$!%*?&])/)
                 .messages({
                     'string.min': 'Password must be at least 12 characters long',
                     'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
                 }),
}).min(1);

const validate = (schema, data) => {
    const { error } = schema.validate(data);
    if (error) throw new AppError(400, error.details[0].message);
};

const register = async (req, res, next) => {
    try {
        const { fname, lname, email, password } = req.body;
        validate(USchema, { fname, lname, email, password });
        const result = await authService.register({ fname, lname, email, password });
        if (result.conflict) {
            logger.warn(`Register failed - email already exists: ${email}`);
            throw new AppError(400, 'An account with this email already exists. Please log in.');
        }
        logger.info(`New registration: ${email}`);
        logEvent(EVENTS.USER_REGISTERED, null, { email });
        res.status(201).json({ message: 'Sign Up Successful. Please log in to your account.', showDialog: true });
    } catch (e) { next(e); }
};

const resendVerification = async (req, res, next) => {
    try {
        const { email } = req.body;
        validate(USchema1, { email });
        const result = await authService.resendVerification(email);
        if (result.notFound)        throw new AppError(400, 'User Not Found');
        if (result.inactive)        throw new AppError(400, 'Your account is inactive');
        if (result.alreadyVerified) throw new AppError(400, 'Your account is verified');
        res.status(200).json({ message: 'We have sent you the verify email!', showDialog: true });
    } catch (e) { next(e); }
};

const verifyEmail = async (req, res, next) => {
    try {
        const { token, id } = req.query;
        if (!token || !id) throw new AppError(400, 'Invalid verification link.');
        const result = await authService.verifyEmail(token, id);
        if (result.invalid) throw new AppError(400, 'Invalid or expired verification link.');
        res.status(200).json({ message: 'Verification Successful' });
    } catch (e) { next(e); }
};

const forgotLink = async (req, res, next) => {
    try {
        const { email } = req.body;
        validate(USchema1, { email });
        const result = await authService.requestPasswordReset(email);
        if (result.notFound)   throw new AppError(404, 'User Not Found');
        if (result.inactive)   throw new AppError(400, 'Your account is inactive');
        if (result.unverified) throw new AppError(400, 'Your account is not verified');
        res.status(200).json({ message: 'Sent Successful' });
    } catch (e) { next(e); }
};

const validateResetToken = async (req, res, next) => {
    try {
        const { token, id } = req.query;
        if (!token || !id) throw new AppError(400, 'Invalid request. Token and ID are required.');
        const result = await authService.validateResetToken(token, id);
        if (result.notFound) throw new AppError(400, 'User Not Found');
        if (result.invalid)  throw new AppError(400, 'Your reset password link is expired or invalid.');
        res.status(200).json({ message: 'Reset password link is valid.' });
    } catch (e) { next(e); }
};

const forgotPass = async (req, res, next) => {
    try {
        const { token, id } = req.query;
        const { password, confirmPassword } = req.body;
        if (!token) throw new AppError(400, 'No reset token provided.');
        if (password !== confirmPassword) throw new AppError(400, 'Password and Confirm Password must be the same.');
        validate(USchema1, { password });
        const result = await authService.resetPassword(id, token, password);
        if (result.invalid) throw new AppError(400, 'Invalid or expired reset token.');
        res.status(200).json({ message: 'Password reset successfully!', showDialog: true });
    } catch (e) { next(e); }
};

const createGuest = async (req, res, next) => {
    try {
        const data = await authService.createGuest();
        logger.info(`Guest session created: user ${data.id}`);
        logEvent(EVENTS.GUEST_CREATED, data.id);
        res.json(data);
    } catch (e) { next(e); }
};

const deleteGuest = async (req, res, next) => {
    try {
        if (!req.user.isGuest) throw new AppError(403, 'Not a guest account');
        await authService.deleteGuest(req.user.id);
        res.sendStatus(200);
    } catch (e) { next(e); }
};

const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const result = await authService.login(email, password);
        if (result.invalid) {
            logger.warn(`Login failed - invalid credentials: ${email}`);
            throw new AppError(400, 'Invalid Email or Password!');
        }
        if (result.inactive) {
            logger.warn(`Login failed - inactive account: ${email}`);
            throw new AppError(400, 'Your account is Inactive.');
        }
        logger.info(`Login success: user ${result.id} (${email})`);
        logEvent(EVENTS.USER_LOGIN, result.id, { email });
        res.json({ token: result.token, fname: result.fname, id: result.id });
    } catch (e) { next(e); }
};

const getProfile = async (req, res, next) => {
    try {
        const profile = await authService.getProfile(req.params.uid);
        if (!profile) throw new AppError(404, 'User not found');
        res.status(200).json(profile);
    } catch (e) { next(e); }
};

const changePassword = async (req, res, next) => {
    try {
        const { password, confirmPassword } = req.body;
        if (password !== confirmPassword) throw new AppError(400, 'Password and Confirm Password must be same.');
        validate(USchema1, { password });
        const result = await authService.changePassword(req.user.id, password);
        if (result.same) throw new AppError(400, 'Password cannot be the same as the previous password!');
        res.status(200).json({ message: 'Password Changed' });
    } catch (e) { next(e); }
};

const editProfile = async (req, res, next) => {
    try {
        const { fname, lname } = req.body;
        validate(USchema1, { fname, lname });
        const user = await authService.editProfile(req.params.uid, fname, lname);
        if (!user) throw new AppError(404, 'User not found');
        res.status(200).json({ messages: 'Change Successful!' });
    } catch (e) { next(e); }
};

const getAuth = (req, res) => {
    res.json(req.user);
};

module.exports = {
    register, resendVerification, verifyEmail, forgotLink, validateResetToken,
    forgotPass, createGuest, deleteGuest, login, getProfile, changePassword,
    editProfile, getAuth,
};
