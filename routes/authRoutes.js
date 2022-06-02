const express = require('express');
const router = express.Router();
const passport = require('passport');
const { validateRegistrationData, validateLoginData } = require('../validators/authValidators');

const auth = require('../controllers/authController');

// ========================================================================================================
const bodyParser = require('body-parser');
router.use(bodyParser.json());

router.post('/test', (req,res) => { console.log(req.body); res.send({done: 'true'}); });

router.get('/getuser', auth.getUser);
router.post('/register/user', validateRegistrationData, auth.registerUser);
router.get('/logout', auth.logout);

router.post('/login', validateLoginData, passport.authenticate('local', {failureRedirect: '/auth/login/failure'}), auth.login);
router.get('/login/failure', (req, res) => { return res.status(401).json({ status: 'failure', message: 'Invalid username or password' }); });

// ========================================================================================================

module.exports = router;