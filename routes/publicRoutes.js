const express = require('express');
const router = express.Router();

const public = require('../controllers/publicController');

const { validateNewsletterEmail, validateMessage } = require('../validators/publicValidators');

// ========================================================================================================

router.post('/subscribe-newsletter',validateNewsletterEmail, public.subscribeNewsletter);
router.post('/send-message',validateMessage, public.sendMessage);

// ========================================================================================================

module.exports = router;