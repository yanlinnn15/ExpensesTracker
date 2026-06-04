const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { validateToken } = require('../middlewares/authMW');

router.post('/',                          authController.register);
router.post('/resendveri',                authController.resendVerification);
router.post('/verify-email',              authController.verifyEmail);
router.post('/forgotlink',                authController.forgotLink);
router.post('/validate-reset-token',      authController.validateResetToken);
router.post('/forgotpass',                authController.forgotPass);
router.post('/guest',                     authController.createGuest);
router.delete('/guest',   validateToken,  authController.deleteGuest);
router.post('/login',                     authController.login);
router.get('/profile/:uid', validateToken, authController.getProfile);
router.put('/pass/:uid',    validateToken, authController.changePassword);
router.patch('/edit/:uid',  validateToken, authController.editProfile);
router.get('/auth',         validateToken, authController.getAuth);

module.exports = router;
