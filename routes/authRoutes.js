const express = require('express');
const router = express.Router();

const { validateRegistrationData, validateLoginData } = require('../validators/authValidators');
const authCheck = require('../middlewares/authMiddleware');

const auth = require('../controllers/authController');

// ========================================================================================================

router.post('/refreshtoken', authCheck, auth.refreshToken);
router.post('/register/user', validateRegistrationData, auth.registerUser);
router.post('/logout', auth.logout);

router.post('/login', validateLoginData, auth.login);

// ========================================================================================================

module.exports = router;