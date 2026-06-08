const { Users, Categories, sequelize } = require('../models');
const { sign } = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const { Op } = require('sequelize');
const { sendVerificationEmail, sendForgotEmail } = require('./emailService');

const DUMMY_HASH = bcrypt.hashSync('dummy-timing-normalization', 10);

const DEFAULT_CATEGORIES = [
    { name: 'Salary',     is_income: true,  IconId: 1 },
    { name: 'Part Time',  is_income: true,  IconId: 2 },
    { name: 'Food',       is_income: false, IconId: 6 },
    { name: 'Transport',  is_income: false, IconId: 9 },
    { name: 'Essentials', is_income: false, IconId: 8 },
    { name: 'Shopping',   is_income: false, IconId: 7 },
];

const seedDefaultCategories = async (userId, t) => {
    await Categories.bulkCreate(
        DEFAULT_CATEGORIES.map(c => ({ ...c, UserId: userId })),
        t ? { transaction: t } : {}
    );
};

const register = async ({ fname, lname, email, password }) => {
    const exists = await Users.findOne({ where: { email } });
    if (exists) return { conflict: true };

    const hash = await bcrypt.hash(password, 10);
    const user = await sequelize.transaction(async (t) => {
        const newUser = await Users.create({
            fName: fname, lName: lname, email,
            password: hash, active: true, verify: true,
        }, { transaction: t });
        await seedDefaultCategories(newUser.id, t);
        return newUser;
    });
    return { user };
};

const resendVerification = async (email) => {
    const user = await Users.findOne({ where: { email } });
    if (!user)        return { notFound: true };
    if (!user.active) return { inactive: true };
    if (user.verify)  return { alreadyVerified: true };

    const verifyToken   = crypto.randomBytes(32).toString('hex');
    const verifyTokenEx = Date.now() + 3600000;
    await Users.update({ verifyToken, verifyTokenEx }, { where: { email } });

    const verificationUrl = `${process.env.CLIENT_URL}/auth/verify?token=${verifyToken}&id=${user.id}`;
    await sendVerificationEmail(email, verificationUrl);
    return { ok: true };
};

const verifyEmail = async (token, id) => {
    const user = await Users.findOne({
        where: {
            id, active: true, verify: false,
            verifyToken: token,
            verifyTokenEx: { [Op.gt]: Date.now() },
        },
    });
    if (!user) return { invalid: true };

    await Users.update({ verify: true, verifyToken: '1' }, { where: { id } });
    await seedDefaultCategories(id);
    return { ok: true };
};

const requestPasswordReset = async (email) => {
    const user = await Users.findOne({ where: { email } });
    if (!user)        return { notFound: true };
    if (!user.active) return { inactive: true };
    if (!user.verify) return { unverified: true };

    const resetToken   = crypto.randomBytes(32).toString('hex');
    const resetTokenEx = Date.now() + 3600000;
    await Users.update({ resetToken, resetTokenEx }, { where: { email } });

    const resetUrl = `${process.env.CLIENT_URL}/auth/resetpass?token=${resetToken}&id=${user.id}`;
    await sendForgotEmail(email, resetUrl);
    return { ok: true };
};

const validateResetToken = async (token, id) => {
    const user = await Users.findOne({ where: { id } });
    if (!user) return { notFound: true };

    const valid = await Users.findOne({
        where: { id, resetToken: token, resetTokenEx: { [Op.gt]: Date.now() } },
    });
    if (!valid) return { invalid: true };
    return { ok: true };
};

const resetPassword = async (id, token, password) => {
    const user = await Users.findOne({
        where: { id, resetToken: token, resetTokenEx: { [Op.gt]: new Date() } },
    });
    if (!user) return { invalid: true };

    const hash = await bcrypt.hash(password, 10);
    await Users.update({ password: hash, resetToken: null, resetTokenEx: null }, { where: { id } });
    return { ok: true };
};

const createGuest = async () => {
    const uid  = `guest_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    const user = await Users.create({
        fName: 'Guest', lName: 'User',
        email: `${uid}@guest.local`, password: null,
        active: true, verify: true, isGuest: true,
    });
    await seedDefaultCategories(user.id);
    const token = sign({ fname: 'Guest', id: user.id, isGuest: true }, process.env.JWT_SECRET, { expiresIn: '7d' });
    return { token, fname: 'Guest', id: user.id, isGuest: true };
};

const deleteGuest = async (userId) => {
    await Users.destroy({ where: { id: userId, isGuest: true } });
};

const login = async (email, password) => {
    const user = await Users.findOne({ where: { email } });
    if (!user) {
        await bcrypt.compare(password, DUMMY_HASH);
        return { invalid: true };
    }
    if (!user.active) return { inactive: true };

    const match = await bcrypt.compare(password, user.password);
    if (!match) return { invalid: true };

    const token = sign({ fname: user.fName, id: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    return { token, fname: user.fName, id: user.id };
};

const getProfile = async (id) => {
    return await Users.findByPk(id, { attributes: { exclude: ['password'] } });
};

const changePassword = async (id, newPassword) => {
    const user = await Users.findByPk(id, { attributes: { include: ['password'] } });
    const same = await bcrypt.compare(newPassword, user.password);
    if (same) return { same: true };

    const hash = await bcrypt.hash(newPassword, 10);
    await Users.update({ password: hash, resetToken: '1' }, { where: { id } });
    return { ok: true };
};

const editProfile = async (id, fname, lname) => {
    const user = await Users.findByPk(id);
    if (!user) return null;
    if (fname) user.fName = fname;
    if (lname) user.lName = lname;
    await user.save();
    return user;
};

module.exports = {
    register, resendVerification, verifyEmail, requestPasswordReset,
    validateResetToken, resetPassword, createGuest, deleteGuest,
    login, getProfile, changePassword, editProfile,
};
