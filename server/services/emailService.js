const nodemailer = require('nodemailer');

const createTransporter = () =>
    nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USERNAME,
            pass: process.env.EMAIL_PASSWORD,
        },
    });

const sendVerificationEmail = async (email, verificationUrl) => {
    await createTransporter().sendMail({
        from: '"My Personal Expenses Tracker" <yanlinnn155@gmail.com>',
        to: email,
        subject: 'Verify your email',
        html: `<p>Hello! Please verify your email by clicking on this link:</p><a href="${verificationUrl}">Verify Email</a>`,
    });
};

const sendForgotEmail = async (email, resetUrl) => {
    await createTransporter().sendMail({
        from: '"My Personal Expenses Tracker" <noreply@ypet.com>',
        to: email,
        subject: 'Forgot Password',
        html: `<p>Hello! Please reset your password by clicking on this link:</p><a href="${resetUrl}">Reset Password</a>`,
    });
};

module.exports = { sendVerificationEmail, sendForgotEmail };
