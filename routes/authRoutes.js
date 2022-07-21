const express = require('express');
const router = express.Router();

const { validateRegistrationData, validateLoginData, validateChangePasswordData, validateProfileData } = require('../validators/authValidators');
const { authCheck } = require('../middlewares/authMiddleware');

const auth = require('../controllers/authController');

// ========================================================================================================

router.post('/refreshtoken', authCheck, auth.refreshToken);
router.post('/register/user', validateRegistrationData, auth.registerUser);
router.post('/logout', auth.logout);

router.post('/login', validateLoginData, auth.login);

router.post('/change-password', authCheck, validateChangePasswordData, auth.changePassword);
router.post('/update-profile', authCheck, validateProfileData, auth.updateProfile);

// ========================================================================================================

module.exports = router;