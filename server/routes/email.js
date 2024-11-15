const nodemailer = require('nodemailer');
require('dotenv').config();

const sendVerificationEmail = async (email, verificationUrl) => {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  
    const mailOptions = {
      from: '"My Personal Expenses Tracker" <yanlinnn155@gmail.com>',
      to: email,
      subject: 'Verify your email',
      text: `Hello! Please verify your email by clicking on this link: ${verificationUrl}`,
      html: `<p>Hello! Please verify your email by clicking on this link:</p><a href="${verificationUrl}">Verify Email</a>`,
    };
  
    await transporter.sendMail(mailOptions);
  };

  const sendForgotEmail = async (email, resetUrl) => {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  
    const mailOptions = {
      from: '"My Personal Expenses Tracker" <noreply@ypet.com>',
      to: email,
      subject: 'Forgot Password',
      text: `Hello! Please verify your email by clicking on this link: ${resetUrl}`,
      html: `<p>Hello! Please reset your password by clicking on this link:</p><a href="${resetUrl}">Reset Password</a>`,
    };
  
    await transporter.sendMail(mailOptions);
  };
  
  module.exports = { sendVerificationEmail, sendForgotEmail};