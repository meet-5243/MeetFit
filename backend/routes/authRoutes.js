const express = require('express');
const router = express.Router();
const { register, login, logout, getMe, updateProfile, updatePassword } = require('../controllers/authController');
const { verifyToken } = require('../middleware/authMiddleware');

router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);
router.get('/me', verifyToken, getMe);
router.put('/profile', verifyToken, updateProfile);
router.put('/password', verifyToken, updatePassword);

module.exports = router;
