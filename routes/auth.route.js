const express = require('express');
const router = express.Router();
const { login, signup, logout, forgotPassword, resetPassword, setNewPassword } = require('../controllers/auth.controller');

// Auth routes
router.post('/signup', signup);
router.post('/login', login);
router.post('/logout', logout);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:resetToken', resetPassword);
router.post('/set-new-password', setNewPassword);

module.exports = router;
