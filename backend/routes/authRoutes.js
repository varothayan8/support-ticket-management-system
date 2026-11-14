const express = require('express');
const router = express.Router();
const { register, login, getUsers, signout } = require('../controllers/authController');
const auth = require('../middleware/authMiddleware');

router.post('/register', register);
router.post('/login', login);
router.get('/signout', signout);
router.get('/users', auth, getUsers);

module.exports = router;
